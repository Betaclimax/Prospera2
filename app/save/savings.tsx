import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, Dimensions, FlatList, Image, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ConnectBankAccount from '../components/ConnectBankAccount';
import PaymentService, { PaymentMethod } from '../services/payment';

const TRANSACTION_FEE = 0.02;
const INVESTMENT_INTEREST_RATE = 0.10;
const LOAN_INTEREST_RATE = 0.15;
const USER_INVESTMENT_RETURN = 0.10;

const mockUser = {
  id: 1,
  name: 'Ihor',
  accountCreationDate: new Date('2024-12-01'),
  savingsPlans: [],
  investments: [],
};
const { width } = Dimensions.get('window');
const splashSlides = [
  {
    image: require('../../assets/home/step1.png'),
    text: 'Choose your savings target and duration\n(10 or 20 weeks).\nWe will calculate your weekly deposits.',
  },
  {
    image: require('../../assets/home/step2.png'),
    text: 'Make weekly deposits automatically. \nTrack your progress and stay motivated\nwith our dashboard.',
  },
  {
    image: require('../../assets/home/step3.png'),
    text: 'When your savings mature, reinvest for\n10% APY returns. \nWatch your wealth compound over time.',
  },
];

type SavingsPlan = {
  id: number;
  amount: number;
  originalAmount: number;
  fee: number;
  duration: number;
  startDate: string;
  maturityDate: string;
};

type Investment = {
  id: number;
  amount: number;
  returnAmount: number;
  yourProfit: number;
  startDate: string;
  endDate: string;
};

interface SavingsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  depositAmount: string;
  setDepositAmount: (value: string) => void;
  savingsDuration: number;
  setSavingsDuration: (value: number) => void;
  transactionFee: number;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string | null;
  setSelectedPaymentMethod: (value: string | null) => void;
  onConnectBank: () => void;
}

const SavingsModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  depositAmount, 
  setDepositAmount, 
  savingsDuration, 
  setSavingsDuration,
  transactionFee,
  paymentMethods,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  onConnectBank
}: SavingsModalProps) => {
  const { t } = useTranslation();
  const weeks = Array.from({ length: 11 }, (_, i) => i + 10);
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('common.startNewSavings')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('common.depositAmount')}</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={depositAmount}
                onChangeText={setDepositAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('common.savingsDuration')}</Text>
            {Platform.OS === 'ios' ? (
              <View style={styles.iosPickerContainer}>
                <Picker
                  selectedValue={savingsDuration}
                  onValueChange={(value) => setSavingsDuration(value)}
                  style={styles.iosPicker}
                >
                  {weeks.map((week) => (
                    <Picker.Item key={week} label={`${week} ${t('common.weeks')}`} value={week} />
                  ))}
                </Picker>
              </View>
            ) : (
              <View style={styles.androidPickerContainer}>
                <Picker
                  selectedValue={savingsDuration}
                  onValueChange={(value) => setSavingsDuration(value)}
                  style={styles.androidPicker}
                >
                  {weeks.map((week) => (
                    <Picker.Item key={week} label={`${week} ${t('common.weeks')}`} value={week} />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('common.paymentMethod')}</Text>
            {paymentMethods.length > 0 ? (
              <View style={styles.paymentMethodContainer}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethodButton,
                      selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
                    ]}
                    onPress={() => setSelectedPaymentMethod(method.id)}
                  >
                    <Text style={[
                      styles.paymentMethodText,
                      selectedPaymentMethod === method.id && styles.selectedPaymentMethodText,
                    ]}>
                      {method.type === 'bank_account' 
                        ? `${method.bankAccount?.bankName} (****${method.last4})`
                        : `Card (****${method.last4})`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.connectBankButton}
                onPress={() => {
                  onClose();
                  onConnectBank();
                }}
              >
                <Text style={styles.connectBankButtonText}>
                  {t('common.connectBankAccount')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('common.transactionFee')}</Text>
              <Text style={styles.summaryValue}>${(Number(depositAmount || 0) * transactionFee).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('common.netAmount')}</Text>
              <Text style={styles.summaryValue}>
                ${(Number(depositAmount || 0) * (1 - transactionFee)).toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={onConfirm}
            disabled={!depositAmount || Number(depositAmount) <= 0}
          >
            <LinearGradient
              colors={['#4A90E2', '#357ABD']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.confirmButtonText}>{t('common.startSavings')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

export default function Savings() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [user, setUser] = useState(mockUser);
  const [depositAmount, setDepositAmount] = useState('');
  const [savingsDuration, setSavingsDuration] = useState(10); 
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSavingsPlans, setActiveSavingsPlans] = useState<SavingsPlan[]>([]);
  const [maturedPlans, setMaturedPlans] = useState<SavingsPlan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loanEligible, setLoanEligible] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeSplashIndex, setActiveSplashIndex] = useState(0);
  const flatListRef = useRef<FlatList<any>>(null);
  const [showConnectBank, setShowConnectBank] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  // Animation for language change
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [i18n.language]);

  const goHome = () => {
    router.push('../home/home');
  };
  const goInvest = () => {
    router.push('../invest/invest');
  };
  const goInbox = () => {
    router.push('../inbox/inbox');
  };
  const goProfile = () => {
    router.push('../profile/profile');
  };

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeSplashIndex + 1) % splashSlides.length;
      setActiveSplashIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 5000); 
    return () => clearInterval(interval);
  }, [activeSplashIndex]);

  const handleSplashScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveSplashIndex(index);
  };

  // Render splash item with text overlay
  const renderSplashItem = ({ item }: { item: { image: any; text: string } }) => (
    <View style={styles.splashImageContainer}>
      <Image source={item.image} style={styles.splashImage} resizeMode="cover" />
      <View style={styles.splashTextWrapper}>
        <Text style={styles.splashText}>{item.text}</Text>
      </View>
    </View>
  );

  useEffect(() => {
    const accountAgeInMonths =
      (new Date().getTime() - new Date(user.accountCreationDate).getTime()) /
      (1000 * 60 * 60 * 24 * 30);
    if (accountAgeInMonths >= 6) {
      setLoanEligible(true);
    }
  }, [user.accountCreationDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const updatedPlans = activeSavingsPlans.filter((plan) => new Date(plan.maturityDate) > now);
      const newMaturedPlans = activeSavingsPlans.filter((plan) => new Date(plan.maturityDate) <= now);

      setActiveSavingsPlans(updatedPlans);
      setMaturedPlans([...maturedPlans, ...newMaturedPlans]);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSavingsPlans, maturedPlans]);

  useEffect(() => {
    const paymentService = PaymentService.getInstance();
    setPaymentMethods(paymentService.getPaymentMethods());
  }, []);

  const startSavingsPlan = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      Alert.alert(t('common.invalidAmount'), t('common.enterValidAmount'));
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert(t('common.error'), t('common.selectPaymentMethod'));
      return;
    }

    try {
      const paymentService = PaymentService.getInstance();
      const transaction = await paymentService.processDeposit(
        Number(depositAmount),
        selectedPaymentMethod
      );

      if (transaction.status === 'completed') {
        const startDate = new Date();
        const maturityDate = new Date(startDate);
        maturityDate.setDate(startDate.getDate() + savingsDuration * 7);
        
        const newPlan = {
          id: Date.now(),
          amount: transaction.netAmount,
          originalAmount: transaction.amount,
          fee: transaction.fee,
          duration: savingsDuration,
          startDate: startDate.toISOString(),
          maturityDate: maturityDate.toISOString(),
        };

        setActiveSavingsPlans([...activeSavingsPlans, newPlan]);
        setDepositAmount('');
        setModalVisible(false);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('common.transactionFailed'));
    }
  };

  const handleMaturityAction = (plan: SavingsPlan, withdrawAmount: number, investAmount: number) => {
    if (withdrawAmount + investAmount !== plan.amount) {
      Alert.alert(t('common.error'), t('common.withdrawInvestEqual'));
      return;
    }

    const withdrawalFee = withdrawAmount * TRANSACTION_FEE;
    const netWithdrawal = withdrawAmount - withdrawalFee;

    Alert.alert(
      t('common.withdrawalConfirmation'),
      t('common.withdrawing', { amount: withdrawAmount.toFixed(2), fee: withdrawalFee.toFixed(2), net: netWithdrawal.toFixed(2) }),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirmAction'),
          onPress: () => {
            if (investAmount > 0) {
              const investmentEndDate = new Date();
              investmentEndDate.setMonth(investmentEndDate.getMonth() + 6);

              const investmentReturn = investAmount * INVESTMENT_INTEREST_RATE;
              const userReturn = investAmount * USER_INVESTMENT_RETURN;
              const yourProfit = investmentReturn - userReturn;

              const newInvestment = {
                id: Date.now(),
                amount: investAmount,
                returnAmount: investAmount + userReturn,
                yourProfit: yourProfit,
                startDate: new Date().toISOString(),
                endDate: investmentEndDate.toISOString(),
              };

              setInvestments([...investments, newInvestment]);
            }

            setMaturedPlans(maturedPlans.filter((p) => p.id !== plan.id));
          },
        },
      ]
    );
  };

  const renderSavingsPlan = ({ item }: { item: SavingsPlan }) => {
    const now = new Date();
    const startDate = new Date(item.startDate);
    const maturityDate = new Date(item.maturityDate);
    const totalDays = (maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const daysPassed = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const progress = Math.min((daysPassed / totalDays) * 100, 100);

    return (
      <View style={styles.planCard}>
        <Animated.Text style={[styles.planTitle, { opacity: fadeAnim }]}>
          {t('common.activeSavings')}: {item.duration} {t('common.weeks')}
        </Animated.Text>
        <Animated.Text style={[styles.planDetail, { opacity: fadeAnim }]}>
          {t('common.amount')}: ${item.amount.toFixed(2)}
        </Animated.Text>
        <Animated.Text style={[styles.planDetail, { opacity: fadeAnim }]}>
          {t('common.maturityDate')}: {new Date(item.maturityDate).toLocaleDateString()}
        </Animated.Text>
        <Animated.Text style={[styles.planDetail, { opacity: fadeAnim }]}>
          {t('common.progress')}: {progress.toFixed(1)}%
        </Animated.Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    );
  };

  const renderMaturedPlan = ({ item }: { item: SavingsPlan }) => {
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [investAmount, setInvestAmount] = useState('');

    return (
      <View style={styles.planCard}>
        <Animated.Text style={[styles.planTitle, { opacity: fadeAnim }]}>
          {t('common.matured')}: {item.duration} {t('common.weeks')}
        </Animated.Text>
        <Animated.Text style={[styles.planDetail, { opacity: fadeAnim }]}>
          {t('common.amount')}: ${item.amount.toFixed(2)}
        </Animated.Text>
        <Animated.Text style={[styles.planDetail, { opacity: fadeAnim }]}>
          {t('common.maturedOn')}: {new Date(item.maturityDate).toLocaleDateString()}
        </Animated.Text>
        <TextInput
          style={styles.input}
          placeholder={t('common.amountToWithdraw')}
          keyboardType="numeric"
          value={withdrawAmount}
          onChangeText={setWithdrawAmount}
        />
        <TextInput
          style={styles.input}
          placeholder={t('common.amountToInvest')}
          keyboardType="numeric"
          value={investAmount}
          onChangeText={setInvestAmount}
        />
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            handleMaturityAction(item, Number(withdrawAmount) || 0, Number(investAmount) || 0)
          }
        >
          <Text style={styles.actionButtonText}>{t('common.confirmAction')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderInvestment = ({ item }: { item: Investment }) => {
    return (
      <View style={styles.planCard}>
        <Animated.Text style={[styles.planTitle, { opacity: fadeAnim }]}>
          {t('invest.title')}
        </Animated.Text>
        <Animated.Text style={[styles.planDetail, { opacity: fadeAnim }]}>
          {t('invest.amount')}: ${item.amount.toFixed(2)}
        </Animated.Text>
        <Animated.Text style={[styles.planDetail, { opacity: fadeAnim }]}>
          {t('invest.return')}: ${item.returnAmount.toFixed(2)}
        </Animated.Text>
        <Animated.Text style={[styles.planDetail, { opacity: fadeAnim }]}>
          {t('invest.endDate')}: {new Date(item.endDate).toLocaleDateString()}
        </Animated.Text>
        <Animated.Text style={[styles.planDetail, { opacity: fadeAnim }]}>
          {t('invest.yourProfit')}: ${item.yourProfit.toFixed(2)}
        </Animated.Text>
      </View>
    );
  };

  // --- WEEK OPTIONS LOGIC ---
  const weekOptions = Array.from({ length: 11 }, (_, i) => 10 + i); 

  return (
    <LinearGradient
      colors={['#f2f2f2', '#f2f2f2']}
      style={styles.container}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 0.5, y: 0.5 }}
    >
    {/* Background Image */}
    <Image
        source={require('../../assets/home/background3.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
    />
      {/* Header */}
      <View style={styles.header}>
        <Animated.Text style={[styles.headerTitle, { opacity: fadeAnim }]}>
          {t('common.title')}
        </Animated.Text>
      </View>

      {/* Start New Savings Plan */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <TouchableOpacity style={styles.startButtonWithImage} onPress={() => setModalVisible(true)}>
            <Image
                source={require('../../assets/home/plus.png')}
                style={{ width: 28, height: 28, marginRight: 6 }}
            />
            </TouchableOpacity>
        </View>  
        <Animated.Text style={[styles.cardtext, { opacity: fadeAnim }]}>
            {t('common.startJourney')}{'\n'}{'\n'}{t('common.setGoal')}
        </Animated.Text>
      </View>

      {/* Modal for New Savings Plan */}
      <SavingsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={startSavingsPlan}
        depositAmount={depositAmount}
        setDepositAmount={setDepositAmount}
        savingsDuration={savingsDuration}
        setSavingsDuration={setSavingsDuration}
        transactionFee={TRANSACTION_FEE}
        paymentMethods={paymentMethods}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        onConnectBank={() => setShowConnectBank(true)}
      />

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 20 }}>
        {/* Active Savings Plans */}
        <View style={[styles.halfCard, { marginRight: 8 }]}>
            <Animated.Text style={[styles.sectionTitle, { opacity: fadeAnim }]}>
              {t('common.activeSavings')}
            </Animated.Text>
            <FlatList
            data={activeSavingsPlans}
            renderItem={renderSavingsPlan}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={styles.emptyText}>{t('common.noActivePlans')}</Text>}
            />
        </View>
        {/* Matured Plans */}
        <View style={[styles.halfCard, { marginLeft: 8 }]}>
            <Animated.Text style={[styles.sectionTitle, { opacity: fadeAnim }]}>
              {t('common.matured')}
            </Animated.Text>
            <FlatList
            data={maturedPlans}
            renderItem={renderMaturedPlan}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={styles.emptyText}>{t('common.noMaturedPlans')}</Text>}
            />
        </View>
    </View>
    <View style={[styles.howworks, { marginHorizontal: 20, marginBottom: 24 }]}>
        <Animated.Text style={[styles.sectionTitlehow, { marginBottom: 8, opacity: fadeAnim }]}>
          {t('common.howItWorks')}
        </Animated.Text>
    </View>

    {/* Splash Images Section */}
            <View style={styles.splashSection}>
              <FlatList
                ref={flatListRef}
                data={[
                  { image: require('../../assets/home/step1.png'), text: t('common.step1') },
                  { image: require('../../assets/home/step2.png'), text: t('common.step2') },
                  { image: require('../../assets/home/step3.png'), text: t('common.step3') },
                ]}
                renderItem={renderSplashItem}
                keyExtractor={(_item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleSplashScroll}
                snapToInterval={width}
                decelerationRate="fast"
              />
            </View>
       {/* Bottom Menu Bar */}
            <View style={styles.bottomMenuContainer}>
              {/* Left menu part */}
              <View style={styles.menuPartLeft}>
                  <TouchableOpacity style={styles.menuItem} onPress={goHome}>
                  <Image source={require('../../assets/home/home2.png')} style={{ width: 24, height: 24 }} />
                  <Animated.Text style={[styles.menuText, { opacity: fadeAnim }]}>
                    {t('common.home')}
                  </Animated.Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={goInvest}>
                  <Image source={require('../../assets/home/invest2.png')} style={{ width: 24, height: 24 }} />
                  <Animated.Text style={[styles.menuText, { opacity: fadeAnim }]}>
                    {t('common.invest')}
                  </Animated.Text>
                  </TouchableOpacity>
              </View>
      
              {/* Center Invest button */}
              <View style={styles.investButtonWrapper}>
                  <TouchableOpacity style={styles.investButton}>
                  <Image source={require('../../assets/home/save.png')} style={{ width: 32, height: 32 }} />
                  <Animated.Text style={[styles.investText, { opacity: fadeAnim }]}>
                    {t('common.save')}
                  </Animated.Text>
                  </TouchableOpacity>
              </View>
      
              {/* Right menu part */}
              <View style={styles.menuPartRight}>
                  <TouchableOpacity style={styles.menuItem} onPress={goInbox}>
                  <Image source={require('../../assets/home/bell2.png')} style={{ width: 19, height: 24 }} />
                  <Animated.Text style={[styles.menuText, { opacity: fadeAnim }]}>
                    {t('common.inbox')}
                  </Animated.Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={goProfile}>
                  <Image source={require('../../assets/home/profile2.png')} style={{ width: 19, height: 24 }} />
                  <Animated.Text style={[styles.menuText, { opacity: fadeAnim }]}>
                    {t('common.profile')}
                  </Animated.Text>
                  </TouchableOpacity>
              </View>
            </View>

    {/* Bank Account Connection Modal */}
    <Modal
      visible={showConnectBank}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowConnectBank(false)}
    >
      <View style={[styles.modalOverlay, { zIndex: 1000 }]}>
        <View style={[styles.bankModalContent, { zIndex: 1001 }]}>
          <ConnectBankAccount
            onSuccess={() => {
              setShowConnectBank(false);
              const paymentService = PaymentService.getInstance();
              setPaymentMethods(paymentService.getPaymentMethods());
            }}
            onCancel={() => setShowConnectBank(false)}
          />
        </View>
      </View>
    </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
    marginTop:30,
  },
  backButton: {
    fontSize: 18,
    color: '#00cc00',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'Satoshi',
    color: '#000'
  },
  startButton: {
    backgroundColor: '#00cc00',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  currencySymbol: {
    fontSize: 20,
    color: '#333',
    marginRight: 5,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    height: '100%',
  },
  iosPickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  iosPicker: {
    height: 150,
  },
  androidPickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  androidPicker: {
    height: 50,
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  confirmButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '700',
    color: '#00cc00',
    marginBottom: 10,
  },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#00cc00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backdropFilter: 'blur(8px)',
  },
  planTitle: {
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#3D3D3A',
    marginBottom: 5,
  },
  planDetail: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666666',
    marginBottom: 3,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00cc00',
    borderRadius: 4,
  },
  actionButton: {
    backgroundColor: '#00cc00',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loanText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666666',
  },
  feeText: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: '#666666',
  },
  bottomMenuContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  width: '100%',
  position: 'absolute',
  bottom: 0,
  backgroundColor: 'transparent',
  zIndex: 10,
},
menuPartLeft: {
  flexDirection: 'row',
  backgroundColor: '#FFFFFF',
  paddingVertical: 14,
  paddingHorizontal: 35,
  borderTopRightRadius:70,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 8,
},
menuPartRight: {
  flexDirection: 'row',
  backgroundColor: '#FFFFFF',
  paddingVertical: 14,
  paddingHorizontal: 33,
  borderTopLeftRadius:70,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 8,
},
investButtonWrapper: {
  position: 'absolute',
  left: '50%',
  bottom: 15,
  transform: [{ translateX: -40 }],
  zIndex: 20,
},
investButton: {
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#fff',
  borderRadius: 48,
  width: 80,
  height: 80,
},
investText: {
  color: '#000000',
  fontSize: 14,
  fontFamily: 'Satoshi',
  marginTop: 2,
},
menuItem: {
  alignItems: 'center',
  justifyContent: 'center',
  marginHorizontal: 8,
},
menuText: {
  fontSize: 14,
  fontFamily: 'Satoshi',
  color: '#000000',
  marginTop: 4,
},
backgroundImage: {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  opacity: 0.9, 
  zIndex: 0,
},
card: {
    backgroundColor: 'rgba(8, 6, 6, 0.26)',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
},
cardtext: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'justify',
},
startButtonWithImage: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 10,
  paddingHorizontal: 8,
  borderRadius: 10,
  marginBottom: 20
},
halfCard: {
  backgroundColor: 'rgba(8, 6, 6, 0.26)',
  borderRadius: 14,
  padding: 14,
  flex: 1,
  minWidth: 0,
  alignItems: 'center',
},
howworks: {
    marginHorizontal: 20,
    marginBottom: 24,
    alignItems: 'flex-start',
},
sectionTitlehow: {
    fontSize: 30,
    fontFamily: 'Satoshi',
    color: '#000'
},
  splashSection: {
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  splashImageContainer: {
    width: width,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashImage: {
    width: width - 20,
    height: 200,
    borderRadius: 15,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B0BEC5',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  splashTextWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    alignItems: 'flex-start',
  },
  splashText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    textAlign: 'left',
    lineHeight: 28,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: 'white',
    color: '#333',
  },
  paymentMethodContainer: {
    marginTop: 10,
  },
  paymentMethodButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedPaymentMethod: {
    borderColor: '#4A90E2',
    backgroundColor: '#4A90E2',
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
  },
  selectedPaymentMethodText: {
    color: 'white',
  },
  connectBankButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 10,
    alignItems: 'center',
  },
  connectBankButtonText: {
    fontSize: 16,
    color: '#4A90E2',
  },
  bankModalContent: {
    width: '90%',
    maxHeight: '80%',
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
    position: 'relative',
  },
});