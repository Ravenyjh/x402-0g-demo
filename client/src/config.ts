import { defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// 0g Chain configuration
export const zeroGChain = defineChain({
  id: 16661,
  name: '0g Chain',
  network: '0g-chain',
  nativeCurrency: {
    decimals: 18,
    name: '0g Chain Token',
    symbol: '0G',
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0g Explorer',
      url: 'https://explorer.0g.ai',
    },
  },
});

// Client configuration
export const config = {
  // Resource server (API endpoints)
  resourceServerUrl: process.env.RESOURCE_SERVER_URL || 'http://localhost:3002',
  
  // Client wallet private key (for making payments)
  clientPrivateKey: process.env.CLIENT_PRIVATE_KEY,
  
  // 0g Chain details
  chain: zeroGChain,
  network: '0g-chain' as const,
  
  // USDC.e contract on 0g Chain
  usdcAddress: '0x1f3aa82227281ca364bfb3d253b0f1af1da6473e',
};

// Validate configuration
if (!config.clientPrivateKey) {
  console.error('❌ CLIENT_PRIVATE_KEY environment variable is required');
  console.error('   This should be the private key of an account with USDC.e balance');
  process.exit(1);
}

// Create client account
export const clientAccount = privateKeyToAccount(config.clientPrivateKey as `0x${string}`);

console.log(`🔑 Client wallet: ${clientAccount.address}`);
console.log(`🌐 Resource server: ${config.resourceServerUrl}`);
console.log(`⛓️  Network: ${config.network} (${config.chain.id})`);
console.log(`💰 USDC.e: ${config.usdcAddress}`);