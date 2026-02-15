export interface UserProfile {
  address: string;
  name: string;
  avatar: string;
  createdAt: number;
  stats: UserStats;
}

export interface UserStats {
  totalBets: number;
  wins: number;
  losses: number;
  pending: number;
  netPnL: number;
  currentStreak: number;
  bestStreak: number;
  totalVolume: number;
}

export interface Circle {
  id: string;
  name: string;
  emoji: string;
  inviteCode: string;
  creatorAddress: string;
  members: CircleMember[];
  createdAt: number;
}

export interface CircleMember {
  address: string;
  name: string;
  avatar: string;
  joinedAt: number;
}

export interface FriendBet {
  id: string;
  question: string;
  creator: string;
  creatorAddress: string;
  creatorAvatar: string;
  circleId: string;
  circleName: string;
  circleEmoji: string;
  deadline: number;
  minBet: number;
  resolved: boolean;
  outcome?: 'yes' | 'no';
  totalPool: number;
  bets: Bet[];
  createdAt: number;
}

export interface Bet {
  id: string;
  marketId: string;
  marketType: 'friend';
  bettor: string;
  bettorName: string;
  bettorAvatar: string;
  position: 'yes' | 'no';
  amount: number;
  timestamp: number;
  txHash?: string;
}

export type Badge = 'oracle' | 'degen' | 'whale' | 'streak';

export interface LeaderboardEntry extends UserProfile {
  rank: number;
  badges: Badge[];
}
