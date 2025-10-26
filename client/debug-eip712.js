const { createPublicClient, http } = require('viem');

const client = createPublicClient({
  chain: {
    id: 16661,
    name: '0g Chain',
    rpcUrls: {
      default: {
        http: ['https://evmrpc.0g.ai'],
      },
    },
  },
  transport: http()
});

const usdcAddress = '0x1f3aa82227281ca364bfb3d253b0f1af1da6473e';

async function checkEIP712Domain() {
  try {
    console.log('🔍 Checking EIP712 domain for USDC.e on 0g Chain...');
    
    // Try to call DOMAIN_SEPARATOR
    const domainSeparator = await client.readContract({
      address: usdcAddress,
      abi: [
        {
          name: 'DOMAIN_SEPARATOR',
          type: 'function',
          inputs: [],
          outputs: [{ type: 'bytes32' }],
        }
      ],
      functionName: 'DOMAIN_SEPARATOR',
    });
    
    console.log('Domain Separator:', domainSeparator);
    
    // Try to get name and version
    const name = await client.readContract({
      address: usdcAddress,
      abi: [
        {
          name: 'name',
          type: 'function',
          inputs: [],
          outputs: [{ type: 'string' }],
        }
      ],
      functionName: 'name',
    });
    
    console.log('Contract Name:', name);
    
    // Try to get version (might not exist)
    try {
      const version = await client.readContract({
        address: usdcAddress,
        abi: [
          {
            name: 'version',
            type: 'function',
            inputs: [],
            outputs: [{ type: 'string' }],
          }
        ],
        functionName: 'version',
      });
      console.log('Contract Version:', version);
    } catch (e) {
      console.log('❌ Version function not found or failed');
    }
    
    // Try to get symbol
    const symbol = await client.readContract({
      address: usdcAddress,
      abi: [
        {
          name: 'symbol',
          type: 'function',
          inputs: [],
          outputs: [{ type: 'string' }],
        }
      ],
      functionName: 'symbol',
    });
    
    console.log('Contract Symbol:', symbol);
    
  } catch (error) {
    console.error('❌ Error checking EIP712 domain:', error.message);
  }
}

checkEIP712Domain();