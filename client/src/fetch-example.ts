import { createWalletClient, http } from 'viem';
import { x402Fetch } from '@coinbase/x402-fetch';
import { config, clientAccount, zeroGChain } from './config';
import dotenv from 'dotenv';

dotenv.config();

async function runFetchDemo() {
  console.log('🚀 Starting x402 Fetch Demo on 0g Chain\n');

  // Create wallet client
  const walletClient = createWalletClient({
    account: clientAccount,
    chain: zeroGChain,
    transport: http()
  });

  // Create x402-enabled fetch function
  const paymentFetch = x402Fetch({
    wallet: walletClient,
    network: config.network
  });

  console.log('📋 Testing paid endpoints with fetch + x402...\n');

  try {
    // Test 1: Weather API ($0.01)
    console.log('🌤️  Testing Weather API ($0.01)...');
    const weatherResponse = await paymentFetch(`${config.resourceServerUrl}/api/weather?city=Tokyo`);
    const weatherData = await weatherResponse.json();
    console.log('✅ Weather data:', weatherData);
    console.log('');

    // // Test 2: AI Assistant ($0.05)
    // console.log('🤖 Testing AI Assistant ($0.05)...');
    // const aiResponse = await paymentFetch(`${config.resourceServerUrl}/api/ai/premium`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     prompt: 'What are the benefits of decentralized payments?'
    //   })
    // });
    // const aiData = await aiResponse.json();
    // console.log('✅ AI response:', aiData);
    // console.log('');

    // // Test 3: File Download ($0.02)
    // console.log('📁 Testing File Download ($0.02)...');
    // const fileResponse = await paymentFetch(`${config.resourceServerUrl}/api/files/download/whitepaper-v2`);
    // const fileData = await fileResponse.json();
    // console.log('✅ File data:', fileData);
    // console.log('');

    // // Test 4: Analytics ($0.03)
    // console.log('📊 Testing Analytics API ($0.03)...');
    // const analyticsResponse = await paymentFetch(`${config.resourceServerUrl}/api/analytics?metric=users`);
    // const analyticsData = await analyticsResponse.json();
    // console.log('✅ Analytics data:', analyticsData);
    // console.log('');

    // console.log('🎉 All fetch tests completed successfully!');
    // console.log('💰 Total spent: $0.11 USDC.e on 0g Chain');

  } catch (error) {
    console.error('❌ Fetch demo failed:', error);
  }
}

// Run the demo
if (require.main === module) {
  runFetchDemo().catch(console.error);
}

export { runFetchDemo };