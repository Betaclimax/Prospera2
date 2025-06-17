import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const stripe = new Stripe('sk_test_51Ra4WR4cDnFMEbqAmKUTv9BoSDDIShLTzjszh6Hkt7MZIN2UM0KYwp1uTkBWunE4tDK7jKuEBy22vWnrF0c3oEj600ILaA2M6I', {
  apiVersion: '2022-11-15'
});

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'exp://localhost:19000', 'exp://192.168.1.1:19000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Create a payment method and customer
app.post('/api/create-payment-method', async (req, res) => {
  try {
    console.log('Received payment method request:', req.body);
    const { type, bankName, accountType, accountNumber, routingNumber, cardNumber, expiryDate, cvv, cardholderName } = req.body;
    console.log('Creating payment method for:', bankName, 'Type:', type);

    let paymentMethod;
    let customer;
    
    if (type === 'debit_card') {
      // Create a payment method for the card using test token
      paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          token: 'tok_visa', // Using Stripe's test token for Visa card
        },
        billing_details: {
          name: cardholderName,
        },
      });

      // Create or retrieve customer
      customer = await stripe.customers.create({
        name: cardholderName,
        payment_method: paymentMethod.id,
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      // Attach the payment method to the customer
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customer.id,
      });

      res.json({
        paymentMethodId: paymentMethod.id,
        customerId: customer.id,
        last4: paymentMethod.card?.last4,
        type: paymentMethod.type,
        cardholderName,
      });
    } else if (type === 'bank_account') {
      // Create a bank account payment method
      paymentMethod = await stripe.paymentMethods.create({
        type: 'us_bank_account',
        billing_details: {
          name: bankName,
        },
        us_bank_account: {
          account_number: accountNumber,
          routing_number: routingNumber,
          account_holder_type: 'individual',
          account_type: accountType,
        },
      });

    // Create a customer
      customer = await stripe.customers.create({
      name: bankName,
    });

      // For bank accounts, we need to verify them before attaching
    const response = {
      paymentMethodId: paymentMethod.id,
      customerId: customer.id,
        last4: paymentMethod.us_bank_account?.last4,
      type: paymentMethod.type,
      bankName,
        accountType,
        requiresVerification: true,
        verificationAmounts: [0.32, 0.45] // These will be actual micro-deposit amounts in production
    };

    res.json(response);
    } else {
      throw new Error('Invalid payment method type. Only debit cards and bank accounts are accepted.');
    }
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(400).json({ 
      error: error.message,
      code: error.code,
      type: error.type 
    });
  }
});

// Process a deposit
app.post('/api/process-deposit', async (req, res) => {
  try {
    const { amount, paymentMethodId, customerId } = req.body;
    console.log('Processing deposit:', { amount, paymentMethodId, customerId });

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
      payment_method_types: ['card', 'us_bank_account'],
      payment_method_options: {
        us_bank_account: {
          verification_method: 'automatic',
        },
      },
    });

    console.log('Payment intent created:', paymentIntent.id);

    // Check if the payment was successful
    if (paymentIntent.status === 'succeeded') {
    res.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      status: paymentIntent.status
    });
    } else {
      throw new Error(`Payment failed with status: ${paymentIntent.status}`);
    }
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(400).json({ 
      error: error.message,
      code: error.code,
      type: error.type 
    });
  }
});

// Get customer's balance
app.get('/api/customer-balance/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    // Get all successful payments for this customer
    const payments = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 100,
    });

    // Filter for succeeded payments and calculate total
    const totalBalance = payments.data
      .filter(payment => payment.status === 'succeeded')
      .reduce((sum, payment) => {
        return sum + (payment.amount / 100); // Convert from cents to dollars
      }, 0);

    res.json({
      customerId,
      balance: totalBalance,
      currency: 'usd'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Verify bank account with micro-deposits
app.post('/api/verify-bank-account', async (req, res) => {
  try {
    const { paymentMethodId, customerId, amounts } = req.body;
    console.log('Verifying bank account:', { paymentMethodId, customerId, amounts });

    if (!paymentMethodId || !customerId) {
      throw new Error('Missing required parameters');
    }

    if (!amounts || !Array.isArray(amounts) || amounts.length !== 2) {
      throw new Error('Invalid verification amounts');
    }

    // Get the payment method
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    console.log('Payment method:', paymentMethod);

    if (paymentMethod.type !== 'us_bank_account') {
      throw new Error('Invalid payment method type');
    }

    // In test mode, we'll simulate verification
    // In production, you would verify against the actual micro-deposits
    const [amount1, amount2] = amounts;

    // Create a setup intent for verification
    const setupIntent = await stripe.setupIntents.create({
      payment_method: paymentMethodId,
      payment_method_types: ['us_bank_account'],
      confirm: true,
      customer: customerId,
      mandate_data: {
        customer_acceptance: {
          type: 'online',
        },
      },
    });

    console.log('Setup intent status:', setupIntent.status);

    if (setupIntent.status === 'succeeded') {
      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Return success response
      res.json({
        success: true,
        paymentMethodId,
        customerId,
        status: 'verified',
        message: 'Bank account verified successfully',
        verifiedAmounts: amounts
      });
    } else {
      throw new Error('Bank account verification failed');
    }
  } catch (error: any) {
    console.error('Stripe verification error:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to verify bank account',
      code: error.code,
      type: error.type 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 