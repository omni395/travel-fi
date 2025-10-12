import { ethers } from 'ethers'
import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()

// ABI токена TRAVELFI
export const TRAVELFI_TOKEN_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function mint(address to, uint256 amount)"
]

// Адрес контракта токена TRAVELFI в сети Polygon
export const TRAVELFI_TOKEN_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS || ''

// Настройка провайдера для Polygon
let provider: ethers.JsonRpcProvider | null = null
export function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    if (!process.env.POLYGON_RPC_URL) {
      throw new Error('POLYGON_RPC_URL is not defined')
    }
    provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL)
  }
  return provider
}

// Получение подписанта для транзакций
let signer: ethers.Wallet | null = null
export function getSigner(provider: ethers.JsonRpcProvider): ethers.Wallet {
  if (!signer) {
    if (!process.env.TOKEN_PRIVATE_KEY) {
      throw new Error('TOKEN_PRIVATE_KEY is not defined')
    }
    signer = new ethers.Wallet(process.env.TOKEN_PRIVATE_KEY, provider)
  }
  return signer
}