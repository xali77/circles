import { UserProfile, Circle, CircleMember, FriendBet, Bet, LeaderboardEntry } from './types';

// --- Profiles ---

export async function syncProfile(profile: UserProfile): Promise<void> {
  await fetch('/api/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
}

export async function fetchAllProfiles(): Promise<Record<string, UserProfile>> {
  const res = await fetch('/api/profiles/all');
  return res.json();
}

// --- Circles ---

export async function fetchCircles(): Promise<Circle[]> {
  const res = await fetch('/api/circles');
  return res.json();
}

export async function fetchMyCircles(address: string): Promise<Circle[]> {
  const circles = await fetchCircles();
  return circles.filter((c) => c.members.some((m) => m.address === address));
}

export async function fetchCircleByInviteCode(code: string): Promise<Circle | null> {
  const res = await fetch(`/api/circles/invite?code=${encodeURIComponent(code)}`);
  return res.json();
}

export async function apiCreateCircle(circle: Circle): Promise<Circle> {
  const res = await fetch('/api/circles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(circle) });
  return res.json();
}

export async function apiJoinCircle(circleId: string, member: CircleMember): Promise<boolean> {
  const res = await fetch('/api/circles/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ circleId, member }) });
  return res.ok;
}

// --- Friend Bets ---

export async function fetchMyFeedBets(address: string): Promise<FriendBet[]> {
  const res = await fetch(`/api/friendbets?address=${encodeURIComponent(address)}`);
  return res.json();
}

export async function apiSaveFriendBet(bet: FriendBet): Promise<FriendBet> {
  const res = await fetch('/api/friendbets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bet) });
  return res.json();
}

export async function apiUpdateFriendBet(id: string, updates: Partial<FriendBet>): Promise<void> {
  await fetch('/api/friendbets/update', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, updates }) });
}

// --- Bets ---

export async function fetchBets(bettor?: string): Promise<Bet[]> {
  const url = bettor ? `/api/bets?bettor=${encodeURIComponent(bettor)}` : '/api/bets';
  const res = await fetch(url);
  return res.json();
}

export async function apiPlaceBet(bet: Bet): Promise<void> {
  await fetch('/api/bets/place', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bet) });
}

export async function apiRecordBetResult(address: string, won: boolean, pnl: number): Promise<void> {
  await fetch('/api/friendbets/result', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address, won, pnl }) });
}

// --- Leaderboard ---

export async function fetchCircleLeaderboard(circleId: string): Promise<LeaderboardEntry[]> {
  const res = await fetch(`/api/circles/leaderboard?circleId=${encodeURIComponent(circleId)}`);
  return res.json();
}
