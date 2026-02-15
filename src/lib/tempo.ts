import { encodeFunctionData, parseUnits, formatUnits, type Address } from 'viem';

export const ALPHA_USD = '0x20c0000000000000000000000000000000000001' as Address;
export const PATH_USD = '0x20c0000000000000000000000000000000000000' as Address;

export const TEMPO_CHAIN = {
  id: 42431,
  name: 'Tempo Testnet',
  network: 'tempo-testnet',
  nativeCurrency: { name: 'USD', symbol: 'USD', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.moderato.tempo.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Tempo Explorer', url: 'https://explore.tempo.xyz' },
  },
} as const;

export const tip20Abi = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'transferWithMemo',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'memo', type: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function encodeBetMemo(marketId: string, position: 'yes' | 'no'): `0x${string}` {
  const memo = `circles:${marketId.slice(0, 8)}:${position}`;
  const hex = Buffer.from(memo).toString('hex').padEnd(64, '0');
  return `0x${hex}`;
}

export function encodeTransferWithMemo(recipient: Address, amount: string, memo: `0x${string}`) {
  return encodeFunctionData({
    abi: tip20Abi,
    functionName: 'transferWithMemo',
    args: [recipient, parseUnits(amount, 6), memo],
  });
}

export function encodeTransfer(recipient: Address, amount: string) {
  return encodeFunctionData({
    abi: tip20Abi,
    functionName: 'transfer',
    args: [recipient, parseUnits(amount, 6)],
  });
}

export function formatUSD(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${num.toFixed(2)}`;
}

export function formatTokenAmount(raw: bigint): string {
  return formatUnits(raw, 6);
}

export function explorerTxUrl(hash: string): string {
  return `https://explore.tempo.xyz/tx/${hash}`;
}

export function explorerAddressUrl(address: string): string {
  return `https://explore.tempo.xyz/address/${address}`;
}

export function truncateAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function fetchAlphaBalance(address: string): Promise<string> {
  const data = encodeFunctionData({
    abi: tip20Abi,
    functionName: 'balanceOf',
    args: [address as Address],
  });
  const res = await fetch(TEMPO_CHAIN.rpcUrls.default.http[0], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to: ALPHA_USD, data }, 'latest'],
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  const raw = BigInt(json.result);
  return formatUnits(raw, 6);
}
