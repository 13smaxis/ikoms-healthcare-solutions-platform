#!/usr/bin/env node

/**
 * 2Checkout Setup Validation Script
 * 
 * Runs a series of checks to ensure 2Checkout is properly configured
 * Usage: node scripts/validate-2checkout-setup.js
 */

const fs = require('fs');
const path = require('path');

const checks = [];

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function check(name, fn) {
  checks.push({ name, fn });
}

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Checks

check('Environment file exists', () => {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local not found. Copy from .env.local.example and add credentials.');
  }
  return '.env.local exists';
});

check('Read environment variables', () => {
  const envPath = path.join(process.cwd(), '.env.local');
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  const env = {};
  
  lines.forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return env;
});

check('Merchant code configured', (env) => {
  const code = env.NEXT_PUBLIC_TWOCHECKOUT_MERCHANT_CODE;
  if (!code || code === 'placeholder' || code === '') {
    throw new Error(
      'NEXT_PUBLIC_TWOCHECKOUT_MERCHANT_CODE not set. ' +
      'Get this from 2Checkout Dashboard → Integrations → API'
    );
  }
  return `Merchant code: ${code.substring(0, 5)}...`;
});

check('Secret key configured', (env) => {
  const key = env.TWOCHECKOUT_SECRET_KEY;
  if (!key || key === 'placeholder' || key === '') {
    throw new Error(
      'TWOCHECKOUT_SECRET_KEY not set. ' +
      'Get this from 2Checkout Dashboard → Integrations → API'
    );
  }
  return `Secret key: ${key.substring(0, 5)}...`;
});

check('Webhook secret configured', (env) => {
  const secret = env.TWOCHECKOUT_WEBHOOK_SECRET;
  if (!secret || secret === 'placeholder' || secret === '') {
    throw new Error(
      'TWOCHECKOUT_WEBHOOK_SECRET not set. ' +
      'Get this from 2Checkout Dashboard → Integrations → Webhooks'
    );
  }
  return `Webhook secret: ${secret.substring(0, 5)}...`;
});

check('Supabase URL configured', (env) => {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url === '') {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL not set');
  }
  return `Supabase URL: ${url}`;
});

check('Supabase service role key configured', (env) => {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || key === '') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  }
  return `Service role key: ${key.substring(0, 10)}...`;
});

check('API routes exist', () => {
  const routes = [
    'app/api/checkout/process-payment/route.js',
    'app/api/checkout/webhooks/twocheckout/route.js',
  ];
  
  const missing = routes.filter((route) => {
    const fullPath = path.join(process.cwd(), route);
    return !fs.existsSync(fullPath);
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing routes: ${missing.join(', ')}`);
  }
  
  return `All ${routes.length} API routes found`;
});

check('Checkout page exists', () => {
  const checkoutPath = path.join(process.cwd(), 'app/shop/checkout/page.tsx');
  if (!fs.existsSync(checkoutPath)) {
    throw new Error('app/shop/checkout/page.tsx not found');
  }
  return 'Checkout page found';
});

check('Order confirmation page exists', () => {
  const confirmPath = path.join(process.cwd(), 'app/shop/order-confirmation/page.tsx');
  if (!fs.existsSync(confirmPath)) {
    throw new Error('app/shop/order-confirmation/page.tsx not found');
  }
  return 'Order confirmation page found';
});

// Run all checks
async function runChecks() {
  log('blue', '\n🔍 Validating 2Checkout Setup...\n');
  
  let passed = 0;
  let failed = 0;
  let currentEnv = null;
  
  for (const { name, fn } of checks) {
    try {
      const input = currentEnv || undefined;
      const result = fn(input);
      
      // If this check returns env, store it for next checks
      if (typeof result === 'object' && result !== null) {
        currentEnv = result;
        log('green', `✓ ${name}`);
      } else {
        log('green', `✓ ${name}: ${result}`);
      }
      
      passed++;
    } catch (error) {
      log('red', `✗ ${name}`);
      log('red', `  Error: ${error.message}`);
      failed++;
    }
  }
  
  // Summary
  log('blue', `\n${'─'.repeat(50)}`);
  log('blue', `\nSummary: ${passed} passed, ${failed} failed\n`);
  
  if (failed === 0) {
    log('green', '✓ All checks passed! 2Checkout is ready to use.\n');
    log('yellow', 'Next steps:');
    log('yellow', '1. Run: npm run dev');
    log('yellow', '2. Navigate to http://localhost:3000/shop');
    log('yellow', '3. Add items to cart and proceed to checkout');
    log('yellow', '4. You should be redirected to 2Checkout secure purchase page\n');
    process.exit(0);
  } else {
    log('red', `\n✗ ${failed} check(s) failed. Please fix the errors above.\n`);
    process.exit(1);
  }
}

runChecks();
