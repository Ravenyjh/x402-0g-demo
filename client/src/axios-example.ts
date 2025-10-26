import axios from 'axios';
import { createWalletClient, http } from 'viem';
import { withPaymentInterceptor } from 'x402-axios';
import { config, clientAccount, zeroGChain } from './config';
import dotenv from 'dotenv';

dotenv.config();

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

    // // Test 2: AI Assistant ($0.05)
    // console.log('🤖 Testing AI Assistant ($0.05)...');
    // const aiResponse = await apiClient.post('/api/ai/premium', {
    //   prompt: 'Explain blockchain payments in simple terms'
    // });
    // console.log('✅ AI response:', aiResponse.data);
    // console.log('');

    // // Test 3: File Download ($0.02)
    // console.log('📁 Testing File Download ($0.02)...');
    // const fileResponse = await apiClient.get('/api/files/download/report-2024');
    // console.log('✅ File data:', fileResponse.data);
    // console.log('');

    // // Test 4: Analytics ($0.03)
    // console.log('📊 Testing Analytics API ($0.03)...');
    // const analyticsResponse = await apiClient.get('/api/analytics?metric=revenue');
    // console.log('✅ Analytics data:', analyticsResponse.data);
    // console.log('');

    // console.log('🎉 All tests completed successfully!');
    // console.log('💰 Total spent: $0.11 USDC.e on 0g Chain');

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