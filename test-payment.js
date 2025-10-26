#!/usr/bin/env node

const http = require('http');

console.log('🧪 测试 x402 支付流程 on 0g Chain\n');

// 模拟客户端发起支付
async function testPaymentFlow() {
  try {
    console.log('📤 步骤1: 请求受保护的API (应该返回402)...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/weather?city=Shanghai',
      method: 'GET'
    };

    const response = await makeRequest(options);
    
    if (response.status === 402) {
      console.log('✅ 收到402支付要求');
      console.log('💰 支付要求:', JSON.stringify(response.data, null, 2));
      
      const paymentReq = response.data.accepts[0];
      console.log(`\n🔍 网络: ${paymentReq.network}`);
      console.log(`💵 金额: ${paymentReq.maxAmountRequired} (${parseFloat(paymentReq.maxAmountRequired)/1000000} USDC)`);
      console.log(`📍 收款地址: ${paymentReq.payTo}`);
      console.log(`⛓️  USDC合约: ${paymentReq.asset}`);
      
      if (paymentReq.network === '0g-chain') {
        console.log('\n🎉 成功！Resource Server配置了0g Chain!');
      } else {
        console.log(`\n⚠️  注意：Network是 ${paymentReq.network}，期望是 0g-chain`);
      }
      
      console.log('\n📤 步骤2: 模拟创建支付签名...');
      const mockPayment = createMockPayment(paymentReq);
      console.log('✅ 创建模拟支付:', mockPayment);
      
      console.log('\n📤 步骤3: 带支付头重新请求...');
      const paymentHeader = Buffer.from(JSON.stringify(mockPayment)).toString('base64');
      
      const optionsWithPayment = {
        ...options,
        headers: {
          'X-Payment': paymentHeader
        }
      };
      
      const paidResponse = await makeRequest(optionsWithPayment);
      console.log(`✅ 支付后响应 (${paidResponse.status}):`, paidResponse.data);
      
    } else {
      console.log('❌ 期望402状态码，收到:', response.status);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

function createMockPayment(paymentRequirements) {
  return {
    x402Version: 1,
    scheme: 'exact',
    network: paymentRequirements.network,
    payload: {
      signature: '0x' + Array(130).fill('a').join(''), // 模拟签名
      authorization: {
        from: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // demo client address
        to: paymentRequirements.payTo,
        value: paymentRequirements.maxAmountRequired,
        validAfter: Math.floor(Date.now() / 1000).toString(),
        validBefore: (Math.floor(Date.now() / 1000) + 300).toString(),
        nonce: '0x' + Array(64).fill('b').join('')
      }
    }
  };
}

function makeRequest(options, data = null) {
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
}

// 运行测试
testPaymentFlow();