export interface User {
  id: number
  email: string
  name?: string
  password?: string
  walletAddress?: string
  points: number
  role: string  // 'user', 'admin', 'moderator'
  badges: string[]
  leaderboardRank?: number | null
  // Extend with more from Prisma schema as needed
}