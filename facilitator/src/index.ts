import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createWalletClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { settle, verify } from 'ravenyjh-x402/facilitator';
import { 
  PaymentPayload, 
  PaymentRequirements, 
  PaymentPayloadSchema, 
  PaymentRequirementsSchema, 
  createConnectedClient, 
  createSigner,
  SupportedEVMNetworks,
  Signer,
  ConnectedClient
} from 'ravenyjh-x402/types';

// Load environment variables
dotenv.config();

// Define 0g Chain
const zeroGChain = defineChain({
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

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Create facilitator wallet
if (!process.env.FACILITATOR_PRIVATE_KEY) {
  console.error('❌ FACILITATOR_PRIVATE_KEY environment variable is required');
  process.exit(1);
}

const account = privateKeyToAccount(process.env.FACILITATOR_PRIVATE_KEY as `0x${string}`);
const facilitatorWallet = createWalletClient({
  account,
  chain: zeroGChain,
  transport: http()
});

console.log(`🔑 Facilitator wallet address: ${account.address}`);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    network: '0g-chain',
    facilitator: account.address
  });
});

// Get supported payment schemes
app.get('/supported', (req, res) => {
  res.json({
    kinds: [
      {
        scheme: 'exact',
        network: '0g-chain'
      }
    ]
  });
});

// Verify payment endpoint
app.post('/verify', async (req, res) => {
  try {
    const { paymentPayload, paymentRequirements } = req.body;

    console.log('🔍 Verifying payment...');
    console.log('Payment Requirements:', JSON.stringify(paymentRequirements, null, 2));
    console.log('Payment Payload:', JSON.stringify(paymentPayload, null, 2));

    // Create appropriate client based on network
    let client: Signer | ConnectedClient;
    if (SupportedEVMNetworks.includes(paymentRequirements.network)) {
      client = createConnectedClient(paymentRequirements.network);
    } else {
      throw new Error(`Unsupported network: ${paymentRequirements.network}`);
    }

    // Verify payment
    const verificationResult = await verify(
      client,
      paymentPayload,
      paymentRequirements
    );

    console.log('✅ Verification result:', verificationResult);

    res.json(verificationResult);
  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(400).json({
      isValid: false,
      invalidReason: 'verification_failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Settle payment endpoint
app.post('/settle', async (req, res) => {
  try {
    const { paymentPayload, paymentRequirements } = req.body;

    console.log('💰 Settling payment...');
    console.log('Payment Payload:', JSON.stringify(paymentPayload, null, 2));

    // Create signer for settlement
    const signer = await createSigner(paymentRequirements.network, process.env.FACILITATOR_PRIVATE_KEY as string);

    // Settle payment on blockchain
    const settlementResult = await settle(
      signer,
      paymentPayload,
      paymentRequirements
    );

    console.log('✅ Settlement result:', settlementResult);

    res.json(settlementResult);
  } catch (error) {
    console.error('❌ Settlement error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      transaction: null,
      network: '0g-chain'
    });
  }
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Facilitator server running on port ${PORT}`);
  console.log(`🌐 Network: 0g Chain (${zeroGChain.id})`);
  console.log(`📍 USDC.e Contract: 0x1f3aa82227281ca364bfb3d253b0f1af1da6473e`);
  console.log(`\n📋 Endpoints:`);
  console.log(`  GET  /health     - Health check`);
  console.log(`  GET  /supported  - Supported payment schemes`);
  console.log(`  POST /verify     - Verify payment`);
  console.log(`  POST /settle     - Settle payment`);
});

export default app;