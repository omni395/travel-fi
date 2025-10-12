// Минимальный ABI для баланса и истории
const ERC20_ABI_FULL = [
  'function balanceOf(address owner) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
]

export async function getBalance(address: string) {
  if (!config.tokenContractAddress || !config.polygonRpcUrl) {
    throw new Error('Token balance not configured')
  }
  const provider = new ethers.JsonRpcProvider(config.polygonRpcUrl)
  const contract = new ethers.Contract(config.tokenContractAddress, ERC20_ABI_FULL, provider)
  const decimals = config.tokenDecimals ? Number(config.tokenDecimals) : 18
  if (typeof contract.balanceOf !== 'function') throw new Error('balanceOf not available')
  const balance = await contract['balanceOf'](address)
  return ethers.formatUnits(balance, decimals)
}

export async function getTransactionHistory(address: string) {
  if (!config.tokenContractAddress || !config.polygonRpcUrl) {
    throw new Error('Token history not configured')
  }
  const provider = new ethers.JsonRpcProvider(config.polygonRpcUrl)
  const contract = new ethers.Contract(config.tokenContractAddress, ERC20_ABI_FULL, provider)
  if (!contract.filters || typeof contract.filters.Transfer !== 'function') throw new Error('Transfer event not available')
  const sentFilter = contract.filters.Transfer(address, null)
  const receivedFilter = contract.filters.Transfer(null, address)
  const [sentEvents, receivedEvents] = await Promise.all([
    contract.queryFilter(sentFilter, -10000),
    contract.queryFilter(receivedFilter, -10000)
  ])
  const events = [...sentEvents, ...receivedEvents].sort((a, b) => b.blockNumber - a.blockNumber)
  return await Promise.all(events.map(async (event: any) => {
    const block = await provider.getBlock(event.blockNumber)
    // args: [from, to, value]
    const args = event.args || []
    return {
      hash: event.transactionHash,
      from: args[0],
      to: args[1],
      amount: ethers.formatUnits(args[2], config.tokenDecimals || 18),
      timestamp: block?.timestamp ? new Date(block.timestamp * 1000) : null,
      type: args[0] === address ? 'sent' : 'received'
    }
  }))
}
import { ethers } from 'ethers'
import prisma from '~/lib/prisma'

const config = useRuntimeConfig() as any

// Minimal ERC-20 ABI for transfer
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)'
]

export async function transferTokens(to: string, amount: string) {
  if (!config.tokenContractAddress || !config.polygonRpcUrl || !config.tokenPrivateKey) {
    throw new Error('Token transfer not configured')
  }
  const polygonRpcUrl: string = String(config.polygonRpcUrl)
  const tokenPrivateKey: string = String(config.tokenPrivateKey)
  const tokenContractAddress: string = String(config.tokenContractAddress)
  const provider = new ethers.JsonRpcProvider(polygonRpcUrl)
  const wallet = new ethers.Wallet(tokenPrivateKey, provider)
  const contract = new ethers.Contract(tokenContractAddress, ERC20_ABI, wallet)
  const decimals = config.tokenDecimals ? Number(config.tokenDecimals) : 18
  const value = ethers.parseUnits(amount, decimals)
  const tx = await (contract as any).transfer(to, value)
  return tx
}

export async function rewardForConnect(userId: number, walletAddress: string) {
  // Rewards on connect: configurable amount
  try {
  const amount = config.rewardOnConnect || '0'
    if (Number(amount) <= 0) return null
    const tx = await transferTokens(walletAddress, amount)
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'token.reward_connect',
        targetType: 'User',
        targetId: userId,
        result: 'success',
        metadata: { txHash: tx.hash, amount },
      },
    })
    return tx.hash
  } catch (err: any) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'token.reward_connect',
        targetType: 'User',
        targetId: userId,
        result: 'failure',
        metadata: { error: String(err), walletAddress },
      },
    })
    throw err
  }
}
