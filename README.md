# x402 Payment System Demo on 0g Chain

> **Complete implementation of x402 gasless micropayments using USDC.e on 0g Chain**

## 🌟 Overview

This demo showcases a complete x402 payment system running on **0g Chain**, featuring:

- ⚡ **Gasless payments** - Users only need USDC.e, no native tokens for gas
- 🔗 **EIP-3009 integration** - Secure authorization-based transfers
- 💰 **Micropayments** - Starting from $0.001
- 🚀 **2-second settlement** - Fast blockchain confirmation
- 🔧 **One-line integration** - Simple server setup

## 🏗️ Architecture

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client    │ ── │ Resource Server │ ── │   Facilitator   │
│             │    │                 │    │                 │
│ - Wallet    │    │ - Express API   │    │ - Gas provider  │
│ - USDC.e    │    │ - x402 middleware│    │ - Settlement    │
│ - Signing   │    │ - Paid endpoints│    │ - Verification  │
└─────────────┘    └─────────────────┘    └─────────────────┘
       │                     │                      │
       └─────────────────────┼──────────────────────┘
                             │
                   ┌─────────────────┐
                   │   0g Chain      │
                   │                 │
                   │ - USDC.e ERC20  │
                   │ - EIP-3009      │
                   │ - Fast blocks   │
                   └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js** >= 18.0.0
2. **0g Chain wallet** with:
   - Some **0G tokens** (for facilitator gas fees)
   - **USDC.e tokens** (for making payments)
3. **Private keys** for facilitator and client wallets

### 🔧 Setup

1. **Clone and install dependencies:**
```bash
cd /home/raven/workspace/0g/x402-0g-demo
npm install
```

2. **Configure Facilitator** (pays gas fees):
```bash
cd facilitator
cp .env.example .env
# Edit .env with your facilitator private key
```

3. **Configure Resource Server** (receives payments):
```bash
cd ../resource-server  
cp .env.example .env
# Edit .env with your receiver address
```

4. **Configure Client** (makes payments):
```bash
cd ../client
cp .env.example .env
# Edit .env with your client private key
```

### 🏃 Running the Demo

**Start all services:**
```bash
# Terminal 1: Start Facilitator
npm run dev:facilitator

# Terminal 2: Start Resource Server  
npm run dev:server

# Terminal 3: Run Client Demo
npm run dev:client
```

**Or use the CLI:**
```bash
cd client
npm run demo:cli -- --axios    # Axios demo
npm run demo:cli -- --fetch    # Fetch demo
npm run demo:cli balance       # Check balance
npm run demo:cli info          # System info
```

## 📊 API Endpoints & Pricing

| Endpoint | Description | Price | Example |
|----------|-------------|-------|---------|
| `GET /api/weather` | Weather data | $0.01 | Current conditions |
| `POST /api/ai/premium` | AI Assistant | $0.05 | GPT-style responses |
| `GET /api/files/download/:id` | File download | $0.02 | Premium content |
| `GET /api/analytics` | Analytics data | $0.03 | Usage metrics |

**Total demo cost: $0.11 USDC.e**

## 🔍 Network Configuration

### 0g Chain Details
- **Chain ID:** `16661`
- **RPC URL:** `https://evmrpc.0g.ai`
- **Explorer:** `https://explorer.0g.ai`
- **USDC.e Contract:** `0x1f3aa82227281ca364bfb3d253b0f1af1da6473e`

### EIP-3009 Support ✅
The USDC.e contract on 0g Chain supports all required EIP-3009 functions:
- ✅ `transferWithAuthorization`
- ✅ `authorizationState`
- ✅ `cancelAuthorization`
- ✅ `DOMAIN_SEPARATOR`
- ✅ `TRANSFER_WITH_AUTHORIZATION_TYPEHASH`

## 💻 Usage Examples

### Axios Integration
```typescript
import axios from 'axios';
import { attachPaymentHeaders } from '@coinbase/x402-axios';

const client = axios.create({ baseURL: 'http://localhost:3000' });
attachPaymentHeaders(client, { wallet, network: '0g-chain' });

// This request will automatically include payment!
const response = await client.get('/api/weather?city=Shanghai');
```

### Fetch Integration
```typescript
import { x402Fetch } from '@coinbase/x402-fetch';

const paymentFetch = x402Fetch({ wallet, network: '0g-chain' });

// This request will automatically include payment!
const response = await paymentFetch('http://localhost:3000/api/weather');
```

### Express Server Integration
```typescript
import { paymentMiddleware } from '@coinbase/x402-express';

app.use(paymentMiddleware(receiverAddress, {
  '/api/weather': '$0.01',
  '/api/ai/premium': '$0.05'
}, {
  facilitatorUrl: 'http://localhost:3001',
  network: '0g-chain'
}));
```

## 🔒 Security Features

- **Non-custodial:** Facilitator cannot redirect funds
- **Authorization-based:** Each payment is cryptographically signed
- **Time-limited:** Signatures expire automatically
- **Nonce protection:** Prevents replay attacks
- **Amount verification:** Exact payment amounts only

## 🛠️ Development

### Project Structure
```
x402-0g-demo/
├── facilitator/          # Gas provider & settlement service
│   ├── src/index.ts     # Express server with verify/settle endpoints
│   └── .env.example     # Configuration template
├── resource-server/      # API server with paid endpoints
│   ├── src/index.ts     # Express + x402 middleware
│   └── .env.example     # Configuration template
├── client/              # Payment client examples
│   ├── src/
│   │   ├── axios-example.ts    # Axios integration
│   │   ├── fetch-example.ts    # Fetch integration
│   │   └── cli-demo.ts         # Interactive CLI
│   └── .env.example     # Configuration template
└── README.md           # This file
```

### Testing
```bash
# Run all demos
npm run dev:all

# Test individual components
npm run dev:facilitator
npm run dev:server
npm run demo:axios
npm run demo:fetch
```

## 🌐 Deployment

### Production Considerations

1. **Secure Key Management:**
   - Use environment variables or key management services
   - Never commit private keys to version control

2. **Facilitator Scaling:**
   - Monitor gas costs and 0G token balance
   - Consider batching transactions for efficiency
   - Set up monitoring and alerting

3. **Rate Limiting:**
   - Implement proper rate limiting on APIs
   - Add abuse detection and prevention

4. **Error Handling:**
   - Graceful handling of payment failures
   - Retry logic for network issues
   - Proper user feedback

## 📈 Monitoring

Monitor these metrics:

- **Payment Success Rate:** % of successful payments
- **Gas Costs:** Facilitator operational expenses  
- **Response Times:** API latency including payment verification
- **USDC.e Balance:** Client and receiver balances
- **Error Rates:** Failed payments by error type

## 🤝 Contributing

This demo is based on the official x402 protocol. To contribute:

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📚 Resources

- [x402 Protocol](https://github.com/coinbase/x402)
- [0g Chain Documentation](https://0g.ai)
- [EIP-3009 Standard](https://eips.ethereum.org/EIPS/eip-3009)
- [x402 Specification](https://github.com/coinbase/x402/blob/main/specs/x402-specification.md)

## 🎯 Next Steps

1. **Add your 0g Chain to x402:** Submit PR to official repository
2. **Build your app:** Use this demo as a starting point
3. **Production deployment:** Scale up for real users
4. **Community:** Share your x402 integration with the ecosystem

---

**Built with ❤️ for the 0g Chain ecosystem**

*This demo showcases the future of internet payments - fast, cheap, and user-friendly!*