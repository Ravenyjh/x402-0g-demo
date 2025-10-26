import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { paymentMiddleware } from 'ravenyjh-x402-express';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(helmet());
app.use(cors());

// Validate required environment variables
if (!process.env.RECEIVER_ADDRESS) {
  console.error('❌ RECEIVER_ADDRESS environment variable is required');
  process.exit(1);
}

const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS;
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'http://localhost:3001';

console.log(`💰 Payment receiver: ${RECEIVER_ADDRESS}`);
console.log(`🔗 Facilitator URL: ${FACILITATOR_URL}`);

// Apply x402 payment middleware
app.use(
  paymentMiddleware(RECEIVER_ADDRESS as `0x${string}`, {
    // Weather API - $0.01 per request
    '/api/weather': {
      price: '$0.01',
      network: '0g-chain'
    },
    
    // Premium AI Assistant - $0.05 per request  
    '/api/ai/premium': {
      price: '$0.05',
      network: '0g-chain'
    },
    
    // File download - $0.02 per download
    '/api/files/download/:id': {
      price: '$0.02',
      network: '0g-chain'
    },
    
    // Analytics data - $0.03 per query
    '/api/analytics': {
      price: '$0.03',
      network: '0g-chain'
    }
  }, {
    url: FACILITATOR_URL as `${string}://${string}`
  })
);

// Health check (free endpoint)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    network: '0g-chain',
    receiver: RECEIVER_ADDRESS,
    facilitator: FACILITATOR_URL
  });
});

// Free endpoints (no payment required)
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to x402 Demo on 0g Chain! 🚀',
    network: '0g Chain (ID: 16661)',
    usdc: 'USDC.e at 0x1f3aa82227281ca364bfb3d253b0f1af1da6473e',
    endpoints: {
      free: [
        'GET / - This welcome message',
        'GET /health - Health check'
      ],
      paid: [
        'GET /api/weather - Weather data ($0.01)',
        'POST /api/ai/premium - AI Assistant ($0.05)', 
        'GET /api/files/download/:id - File download ($0.02)',
        'GET /api/analytics - Analytics data ($0.03)'
      ]
    },
    demo: {
      facilitator: FACILITATOR_URL,
      receiver: RECEIVER_ADDRESS
    }
  });
});

// PAID ENDPOINTS (protected by x402)

// Weather API - $0.01
app.get('/api/weather', (req, res) => {
  const { city = 'Beijing' } = req.query;
  
  // Simulated weather data
  const weatherData = {
    city,
    temperature: Math.floor(Math.random() * 30) + 5,
    condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
    humidity: Math.floor(Math.random() * 60) + 30,
    timestamp: new Date().toISOString(),
    paid_with: 'x402 on 0g Chain ⚡',
    cost: '$0.01 USDC.e'
  };

  console.log(`🌤️  Weather request for ${city} - payment verified!`);
  res.json(weatherData);
});

// Premium AI Assistant - $0.05
app.post('/api/ai/premium', express.json(), (req, res) => {
  const { prompt = 'Hello!' } = req.body;
  
  // Simulated AI response
  const aiResponse = {
    prompt,
    response: `🤖 Premium AI Response: "${prompt}" - This is a premium AI analysis powered by x402 payments on 0g Chain. Your request has been processed with advanced algorithms!`,
    model: 'Premium-GPT-0g',
    tokens_used: Math.floor(Math.random() * 100) + 50,
    timestamp: new Date().toISOString(),
    paid_with: 'x402 on 0g Chain ⚡',
    cost: '$0.05 USDC.e'
  };

  console.log(`🤖 AI request: "${prompt}" - payment verified!`);
  res.json(aiResponse);
});

// File Download - $0.02
app.get('/api/files/download/:id', (req, res) => {
  const { id } = req.params;
  
  // Simulated file data
  const fileData = {
    file_id: id,
    filename: `premium-content-${id}.pdf`,
    size: '2.5 MB',
    download_url: `https://cdn.example.com/files/${id}.pdf`,
    expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    content_type: 'application/pdf',
    timestamp: new Date().toISOString(),
    paid_with: 'x402 on 0g Chain ⚡',
    cost: '$0.02 USDC.e'
  };

  console.log(`📁 File download: ${id} - payment verified!`);
  res.json(fileData);
});

// Analytics Data - $0.03
app.get('/api/analytics', (req, res) => {
  const { metric = 'users' } = req.query;
  
  // Simulated analytics data
  const analyticsData = {
    metric,
    data: {
      today: Math.floor(Math.random() * 1000) + 100,
      yesterday: Math.floor(Math.random() * 1000) + 100,
      last_7_days: Math.floor(Math.random() * 7000) + 1000,
      last_30_days: Math.floor(Math.random() * 30000) + 5000
    },
    trends: {
      daily_growth: `${Math.floor(Math.random() * 20)}%`,
      weekly_growth: `${Math.floor(Math.random() * 50)}%`
    },
    timestamp: new Date().toISOString(),
    paid_with: 'x402 on 0g Chain ⚡',
    cost: '$0.03 USDC.e'
  };

  console.log(`📊 Analytics request for ${metric} - payment verified!`);
  res.json(analyticsData);
});

// Error handling
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /api/weather',
      'POST /api/ai/premium',
      'GET /api/files/download/:id',
      'GET /api/analytics'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Resource server running on port ${PORT}`);
  console.log(`🌐 Network: 0g Chain`);
  console.log(`💰 Receiver: ${RECEIVER_ADDRESS}`);
  console.log(`🔗 Facilitator: ${FACILITATOR_URL}`);
  console.log(`\n📋 Paid Endpoints:`);
  console.log(`  GET  /api/weather        - $0.01 USDC.e`);
  console.log(`  POST /api/ai/premium     - $0.05 USDC.e`);
  console.log(`  GET  /api/files/download - $0.02 USDC.e`);
  console.log(`  GET  /api/analytics      - $0.03 USDC.e`);
});

export default app;