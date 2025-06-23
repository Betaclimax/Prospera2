import { Platform } from 'react-native';
import { supabase } from '../../lib/supabase';

// For iOS simulator, use localhost
// For Android emulator, use 10.0.2.2
// For physical device, use your computer's local IP address
const API_URL = Platform.select({
  ios: 'http://127.0.0.1:3000/api',  // Changed from localhost to 127.0.0.1
  android: 'http://10.0.2.2:3000/api',
  default: 'http://127.0.0.1:3000/api'
});

export interface BankAccount {
  bankName: string;
  accountType: string;
  accountNumber?: string;
  routingNumber?: string;
  isVerified?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'debit_card';
  last4: string;
  bankAccount?: BankAccount;
  is_verified: boolean;
  verificationAmounts?: number[];
  customerId?: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  netAmount: number;
  fee: number;
  status: 'completed' | 'failed' | 'pending';
  paymentMethodId: string;
  timestamp: string;
  type?: 'deposit' | 'withdrawal';
  createdAt?: string;
  completedAt?: string;
}

class PaymentService {
  private static instance: PaymentService;
  private paymentMethods: PaymentMethod[] = [];
  private transactions: Transaction[] = [];
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: paymentMethods, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      this.paymentMethods = paymentMethods.map(pm => ({
        id: pm.stripe_payment_method_id,
        type: pm.type as 'bank_account' | 'debit_card',
        last4: pm.last4,
        is_verified: pm.is_verified,
        isDefault: pm.is_default,
        customerId: pm.stripe_customer_id,
        bankAccount: pm.type === 'bank_account' ? {
          bankName: pm.bank_name || '',
          accountType: pm.account_type || '',
        } : undefined
      }));

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing payment methods:', error);
      throw error;
    }
  }

  async connectBankAccount(accountDetails: {
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
    bankName: string;
  }): Promise<PaymentMethod> {
    try {
      const testAccountDetails = {
        ...accountDetails,
        accountNumber: '000123456789',
        routingNumber: '110000000'
      };

      console.log('Starting bank account connection process...');
      console.log('API URL:', API_URL);
      console.log('Account details:', { ...testAccountDetails, accountNumber: '****' });
      
      const response = await fetch(`${API_URL}/create-payment-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'bank_account',
          bankName: testAccountDetails.bankName,
          accountType: testAccountDetails.accountType,
          accountNumber: testAccountDetails.accountNumber,
          routingNumber: testAccountDetails.routingNumber,
          metadata: {
            is_test: true
          }
        }),
      });

      console.log('Server response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to create payment method');
      }

      const responseData = await response.json();
      console.log('Server response data:', responseData);

      const { paymentMethodId, customerId, last4, type } = responseData;
      console.log('Bank account connected successfully:', { paymentMethodId, customerId, last4, type });

      const paymentMethod: PaymentMethod = {
        id: paymentMethodId,
        type: 'bank_account',
        last4,
        isDefault: this.paymentMethods.length === 0,
        customerId,
        is_verified: false,
        bankAccount: {
          bankName: testAccountDetails.bankName,
          accountType: testAccountDetails.accountType,
          accountNumber: testAccountDetails.accountNumber,
          routingNumber: testAccountDetails.routingNumber,
        }
      };

      const { error: dbError } = await supabase
        .from('payment_methods')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          type: 'bank_account',
          stripe_payment_method_id: paymentMethodId,
          stripe_customer_id: customerId,
          last4: last4,
          bank_name: testAccountDetails.bankName,
          account_type: testAccountDetails.accountType,
          is_default: this.paymentMethods.length === 0,
          is_verified: false
        });

      if (dbError) throw dbError;

      this.paymentMethods.push(paymentMethod);
      return paymentMethod;
    } catch (error) {
      console.error('Error connecting bank account:', error);
      throw new Error('Failed to connect bank account. Please check your internet connection and try again.');
    }
  }

  async connectDebitCard(cardDetails: { 
    cardNumber: string; 
    expiryDate: string; 
    cvv: string; 
    cardholderName: string 
  }): Promise<PaymentMethod> {
    try {
      if (cardDetails.cardNumber !== '4000000000000002') {
        console.log('Using test debit card number: 4000000000000002');
        cardDetails.cardNumber = '4000000000000002';
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: existingCards, error: checkError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'debit_card')
        .eq('last4', '0002'); 

      if (checkError) throw checkError;

      if (existingCards && existingCards.length > 0) {
        console.log('Card already exists:', existingCards[0]);
        return {
          id: existingCards[0].stripe_payment_method_id,
          type: 'debit_card',
          last4: existingCards[0].last4,
          isDefault: existingCards[0].is_default,
          customerId: existingCards[0].stripe_customer_id,
          is_verified: existingCards[0].is_verified
        };
      }

      console.log('Starting debit card connection process...');
      console.log('API URL:', API_URL);
      console.log('Card details:', { ...cardDetails, cardNumber: '****', cvv: '***' });
      
      const response = await fetch(`${API_URL}/create-payment-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardholderName: cardDetails.cardholderName,
          type: 'debit_card'
        }),
      });

      console.log('Server response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to create payment method');
      }

      const responseData = await response.json();
      console.log('Server response data:', responseData);

      const { paymentMethodId, customerId, last4, type } = responseData;
      console.log('Payment method connected successfully:', { paymentMethodId, customerId, last4, type });

      const paymentMethod: PaymentMethod = {
        id: paymentMethodId,
        type: 'debit_card',
        last4,
        isDefault: this.paymentMethods.length === 0,
        customerId,
        is_verified: true
      };

      const { error: dbError } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type: 'debit_card',
          stripe_payment_method_id: paymentMethodId,
          stripe_customer_id: customerId,
          last4: last4,
          is_default: this.paymentMethods.length === 0,
          is_verified: true
        });

      if (dbError) throw dbError;

      this.paymentMethods.push(paymentMethod);
      return paymentMethod;
    } catch (error) {
      console.error('Error connecting debit card:', error);
      throw new Error('Failed to connect debit card. Please check your internet connection and try again.');
    }
  }

  async processDeposit(amount: number, paymentMethodId: string): Promise<Transaction> {
    try {
      const paymentMethod = this.paymentMethods.find(pm => pm.id === paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      const response = await fetch(`${API_URL}/process-deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          paymentMethodId,
          customerId: paymentMethod.customerId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process deposit');
      }

      const data = await response.json();
      const transaction: Transaction = {
        id: data.paymentIntentId,
        amount: amount,
        netAmount: amount * (1 - 0.02), 
        fee: amount * 0.02,
        status: data.status === 'succeeded' ? 'completed' : 'failed',
        paymentMethodId,
        timestamp: new Date().toISOString(),
      };

      this.transactions.push(transaction);
      return transaction;
    } catch (error) {
      console.error('Error processing deposit:', error);
      throw error;
    }
  }

  async processWithdrawal(amount: number, paymentMethodId: string): Promise<Transaction> {
    try {
      const paymentMethod = this.paymentMethods.find(pm => pm.id === paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      const fee = amount * 0.02;
      const netAmount = amount - fee;

      const transaction: Transaction = {
        id: `tx_${Date.now()}`,
        amount,
        netAmount,
        fee,
        status: 'completed',
        paymentMethodId,
        timestamp: new Date().toISOString(),
        type: 'withdrawal',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      this.transactions.push(transaction);
      return transaction;
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      throw new Error('Failed to process withdrawal');
    }
  }

  async getCustomerBalance(customerId: string): Promise<number> {
    try {
      const response = await fetch(`${API_URL}/customer-balance/${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to get customer balance');
      }

      const { balance } = await response.json();
      return balance;
    } catch (error) {
      console.error('Error getting customer balance:', error);
      throw new Error('Failed to get customer balance');
    }
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.paymentMethods;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  async addPaymentMethod(type: string, bankName: string, accountType: string): Promise<PaymentMethod> {
    try {
      const response = await fetch('http://localhost:3000/api/create-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, bankName, accountType }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment method');
      }

      const data = await response.json();
      const paymentMethod: PaymentMethod = {
        id: data.paymentMethodId,
        type: type as 'bank_account' | 'debit_card',
        last4: data.last4,
        bankAccount: {
          bankName,
          accountType
        },
        is_verified: false,
        verificationAmounts: data.verificationAmounts,
        customerId: data.customerId
      };

      this.paymentMethods.push(paymentMethod);
      return paymentMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }
}

export default PaymentService; 