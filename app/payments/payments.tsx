import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConnectBankAccount from '../components/ConnectBankAccount';
import ConnectDebitCard from '../components/ConnectDebitCard';
import PaymentMethodDetails from '../components/PaymentMethodDetails';
import PaymentService from '../services/payment';

const { width } = Dimensions.get('window');

interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'card';
  last4: string;
  bankName?: string;
  expiryDate?: string;
  cardType?: string;
  bankAccount?: { bankName: string };
}

export default function Payments() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('methods');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showMethodDetails, setShowMethodDetails] = useState(false);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [showConnectBank, setShowConnectBank] = useState(false);
  const [showConnectCard, setShowConnectCard] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Load payment methods when component mounts
  useEffect(() => {
    const paymentService = PaymentService.getInstance();
    const methods = paymentService.getPaymentMethods();
    setPaymentMethods(methods);
  }, []);

  const handleBankSuccess = async (accountDetails: {
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
    bankName: string;
  }) => {
    try {
      const paymentService = PaymentService.getInstance();
      await paymentService.connectBankAccount(accountDetails);
      const updatedMethods = paymentService.getPaymentMethods();
      setPaymentMethods(updatedMethods);
      setShowConnectBank(false);
      setShowAddMethodModal(false);
    } catch (error) {
      Alert.alert(t('common.error'), t('common.failedToConnectBank'));
    }
  };

  const handleCardSuccess = async (cardDetails: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  }) => {
    try {
      const paymentService = PaymentService.getInstance();
      await paymentService.connectDebitCard(cardDetails);
      const updatedMethods = paymentService.getPaymentMethods();
      setPaymentMethods(updatedMethods);
      setShowConnectCard(false);
      setShowAddMethodModal(false);
    } catch (error) {
      Alert.alert(t('common.error'), t('common.failedToConnectCard'));
    }
  };

  const handleRemoveMethod = async () => {
    if (selectedMethod) {
      try {
        const paymentService = PaymentService.getInstance();
        // Remove the payment method from the service
        const updatedMethods = paymentService.getPaymentMethods().filter(m => m.id !== selectedMethod.id);
        setPaymentMethods(updatedMethods);
        setShowMethodDetails(false);
        setSelectedMethod(null);
      } catch (error) {
        Alert.alert(t('common.error'), t('common.failedToRemoveMethod'));
      }
    }
  };

  const goBack = () => {
    router.back();
  };

  const handleMethodPress = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setShowMethodDetails(true);
  };

  const handleSelectMethod = (method: PaymentMethod) => {
    // Navigate back to savings page with the selected method
    router.push({
      pathname: '../save/savings',
      params: { 
        openModal: 'true',
        selectedMethodId: method.id,
        selectedMethodType: method.type,
        selectedMethodLast4: method.last4,
        selectedMethodName: method.type === 'bank_account' 
          ? method.bankAccount?.bankName 
          : 'Card'
      }
    });
  };

  const handleAddMethod = () => {
    setShowAddMethodModal(true);
  };

  const handleConnectBank = () => {
    setShowAddMethodModal(false);
    setShowConnectBank(true);
  };

  const handleConnectCard = () => {
    setShowAddMethodModal(false);
    setShowConnectCard(true);
  };

  const renderPaymentMethods = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('common.paymentMethods')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddMethod}>
          <Image source={require('../../assets/home/save.png')} style={styles.addIcon} />
          <Text style={styles.addButtonText}>{t('common.addNew')}</Text>
        </TouchableOpacity>
      </View>

      {paymentMethods.length === 0 ? (
        <View style={styles.emptyState}>
          <Image 
            source={require('../../assets/home/cards.png')} 
            style={styles.emptyStateIcon}
          />
          <Text style={styles.emptyStateText}>{t('common.noPaymentMethods')}</Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={handleAddMethod}
          >
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.emptyStateButtonGradient}
            >
              <Text style={styles.emptyStateButtonText}>{t('common.addPaymentMethod')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.methodsContainer}>
          {paymentMethods.map((method) => (
            <TouchableOpacity 
              key={method.id}
              style={styles.methodCard}
              onPress={() => handleMethodPress(method)}
            >
              <LinearGradient
                colors={method.type === 'bank_account' ? ['#2196F3', '#1976D2'] : ['#2196F3', '#1976D2']}
                style={styles.methodGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.methodIcon}>
                  <Image source={require('../../assets/home/cards.png')} style={styles.methodIconImage} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodType}>
                    {method.type === 'bank_account' ? method.bankAccount?.bankName : 'Card'}
                  </Text>
                  <Text style={styles.methodDetails}>**** {method.last4}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.selectButton}
                  onPress={() => handleSelectMethod(method)}
                >
                  <Text style={styles.selectButtonText}>{t('common.select')}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderRecentTransactions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('common.recentTransactions')}</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>{t('common.viewAll')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsContainer}>
        {[1, 2, 3].map((_, index) => (
          <View key={index} style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <Image source={require('../../assets/home/deposit.png')} style={styles.transactionIconImage} />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>Deposit</Text>
              <Text style={styles.transactionDate}>Mar 15, 2024</Text>
            </View>
            <Text style={styles.transactionAmount}>+$500.00</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('common.quickActions')}</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.actionButtonGradient}
          >
            <Image source={require('../../assets/home/deposit.png')} style={styles.actionIcon} />
            <Text style={styles.actionText}>{t('common.deposit')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            style={styles.actionButtonGradient}
          >
            <Image source={require('../../assets/home/withdraw.png')} style={styles.actionIcon} />
            <Text style={styles.actionText}>{t('common.withdraw')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require('../../assets/home/background3.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('common.payments')}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'methods' && styles.activeTab]}
          onPress={() => setActiveTab('methods')}
        >
          <LinearGradient
            colors={activeTab === 'methods' ? ['#2196F3', '#1976D2'] : ['#F5F5F5', '#F5F5F5']}
            style={styles.tabGradient}
          >
            <Text style={[styles.tabText, activeTab === 'methods' && styles.activeTabText]}>
              {t('common.paymentMethods')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <LinearGradient
            colors={activeTab === 'transactions' ? ['#2196F3', '#1976D2'] : ['#F5F5F5', '#F5F5F5']}
            style={styles.tabGradient}
          >
            <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
              {t('common.transactions')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderQuickActions()}
        {renderPaymentMethods()}
        {renderRecentTransactions()}
      </ScrollView>

      {/* Payment Method Details Modal */}
      {selectedMethod && (
        <PaymentMethodDetails
          visible={showMethodDetails}
          onClose={() => setShowMethodDetails(false)}
          method={selectedMethod}
          onRemove={handleRemoveMethod}
        />
      )}

      {/* Add Payment Method Modal */}
      <Modal
        visible={showAddMethodModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddMethodModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('common.addPaymentMethod')}</Text>
              <TouchableOpacity onPress={() => setShowAddMethodModal(false)}>
                <Ionicons name="close" size={24} color="#000" style={styles.backIcon} />
              </TouchableOpacity>
            </View>

            <View style={styles.addMethodButtons}>
              <TouchableOpacity
                style={[styles.addMethodButton, styles.connectBankButton]}
                onPress={handleConnectBank}
              >
                <LinearGradient
                  colors={['#2196F3', '#1976D2']}
                  style={styles.addMethodButtonGradient}
                >
                  <Image source={require('../../assets/home/cards.png')} style={styles.addMethodIcon} />
                  <Text style={styles.addMethodButtonText}>{t('common.connectBankAccount')}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addMethodButton, styles.connectCardButton]}
                onPress={handleConnectCard}
              >
                <LinearGradient
                  colors={['#2196F3', '#1976D2']}
                  style={styles.addMethodButtonGradient}
                >
                  <Image source={require('../../assets/home/cards.png')} style={styles.addMethodIcon} />
                  <Text style={styles.addMethodButtonText}>{t('common.connectDebitCard')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Connect Bank Account Modal */}
      <Modal
        visible={showConnectBank}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConnectBank(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ConnectBankAccount
              onSuccess={(accountDetails) => handleBankSuccess(accountDetails)}
              onCancel={() => setShowConnectBank(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Connect Debit Card Modal */}
      <Modal
        visible={showConnectCard}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConnectCard(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ConnectDebitCard
              onSuccess={(cardDetails) => handleCardSuccess(cardDetails)}
              onCancel={() => setShowConnectCard(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Satoshi-Bold',
    color: '#000',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  activeTab: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi-Bold',
    color: '#000',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addIcon: {
    width: 24,
    height: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#1976D2',
    marginLeft: 5,
  },
  methodsContainer: {
    gap: 15,
  },
  methodCard: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  methodGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodIconImage: {
    width: 24,
    height: 24,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 15,
  },
  methodType: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#fff',
  },
  methodDetails: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  arrowIcon: {
    width: 24,
    height: 24,
  },
  transactionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionIcon: {
    
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionIconImage: {
    width: 40,
    height: 40,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 15,
  },
  transactionTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#000',
  },
  transactionDate: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    color: '#4CAF50',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  actionButtonGradient: {
    padding: 15,
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    textAlign: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#1976D2',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  addMethodButtons: {
    gap: 12,
  },
  addMethodButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addMethodButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  addMethodIcon: {
    width: 24,
    height: 24,
  },
  addMethodButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  connectBankButton: {
    backgroundColor: '#2196F3',
  },
  connectCardButton: {
    backgroundColor: '#2196F3',
  },
  selectButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
  },
  selectButtonText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#fff',
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 18,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  emptyStateButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
}); 