# Setup Guide for x402 on 0g Chain

## 📋 Prerequisites Checklist

### Required Software
- [ ] Node.js >= 18.0.0
- [ ] npm or pnpm
- [ ] Git
- [ ] Text editor (VS Code recommended)

### Required Accounts & Tokens

#### 1. Facilitator Wallet
- [ ] 0g Chain wallet address
- [ ] Private key (will pay gas fees)
- [ ] **Minimum 1 0G tokens** for gas fees
- [ ] RPC access to 0g Chain

#### 2. Resource Server (API Owner)
- [ ] 0g Chain wallet address (receives payments)
- [ ] No tokens required initially

#### 3. Client Wallet (API User)  
- [ ] 0g Chain wallet address
- [ ] Private key
- [ ] **USDC.e tokens** for making payments
- [ ] Minimum $1 USDC.e recommended for testing

## 🔑 Getting USDC.e on 0g Chain

### Option 1: Bridge from Other Chains
1. Use a bridge service to transfer USDC to 0g Chain
2. The bridged token will be USDC.e
3. Contract address: `0x1f3aa82227281ca364bfb3d253b0f1af1da6473e`

### Option 2: DEX Purchase
1. Get 0G tokens first
2. Use a DEX on 0g Chain to swap 0G → USDC.e
3. Ensure you have enough for testing ($1-5 recommended)

### Option 3: Direct Transfer
If you already have USDC.e on 0g Chain, you can transfer it between wallets.

## ⚙️ Configuration Steps

### 1. Environment Variables

**Facilitator (.env):**
```bash
PORT=3001
FACILITATOR_PRIVATE_KEY=0x[YOUR_FACILITATOR_PRIVATE_KEY]
DEBUG=true
```

**Resource Server (.env):**
```bash
PORT=3000
RECEIVER_ADDRESS=0x[YOUR_RECEIVER_ADDRESS]
FACILITATOR_URL=http://localhost:3001
DEBUG=true
```

**Client (.env):**
```bash
CLIENT_PRIVATE_KEY=0x[YOUR_CLIENT_PRIVATE_KEY]
RESOURCE_SERVER_URL=http://localhost:3000
```

### 2. Security Best Practices

#### Private Key Management
- **Never commit private keys to git**
- Use `.env` files (already in `.gitignore`)
- Consider using hardware wallets for production
- Rotate keys regularly in production

#### Network Security
- Use HTTPS in production
- Implement rate limiting
- Add authentication for admin endpoints
- Monitor for suspicious activity

### 3. Testing Configuration

#### Local Development
```bash
# All services on localhost
Facilitator:      http://localhost:3001
Resource Server:  http://localhost:3000
Client:          Direct API calls
```

#### Production Example
```bash
# Distributed deployment
Facilitator:      https://facilitator.yourapp.com
Resource Server:  https://api.yourapp.com
Client:          https://yourapp.com
```

## 🧪 Verification Steps

### 1. Network Connectivity
```bash
# Test 0g Chain RPC
curl -X POST https://evmrpc.0g.ai \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Expected response: {"jsonrpc":"2.0","id":1,"result":"0x4115"}
```

### 2. USDC.e Contract Verification
```bash
# Check if USDC.e contract exists
curl -X POST https://evmrpc.0g.ai \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_getCode",
    "params":["0x1f3aa82227281ca364bfb3d253b0f1af1da6473e", "latest"],
    "id":1
  }'

# Should return contract bytecode (not "0x")
```

### 3. Wallet Balance Check
```bash
# Check 0G balance (for gas)
curl -X POST https://evmrpc.0g.ai \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_getBalance",
    "params":["YOUR_WALLET_ADDRESS", "latest"],
    "id":1
  }'
```

### 4. Service Health Checks

**Facilitator Health:**
```bash
curl http://localhost:3001/health
```

**Resource Server Health:**
```bash
curl http://localhost:3000/health
```

**Supported Schemes:**
```bash
curl http://localhost:3001/supported
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Network not supported"
- **Cause:** x402 package doesn't recognize 0g-chain
- **Solution:** Ensure you're using the modified x402 package with 0g chain support

#### 2. "Insufficient funds"
- **Cause:** Not enough USDC.e balance
- **Solution:** Check balance and transfer more USDC.e

#### 3. "Gas estimation failed"
- **Cause:** Facilitator wallet has no 0G tokens
- **Solution:** Send 0G tokens to facilitator wallet

#### 4. "Invalid signature"
- **Cause:** Wrong network or contract configuration
- **Solution:** Verify USDC.e contract address and chain ID

#### 5. "Connection timeout"
- **Cause:** RPC endpoint issues
- **Solution:** Try alternative RPC or check network

### Debug Commands

```bash
# Enable debug logging
export DEBUG=true

# Check all service logs
npm run dev:all 2>&1 | tee debug.log

# Test individual payments
curl -X GET http://localhost:3000/api/weather
```

### Log Analysis

Look for these key log messages:

**Facilitator Logs:**
```
🔑 Facilitator wallet address: 0x...
🔍 Verifying payment...
✅ Verification result: { isValid: true }
💰 Settling payment...
✅ Settlement result: { success: true, transaction: "0x..." }
```

**Resource Server Logs:**
```
💰 Payment receiver: 0x...
🌤️ Weather request for Beijing - payment verified!
```

**Client Logs:**
```
🔑 Client wallet: 0x...
✅ Weather data: { city: "Beijing", temperature: 22, ... }
```

## 📊 Performance Optimization

### Facilitator Optimization
- **Batch Processing:** Combine multiple settlements
- **Gas Optimization:** Use optimal gas prices
- **Caching:** Cache verification results temporarily
- **Load Balancing:** Multiple facilitator instances

### Resource Server Optimization
- **Response Caching:** Cache API responses
- **Rate Limiting:** Prevent abuse
- **Request Validation:** Validate early
- **Monitoring:** Track performance metrics

### Client Optimization
- **Connection Pooling:** Reuse HTTP connections
- **Retry Logic:** Handle temporary failures
- **Payment Caching:** Avoid duplicate payments
- **Error Handling:** Graceful degradation

## 🔄 Maintenance

### Regular Tasks
- **Monitor balances:** Facilitator 0G tokens, client USDC.e
- **Update dependencies:** Keep packages current
- **Rotate keys:** Regular security practice
- **Monitor logs:** Watch for errors or attacks
- **Backup configurations:** Save environment files securely

### Scaling Considerations
- **Horizontal scaling:** Multiple facilitator instances
- **Database addition:** Store payment history
- **Monitoring setup:** Prometheus + Grafana
- **Alerting:** PagerDuty or similar
- **Load testing:** Simulate high traffic

---

**Need help?** Check the [main README](../README.md) or open an issue!