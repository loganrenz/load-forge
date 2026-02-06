import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.error('Error: STRIPE_SECRET_KEY environment variable is missing.')
  process.exit(1)
}

const stripe = new Stripe(stripeSecretKey)

async function seed() {
  console.log('🚀 Creating loadtest.dev Stripe products and prices...')

  // Pro Tier
  const proProduct = await stripe.products.create({
    name: 'Pro Plan',
    description: '500 Virtual Users, 10 minute max test duration, 3 concurrent tests, 30 day history',
    metadata: { tier: 'pro' }
  })

  const proPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 2900, // $29.00
    currency: 'usd',
    recurring: { interval: 'month' },
  })

  console.log(`✅ Pro tier created! Price ID: ${proPrice.id}`)

  // Business Tier
  const businessProduct = await stripe.products.create({
    name: 'Business Plan',
    description: '2,000 Virtual Users, 30 minute max test duration, 10 concurrent tests, 90 day history',
    metadata: { tier: 'business' }
  })

  const businessPrice = await stripe.prices.create({
    product: businessProduct.id,
    unit_amount: 9900, // $99.00
    currency: 'usd',
    recurring: { interval: 'month' },
  })

  console.log(`✅ Business tier created! Price ID: ${businessPrice.id}`)

  console.log('\n🎉 Setup complete! Add these to your .env file:')
  console.log('----------------------------------------------')
  console.log(`STRIPE_PRICE_ID_PRO=${proPrice.id}`)
  console.log(`STRIPE_PRICE_ID_BUSINESS=${businessPrice.id}`)
  console.log('----------------------------------------------')
}

seed().catch(err => {
  console.error('❌ Error seeding Stripe:', err.message)
  process.exit(1)
})
