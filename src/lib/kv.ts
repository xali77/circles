import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

let _client: RedisClient | null = null;
let _connected = false;

async function getClient(): Promise<RedisClient> {
  if (!_client) {
    _client = createClient({ url: process.env.REDIS_URL });
    _client.on('error', (err) => console.error('Redis error:', err));
  }
  if (!_connected) {
    await _client.connect();
    _connected = true;
  }
  return _client;
}

// Simple KV wrapper matching the interface our API routes expect
export const kv = {
  async get<T>(key: string): Promise<T | null> {
    const client = await getClient();
    const raw = await client.get(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return raw as T; }
  },

  async set(key: string, value: unknown): Promise<void> {
    const client = await getClient();
    await client.set(key, JSON.stringify(value));
  },

  async keys(pattern: string): Promise<string[]> {
    const client = await getClient();
    return client.keys(pattern);
  },

  async mget<T>(...keys: string[]): Promise<(T | null)[]> {
    const client = await getClient();
    const results = await client.mGet(keys);
    return results.map((r) => {
      if (!r) return null;
      try { return JSON.parse(r) as T; } catch { return r as T; }
    });
  },
};
