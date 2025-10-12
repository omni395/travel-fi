import { defineEventHandler, createError } from 'h3'
import prisma from '~/lib/prisma'
import { getBalance, getTransactionHistory } from '~/services/token.service'

export default defineEventHandler(async (event) => {
  try {
    const user = event.context?.auth?.user
    
    if (!user || !user.walletAddress) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User not found or wallet not connected'
      })
    }

  const balance = await getBalance(user.walletAddress)
  const transactions = await getTransactionHistory(user.walletAddress)

    return {
      balance,
      transactions
    }
  } catch (error: any) {
    console.error('Error getting token balance:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }
})