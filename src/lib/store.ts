import { FriendBet, Bet, UserProfile, LeaderboardEntry, Badge, Circle, CircleMember } from './types';

const BETS_KEY = 'circles_bets';
const FRIEND_BETS_KEY = 'circles_friend_bets';
const PROFILE_KEY = 'circles_profile';
const CIRCLES_KEY = 'circles_groups';
const ALL_PROFILES_KEY = 'circles_all_profiles';

// --- Profile ---

export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  const all = getAllProfiles();
  all[profile.address] = profile;
  localStorage.setItem(ALL_PROFILES_KEY, JSON.stringify(all));
}

export function getAllProfiles(): Record<string, UserProfile> {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(ALL_PROFILES_KEY);
  return raw ? JSON.parse(raw) : {};
}

// --- Circles ---

export function getCircles(): Circle[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(CIRCLES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getMyCircles(address: string): Circle[] {
  return getCircles().filter((c) => c.members.some((m) => m.address === address));
}

export function getCircleById(id: string): Circle | null {
  return getCircles().find((c) => c.id === id) || null;
}

export function getCircleByInviteCode(code: string): Circle | null {
  return getCircles().find((c) => c.inviteCode === code.toUpperCase()) || null;
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function createCircle(name: string, emoji: string, creator: UserProfile): Circle {
  const circle: Circle = {
    id: `crc-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    name,
    emoji,
    inviteCode: generateInviteCode(),
    creatorAddress: creator.address,
    members: [{ address: creator.address, name: creator.name, avatar: creator.avatar, joinedAt: Date.now() }],
    createdAt: Date.now(),
  };
  const circles = getCircles();
  circles.push(circle);
  localStorage.setItem(CIRCLES_KEY, JSON.stringify(circles));
  return circle;
}

export function joinCircle(circleId: string, member: CircleMember): boolean {
  const circles = getCircles();
  const circle = circles.find((c) => c.id === circleId);
  if (!circle) return false;
  if (circle.members.some((m) => m.address === member.address)) return false;
  circle.members.push(member);
  localStorage.setItem(CIRCLES_KEY, JSON.stringify(circles));
  return true;
}

// --- Friend Bets ---

export function getFriendBets(): FriendBet[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(FRIEND_BETS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getMyFeedBets(address: string): FriendBet[] {
  const myCircles = getMyCircles(address);
  const circleIds = new Set(myCircles.map((c) => c.id));
  return getFriendBets()
    .filter((b) => circleIds.has(b.circleId))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function saveFriendBet(bet: FriendBet): void {
  const bets = getFriendBets();
  bets.unshift(bet);
  localStorage.setItem(FRIEND_BETS_KEY, JSON.stringify(bets));
}

export function updateFriendBet(id: string, updates: Partial<FriendBet>): void {
  const bets = getFriendBets();
  const idx = bets.findIndex((b) => b.id === id);
  if (idx !== -1) {
    bets[idx] = { ...bets[idx], ...updates };
    localStorage.setItem(FRIEND_BETS_KEY, JSON.stringify(bets));
  }
}

// --- Bets ---

export function getBets(): Bet[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(BETS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveBet(bet: Bet): void {
  const bets = getBets();
  bets.unshift(bet);
  localStorage.setItem(BETS_KEY, JSON.stringify(bets));

  const friendBets = getFriendBets();
  const fb = friendBets.find((fb) => fb.id === bet.marketId);
  if (fb) {
    fb.bets.push(bet);
    fb.totalPool += bet.amount;
    localStorage.setItem(FRIEND_BETS_KEY, JSON.stringify(friendBets));
  }

  const profile = getProfile();
  if (profile && profile.address === bet.bettor) {
    profile.stats.totalBets += 1;
    profile.stats.pending += 1;
    profile.stats.totalVolume += bet.amount;
    saveProfile(profile);
  }
}

export function recordBetResult(address: string, won: boolean, pnl: number): void {
  const all = getAllProfiles();
  const profile = all[address];
  if (profile) {
    profile.stats.pending = Math.max(0, profile.stats.pending - 1);
    if (won) {
      profile.stats.wins += 1;
      profile.stats.currentStreak += 1;
      profile.stats.bestStreak = Math.max(profile.stats.bestStreak, profile.stats.currentStreak);
    } else {
      profile.stats.losses += 1;
      profile.stats.currentStreak = 0;
    }
    profile.stats.netPnL += pnl;
    all[address] = profile;
    localStorage.setItem(ALL_PROFILES_KEY, JSON.stringify(all));
    const myProfile = getProfile();
    if (myProfile && myProfile.address === address) {
      saveProfile(profile);
    }
  }
}

function getBadges(p: UserProfile): Badge[] {
  const s = p.stats;
  const badges: Badge[] = [];
  if (s.totalBets >= 20 && s.wins / s.totalBets >= 0.8) badges.push('oracle');
  if (s.totalBets >= 15) badges.push('degen');
  if (s.totalVolume >= 100) badges.push('whale');
  if (s.currentStreak >= 5) badges.push('streak');
  return badges;
}

export function getCircleLeaderboard(circleId: string): LeaderboardEntry[] {
  const circle = getCircleById(circleId);
  if (!circle) return [];
  const all = getAllProfiles();

  const entries = circle.members
    .map((m) => all[m.address])
    .filter(Boolean)
    .map((p) => ({ ...p, rank: 0, badges: getBadges(p) }))
    .sort((a, b) => {
      const aRate = a.stats.totalBets > 0 ? a.stats.wins / a.stats.totalBets : 0;
      const bRate = b.stats.totalBets > 0 ? b.stats.wins / b.stats.totalBets : 0;
      if (bRate !== aRate) return bRate - aRate;
      return b.stats.netPnL - a.stats.netPnL;
    });

  entries.forEach((e, i) => (e.rank = i + 1));
  return entries;
}
