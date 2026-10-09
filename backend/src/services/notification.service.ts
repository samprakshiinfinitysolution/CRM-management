import prisma from "../config/db.js";
import {
  emitToUser,
  emitToRole,
  sendNotificationToUser,
  WS_EVENTS,
} from "../config/socket.js";
import { UserRole } from "../types/index.js";

export interface UserSummary {
  id: string;
  name?: string | null;
  role?: string;
}

export interface LeadSummary {
  id: string;
  leadCode: string;
  customerName: string;
  assignedToUserId?: string | null;
  assignedByUserId?: string | null;
}

export interface CreateNotificationParams {
  recipientUserId: string;
  title: string;
  message: string;
  type: string;
}

export class NotificationService {
  /**
   * Maps a UserRole to a short display label used in notification messages.
   * Derives the label from the authoritative `role` field — never from the name string.
   */
  static getRoleLabel(role?: string | null): string {
    if (!role) return "SE";
    const normalized = role.toUpperCase();
    if (normalized === UserRole.ADMIN) return "ADMIN";
    if (normalized === UserRole.TEAM_LEADER) return "TL";
    if (normalized === UserRole.SALES_EXECUTIVE) return "SE";
    return "SE";
  }

  /**
   * Formats an actor's name with their authoritative role label (e.g. "Sarah SE" or "Marcus TL").
   * Strips any pre-existing or misplaced role suffixes from the raw name string.
   */
  static formatActorDisplay(name: string, role?: string | null): string {
    const roleLabel = this.getRoleLabel(role);
    const cleanName = name
      .replace(/\s+(TL|TeamLeader|Supervisor|SE|Rep|SalesExecutive)$/i, "")
      .trim();
    return `${cleanName} ${roleLabel}`;
  }

