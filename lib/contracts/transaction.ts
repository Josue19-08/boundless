import { TransactionBuilder, rpc as SorobanRpc } from '@stellar/stellar-sdk';
import type { AssembledTransaction } from '@stellar/stellar-sdk/contract';
import { getRpcUrl, getNetworkPassphrase } from './index';

/**
 * Simulate a contract call and return the decoded result.
 * Uses the contract client's built-in simulation via AssembledTransaction.
 */
export async function simulateContract<T>(
  tx: AssembledTransaction<T>
): Promise<T> {
  await tx.simulate();
  return tx.result;
}

/**
 * Build an unsigned transaction XDR from an AssembledTransaction.
 * Simulates the transaction to populate Soroban data (footprint, auth entries),
 * then returns the XDR ready for wallet signing.
 */
export async function buildTransaction<T>(
  tx: AssembledTransaction<T>
): Promise<string> {
  await tx.simulate();
  return tx.toXDR();
}

export interface SubmitTransactionResult {
  hash: string;
  getResponse: SorobanRpc.Api.GetTransactionResponse;
}

/**
 * Submit a signed transaction XDR to the network.
 * Polls until confirmed or until maxWaitSeconds is reached.
 * Returns the hash and the final GetTransactionResponse so callers
 * can access write-method return values.
 */
export async function submitTransaction(
  signedXdr: string,
  maxWaitSeconds = 30
): Promise<SubmitTransactionResult> {
  const server = new SorobanRpc.Server(getRpcUrl());

  const sendResponse = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, getNetworkPassphrase())
  );

  if (sendResponse.status === 'ERROR') {
    throw new Error(
      `Transaction submission failed: ${JSON.stringify(sendResponse.errorResult)}`
    );
  }

  const hash = sendResponse.hash;
  const deadline = Date.now() + maxWaitSeconds * 1000;
  let getResponse = await server.getTransaction(hash);

  while (getResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
    if (Date.now() > deadline) {
      throw new Error(
        `Transaction ${hash} not confirmed within ${maxWaitSeconds}s`
      );
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    getResponse = await server.getTransaction(hash);
  }

  if (getResponse.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
    throw new Error(`Transaction failed: ${hash}`);
  }

  return { hash, getResponse };
}
