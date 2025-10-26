
import axios from 'axios';
import { createWalletClient, http } from 'viem';
import { withPaymentInterceptor } from 'ravenyjh-x402-axios';
import { config, clientAccount, zeroGChain } from './config';

async function runAxiosDemo() {
  console.log('🚀 Starting x402 Axios Demo on 0g Chain\n');

  // Create wallet client
  const walletClient = createWalletClient({
    account: clientAccount,
    chain: zeroGChain,
    transport: http()
  });

  // Create axios instance with x402 payment interceptor
  const apiClient = withPaymentInterceptor(
    axios.create({
      baseURL: config.resourceServerUrl,
      timeout: 30000
    }),
    walletClient
  );

  console.log('📋 Testing paid endpoints with x402...\n');

  try {
    // Test 1: Weather API ($0.01)
    console.log('🌤️  Testing Weather API ($0.01)...');
    const weatherResponse = await apiClient.get('/api/weather?city=Shanghai');
    console.log('✅ Weather data:', weatherResponse.data);
    console.log('');

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Request failed:', error.response?.status);
      console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Error message:', error.message);
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }
}

// Run the demo
if (require.main === module) {
  runAxiosDemo().catch(console.error);
}

export { runAxiosDemo };