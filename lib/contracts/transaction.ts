import {
  TransactionBuilder,
  BASE_FEE,
  rpc as SorobanRpc,
} from '@stellar/stellar-sdk';
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
 * The returned XDR can be passed to a wallet for signing.
 */
export async function buildTransaction<T>(
  tx: AssembledTransaction<T>,
  sourcePublicKey: string
): Promise<string> {
  const server = new SorobanRpc.Server(getRpcUrl());
  const account = await server.getAccount(sourcePublicKey);

  const builtTx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .setTimeout(30)
    .build();

  await server.simulateTransaction(builtTx);

  return tx.toXDR();
}

/**
 * Submit a signed transaction XDR to the network.
 * Returns the transaction hash on success.
 */
export async function submitTransaction(signedXdr: string): Promise<string> {
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
  let getResponse = await server.getTransaction(hash);

  while (getResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    getResponse = await server.getTransaction(hash);
  }

  if (getResponse.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
    throw new Error(`Transaction failed: ${hash}`);
  }

  return hash;
}
