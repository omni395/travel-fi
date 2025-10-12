import prisma from '~/lib/prisma'

const REPUTATION_RULES = {
  CONTENT_REMOVED: -5,
  CONTENT_MODERATED: -3,
  UPVOTE_RECEIVED: 2,
  DOWNVOTE_RECEIVED: -1,
  HELPFUL_REPORT: 3,
  SPAM_REPORT: -2
}

export async function updateUserReputation(userId: number, action: keyof typeof REPUTATION_RULES) {
  const points = REPUTATION_RULES[action]
  
  await prisma.user.update({
    where: { id: userId },
    data: { 
      reputation: { increment: points }
    }
  })
}

export async function processVote(userId: number, targetType: string, targetId: number, isUpvote: boolean) {
  const voteType = isUpvote ? 'upvote' : 'downvote'
  
  try {
    // Создаем голос или обновляем существующий
    await prisma.vote.upsert({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId
        }
      },
      create: {
        userId,
        targetType,
        targetId,
        type: voteType
      },
      update: {
        type: voteType
      }
    })

    // Обновляем счетчики целевого пользователя
    const targetContent = await getTargetContent(targetType, targetId)
    if (targetContent?.userId) {
      await prisma.user.update({
        where: { id: targetContent.userId },
        data: {
          totalVotesReceived: { increment: 1 },
          reputation: { increment: isUpvote ? REPUTATION_RULES.UPVOTE_RECEIVED : REPUTATION_RULES.DOWNVOTE_RECEIVED }
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error processing vote:', error)
    return { error: 'Failed to process vote' }
  }
}

async function getTargetContent(targetType: string, targetId: number) {
  switch(targetType) {
    case 'Review':
      return await prisma.review.findUnique({ where: { id: targetId } })
    case 'SecurityReport':
      return await prisma.securityReport.findUnique({ where: { id: targetId } })
    case 'WifiPoint':
      return await prisma.wifiPoint.findUnique({ where: { id: targetId } })
    default:
      return null
  }
}

export async function getUserReputation(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      reputation: true,
      totalVotesReceived: true,
      status: true
    }
  })
  
  return {
    ...user,
    level: calculateReputationLevel(user?.reputation || 0)
  }
}

function calculateReputationLevel(reputation: number) {
  if (reputation < -50) return 'UNTRUSTED'
  if (reputation < 0) return 'SUSPICIOUS'
  if (reputation < 50) return 'NEUTRAL'
  if (reputation < 100) return 'TRUSTED'
  return 'VERIFIED'
}