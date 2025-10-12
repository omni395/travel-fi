import { H3Event, getCookie } from 'h3'
import prisma from '~/lib/prisma'

export async function getUser(event: H3Event) {
  const token = getCookie(event, 'auth-token')
  if (!token) return null
  
  const session = await prisma.session.findFirst({
    where: { 
      token,
      isActive: true,
      expiresAt: {
        gt: new Date()
      }
    }
  })
  
  if (!session) return null
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      points: true,
      isAdmin: true,
      walletAddress: true,
      status: true,
      confirmedEmail: true
    }
  })
  
  return user
}