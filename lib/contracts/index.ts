import type { ClientOptions as ContractClientOptions } from '@stellar/stellar-sdk/contract';
import { Client as BountyRegistryClient } from './bounty-registry/src/index';
import { Client as CoreEscrowClient } from './core-escrow/src/index';
import { Client as ReputationRegistryClient } from './reputation-registry/src/index';
import { Client as ProjectRegistryClient } from './project-registry/src/index';

export type {
  BountyRegistryClient,
  CoreEscrowClient,
  ReputationRegistryClient,
  ProjectRegistryClient,
};
export * from './bounty-registry/src/index';
export * from './transaction';

// ─── Network config ────────────────────────────────────────────────────────────

const STELLAR_NETWORK =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'public' ? 'public' : 'testnet';

const RPC_URLS: Record<string, string> = {
  testnet: 'https://soroban-testnet.stellar.org',
  public: 'https://mainnet.sorobanrpc.com',
};

const NETWORK_PASSPHRASES: Record<string, string> = {
  testnet: 'Test SDF Network ; September 2015',
  public: 'Public Global Stellar Network ; September 2015',
};

// ─── Contract addresses ────────────────────────────────────────────────────────

const CONTRACT_ADDRESSES = {
  bountyRegistry:
    process.env.NEXT_PUBLIC_BOUNTY_REGISTRY_CONTRACT_ID ??
    'CBWXIV3DERH4GKADOTEEI2QADGZAMMJT4T2B5LFVZULGHEP5BACK2TLY',
  coreEscrow:
    process.env.NEXT_PUBLIC_CORE_ESCROW_CONTRACT_ID ??
    'CA3VZVIMGLVG5EJF2ACB3LPMGQ6PID4TJTB3D2B3L6JIZRIS7NQPVPHN',
  reputationRegistry:
    process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_CONTRACT_ID ??
    'CBVQEDH4T5KOJQSESL2HEFI2YZWXPSZQ5TASKRNWAVZFIWAKEU74RFF4',
  projectRegistry:
    process.env.NEXT_PUBLIC_PROJECT_REGISTRY_CONTRACT_ID ??
    'CCG4QM2GZKBN7GBRAE3PFNE3GM2B6QRS7FOKLHGV2FT2HHETIS7JUVYT',
} as const;

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function getRpcUrl(): string {
  return RPC_URLS[STELLAR_NETWORK];
}

export function getNetworkPassphrase(): string {
  return NETWORK_PASSPHRASES[STELLAR_NETWORK];
}

function baseClientOptions(contractId: string): ContractClientOptions {
  return {
    contractId,
    networkPassphrase: getNetworkPassphrase(),
    rpcUrl: getRpcUrl(),
  };
}

// ─── Client factories ──────────────────────────────────────────────────────────

/**
 * Create a Bounty Registry client.
 * Pass `publicKey` to enable transaction building for write operations.
 */
export function createBountyRegistryClient(
  publicKey?: string
): BountyRegistryClient {
  return new BountyRegistryClient({
    ...baseClientOptions(CONTRACT_ADDRESSES.bountyRegistry),
    ...(publicKey ? { publicKey } : {}),
  });
}

/**
 * Create a Core Escrow client.
 * Pass `publicKey` to enable transaction building for write operations.
 */
export function createCoreEscrowClient(publicKey?: string): CoreEscrowClient {
  return new CoreEscrowClient({
    ...baseClientOptions(CONTRACT_ADDRESSES.coreEscrow),
    ...(publicKey ? { publicKey } : {}),
  });
}

/**
 * Create a Reputation Registry client.
 * Pass `publicKey` to enable transaction building for write operations.
 */
export function createReputationRegistryClient(
  publicKey?: string
): ReputationRegistryClient {
  return new ReputationRegistryClient({
    ...baseClientOptions(CONTRACT_ADDRESSES.reputationRegistry),
    ...(publicKey ? { publicKey } : {}),
  });
}

/**
 * Create a Project Registry client.
 * Pass `publicKey` to enable transaction building for write operations.
 */
export function createProjectRegistryClient(
  publicKey?: string
): ProjectRegistryClient {
  return new ProjectRegistryClient({
    ...baseClientOptions(CONTRACT_ADDRESSES.projectRegistry),
    ...(publicKey ? { publicKey } : {}),
  });
}
