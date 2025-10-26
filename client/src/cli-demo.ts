#!/usr/bin/env tsx
import { Command } from 'commander';
import chalk from 'chalk';
import { createWalletClient, http, formatUnits, parseUnits } from 'viem';
import { config, clientAccount, zeroGChain } from './config';
import { runAxiosDemo } from './axios-example';
import { runFetchDemo } from './fetch-example';
import dotenv from 'dotenv';

dotenv.config();

const program = new Command();

// CLI Header
function printHeader() {
  console.log(chalk.cyan('╔══════════════════════════════════════════════════════════════╗'));
  console.log(chalk.cyan('║') + chalk.bold.white('              x402 Demo on 0g Chain                          ') + chalk.cyan('║'));
  console.log(chalk.cyan('║') + chalk.gray('              Gasless micropayments with USDC.e              ') + chalk.cyan('║'));
  console.log(chalk.cyan('╚══════════════════════════════════════════════════════════════╝'));
  console.log('');
}

// Check USDC.e balance
async function checkBalance() {
  console.log(chalk.yellow('🔍 Checking USDC.e balance...'));
  
  try {
    const publicClient = createWalletClient({
      account: clientAccount,
      chain: zeroGChain,
      transport: http()
    });

    // Get USDC.e balance (simplified - in real implementation you'd call the contract)
    const balance = await publicClient.getBalance({ address: clientAccount.address });
    
    console.log(chalk.green('✅ Wallet Details:'));
    console.log(`   Address: ${chalk.white(clientAccount.address)}`);
    console.log(`   Network: ${chalk.white('0g Chain')} (${zeroGChain.id})`);
    console.log(`   Native Balance: ${chalk.white(formatUnits(balance, 18))} 0G`);
    console.log(`   USDC.e Contract: ${chalk.white(config.usdcAddress)}`);
    console.log('');
    console.log(chalk.yellow('💡 Note: Make sure your wallet has USDC.e tokens for payments!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to check balance:'), error);
  }
}

// Show pricing info
function showPricing() {
  console.log(chalk.blue('💰 API Pricing on 0g Chain:'));
  console.log('');
  console.log('   🌤️  Weather API      - ' + chalk.green('$0.01 USDC.e'));
  console.log('   🤖  AI Assistant     - ' + chalk.green('$0.05 USDC.e'));
  console.log('   📁  File Download    - ' + chalk.green('$0.02 USDC.e'));
  console.log('   📊  Analytics API    - ' + chalk.green('$0.03 USDC.e'));
  console.log('');
  console.log('   🎯 Total for all APIs: ' + chalk.yellow('$0.11 USDC.e'));
  console.log('');
}

// Interactive demo menu
async function interactiveDemo() {
  printHeader();
  await checkBalance();
  showPricing();

  console.log(chalk.blue('🎮 Interactive Demo Options:'));
  console.log('');
  console.log('1. Run Axios Demo (all APIs)');
  console.log('2. Run Fetch Demo (all APIs)');
  console.log('3. Check wallet balance');
  console.log('4. Show pricing info');
  console.log('');

  // Simple interactive demo (you could enhance this with proper prompts)
  const args = process.argv.slice(2);
  
  if (args.includes('--axios')) {
    console.log(chalk.cyan('🚀 Running Axios Demo...\n'));
    await runAxiosDemo();
  } else if (args.includes('--fetch')) {
    console.log(chalk.cyan('🚀 Running Fetch Demo...\n'));
    await runFetchDemo();
  } else {
    console.log(chalk.gray('Usage:'));
    console.log(chalk.gray('  npm run demo:cli -- --axios   # Run axios demo'));
    console.log(chalk.gray('  npm run demo:cli -- --fetch   # Run fetch demo'));
  }
}

// CLI Commands
program
  .name('x402-0g-demo')
  .description('x402 payment demo on 0g Chain')
  .version('1.0.0');

program
  .command('balance')
  .description('Check wallet balance')
  .action(async () => {
    printHeader();
    await checkBalance();
  });

program
  .command('pricing')
  .description('Show API pricing')
  .action(() => {
    printHeader();
    showPricing();
  });

program
  .command('demo')
  .description('Run interactive demo')
  .option('--axios', 'Use axios client')
  .option('--fetch', 'Use fetch client')
  .action(async (options) => {
    printHeader();
    
    if (options.axios) {
      console.log(chalk.cyan('🚀 Running Axios Demo...\n'));
      await runAxiosDemo();
    } else if (options.fetch) {
      console.log(chalk.cyan('🚀 Running Fetch Demo...\n'));
      await runFetchDemo();
    } else {
      await interactiveDemo();
    }
  });

program
  .command('info')
  .description('Show system information')
  .action(() => {
    printHeader();
    console.log(chalk.blue('ℹ️  System Information:'));
    console.log('');
    console.log(`   Network: ${chalk.white('0g Chain')} (${zeroGChain.id})`);
    console.log(`   RPC: ${chalk.white(zeroGChain.rpcUrls.default.http[0])}`);
    console.log(`   Explorer: ${chalk.white(zeroGChain.blockExplorers.default.url)}`);
    console.log(`   USDC.e: ${chalk.white(config.usdcAddress)}`);
    console.log(`   Client: ${chalk.white(clientAccount.address)}`);
    console.log(`   Resource Server: ${chalk.white(config.resourceServerUrl)}`);
    console.log('');
  });

// Main execution
if (require.main === module) {
  if (process.argv.length === 2) {
    // No arguments - run interactive demo
    interactiveDemo().catch(console.error);
  } else {
    // Parse CLI commands
    program.parse();
  }
}

export { interactiveDemo };