  /**
   * Formats a date into a clean, human-friendly string (e.g. "15 Oct 2026, 2:30 pm").
   */
  static formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "Scheduled Date";
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  /**
   * Resolves user details from an ID or returns the provided object.
   */
  static async resolveUser(
    userOrId: string | UserSummary | undefined | null,
  ): Promise<UserSummary | null> {
    if (!userOrId) return null;
    if (typeof userOrId === "object") return userOrId;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userOrId },
        select: { id: true, name: true, role: true },
      });
      return user;
    } catch {
      return { id: userOrId };
    }
  }

  /**
   * Resolves lead details from an ID or returns the provided object.
   */
  static async resolveLead(
    leadOrId: string | LeadSummary | undefined | null,
  ): Promise<LeadSummary | null> {
    if (!leadOrId) return null;
    if (typeof leadOrId === "object") return leadOrId;

    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadOrId },
        select: {
          id: true,
          leadCode: true,
          customerName: true,
          assignedToUserId: true,
          assignedByUserId: true,
        },
      });
      return lead;
    } catch {
      return null;
    }
  }

  /**
   * Persists a notification to PostgreSQL and emits real-time WebSocket events.
   */
  static async createNotification(params: CreateNotificationParams) {
    const { recipientUserId, title, message, type } = params;

    if (!recipientUserId) {
      console.warn("⚠️ Notification skipped: No recipientUserId provided");
      return null;
    }

    try {
      const notification = await prisma.notification.create({
        data: {
          recipientUserId,
          title,
          message,
          type,
        },
      });

      // 1. Emit the new notification to user's personal WebSocket room
      sendNotificationToUser(recipientUserId, notification);

      // 2. Emit updated unread count to user
      try {
        const unreadCount = await prisma.notification.count({
          where: { recipientUserId, isRead: false },
        });
        emitToUser(recipientUserId, WS_EVENTS.NOTIFICATION_COUNT, {
          unreadCount,
        });
      } catch {
        // Count emission failure is non-fatal
      }

      return notification;
    } catch (error) {
      console.error("Failed to create notification in database:", error);
      // Fallback: emit ephemeral real-time alert even if database write fails
      sendNotificationToUser(recipientUserId, { title, message, type });
      return null;
    }
  }

  /**
   * Batch creates and dispatches notifications in a single database query, eliminating N+1 roundtrips.
   */
  static async createManyNotifications(
    notifications: Array<{
      recipientUserId: string;
      title: string;
      message: string;
      type: string;
    }>,
  ) {
    if (!notifications || notifications.length === 0) return [];

    try {
      const created = await prisma.notification.createManyAndReturn({
        data: notifications.map((n) => ({
          recipientUserId: n.recipientUserId,
          title: n.title,
          message: n.message,
          type: n.type,
        })),
      });

      // Dispatch real-time WebSocket events for each notification
      for (const notif of created) {
        sendNotificationToUser(notif.recipientUserId, notif);
      }

      return created;
    } catch (error) {
      console.error("Failed to batch create notifications:", error);
      // Fallback: emit ephemeral real-time alerts
      for (const n of notifications) {
        sendNotificationToUser(n.recipientUserId, {
          title: n.title,
          message: n.message,
          type: n.type,
        });
      }
      return [];
    }
  }

  /**
   * Notifies all active Team Leaders using a single batch query.
   */
  static async notifyTeamLeaders(params: {
    title: string;
    message: string;
    type: string;
    excludeUserId?: string;
  }) {
    const { title, message, type, excludeUserId } = params;

    try {
      const teamLeaders = await prisma.user.findMany({
        where: {
          role: UserRole.TEAM_LEADER,
          isActive: true,
          ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
        },
        select: { id: true },
      });

      if (teamLeaders.length === 0) return;

      await this.createManyNotifications(
        teamLeaders.map((tl) => ({
          recipientUserId: tl.id,
          title,
          message,
          type,
        })),
      );
    } catch (error) {
      console.error("Failed to notify team leaders:", error);
    }
  }

  // =========================================================================
  // 1. LEAD CREATED NOTIFICATIONS
  // =========================================================================

  /**
   * Dispatches notifications when a lead is created.
   * Can accept lead object or ID, and creator object or ID.
   */
  static async notifyLeadCreated(
    leadOrId: LeadSummary | string,
    creatorOrId: UserSummary | string,
  ) {
    try {
      const lead = await this.resolveLead(leadOrId);
      if (!lead) return;

      const creator = (await this.resolveUser(creatorOrId)) || {
        id: "system",
        role: "SYSTEM",
      };
      const resolvedRole = creator.role;
      const creatorBaseName =
        creator.name ||
        (resolvedRole === UserRole.TEAM_LEADER
          ? "Team Leader"
          : "Sales Executive");
      const actorDisplay = this.formatActorDisplay(
        creatorBaseName,
        resolvedRole,
      );

      // If lead was assigned directly on creation, notify the assigned sales executive
      if (lead.assignedToUserId) {
        await this.createNotification({
          recipientUserId: lead.assignedToUserId,
          title: "New Lead Assigned",
          message: `Lead ${lead.leadCode} (${lead.customerName}) has been assigned to you by ${actorDisplay}.`,
          type: "ASSIGNMENT",
        });

        emitToUser(lead.assignedToUserId, WS_EVENTS.LEAD_ASSIGNED, {
          count: 1,
          message: `Lead ${lead.leadCode} (${lead.customerName}) assigned to you by ${actorDisplay}!`,
          leadId: lead.id,
        });
      }

      // Notify all Team Leaders about the new lead
      await this.notifyTeamLeaders({
        title: "New Lead Created",
        message: `Lead ${lead.leadCode} (${lead.customerName}) was registered by ${actorDisplay}.`,
        type: "LEAD_CREATED",
        excludeUserId:
          creator.role === UserRole.TEAM_LEADER ? creator.id : undefined,
      });

      // Emit dashboard update
      emitToRole(UserRole.TEAM_LEADER, WS_EVENTS.DASHBOARD_METRICS_UPDATE, {
        reason: "LEAD_CREATED",
        leadId: lead.id,
      });
    } catch (error) {
      console.error("Error in notifyLeadCreated:", error);
    }
  }

  // =========================================================================
  // 2. LEAD DISTRIBUTION / ASSIGNMENT NOTIFICATIONS
  // =========================================================================

  /**
   * Dispatches notifications when leads are distributed/assigned across executives.
   */
  static async notifyLeadsDistributed(params: {
    allocations: Array<{
      salesExecutiveId: string;
      executiveName?: string;
      count: number;
    }>;
    actorUserId: string;
    actorName?: string;
    actorRole?: string;
    reason?: string;
  }) {
    const { allocations, actorUserId, actorName, actorRole, reason } = params;

    try {
      const actorUser = await this.resolveUser(actorUserId);
      const resolvedRole = actorUser?.role ?? actorRole;
      const actorBaseName =
        actorName ||
        actorUser?.name ||
        (resolvedRole === UserRole.TEAM_LEADER
          ? "Team Leader"
          : "Sales Executive");
      const actorDisplay = this.formatActorDisplay(actorBaseName, resolvedRole);
      const reasonSuffix = reason ? ` (Reason: ${reason})` : "";

      let totalAssigned = 0;

      // 1. Notify each assigned sales executive
      for (const allocation of allocations) {
        if (allocation.count <= 0) continue;
        totalAssigned += allocation.count;

        await this.createNotification({
          recipientUserId: allocation.salesExecutiveId,
          title: "New Lead(s) Assigned",
          message: `${allocation.count} new lead(s) have been assigned to you by ${actorDisplay}${reasonSuffix}.`,
          type: "ASSIGNMENT",
        });

        emitToUser(allocation.salesExecutiveId, WS_EVENTS.LEAD_ASSIGNED, {
          count: allocation.count,
          message: `${allocation.count} new lead(s) assigned to you by ${actorDisplay}!`,
          assignedByUserId: actorUserId,
        });
      }

      // 2. Notify other Team Leaders about the distribution event
      if (totalAssigned > 0) {
        await this.notifyTeamLeaders({
          title: "Leads Distributed",
          message: `${totalAssigned} lead(s) distributed across ${allocations.length} executive(s) by ${actorDisplay}${reasonSuffix}.`,
          type: "LEADS_DISTRIBUTED",
          excludeUserId: actorUserId,
        });
      }

      // 3. Emit dashboard metric updates to both roles
      emitToRole(UserRole.TEAM_LEADER, WS_EVENTS.DASHBOARD_METRICS_UPDATE, {
        reason: "LEAD_DISTRIBUTED",
      });
      emitToRole(UserRole.SALES_EXECUTIVE, WS_EVENTS.DASHBOARD_METRICS_UPDATE, {
        reason: "LEAD_DISTRIBUTED",
      });
    } catch (error) {
      console.error("Error in notifyLeadsDistributed:", error);
    }
  }

  // =========================================================================
  // 3. LEAD REASSIGN NOTIFICATIONS
  // =========================================================================

  /**
   * Dispatches notifications when leads are reassigned.
   */
  static async notifyLeadsReassigned(params: {
    leadIds: string[];
    targetExecutiveId: string;
    targetExecutiveName?: string;
    previousAssigneeMap: Record<string, number>;
    actorUserId: string;
    actorName?: string;
    actorRole?: string;
    reason?: string;
  }) {
    const {
      leadIds,
      targetExecutiveId,
      previousAssigneeMap,
      actorUserId,
      reason,
    } = params;

    try {
      // Always resolve actor from DB to get the authoritative role field
      const [targetUser, actorUser] = await Promise.all([
        params.targetExecutiveName ? null : this.resolveUser(targetExecutiveId),
        this.resolveUser(actorUserId),
      ]);

      const targetExecutiveName =
        params.targetExecutiveName || targetUser?.name || "Sales Executive";

      // Derive label from actual role — never trust the name field for role info
      const resolvedRole = actorUser?.role ?? params.actorRole;
      const actorBaseName =
        params.actorName ||
        actorUser?.name ||
        (resolvedRole === UserRole.TEAM_LEADER
          ? "Team Leader"
          : "Sales Executive");
      const actorDisplay = this.formatActorDisplay(actorBaseName, resolvedRole);

      const reasonSuffix = reason ? ` (Reason: ${reason})` : "";

      // 1. Notify Target Executive
      await this.createNotification({
        recipientUserId: targetExecutiveId,
        title: "Lead(s) Reassigned to You",
        message: `${leadIds.length} lead(s) have been reassigned to you by ${actorDisplay}${reasonSuffix}.`,
        type: "LEAD_REASSIGNED",
      });

      emitToUser(targetExecutiveId, WS_EVENTS.LEAD_ASSIGNED, {
        count: leadIds.length,
        message: `${leadIds.length} lead(s) reassigned to you by ${actorDisplay}!`,
        leadIds,
      });

      // 2. Notify each previous executive whose leads were reassigned away
      for (const [prevUserId, count] of Object.entries(previousAssigneeMap)) {
        if (prevUserId !== targetExecutiveId) {
          await this.createNotification({
            recipientUserId: prevUserId,
            title: "Lead(s) Reassigned",
            message: `${count} lead(s) previously in your queue were reassigned to ${targetExecutiveName} by ${actorDisplay}${reasonSuffix}.`,
            type: "LEAD_REASSIGNED",
          });

          emitToUser(prevUserId, WS_EVENTS.LEAD_REASSIGNED, {
            count,
            message: `${count} lead(s) reassigned to ${targetExecutiveName} by ${actorDisplay}`,
          });
        }
      }

      // 3. Notify other Team Leaders
      await this.notifyTeamLeaders({
        title: "Leads Reassigned",
        message: `${leadIds.length} lead(s) reassigned to ${targetExecutiveName} by ${actorDisplay}${reasonSuffix}.`,
        type: "LEAD_REASSIGNED",
        excludeUserId: actorUserId,
      });

      // 4. Emit dashboard metrics update to both roles
      emitToRole(UserRole.TEAM_LEADER, WS_EVENTS.DASHBOARD_METRICS_UPDATE, {
        reason: "LEAD_REASSIGNED",
      });
      emitToRole(UserRole.SALES_EXECUTIVE, WS_EVENTS.DASHBOARD_METRICS_UPDATE, {
        reason: "LEAD_REASSIGNED",
      });
    } catch (error) {
      console.error("Error in notifyLeadsReassigned:", error);
    }
  }

  // =========================================================================
  // 4. LEAD RECALL NOTIFICATIONS
  // =========================================================================

  /**
   * Dispatches notifications when leads are recalled to the unassigned pool.
   */
  static async notifyLeadsRecalled(params: {
    count: number;
    previousAssigneeMap: Record<string, number>;
    actorUserId: string;
    actorName?: string;
    actorRole?: string;
    reason?: string;
  }) {
    const {
      count,
      previousAssigneeMap,
      actorUserId,
      actorName,
      actorRole,
      reason,
    } = params;

    try {
      const actorUser = await this.resolveUser(actorUserId);
      const resolvedRole = actorUser?.role ?? actorRole;
      const actorBaseName =
        actorName ||
        actorUser?.name ||
        (resolvedRole === UserRole.TEAM_LEADER
          ? "Team Leader"
          : "Sales Executive");
      const actorDisplay = this.formatActorDisplay(actorBaseName, resolvedRole);
      const reasonSuffix = reason ? ` (Reason: ${reason})` : "";

      // 1. Notify each affected executive
      for (const [prevUserId, leadCount] of Object.entries(
        previousAssigneeMap,
      )) {
        await this.createNotification({
          recipientUserId: prevUserId,
          title: "Lead(s) Recalled",
          message: `${leadCount} lead(s) from your queue were recalled back to the unassigned pool by ${actorDisplay}${reasonSuffix}.`,
          type: "LEAD_RECALLED",
        });

        emitToUser(prevUserId, WS_EVENTS.LEAD_REASSIGNED, {
          count: leadCount,
          message: `${leadCount} lead(s) recalled to unassigned pool by ${actorDisplay}`,
        });
      }

      // 2. Notify other Team Leaders
      await this.notifyTeamLeaders({
        title: "Leads Recalled",
        message: `${count} lead(s) recalled to the unassigned pool by ${actorDisplay}${reasonSuffix}.`,
        type: "LEAD_RECALLED",
        excludeUserId: actorUserId,
      });

      // 3. Emit dashboard metrics update
      emitToRole(UserRole.TEAM_LEADER, WS_EVENTS.DASHBOARD_METRICS_UPDATE, {
        reason: "LEAD_RECALLED",
      });
      emitToRole(UserRole.SALES_EXECUTIVE, WS_EVENTS.DASHBOARD_METRICS_UPDATE, {
        reason: "LEAD_RECALLED",
      });
    } catch (error) {
      console.error("Error in notifyLeadsRecalled:", error);
    }
  }

  // =========================================================================
  // 5. LEAD STATUS UPDATE NOTIFICATIONS
  // =========================================================================

  /**
   * Dispatches notifications when a lead's status is updated.
   */
  static async notifyLeadStatusUpdated(params: {
    lead: LeadSummary | string;
    oldStatus: string;
    newStatus: string;
    actorUserId: string;
    actorName?: string;
    actorRole?: string;
    note?: string;
  }) {
    const { oldStatus, newStatus, actorUserId, actorName, actorRole, note } =
      params;

    if (oldStatus === newStatus) return;

    try {
      const [lead, actorUser] = await Promise.all([
        this.resolveLead(params.lead),
        this.resolveUser(actorUserId),
      ]);

      if (!lead) return;

      const resolvedRole = actorUser?.role ?? actorRole;
      const actorBaseName =
        actorName ||
        actorUser?.name ||
        (resolvedRole === UserRole.TEAM_LEADER
          ? "Team Leader"
          : "Sales Executive");
      const actorDisplay = this.formatActorDisplay(actorBaseName, resolvedRole);
      const noteSuffix = note ? ` (Note: ${note})` : "";

      // Case A: Sales Executive updated status -> notify assigned TL / all TLs
      if (resolvedRole === UserRole.SALES_EXECUTIVE) {
        const msg = `Lead ${lead.leadCode} (${lead.customerName}) status changed from ${oldStatus} to ${newStatus} by ${actorDisplay}${noteSuffix}.`;

        if (lead.assignedByUserId && lead.assignedByUserId !== actorUserId) {
          await this.createNotification({
            recipientUserId: lead.assignedByUserId,
            title: "Lead Status Updated",
            message: msg,
            type: "STATUS_UPDATE",
          });
        } else {
          await this.notifyTeamLeaders({
            title: "Lead Status Updated",
            message: msg,
            type: "STATUS_UPDATE",
          });
        }
      }

      // Case B: Team Leader updated status -> notify assigned Sales Executive + other TLs
      if (resolvedRole === UserRole.TEAM_LEADER) {
        if (lead.assignedToUserId && lead.assignedToUserId !== actorUserId) {
          await this.createNotification({
            recipientUserId: lead.assignedToUserId,
            title: "Lead Status Updated",
            message: `Your lead ${lead.leadCode} (${lead.customerName}) status was updated from ${oldStatus} to ${newStatus} by ${actorDisplay}${noteSuffix}.`,
            type: "STATUS_UPDATE",
          });
        }

        // Notify other Team Leaders
        await this.notifyTeamLeaders({
          title: "Lead Status Updated",
          message: `Lead ${lead.leadCode} (${lead.customerName}) status changed from ${oldStatus} to ${newStatus} by ${actorDisplay}${noteSuffix}.`,
          type: "STATUS_UPDATE",
          excludeUserId: actorUserId,
        });
      }

      // Emit dashboard metric updates
      emitToRole(UserRole.TEAM_LEADER, WS_EVENTS.DASHBOARD_METRICS_UPDATE, {
        reason: "STATUS_UPDATE",
        leadId: lead.id,
      });
      emitToRole(UserRole.SALES_EXECUTIVE, WS_EVENTS.DASHBOARD_METRICS_UPDATE, {
        reason: "STATUS_UPDATE",
        leadId: lead.id,
      });
    } catch (error) {
      console.error("Error in notifyLeadStatusUpdated:", error);
    }
  }

  // =========================================================================
  // 6. BULK LEADS IMPORTED NOTIFICATIONS
  // =========================================================================

  /**
   * Dispatches notifications when leads are imported in bulk from an Excel sheet.
   */
  static async notifyLeadsImported(params: {
    count: number;
    fileName: string;
    actorUserId: string;
    actorName?: string;
    actorRole?: string;
  }) {
    const { count, fileName, actorUserId, actorName, actorRole } = params;

    if (count <= 0) return;

    try {
      const actorUser = await this.resolveUser(actorUserId);
      const resolvedRole = actorUser?.role ?? actorRole;
      const actorBaseName =
        actorName ||
        actorUser?.name ||
        (resolvedRole === UserRole.TEAM_LEADER
          ? "Team Leader"
          : "Sales Executive");
      const actorDisplay = this.formatActorDisplay(actorBaseName, resolvedRole);

      await this.notifyTeamLeaders({
        title: "Bulk Leads Imported",
        message: `${count} lead(s) imported into the unassigned pool from "${fileName}" by ${actorDisplay}.`,
        type: "LEADS_IMPORTED",
        excludeUserId: actorUserId,
      });

      emitToRole(UserRole.TEAM_LEADER, WS_EVENTS.DASHBOARD_METRICS_UPDATE, {
        reason: "LEADS_IMPORTED",
      });
    } catch (error) {
      console.error("Error in notifyLeadsImported:", error);
    }
  }

  // =========================================================================
  // 7. FOLLOW-UP CREATED & UPDATED NOTIFICATIONS
  // =========================================================================

  /**
   * Dispatches notifications when a follow-up is scheduled.
   */
  static async notifyFollowUpCreated(params: {
    followUp: {
      id: string;
      type: string;
      scheduledAt: Date | string;
      assignedToUserId: string;
      leadId?: string;
    };
    lead?: LeadSummary | string;
    actor: UserSummary | string;
  }) {
    const { followUp } = params;

    try {
      const [lead, actor] = await Promise.all([
        this.resolveLead(params.lead || followUp.leadId),
        this.resolveUser(params.actor),
      ]);

      if (!lead || !actor) return;

      const scheduledDateStr = this.formatDate(followUp.scheduledAt);
      const actorRole = actor.role;
      const actorBaseName =
        actor.name ||
        (actorRole === UserRole.TEAM_LEADER
          ? "Team Leader"
          : "Sales Executive");
      const actorDisplay = this.formatActorDisplay(actorBaseName, actorRole);

      // Case A: Scheduled by Team Leader for an Executive
      if (
        actor.role === UserRole.TEAM_LEADER &&
        followUp.assignedToUserId !== actor.id
      ) {
        await this.createNotification({
          recipientUserId: followUp.assignedToUserId,
          title: "Follow-up Scheduled",
          message: `A ${followUp.type} follow-up for ${lead.customerName} (${lead.leadCode}) was scheduled for ${scheduledDateStr} by ${actorDisplay}.`,
          type: "FOLLOW_UP",
        });

        emitToUser(followUp.assignedToUserId, WS_EVENTS.FOLLOWUP_DUE, {
          title: "Follow-up Scheduled",
          message: `A ${followUp.type} follow-up is scheduled for ${scheduledDateStr} by ${actorDisplay}.`,
          leadId: lead.id,
        });
      }

      // Case B: Scheduled by Sales Executive -> notify the Team Leader who assigned or all TLs
      if (actor.role === UserRole.SALES_EXECUTIVE) {
        const msg = `${actorDisplay} scheduled a ${followUp.type} follow-up for ${lead.customerName} (${lead.leadCode}) on ${scheduledDateStr}.`;

        if (lead.assignedByUserId) {
          await this.createNotification({
            recipientUserId: lead.assignedByUserId,
            title: "Follow-up Scheduled",
            message: msg,
            type: "FOLLOW_UP",
          });
          emitToUser(lead.assignedByUserId, WS_EVENTS.FOLLOWUP_DUE, {
            title: "Follow-up Scheduled",
            message: msg,
            leadId: lead.id,
          });
        } else {
          await this.notifyTeamLeaders({
            title: "Follow-up Scheduled",
            message: msg,
            type: "FOLLOW_UP",
          });
        }
      }
    } catch (error) {
      console.error("Error in notifyFollowUpCreated:", error);
    }
  }

  /**
   * Dispatches notifications when a follow-up is updated (Completed or Rescheduled).
   */
  static async notifyFollowUpUpdated(params: {
    action: "COMPLETED" | "RESCHEDULED";
    followUp: {
      id: string;
      type: string;
      assignedToUserId: string;
      leadId?: string;
    };
    lead?: LeadSummary | string;
    actor: UserSummary | string;
    notes?: string;
    nextStatus?: string;
    newScheduledAt?: Date | string;
    reason?: string;
  }) {
    const { action, followUp, nextStatus, newScheduledAt, reason } = params;

    try {
      const [lead, actor] = await Promise.all([
        this.resolveLead(params.lead || followUp.leadId),
        this.resolveUser(params.actor),
      ]);

      if (!lead || !actor) return;

      const actorRole = actor.role;
      const actorBaseName =
        actor.name ||
        (actorRole === UserRole.TEAM_LEADER
          ? "Team Leader"
          : "Sales Executive");
      const actorDisplay = this.formatActorDisplay(actorBaseName, actorRole);

      if (action === "COMPLETED") {
        const statusSuffix = nextStatus
          ? ` (Status changed to ${nextStatus})`
          : "";

        if (actor.role === UserRole.SALES_EXECUTIVE) {
          const msg = `${actorDisplay} completed the ${followUp.type} follow-up for ${lead.customerName} (${lead.leadCode})${statusSuffix}.`;

          if (lead.assignedByUserId) {
            await this.createNotification({
              recipientUserId: lead.assignedByUserId,
              title: "Follow-up Completed",
              message: msg,
              type: "FOLLOW_UP",
            });
            emitToUser(lead.assignedByUserId, WS_EVENTS.FOLLOWUP_DUE, {
              title: "Follow-up Completed",
              message: msg,
              leadId: lead.id,
            });
          } else {
            await this.notifyTeamLeaders({
              title: "Follow-up Completed",
              message: msg,
              type: "FOLLOW_UP",
            });
          }
        } else if (
          actor.role === UserRole.TEAM_LEADER &&
          followUp.assignedToUserId !== actor.id
        ) {
          await this.createNotification({
            recipientUserId: followUp.assignedToUserId,
            title: "Follow-up Completed",
            message: `Your ${followUp.type} follow-up for ${lead.customerName} (${lead.leadCode}) was marked completed by ${actorDisplay}${statusSuffix}.`,
            type: "FOLLOW_UP",
          });
        }
      }

      if (action === "RESCHEDULED") {
        const newDateStr = newScheduledAt
          ? this.formatDate(newScheduledAt)
          : "a new date";
        const reasonSuffix = reason ? ` (Reason: ${reason})` : "";

        if (actor.role === UserRole.SALES_EXECUTIVE) {
          const msg = `${actorDisplay} rescheduled follow-up for ${lead.customerName} (${lead.leadCode}) to ${newDateStr}${reasonSuffix}.`;

          if (lead.assignedByUserId) {
            await this.createNotification({
              recipientUserId: lead.assignedByUserId,
              title: "Follow-up Rescheduled",
              message: msg,
              type: "FOLLOW_UP",
            });
          } else {
            await this.notifyTeamLeaders({
              title: "Follow-up Rescheduled",
              message: msg,
              type: "FOLLOW_UP",
            });
          }
        } else if (
          actor.role === UserRole.TEAM_LEADER &&
          followUp.assignedToUserId !== actor.id
        ) {
          await this.createNotification({
            recipientUserId: followUp.assignedToUserId,
            title: "Follow-up Rescheduled",
            message: `Your follow-up for ${lead.customerName} (${lead.leadCode}) was rescheduled to ${newDateStr} by ${actorDisplay}${reasonSuffix}.`,
            type: "FOLLOW_UP",
          });

          emitToUser(followUp.assignedToUserId, WS_EVENTS.FOLLOWUP_DUE, {
            title: "Follow-up Rescheduled",
            message: `Follow-up rescheduled to ${newDateStr} by ${actorDisplay}`,
            leadId: lead.id,
          });
        }
      }

      // Update metrics for both roles
      emitToRole(UserRole.TEAM_LEADER, WS_EVENTS.DASHBOARD_METRICS_UPDATE, {
        reason: `FOLLOW_UP_${action}`,
        leadId: lead.id,
      });
      emitToRole(UserRole.SALES_EXECUTIVE, WS_EVENTS.DASHBOARD_METRICS_UPDATE, {
        reason: `FOLLOW_UP_${action}`,
        leadId: lead.id,
      });
    } catch (error) {
      console.error("Error in notifyFollowUpUpdated:", error);
    }
  }
}
