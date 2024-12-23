import 'dotenv/config';
import { stripe } from '@/utils/stripe/config';
import { upsertProductRecord, upsertPriceRecord } from '@/utils/supabase/admin';

// Check required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not set in environment variables`);
    process.exit(1);
  }
}

// Verify Stripe key format
const stripeKey = process.env.STRIPE_SECRET_KEY ?? '';
console.log('Stripe key starts with:', stripeKey.substring(0, 8) + '...');
if (!stripeKey.startsWith('sk_')) {
  console.error('Error: Invalid Stripe secret key format. Should start with "sk_"');
  process.exit(1);
}

async function syncStripeProducts() {
  try {
    console.log('Starting Stripe products sync...');
    
    // Test Stripe connection
    try {
      await stripe.accounts.retrieve();
      console.log('✓ Successfully connected to Stripe');
    } catch (error) {
      console.error('Failed to connect to Stripe:', error);
      process.exit(1);
    }
    
    // Fetch all products from Stripe
    const products = await stripe.products.list();
    console.log(`Found ${products.data.length} products in Stripe:`, 
      products.data.map(p => ({ id: p.id, name: p.name, active: p.active }))
    );
    
    // Sync each product
    for (const product of products.data) {
      console.log(`\nProcessing product: ${product.name} (${product.id})`);
      console.log('Product details:', {
        id: product.id,
        name: product.name,
        active: product.active,
        description: product.description,
        metadata: product.metadata
      });
      
      await upsertProductRecord(product);
      console.log(`✓ Synced product: ${product.name}`);
      
      // Fetch and sync prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true
      });
      
      console.log(`Found ${prices.data.length} prices for product ${product.name}`);
      
      for (const price of prices.data) {
        console.log('Price details:', {
          id: price.id,
          product: price.product,
          active: price.active,
          currency: price.currency,
          unit_amount: price.unit_amount,
          type: price.type,
          interval: price.recurring?.interval
        });
        
        await upsertPriceRecord(price);
        console.log(`✓ Synced price: ${price.id} for product ${product.name}`);
      }
    }
    
    console.log('\nSync completed successfully!');
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

// Run the sync
syncStripeProducts();
