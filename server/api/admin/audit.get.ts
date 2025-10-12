// server/api/admin/audit.get.ts
import prisma from '~/lib/prisma'
import { createError, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  // Проверка роли из server/middleware/auth.ts (без импорта nuxt-auth-utils)
  const authUser = event.context?.auth?.user
  if (!authUser || !['admin', 'moderator'].includes(authUser.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const { page = 1, itemsPerPage = 10, sortBy = 'createdAt', sortDesc = 'true' } = getQuery(event) as any
  const skip = (Number(page) - 1) * Number(itemsPerPage)
  const take = Number(itemsPerPage)
  const order = sortDesc === 'true' ? 'desc' : 'asc'

  const total = await prisma.auditLog.count()
  const rows = await prisma.auditLog.findMany({
    orderBy: { [String(sortBy)]: order as any },
    skip,
    take
  })

  return {
    items: rows.map(r => ({
      id: r.id,
      action: r.action,
      targetType: r.targetType,
      targetId: r.targetId ?? undefined,
      ipAddress: r.ipAddress ?? undefined,
      userAgent: r.userAgent ?? undefined,
      metadata: r.metadata ?? undefined,
      createdAt: r.createdAt.toISOString()
    })),
    total
  }
})