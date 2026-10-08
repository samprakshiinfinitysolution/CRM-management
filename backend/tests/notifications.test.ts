import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { NotificationService } from '../src/services/notification.service.js';
import { UserRole } from '../src/types/index.js';

describe('Notification Engine & Lifecycle Suite', () => {
  describe('1. Lead Created Notifications', () => {
    test('notifies assigned executive when lead is assigned on creation', async () => {
      let createdNotifs: any[] = [];
      let tlNotifs: any[] = [];
      const origCreate = NotificationService.createNotification;
      const origNotifyTL = NotificationService.notifyTeamLeaders;

      NotificationService.createNotification = async (params: any) => {
        createdNotifs.push(params);
        return { id: 'notif_1', ...params, isRead: false, createdAt: new Date() };
      };
      NotificationService.notifyTeamLeaders = async (params: any) => {
        tlNotifs.push(params);
      };

      try {
        await NotificationService.notifyLeadCreated(
          {
            id: 'lead_1',
            leadCode: 'CRM-000101',
            customerName: 'Acme Corp',
            assignedToUserId: 'exec_1',
          },
          {
            id: 'tl_1',
            name: 'Marcus Sterling',
            role: UserRole.TEAM_LEADER,
          }
        );

        const assignedNotif = createdNotifs.find((n) => n.recipientUserId === 'exec_1');
        assert.ok(assignedNotif, 'Should create notification for assigned executive');
        assert.equal(assignedNotif.type, 'ASSIGNMENT');
        assert.ok(assignedNotif.message.includes('CRM-000101'));
        assert.ok(assignedNotif.message.includes('Acme Corp'));
        assert.ok(assignedNotif.message.includes('Marcus Sterling TL'));
      } finally {
        NotificationService.createNotification = origCreate;
        NotificationService.notifyTeamLeaders = origNotifyTL;
      }
    });

    test('notifies team leaders when an unassigned lead is created', async () => {
      let notifiedTLs = false;
      const origNotifyTLs = NotificationService.notifyTeamLeaders;
      NotificationService.notifyTeamLeaders = async (params: any) => {
        notifiedTLs = true;
        assert.equal(params.type, 'LEAD_CREATED');
        assert.ok(params.message.includes('CRM-000102'));
      };

      try {
        await NotificationService.notifyLeadCreated(
          {
            id: 'lead_2',
            leadCode: 'CRM-000102',
            customerName: 'Globex Ltd',
            assignedToUserId: null,
          },
          {
            id: 'exec_2',
            name: 'Alex Executive',
            role: UserRole.SALES_EXECUTIVE,
          }
        );

        assert.ok(notifiedTLs, 'Should notify team leaders when unassigned lead is created');
      } finally {
        NotificationService.notifyTeamLeaders = origNotifyTLs;
      }
    });
  });

  describe('2. Lead Reassign Notifications', () => {
    test('notifies both new assignee and previous assignees upon reassignment', async () => {
      let createdNotifs: any[] = [];
      let tlNotifs: any[] = [];
      const origCreate = NotificationService.createNotification;
      const origNotifyTL = NotificationService.notifyTeamLeaders;

      NotificationService.createNotification = async (params: any) => {
        createdNotifs.push(params);
        return { id: 'notif_reassign', ...params, isRead: false, createdAt: new Date() };
      };
      NotificationService.notifyTeamLeaders = async (params: any) => {
        tlNotifs.push(params);
      };

      try {
        await NotificationService.notifyLeadsReassigned({
          leadIds: ['lead_1', 'lead_2'],
          targetExecutiveId: 'exec_target',
          targetExecutiveName: 'Jordan Rep',
          previousAssigneeMap: {
            exec_prev1: 1,
            exec_prev2: 1,
          },
          actorUserId: 'user2',
          actorName: 'Sarah',
          actorRole: UserRole.SALES_EXECUTIVE,
          reason: 'Workload balancing',
        });

        // 1. Target executive notification
        const targetNotif = createdNotifs.find((n) => n.recipientUserId === 'exec_target');
        assert.ok(targetNotif, 'Target executive should receive notification');
        assert.equal(targetNotif.type, 'LEAD_REASSIGNED');
        assert.ok(targetNotif.message.includes('2 lead(s)'));
        assert.ok(targetNotif.message.includes('Workload balancing'));

        // 2. Previous assignees notification
        const prev1Notif = createdNotifs.find((n) => n.recipientUserId === 'exec_prev1');
        assert.ok(prev1Notif, 'Previous executive 1 should receive notification');
        assert.equal(prev1Notif.type, 'LEAD_REASSIGNED');
        assert.ok(prev1Notif.message.includes('Jordan Rep'));

        const prev2Notif = createdNotifs.find((n) => n.recipientUserId === 'exec_prev2');
        assert.ok(prev2Notif, 'Previous executive 2 should receive notification');
        assert.equal(prev2Notif.type, 'LEAD_REASSIGNED');

        // 3. Team leader notification verifies Sarah is labeled as SE, not TL
        assert.equal(tlNotifs.length, 1);
        assert.ok(tlNotifs[0].message.includes('Sarah SE'), `Expected message to include 'Sarah SE' but got: ${tlNotifs[0].message}`);
        assert.ok(!tlNotifs[0].message.includes('Sarah TL'), 'Should not label Sarah as TL');
      } finally {
        NotificationService.createNotification = origCreate;
        NotificationService.notifyTeamLeaders = origNotifyTL;
      }
    });
  });

  describe('3. Lead Recall Notifications', () => {
    test('notifies previous assignees when leads are recalled to unassigned pool and labels actor role correctly', async () => {
      let createdNotifs: any[] = [];
      let tlNotifs: any[] = [];
      const origCreate = NotificationService.createNotification;
      const origNotifyTL = NotificationService.notifyTeamLeaders;

      NotificationService.createNotification = async (params: any) => {
        createdNotifs.push(params);
        return { id: 'notif_recall', ...params, isRead: false, createdAt: new Date() };
      };
      NotificationService.notifyTeamLeaders = async (params: any) => {
        tlNotifs.push(params);
      };

      try {
        await NotificationService.notifyLeadsRecalled({
          count: 3,
          previousAssigneeMap: {
            exec_old: 3,
          },
          actorUserId: 'user2',
          actorName: 'Sarah',
          actorRole: UserRole.SALES_EXECUTIVE,
          reason: 'Inactive lead recovery',
        });

        const affectedNotif = createdNotifs.find((n) => n.recipientUserId === 'exec_old');
        assert.ok(affectedNotif, 'Affected executive should receive recall notification');
        assert.equal(affectedNotif.type, 'LEAD_RECALLED');
        assert.ok(affectedNotif.message.includes('3 lead(s)'));
        assert.ok(affectedNotif.message.includes('Inactive lead recovery'));

        // Verify Team Leader notification correctly shows Sarah SE
        assert.equal(tlNotifs.length, 1);
        assert.ok(tlNotifs[0].message.includes('Sarah SE'), `Expected message to include 'Sarah SE' but got: ${tlNotifs[0].message}`);
        assert.ok(!tlNotifs[0].message.includes('Sarah TL'), 'Should not label Sarah as TL');
      } finally {
        NotificationService.createNotification = origCreate;
        NotificationService.notifyTeamLeaders = origNotifyTL;
      }
    });
  });

  describe('4. Follow-up Created & Updated Notifications', () => {
    test('notifies executive when team leader schedules follow-up for them', async () => {
      let createdNotifs: any[] = [];
      const origCreate = NotificationService.createNotification;
      NotificationService.createNotification = async (params: any) => {
        createdNotifs.push(params);
        return { id: 'notif_fu_create', ...params, isRead: false, createdAt: new Date() };
      };

      try {
        await NotificationService.notifyFollowUpCreated({
          followUp: {
            id: 'fu_1',
            type: 'Meeting',
            scheduledAt: new Date('2026-10-15T10:00:00Z'),
            assignedToUserId: 'exec_assigned',
          },
          lead: {
            id: 'lead_5',
            leadCode: 'CRM-000555',
            customerName: 'Stark Industries',
            assignedByUserId: 'tl_1',
          },
          actor: {
            id: 'tl_1',
            name: 'Marcus Sterling',
            role: UserRole.TEAM_LEADER,
          },
        });

        const execNotif = createdNotifs.find((n) => n.recipientUserId === 'exec_assigned');
        assert.ok(execNotif, 'Assigned executive should be notified');
        assert.equal(execNotif.type, 'FOLLOW_UP');
        assert.ok(execNotif.message.includes('Meeting'));
        assert.ok(execNotif.message.includes('Stark Industries'));
      } finally {
        NotificationService.createNotification = origCreate;
      }
    });

    test('notifies team leader when executive completes a follow-up', async () => {
      let createdNotifs: any[] = [];
      const origCreate = NotificationService.createNotification;
      NotificationService.createNotification = async (params: any) => {
        createdNotifs.push(params);
        return { id: 'notif_fu_complete', ...params, isRead: false, createdAt: new Date() };
      };

      try {
        await NotificationService.notifyFollowUpUpdated({
          action: 'COMPLETED',
          followUp: {
            id: 'fu_1',
            type: 'Call',
            assignedToUserId: 'exec_1',
          },
          lead: {
            id: 'lead_6',
            leadCode: 'CRM-000666',
            customerName: 'Wayne Enterprises',
            assignedByUserId: 'tl_supervisor',
          },
          actor: {
            id: 'exec_1',
            name: 'John Rep',
            role: UserRole.SALES_EXECUTIVE,
          },
          notes: 'Client confirmed order quotation',
          nextStatus: 'WON_SOLD',
        });

        const tlNotif = createdNotifs.find((n) => n.recipientUserId === 'tl_supervisor');
        assert.ok(tlNotif, 'Team Leader should receive completion notification');
        assert.equal(tlNotif.type, 'FOLLOW_UP');
        assert.ok(tlNotif.message.includes('John SE'));
        assert.ok(tlNotif.message.includes('Wayne Enterprises'));
        assert.ok(tlNotif.message.includes('WON_SOLD'));
      } finally {
        NotificationService.createNotification = origCreate;
      }
    });

    test('notifies team leader when executive reschedules a follow-up', async () => {
      let createdNotifs: any[] = [];
      const origCreate = NotificationService.createNotification;
      NotificationService.createNotification = async (params: any) => {
        createdNotifs.push(params);
        return { id: 'notif_fu_resched', ...params, isRead: false, createdAt: new Date() };
      };

      try {
        await NotificationService.notifyFollowUpUpdated({
          action: 'RESCHEDULED',
          followUp: {
            id: 'fu_2',
            type: 'Call',
            assignedToUserId: 'exec_1',
          },
          lead: {
            id: 'lead_7',
            leadCode: 'CRM-000777',
            customerName: 'Cyberdyne Systems',
            assignedByUserId: 'tl_supervisor',
          },
          actor: {
            id: 'exec_1',
            name: 'John Rep',
            role: UserRole.SALES_EXECUTIVE,
          },
          newScheduledAt: new Date('2026-10-20T14:30:00Z'),
          reason: 'Prospect requested postponement',
        });

        const tlNotif = createdNotifs.find((n) => n.recipientUserId === 'tl_supervisor');
        assert.ok(tlNotif, 'Team Leader should receive reschedule notification');
        assert.equal(tlNotif.type, 'FOLLOW_UP');
        assert.ok(tlNotif.message.includes('Cyberdyne Systems'));
        assert.ok(tlNotif.message.includes('postponement'));
      } finally {
        NotificationService.createNotification = origCreate;
      }
    });
  });
});
