import prisma from '~~/lib/prisma'
import { z } from 'zod'

const schema = z.object({ walletAddress: z.string() })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { walletAddress } = schema.parse(body)
  if (!walletAddress) return { userId: null }
  const user = await prisma.user.findFirst({ where: { walletAddress } })
  return { userId: user ? user.id : null }
})
