import { createClient, type VercelKV } from '@vercel/kv';

let _kv: VercelKV | null = null;

export function getKV(): VercelKV {
  if (!_kv) {
    const url = process.env.KV_REST_API_URL || process.env.STORAGE_REST_API_URL || '';
    const token = process.env.KV_REST_API_TOKEN || process.env.STORAGE_REST_API_TOKEN || '';
    _kv = createClient({ url, token });
  }
  return _kv;
}
