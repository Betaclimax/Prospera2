
export interface BankAccount {
  id: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  bankName: string;
  isVerified: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'card';
  last4: string;
  isDefault: boolean;
  bankAccount?: BankAccount;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  paymentMethodId: string;
  fee: number;
  netAmount: number;
}

class PaymentService {
  private static instance: PaymentService;
  private paymentMethods: PaymentMethod[] = [];
  private transactions: Transaction[] = [];

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Connect a bank account
  async connectBankAccount(accountDetails: Omit<BankAccount, 'id' | 'isVerified'>): Promise<BankAccount> {
    try {
      // Here you would integrate with a banking API (like Plaid)
      // For now, we'll simulate the connection
      const newAccount: BankAccount = {
        id: `bank_${Date.now()}`,
        ...accountDetails,
        isVerified: true, // In reality, this would require verification
      };

      const paymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'bank_account',
        last4: accountDetails.accountNumber.slice(-4),
        isDefault: this.paymentMethods.length === 0,
        bankAccount: newAccount,
      };

      this.paymentMethods.push(paymentMethod);
      return newAccount;
    } catch (error) {
      console.error('Error connecting bank account:', error);
      throw new Error('Failed to connect bank account');
    }
  }

  // Process a deposit
  async processDeposit(amount: number, paymentMethodId: string): Promise<Transaction> {
    try {
      // Here you would integrate with a payment processor (like Stripe)
      // For now, we'll simulate the transaction
      const paymentMethod = this.paymentMethods.find(pm => pm.id === paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      const fee = amount * 0.02; // 2% transaction fee
      const netAmount = amount - fee;

      const transaction: Transaction = {
        id: `tx_${Date.now()}`,
        amount,
        type: 'deposit',
        status: 'completed', // In reality, this would be 'pending' initially
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        paymentMethodId,
        fee,
        netAmount,
      };

      this.transactions.push(transaction);
      return transaction;
    } catch (error) {
      console.error('Error processing deposit:', error);
      throw new Error('Failed to process deposit');
    }
  }

  // Process a withdrawal
  async processWithdrawal(amount: number, paymentMethodId: string): Promise<Transaction> {
    try {
      // Here you would integrate with a payment processor
      const paymentMethod = this.paymentMethods.find(pm => pm.id === paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }

      const fee = amount * 0.02;
      const netAmount = amount - fee;

      const transaction: Transaction = {
        id: `tx_${Date.now()}`,
        amount,
        type: 'withdrawal',
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        paymentMethodId,
        fee,
        netAmount,
      };

      this.transactions.push(transaction);
      return transaction;
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      throw new Error('Failed to process withdrawal');
    }
  }

  // Get user's payment methods
  getPaymentMethods(): PaymentMethod[] {
    return this.paymentMethods;
  }

  // Get user's transaction history
  getTransactions(): Transaction[] {
    return this.transactions;
  }
}

export default PaymentService; 