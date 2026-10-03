import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import type { Server as HttpsServer } from "https";
import jwt from "jsonwebtoken";
import { config } from "./env.js";
import { prisma } from "./db.js";
import { UserRole } from "../types/index.js";

export interface AuthenticatedSocketUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: AuthenticatedSocketUser;
  };
}

export interface NotificationPayload {
  id?: string;
  recipientUserId?: string;
  title: string;
  message: string;
  type?: string;
  isRead?: boolean;
  createdAt?: Date | string;
  metadata?: Record<string, unknown>;
}

// WebSocket Event Constants
export const WS_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_READ: "notification:read",
  NOTIFICATION_READ_ALL: "notification:read_all",
  NOTIFICATION_COUNT: "notification:count",
  LEAD_ASSIGNED: "lead:assigned",
  LEAD_REASSIGNED: "lead:reassigned",
  LEAD_STATUS_CHANGED: "lead:status_changed",
  FOLLOWUP_DUE: "followup:due",
  DASHBOARD_METRICS_UPDATE: "dashboard:metrics_update",
} as const;

let io: SocketIOServer | null = null;

export const initSocketServer = (server: HttpServer | HttpsServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow all local dev / configured origins
        callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    addTrailingSlash: false,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT Authentication Middleware for Socket Connections
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const authHeader =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization ||
        socket.handshake.query?.token;

      let token: string | undefined;

      if (typeof authHeader === "string") {
        token = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7).trim()
          : authHeader.trim();
      }

      // Check cookie if token wasn't in auth header
      if (!token && socket.handshake.headers?.cookie) {
        const cookies = socket.handshake.headers.cookie.split(";");
        for (const cookie of cookies) {
          const [key, val] = cookie.trim().split("=");
          if (key === config.tokenKey || key === "token") {
            token = val;
            break;
          }
        }
      }

      if (!token) {
        // Allow anonymous connection or require token
        return next();
      }

      const decoded = jwt.verify(token, config.jwt.secret) as AuthenticatedSocketUser;
      socket.data.user = decoded;
      next();
    } catch (err) {
      console.warn("⚠️ WebSocket connection authentication error:", (err as Error).message);
      // Proceed without user or fail handshake
      next();
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const user = socket.data?.user;

    if (user) {
      // Join personal room for direct user alerts
      const userRoom = `user:${user.id}`;
      socket.join(userRoom);

      // Join role room (e.g. role:TEAM_LEADER or role:SALES_EXECUTIVE)
      const roleRoom = `role:${user.role}`;
      socket.join(roleRoom);

      console.log(`🔌 WS Client connected: ${socket.id} | User: ${user.email} (${user.role})`);

      // Socket Endpoint: Mark specific notification as read
      socket.on(
        WS_EVENTS.NOTIFICATION_READ,
        async (data: { notificationId?: string; id?: string }, ack?: (res: unknown) => void) => {
          try {
            const notificationId = data?.notificationId || data?.id;
            if (!notificationId) {
              ack?.({ success: false, message: "notificationId is required" });
              return;
            }

            const updated = await prisma.notification.updateMany({
              where: {
                id: notificationId,
                recipientUserId: user.id,
              },
              data: {
                isRead: true,
                readAt: new Date(),
              },
            });

            const unreadCount = await prisma.notification.count({
              where: { recipientUserId: user.id, isRead: false },
            });

            socket.emit(WS_EVENTS.NOTIFICATION_COUNT, { unreadCount });
            ack?.({ success: true, count: updated.count, unreadCount });
          } catch (error) {
            console.error("Error marking notification as read via socket:", error);
            ack?.({ success: false, message: "Failed to mark notification as read" });
          }
        }
      );

      // Socket Endpoint: Mark all notifications as read
      socket.on(WS_EVENTS.NOTIFICATION_READ_ALL, async (_data?: unknown, ack?: (res: unknown) => void) => {
        try {
          await prisma.notification.updateMany({
            where: {
              recipientUserId: user.id,
              isRead: false,
            },
            data: {
              isRead: true,
              readAt: new Date(),
            },
          });

          socket.emit(WS_EVENTS.NOTIFICATION_COUNT, { unreadCount: 0 });
          ack?.({ success: true, unreadCount: 0 });
        } catch (error) {
          console.error("Error marking all notifications as read via socket:", error);
          ack?.({ success: false, message: "Failed to mark all notifications as read" });
        }
      });

      // Socket Endpoint: Query unread notification count
      socket.on("notification:get_unread_count", async (_data?: unknown, ack?: (res: unknown) => void) => {
        try {
          const unreadCount = await prisma.notification.count({
            where: { recipientUserId: user.id, isRead: false },
          });
          socket.emit(WS_EVENTS.NOTIFICATION_COUNT, { unreadCount });
          ack?.({ success: true, unreadCount });
        } catch (error) {
          ack?.({ success: false, error: (error as Error).message });
        }
      });

      // Socket Endpoint: Lead assigned listener
      socket.on(WS_EVENTS.LEAD_ASSIGNED, (data: unknown) => {
        console.log(`📋 Lead assigned event received from socket ${socket.id}:`, data);
      });
    } else {
      console.log(`🔌 WS Client connected (Anonymous): ${socket.id}`);
    }

    socket.on("disconnect", (reason) => {
      console.log(`🔌 WS Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.io has not been initialized. Call initSocketServer first.");
  }
  return io;
};

// ==========================================
// Helper Emission Functions
// ==========================================

export const sendNotificationToUser = (
  userId: string,
  notification: NotificationPayload
): void => {
  if (!io) return;
  io.to(`user:${userId}`).emit(WS_EVENTS.NOTIFICATION_NEW, notification);
};

export const sendNotificationToRole = (
  role: UserRole,
  notification: NotificationPayload
): void => {
  if (!io) return;
  io.to(`role:${role}`).emit(WS_EVENTS.NOTIFICATION_NEW, notification);
};

export const broadcastNotification = (notification: NotificationPayload): void => {
  if (!io) return;
  io.emit(WS_EVENTS.NOTIFICATION_NEW, notification);
};

export const createAndEmitNotification = async (params: {
  recipientUserId: string;
  title: string;
  message: string;
  type?: string;
}) => {
  const { recipientUserId, title, message, type = "SYSTEM" } = params;
  try {
    const notification = await prisma.notification.create({
      data: {
        recipientUserId,
        title,
        message,
        type,
      },
    });

    sendNotificationToUser(recipientUserId, notification);
    return notification;
  } catch (error) {
    console.error("Failed to create and emit notification:", error);
    sendNotificationToUser(recipientUserId, { title, message, type });
    return null;
  }
};

export const emitToUser = (userId: string, event: string, payload: unknown): void => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

export const emitToRole = (role: UserRole, event: string, payload: unknown): void => {
  if (!io) return;
  io.to(`role:${role}`).emit(event, payload);
};

export const emitToAll = (event: string, payload: unknown): void => {
  if (!io) return;
  io.emit(event, payload);
};

