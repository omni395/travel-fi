import { defineEventHandler, getQuery } from 'h3'
import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {

  const query = getQuery(event)
  const status = (query.status as string) || undefined
  const page = Number(query.page || 1)
  const pageSize = Number(query.pageSize || query.limit || 20)
  const offset = (page - 1) * pageSize
  const search = (query.search as string) || undefined

  const where: any = {}
  if (status) where.status = status

  if (search) {
    where.OR = [
      { ssid: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [points, total] = await Promise.all([
    prisma.wifiPoint.findMany({
      where,
      include: { user: { select: { id: true, name: true, profilePicture: true, email: true } }, _count: { select: { reviews: true, securityReports: true } }, reviews: { take: 0 } },
      take: pageSize,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.wifiPoint.count({ where }),
  ])

  // compute average ratings for admin view (cheap way)
  const pointsWithStats = await Promise.all(points.map(async (p) => {
    const avg = await prisma.review.aggregate({ where: { wifiPointId: p.id }, _avg: { rating: true } })
    return { ...p, averageRating: avg._avg.rating || 0 }
  }))

  return { success: true, data: { points: pointsWithStats, total, page, pageSize } }
})
