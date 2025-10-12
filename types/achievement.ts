export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  points: number
  tokens?: number
  condition: (stats: UserStats) => boolean
  type: 'milestone' | 'challenge' | 'special'
}

export interface UserStats {
  contributions: number
  wifiPoints: number
  reviews: number
  securityReports: number
  referrals: number
  loginStreak: number
  uniqueCities: number
  uniqueCountries: number
  totalPoints: number
  verifiedEmail: boolean
  hasWallet: boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  // Milestone Achievements
  {
    id: 'first_wifi',
    title: 'First Steps',
    description: 'Add your first Wi-Fi point',
    icon: 'mdi-wifi',
    points: 50,
    tokens: 5,
    condition: (stats) => stats.wifiPoints >= 1,
    type: 'milestone'
  },
  {
    id: 'wifi_collector',
    title: 'Wi-Fi Collector',
    description: 'Add 10 Wi-Fi points',
    icon: 'mdi-wifi-star',
    points: 100,
    tokens: 10,
    condition: (stats) => stats.wifiPoints >= 10,
    type: 'milestone'
  },
  {
    id: 'helpful_reviewer',
    title: 'Helpful Reviewer',
    description: 'Write 5 reviews',
    icon: 'mdi-star',
    points: 75,
    tokens: 7,
    condition: (stats) => stats.reviews >= 5,
    type: 'milestone'
  },
  {
    id: 'security_expert',
    title: 'Security Expert',
    description: 'Submit 3 security reports',
    icon: 'mdi-shield-check',
    points: 60,
    tokens: 6,
    condition: (stats) => stats.securityReports >= 3,
    type: 'milestone'
  },
  
  // Challenge Achievements
  {
    id: 'login_streak_7',
    title: 'Weekly Warrior',
    description: 'Login 7 days in a row',
    icon: 'mdi-calendar-check',
    points: 70,
    condition: (stats) => stats.loginStreak >= 7,
    type: 'challenge'
  },
  {
    id: 'globe_trotter',
    title: 'Globe Trotter',
    description: 'Add Wi-Fi points in 3 different countries',
    icon: 'mdi-earth',
    points: 150,
    tokens: 15,
    condition: (stats) => stats.uniqueCountries >= 3,
    type: 'challenge'
  },
  
  // Special Achievements
  {
    id: 'crypto_pioneer',
    title: 'Crypto Pioneer',
    description: 'Connect your Web3 wallet',
    icon: 'mdi-wallet',
    points: 50,
    tokens: 5,
    condition: (stats) => stats.hasWallet,
    type: 'special'
  },
  {
    id: 'verified_user',
    title: 'Verified User',
    description: 'Verify your email address',
    icon: 'mdi-email-check',
    points: 25,
    condition: (stats) => stats.verifiedEmail,
    type: 'special'
  }
]