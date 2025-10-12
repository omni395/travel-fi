export type RankType = 'beginner' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'legend'

export interface Rank {
  type: RankType
  minPoints: number
  image: string
  tokenReward: number
}

export const RANKS: Rank[] = [
  {
    type: 'beginner',
    minPoints: 0,
    image: '/assets/images/beginner-logo-1.png',
    tokenReward: 5
  },
  {
    type: 'bronze',
    minPoints: 100,
    image: '/assets/images/bronze-logo-1.png',
    tokenReward: 10
  },
  {
    type: 'silver',
    minPoints: 500,
    image: '/assets/images/silver-logo-1.png',
    tokenReward: 25
  },
  {
    type: 'gold',
    minPoints: 1000,
    image: '/assets/images/gold-logo-1.png',
    tokenReward: 50
  },
  {
    type: 'platinum',
    minPoints: 2500,
    image: '/assets/images/platinum-logo-1.png',
    tokenReward: 100
  },
  {
    type: 'legend',
    minPoints: 5000,
    image: '/assets/images/legend-logo-1.png',
    tokenReward: 250
  }
]

export function calculateRank(points: number): Rank {
  return [...RANKS].reverse().find(rank => points >= rank.minPoints) || RANKS[0]
}

export function getNextRank(points: number): Rank | null {
  const currentRank = calculateRank(points)
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1]
  return nextRank || null
}

export function getPointsToNextRank(points: number): number {
  const nextRank = getNextRank(points)
  return nextRank ? nextRank.minPoints - points : 0
}