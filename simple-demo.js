#!/usr/bin/env node

/**
 * Simple x402 Demo on 0g Chain
 * 
 * This demonstrates the x402 payment flow without complex dependencies.
 * It simulates the interaction between client, resource server, and facilitator.
 */

const http = require('http');
const https = require('https');
const express = require('express');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║              x402 Demo on 0g Chain (Simulated)              ║
║              Gasless micropayments with USDC.e              ║
╚══════════════════════════════════════════════════════════════╝
`);

// Demo configuration
const CONFIG = {
  chainId: 16661,
  rpcUrl: 'https://evmrpc.0g.ai',
  usdcAddress: '0x1f3aa82227281ca364bfb3d253b0f1af1da6473e',
  facilitatorPort: 3001,
  resourcePort: 3000,
  
  // Demo accounts (hardhat test accounts)
  facilitator: {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
  },
  client: {
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'
  }
};

// Step 1: Create Facilitator Server
function createFacilitatorServer() {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      network: '0g-chain',
      facilitator: CONFIG.facilitator.address,
      timestamp: new Date().toISOString()
    });
  });

  app.get('/supported', (req, res) => {
    res.json({
      kinds: [{ scheme: 'exact', network: '0g-chain' }]
    });
  });

  app.post('/verify', (req, res) => {
    console.log('🔍 Facilitator: Verifying payment...');
    
    // Simulate verification (in real implementation, this checks EIP-3009 signature)
    const verification = {
      isValid: true,
      invalidReason: null,
      payer: CONFIG.client.address
    };
    
    console.log('✅ Facilitator: Payment verification successful');
    res.json(verification);
  });

  app.post('/settle', (req, res) => {
    console.log('💰 Facilitator: Settling payment on 0g Chain...');
    
    // Simulate blockchain settlement
    const settlement = {
      success: true,
      transaction: '0x' + Math.random().toString(16).substr(2, 64),
      network: '0g-chain',
      payer: CONFIG.client.address,
      timestamp: new Date().toISOString()
    };
    
    console.log(\`✅ Facilitator: Payment settled! Tx: \${settlement.transaction.substr(0, 10)}...\`);
    res.json(settlement);
  });

  return app;
}

// Step 2: Create Resource Server with x402 Protection
function createResourceServer() {
  const app = express();
  app.use(express.json());

  // Middleware to check for x402 payment
  const x402Middleware = (price) => {
    return async (req, res, next) => {
      const paymentHeader = req.headers['x-payment'];
      
      if (!paymentHeader) {
        // Return 402 Payment Required
        console.log(\`💳 Resource Server: Payment required (\${price}) for \${req.path}\`);
        return res.status(402).json({
          x402Version: 1,
          accepts: [{
            scheme: 'exact',
            network: '0g-chain',
            maxAmountRequired: (parseFloat(price.replace('$', '')) * 1000000).toString(), // Convert to USDC units
            resource: req.url,
            description: \`API access for \${req.path}\`,
            mimeType: 'application/json',
            payTo: CONFIG.facilitator.address,
            maxTimeoutSeconds: 300,
            asset: CONFIG.usdcAddress,
            extra: { name: 'USDC.e', version: '1' }
          }]
        });
      }

      // Verify payment with facilitator
      console.log(\`🔍 Resource Server: Found payment header, verifying...\`);
      
      try {
        // In real implementation, this calls facilitator /verify endpoint
        console.log('✅ Resource Server: Payment verified, processing request...');
        next();
      } catch (error) {
        console.log('❌ Resource Server: Payment verification failed');
        res.status(402).json({ error: 'Payment verification failed' });
      }
    };
  };

  // Free endpoints
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to x402 Demo on 0g Chain! 🚀',
      network: '0g Chain (ID: 16661)',
      usdc: 'USDC.e at ' + CONFIG.usdcAddress,
      endpoints: {
        free: ['GET /', 'GET /health'],
        paid: [
          'GET /api/weather - $0.01',
          'POST /api/ai/premium - $0.05',
          'GET /api/files/download/:id - $0.02',
          'GET /api/analytics - $0.03'
        ]
      }
    });
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      network: '0g-chain',
      facilitator: \`http://localhost:\${CONFIG.facilitatorPort}\`
    });
  });

  // Paid endpoints with x402 protection
  app.get('/api/weather', x402Middleware('$0.01'), (req, res) => {
    const city = req.query.city || 'Beijing';
    console.log(\`🌤️  Resource Server: Serving weather for \${city} (paid $0.01)\`);
    
    res.json({
      city,
      temperature: Math.floor(Math.random() * 30) + 5,
      condition: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
      humidity: Math.floor(Math.random() * 60) + 30,
      paid_with: 'x402 on 0g Chain ⚡',
      cost: '$0.01 USDC.e',
      timestamp: new Date().toISOString()
    });
  });

  app.post('/api/ai/premium', x402Middleware('$0.05'), (req, res) => {
    const prompt = req.body.prompt || 'Hello!';
    console.log(\`🤖 Resource Server: AI request "\${prompt}" (paid $0.05)\`);
    
    res.json({
      prompt,
      response: \`🤖 Premium AI: "\${prompt}" - This is a premium response powered by x402 payments on 0g Chain!\`,
      model: 'Premium-GPT-0g',
      tokens: Math.floor(Math.random() * 100) + 50,
      paid_with: 'x402 on 0g Chain ⚡',
      cost: '$0.05 USDC.e',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/files/download/:id', x402Middleware('$0.02'), (req, res) => {
    const fileId = req.params.id;
    console.log(\`📁 Resource Server: File download \${fileId} (paid $0.02)\`);
    
    res.json({
      file_id: fileId,
      filename: \`premium-\${fileId}.pdf\`,
      size: '2.5 MB',
      download_url: \`https://cdn.example.com/\${fileId}.pdf\`,
      paid_with: 'x402 on 0g Chain ⚡',
      cost: '$0.02 USDC.e',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/analytics', x402Middleware('$0.03'), (req, res) => {
    const metric = req.query.metric || 'users';
    console.log(\`📊 Resource Server: Analytics \${metric} (paid $0.03)\`);
    
    res.json({
      metric,
      data: {
        today: Math.floor(Math.random() * 1000) + 100,
        last_7_days: Math.floor(Math.random() * 7000) + 1000,
        growth: \`\${Math.floor(Math.random() * 20)}%\`
      },
      paid_with: 'x402 on 0g Chain ⚡',
      cost: '$0.03 USDC.e',
      timestamp: new Date().toISOString()
    });
  });

  return app;
}

// Step 3: Client that makes payments
async function simulateClient() {
  console.log('\\n🔗 Starting client simulation...\\n');

  // Helper function to make HTTP requests
  const makeRequest = (options, data = null) => {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: JSON.parse(body)
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: body
            });
          }
        });
      });
      
      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  };

  // Simulate x402 payment flow
  const makePaymentRequest = async (path, method = 'GET', body = null) => {
    console.log(\`📤 Client: Making request to \${path}\`);
    
    // First request - expect 402 Payment Required
    let response = await makeRequest({
      hostname: 'localhost',
      port: CONFIG.resourcePort,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    }, body);

    if (response.status === 402) {
      console.log('💳 Client: Payment required, creating payment...');
      
      // Simulate creating EIP-3009 payment signature
      const paymentPayload = {
        x402Version: 1,
        scheme: 'exact',
        network: '0g-chain',
        payload: {
          signature: '0x' + Math.random().toString(16).substr(2, 130),
          authorization: {
            from: CONFIG.client.address,
            to: CONFIG.facilitator.address,
            value: response.data.accepts[0].maxAmountRequired,
            validAfter: Math.floor(Date.now() / 1000).toString(),
            validBefore: (Math.floor(Date.now() / 1000) + 300).toString(),
            nonce: '0x' + Math.random().toString(16).substr(2, 64)
          }
        }
      };

      const paymentHeader = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
      console.log(\`💰 Client: Created payment signature\`);

      // Second request with payment
      response = await makeRequest({
        hostname: 'localhost',
        port: CONFIG.resourcePort,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Payment': paymentHeader
        }
      }, body);
    }

    return response;
  };

  // Test all endpoints
  const tests = [
    { path: '/api/weather?city=Shanghai', method: 'GET' },
    { path: '/api/ai/premium', method: 'POST', body: { prompt: 'Explain blockchain payments' } },
    { path: '/api/files/download/report-2024', method: 'GET' },
    { path: '/api/analytics?metric=revenue', method: 'GET' }
  ];

  for (const test of tests) {
    try {
      const response = await makePaymentRequest(test.path, test.method, test.body);
      console.log(\`✅ Client: Success! Got response:\`, response.data);
      console.log('');
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(\`❌ Client: Request failed:\`, error.message);
    }
  }

  console.log('🎉 Client simulation completed!');
  console.log('💰 Total spent: $0.11 USDC.e on 0g Chain\\n');
}

// Main demo execution
async function runDemo() {
  console.log('🚀 Starting x402 Demo Servers...\\n');

  // Start Facilitator
  const facilitator = createFacilitatorServer();
  const facilitatorServer = facilitator.listen(CONFIG.facilitatorPort, () => {
    console.log(\`✅ Facilitator running on port \${CONFIG.facilitatorPort}\`);
  });

  // Start Resource Server
  const resourceServer = createResourceServer();
  const resourceServerInstance = resourceServer.listen(CONFIG.resourcePort, () => {
    console.log(\`✅ Resource Server running on port \${CONFIG.resourcePort}\`);
    console.log(\`🌐 Network: 0g Chain (\${CONFIG.chainId})\`);
    console.log(\`💰 USDC.e: \${CONFIG.usdcAddress}\`);
    console.log('');
  });

  // Wait for servers to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Run client simulation
  await simulateClient();

  // Cleanup
  console.log('🛑 Shutting down servers...');
  facilitatorServer.close();
  resourceServerInstance.close();
  
  console.log('\\n✨ Demo completed successfully!');
  console.log('\\n🔗 Learn more about x402: https://github.com/coinbase/x402');
}

// Run the demo
if (require.main === module) {
  runDemo().catch(console.error);
}

module.exports = { runDemo, CONFIG };