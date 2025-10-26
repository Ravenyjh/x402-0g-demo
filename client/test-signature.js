const { createWalletClient, http, parseEther } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

// 使用相同的配置
const zeroGChain = {
  id: 16661,
  name: '0g Chain',
  rpcUrls: {
    default: {
      http: ['https://evmrpc.0g.ai'],
    },
  },
};

async function testSignature() {
  // 客户端私钥 (从环境变量读取)
  const clientPrivateKey = process.env.CLIENT_PRIVATE_KEY;
  if (!clientPrivateKey) {
    console.error('❌ CLIENT_PRIVATE_KEY not set');
    return;
  }

  const clientAccount = privateKeyToAccount(clientPrivateKey);
  console.log('🔑 Client address:', clientAccount.address);

  // 模拟的facilitator地址 (from error message)
  const facilitatorAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
  console.log('🏦 Facilitator address:', facilitatorAddress);

  // 创建钱包客户端
  const walletClient = createWalletClient({
    account: clientAccount,
    chain: zeroGChain,
    transport: http()
  });

  try {
    // 模拟EIP-3009参数
    const domain = {
      name: 'Bridged USDC',
      version: '2',
      chainId: 16661,
      verifyingContract: '0x1f3aa82227281ca364bfb3d253b0f1af1da6473e'
    };

    const types = {
      TransferWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' }
      ]
    };

    const message = {
      from: clientAccount.address,
      to: facilitatorAddress,
      value: 10000n,
      validAfter: Math.floor(Date.now() / 1000),
      validBefore: Math.floor(Date.now() / 1000) + 3600,
      nonce: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    };

    console.log('📝 Signing message:', message);

    const signature = await walletClient.signTypedData({
      domain,
      types,
      primaryType: 'TransferWithAuthorization',
      message
    });

    console.log('✅ Signature generated:', signature);
    console.log('📊 Signature length:', signature.length);

  } catch (error) {
    console.error('❌ Error testing signature:', error.message);
  }
}

testSignature();