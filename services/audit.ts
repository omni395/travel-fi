// server/services/audit.ts
import prisma from '~/lib/prisma'

type AuditInput = {
  userId?: number
  action: string
  targetType?: string
  targetId?: number
  result?: 'success' | 'failure'
  reason?: string
  ipAddress?: string
  userAgent?: string
  metadata?: any
  sessionId?: string
}

export async function writeAudit(input: AuditInput) {
  const data = {
    userId: input.userId,
    action: input.action,
    targetType: input.targetType || 'System',
    targetId: input.targetId,
    result: input.result || 'success',
    reason: input.reason,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    metadata: input.metadata,
    sessionId: input.sessionId
  }
  try {
    await prisma.auditLog.create({ data })
  } catch (e) {
    console.error('Audit write failed:', e)
  }
}