import { Prisma } from '@prisma/client';
import prisma from '../config/db.js';

export interface LogAuditInput {
  actorUserId?: string | null;
  action:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'STATUS_CHANGE'
    | 'STATUS_UPDATE'
    | 'ASSIGN'
    | 'REASSIGN'
    | 'RECALL'
    | 'IMPORT'
    | 'IMPORT_PREVIEW'
    | 'EXPORT'
    | 'LOGIN'
    | 'LOGOUT'
    | 'PASSWORD_CHANGE';
  entityType: 'Lead' | 'User' | 'ImportBatch' | 'LeadFollowUp' | 'LeadNote' | 'Auth' | 'Report';
  entityId?: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string | null;
  tx?: Prisma.TransactionClient;
}

export class AuditService {
  private static readonly SENSITIVE_KEYS = new Set([
    'password',
    'passwordhash',
    'token',
    'secret',
    'accesstoken',
    'refreshtoken',
    'auth',
  ]);

  /**
   * Sanitizes payloads by removing or masking sensitive information like passwords and tokens.
   */
  public static sanitizePayload(val: unknown): any {
    if (!val || typeof val !== 'object') {
      return val;
    }

    if (Array.isArray(val)) {
      return val.map((item) => this.sanitizePayload(item));
    }

    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(val as Record<string, any>)) {
      if (this.SENSITIVE_KEYS.has(key.toLowerCase())) {
        clean[key] = '[REDACTED]';
      } else if (value && typeof value === 'object') {
        clean[key] = this.sanitizePayload(value);
      } else {
        clean[key] = value;
      }
    }
    return clean;
  }

  /**
   * Logs an audit record to PostgreSQL.
   * If a transaction client `tx` is provided, the record is created atomically within that transaction.
   * Otherwise, it creates the log using the global Prisma client with safe failover logging.
   */
  public static async log(input: LogAuditInput): Promise<void> {
    const client = input.tx || prisma;
    const sanitizedOld = input.oldValue ? this.sanitizePayload(input.oldValue) : undefined;
    const sanitizedNew = input.newValue ? this.sanitizePayload(input.newValue) : undefined;

    const data: Prisma.AuditLogCreateInput = {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? undefined,
      oldValue: sanitizedOld !== undefined ? sanitizedOld : Prisma.JsonNull,
      newValue: sanitizedNew !== undefined ? sanitizedNew : Prisma.JsonNull,
      ipAddress: input.ipAddress ?? undefined,
      ...(input.actorUserId ? { actor: { connect: { id: input.actorUserId } } } : {}),
    };

    try {
      await client.auditLog.create({ data });
    } catch (error) {
      if (input.tx) {
        // If we're inside an atomic transaction, propagate error to trigger rollback
        throw error;
      }
      // Outside transaction: non-blocking log failover to prevent blocking business requests
      console.error('[AuditService] Failed to record audit log:', error);
    }
  }
}

export default AuditService;
