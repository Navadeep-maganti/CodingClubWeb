import { db } from "@/lib/db"

export type AuditAction =
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "USER_APPROVED"
  | "USER_REVOKED"
  | "ROLE_ASSIGNED"
  | "ROLE_REMOVED"
  | "TEAM_MEMBER_CREATED"
  | "TEAM_MEMBER_UPDATED"
  | "TEAM_MEMBER_DELETED"
  | "BLOG_CREATED"
  | "BLOG_UPDATED"
  | "BLOG_DELETED"
  | "BLOG_PUBLISHED"
  | "BLOG_UNPUBLISHED"
  | "BLOG_AUTHOR_APPROVED"
  | "BLOG_AUTHOR_REVOKED"
  | "IMAGE_UPLOADED"
  | "LOGIN_SUCCESS"
  | "LOGIN_DENIED"

export interface AuditEntry {
  actorId?: string | null
  action: AuditAction | string
  entityType: string
  entityId?: string | null
  metadata?: Record<string, unknown> | null
  ipAddress?: string | null
  userAgent?: string | null
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: entry.actorId || null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId || null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
      },
    })
  } catch (err) {
    // Audit logging must NEVER break the calling operation.
    console.error("[audit] failed to write log:", err)
  }
}
