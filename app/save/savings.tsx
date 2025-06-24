import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, Dimensions, Easing, FlatList, Image, ImageBackground, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../../lib/supabase';
import ConnectBankAccount from '../components/ConnectBankAccount';
import ConnectDebitCard from '../components/ConnectDebitCard';
import PaymentService, { PaymentMethod } from '../services/payment';

const TRANSACTION_FEE = 0.02;
const DEBIT_CARD_FEE = 0.03;
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
  paymentMethod?: {
    id: string;
    stripe_payment_method_id: string;
    last4: string;
    bank_name?: string;
    account_type?: string;
  };
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
  savingsDuration: number | null;
  setSavingsDuration: (value: number | null) => void;
  transactionFee: number;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string | null;
  setSelectedPaymentMethod: (value: string | null) => void;
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
}: SavingsModalProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const weeks = Array.from({ length: 11 }, (_, i) => i + 10);

  const handleGoToPayments = () => {
    onClose();
    router.push('../payments/payments');
  };

  const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod);
  
  const getTransactionFee = () => {
    if (!selectedMethod) return TRANSACTION_FEE;
    return selectedMethod.type === 'bank_account' ? TRANSACTION_FEE : DEBIT_CARD_FEE;
  };

  const currentFee = getTransactionFee();

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

          <ScrollView 
            style={styles.modalScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
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
                    <Picker.Item 
                      label="Select duration" 
                      value={null} 
                      color="#999"
                    />
                    {weeks.map((week) => (
                      <Picker.Item 
                        key={week} 
                        label={`${week} ${t('common.weeks')}`} 
                        value={week} 
                      />
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
                    <Picker.Item 
                      label="Select duration" 
                      value={null} 
                      color="#999"
                    />
                    {weeks.map((week) => (
                      <Picker.Item 
                        key={week} 
                        label={`${week} ${t('common.weeks')}`} 
                        value={week} 
                      />
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
                  <TouchableOpacity
                    style={styles.connectPaymentButton}
                    onPress={handleGoToPayments}
                  >
                    <LinearGradient
                      colors={['#2196F3', '#1976D2']}
                      style={styles.connectPaymentGradient}
                    >
                      <Ionicons name="add-circle-outline" size={24} color="#fff" />
                      <Text style={styles.connectPaymentText}>
                        {t('common.addNewPaymentMethod')}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.connectPaymentButton}
                  onPress={handleGoToPayments}
                >
                  <LinearGradient
                    colors={['#2196F3', '#1976D2']}
                    style={styles.connectPaymentGradient}
                  >
                    <Ionicons name="card-outline" size={24} color="#fff" />
                    <Text style={styles.connectPaymentText}>
                      {t('common.goToPayments')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('common.transactionFee')}</Text>
                <Text style={styles.summaryValue}>${(Number(depositAmount || 0) * currentFee).toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('common.netAmount')}</Text>
                <Text style={styles.summaryValue}>
                  ${(Number(depositAmount || 0) * (1 - currentFee)).toFixed(2)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!depositAmount || !savingsDuration || !selectedPaymentMethod) && styles.disabledButton
              ]}
              onPress={onConfirm}
              disabled={!depositAmount || !savingsDuration || !selectedPaymentMethod}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>{t('common.startSavings')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
};

const useFairyTaleEffect = () => {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const borderGlowAnim = useRef(new Animated.Value(0)).current;

  const startGlow = () => {
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
    ]).start();
  };

  const startBorderGlow = () => {
    Animated.sequence([
      Animated.timing(borderGlowAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
      Animated.timing(borderGlowAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
    ]).start();
  };

  const startScale = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.02,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
    ]).start();
  };

  const startRotate = () => {
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }).start(() => {
      rotateAnim.setValue(0);
    });
  };

  return {
    glowAnim,
    scaleAnim,
    rotateAnim,
    borderGlowAnim,
    startGlow,
    startScale,
    startRotate,
    startBorderGlow,
  };
};

interface MagicalButtonProps {
  onPress: () => void;
  style: any;
  children: React.ReactNode;
}

interface MagicalCardProps {
  style: any;
  children: React.ReactNode;
}

const MagicalButton = ({ onPress, style, children }: MagicalButtonProps) => {
  const { glowAnim, scaleAnim, borderGlowAnim, startGlow, startScale, startBorderGlow } = useFairyTaleEffect();
  const [isPressed, setIsPressed] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePressIn = () => {
    setIsPressed(true);
    pressTimer.current = setTimeout(() => {
      startBorderGlow();
    }, 2000);
  };

  const handlePressOut = () => {
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const glowStyle = {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.8],
    }),
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 20],
    }),
    transform: [{ scale: scaleAnim }],
  };

  const borderGlowStyle = {
    borderWidth: 2,
    borderColor: borderGlowAnim.interpolate({
      inputRange: [0, 0.25, 0.5, 0.75, 1],
      outputRange: [
        'rgba(255, 255, 255, 0)',
        'rgba(255, 255, 255, 0.5)',
        'rgba(255, 255, 255, 1)',
        'rgba(255, 255, 255, 0.5)',
        'rgba(255, 255, 255, 0)',
      ],
    }),
  };

  return (
    <TouchableOpacity
      onPress={() => {
        startGlow();
        startScale();
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, glowStyle, borderGlowStyle]}
    >
      {children}
    </TouchableOpacity>
  );
};

const MagicalCard = ({ style, children }: MagicalCardProps) => {
  const { glowAnim, rotateAnim, startGlow, startRotate } = useFairyTaleEffect();

  useEffect(() => {
    const interval = setInterval(() => {
      startGlow();
      startRotate();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const cardStyle = {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.1, 0.15],
    }),
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [8, 12],
    }),
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '0.5deg'],
        }),
      },
    ],
  };

  return <Animated.View style={[style, cardStyle]}>{children}</Animated.View>;
};

// Background images array
const backgroundImages = [
  require('../../assets/backgrounds/bg1.png'),
  require('../../assets/backgrounds/bg2.png'),
  require('../../assets/backgrounds/bg3.png'),
  require('../../assets/backgrounds/bg4.png'),  
  require('../../assets/backgrounds/bg5.png'),
  require('../../assets/backgrounds/bg6.png'),
  require('../../assets/backgrounds/bg7.png'),
  require('../../assets/backgrounds/bg8.png'),
  require('../../assets/backgrounds/bg9.png'),
  require('../../assets/backgrounds/bg10.png'),
  require('../../assets/backgrounds/bg11.png'),
  require('../../assets/backgrounds/bg12.png'),
  require('../../assets/backgrounds/bg13.png'),
  require('../../assets/backgrounds/bg14.png'),
  require('../../assets/backgrounds/bg15.png'),
  require('../../assets/backgrounds/bg16.png'),
  require('../../assets/backgrounds/bg17.png'),
  require('../../assets/backgrounds/bg18.png'),
  require('../../assets/backgrounds/bg19.png'),
  require('../../assets/backgrounds/bg20.png'),
  require('../../assets/backgrounds/bg21.png'),
  require('../../assets/backgrounds/bg22.png'),
];

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  duration: number;
}

const SuccessModal = ({ visible, onClose, amount, duration }: SuccessModalProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { t, i18n } = useTranslation();
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.elastic(1.2),
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const checkmarkScale = checkmarkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.successModalOverlay}>
      <Animated.View
        style={[
          styles.successModalContent,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.successIconContainer}>
          <View style={styles.checkmarkCircle}>
            <Animated.View 
              style={[
                styles.checkmark,
                {
                  transform: [{ scale: checkmarkScale }],
                  opacity: checkmarkAnim,
                }
              ]}
            >
              <Ionicons name="checkmark" size={60} color="#2196F3" />
            </Animated.View>
          </View>
        </View>
        <Text style={styles.successTitle}>{t('common.Savings Plan Created!')}</Text>
        <Text style={styles.successSubtitle}>
          {t('common.You have successfully started saving')} ${amount.toFixed(2)} {t('common.for')} {duration} {t('common.weeks')}
        </Text>
        <View style={styles.successDetails}>
          <View style={styles.successDetailItem}>
            <Ionicons name="calendar-outline" size={24} color="#2196F3" />
            <Text style={styles.successDetailText}>
              {t('common.Start Date')}: {new Date().toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.successDetailItem}>
            <Ionicons name="trending-up-outline" size={24} color="#2196F3" />
            <Text style={styles.successDetailText}>
              {t('common.Maturity Date')}: {new Date(Date.now() + duration * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.successButton}
          onPress={onClose}
        >
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.successButtonGradient}
          >
            <Text style={styles.successButtonText}>{t('common.Continue')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Add new interfaces for matured savings
interface MaturedSavingsPlan extends SavingsPlan {
  status: 'pending_action' | 'withdrawn' | 'invested';
  withdrawal_amount?: number;
  investment_amount?: number;
  action_date?: string;
}

export default function Savings() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t, i18n } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [user, setUser] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [savingsDuration, setSavingsDuration] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSavingsPlans, setActiveSavingsPlans] = useState<SavingsPlan[]>([]);
  const [maturedPlans, setMaturedPlans] = useState<MaturedSavingsPlan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loanEligible, setLoanEligible] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeSplashIndex, setActiveSplashIndex] = useState(0);
  const flatListRef = useRef<FlatList<any>>(null);
  const [showConnectBank, setShowConnectBank] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showConnectCard, setShowConnectCard] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState({ amount: 0, duration: 0 });
  const [showAllActiveSavings, setShowAllActiveSavings] = useState(false);
  const [selectedMaturedPlanId, setSelectedMaturedPlanId] = useState<number | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [investAmount, setInvestAmount] = useState('');

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

  useEffect(() => {
    const paymentService = PaymentService.getInstance();
    const loadMethods = async () => {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
    };
    loadMethods();
  }, []);

  useEffect(() => {
    if (params.openModal === 'true') {
      setModalVisible(true);
      
      if (params.selectedMethodId) {
        const paymentService = PaymentService.getInstance();
        const loadMethods = async () => {
          const methods = await paymentService.getPaymentMethods();
          setPaymentMethods(methods);
        };
        loadMethods();
        
        setSelectedPaymentMethod(params.selectedMethodId as string);
      }
    }

    if (params.verified === 'true' && params.paymentMethodId && params.depositAmount && params.savingsDuration) {
      const startDate = new Date();
      const maturityDate = new Date(startDate);
      maturityDate.setDate(startDate.getDate() + Number(params.savingsDuration) * 7);
      
      const newPlan = {
        id: Date.now(),
        amount: Number(params.depositAmount),
        originalAmount: Number(params.depositAmount),
        fee: Number(params.depositAmount) * TRANSACTION_FEE,
        duration: Number(params.savingsDuration),
        startDate: startDate.toISOString(),
        maturityDate: maturityDate.toISOString(),
      };

      setActiveSavingsPlans([...activeSavingsPlans, newPlan]);
      setDepositAmount('');
      setModalVisible(false);
    }
  }, [params.openModal, params.selectedMethodId, params.verified, params.paymentMethodId, params.depositAmount, params.savingsDuration]);

  useEffect(() => {
    loadSavedBackground();
  }, []);

  const loadSavedBackground = async () => {
    try {
      const savedIndex = await AsyncStorage.getItem('background-index');
      if (savedIndex !== null) {
        const index = parseInt(savedIndex);
        setSelectedBackground(index);
      }
    } catch (error) {
      console.error('Error loading background:', error);
    }
  };

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
      (new Date().getTime() - new Date(user?.accountCreationDate).getTime()) /
      (1000 * 60 * 60 * 24 * 30);
    if (accountAgeInMonths >= 6) {
      setLoanEligible(true);
    }
  }, [user?.accountCreationDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newMaturedPlans = activeSavingsPlans.filter(plan => new Date(plan.maturityDate) <= now);
      const updatedActivePlans = activeSavingsPlans.filter(plan => new Date(plan.maturityDate) > now);
      setMaturedPlans(prev => {
        const prevIds = new Set(prev.map(p => p.id));
        const uniqueNewMatured = newMaturedPlans.filter(plan => !prevIds.has(plan.id));
        return [
          ...prev,
          ...uniqueNewMatured.map(plan => ({
            ...plan,
            status: 'pending_action' as const,
            withdrawal_amount: undefined,
            investment_amount: undefined,
            action_date: undefined
          }))
        ];
      });

      setActiveSavingsPlans(updatedActivePlans);
    });

    return () => clearInterval(interval);
  }, [activeSavingsPlans]);

  const startSavingsPlan = async () => {
    try {
      if (!depositAmount || parseFloat(depositAmount) <= 0) {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: t('common.invalidAmount'),
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
        });
        return;
      }

      if (!savingsDuration) {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: 'Please select a savings duration',
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
        });
        return;
      }

      if (!selectedPaymentMethod) {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: t('common.selectPaymentMethod'),
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
        });
        return;
      }

      const startDate = new Date();
      const maturityDate = new Date(startDate);
      maturityDate.setDate(startDate.getDate() + (savingsDuration * 7));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: t('common.notLoggedIn'),
          position: 'top',
          visibilityTime: 3000,
          autoHide: true,
        });
        return;
      }

      setIsLoading(true);

      const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethod);
      if (!selectedMethod) {
        throw new Error('Selected payment method not found');
      }

      if (selectedMethod.type === 'bank_account' && !selectedMethod.is_verified) {
        setModalVisible(false);
        router.push({
          pathname: '../payments/verify-bank',
          params: {
            paymentMethodId: selectedMethod.id,
            customerId: selectedMethod.customerId,
            verificationAmounts: selectedMethod.verificationAmounts,
            depositAmount: depositAmount,
            savingsDuration: savingsDuration,
          }
        });
        return;
      }

      let { data: paymentMethodData, error: paymentMethodError } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('stripe_payment_method_id', selectedMethod.id)
        .single();

      if (paymentMethodError || !paymentMethodData) {
        const { data: newPaymentMethod, error: createError } = await supabase
          .from('payment_methods')
          .insert({
            user_id: user.id,
            type: selectedMethod.type,
            stripe_payment_method_id: selectedMethod.id,
            stripe_customer_id: selectedMethod.customerId,
            last4: selectedMethod.last4,
            bank_name: selectedMethod.bankAccount?.bankName,
            account_type: selectedMethod.bankAccount?.accountType,
            is_default: selectedMethod.isDefault,
            is_verified: selectedMethod.is_verified
          })
          .select()
          .single();

        if (createError) throw createError;
        if (!newPaymentMethod) throw new Error('Failed to create payment method');
        paymentMethodData = newPaymentMethod;
      }

      if (!paymentMethodData) {
        throw new Error('Payment method not found or created');
      }

      const response = await fetch('http://localhost:3000/api/process-deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          paymentMethodId: selectedMethod.id,
          customerId: selectedMethod.customerId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process deposit');
      }

      const data = await response.json();

      if (data.success) {
        const { data: savingsPlan, error: savingsError } = await supabase
          .from('savings_plans')
          .insert({
            user_id: user.id,
            amount: parseFloat(depositAmount),
            original_amount: parseFloat(depositAmount),
            fee: TRANSACTION_FEE,
            duration: savingsDuration,
            start_date: new Date().toISOString(),
            maturity_date: maturityDate.toISOString(),
            status: 'active',
            payment_method_id: paymentMethodData.id
          })
          .select()
          .single();

        if (savingsError) throw savingsError;

        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            payment_method_id: paymentMethodData.id,
            type: 'deposit',
            amount: parseFloat(depositAmount),
            fee: TRANSACTION_FEE,
            status: 'completed',
            savings_plan_id: savingsPlan.id
          });

        if (transactionError) throw transactionError;

        // Update local state
        const newPlan: SavingsPlan = {
          id: savingsPlan.id,
          amount: parseFloat(depositAmount),
          originalAmount: parseFloat(depositAmount),
          fee: TRANSACTION_FEE,
          duration: savingsDuration,
          startDate: new Date().toISOString(),
          maturityDate: maturityDate.toISOString(),
        };

        setActiveSavingsPlans(prev => [...prev, newPlan]);
        setSuccessDetails({
          amount: parseFloat(depositAmount),
          duration: savingsDuration
        });
        setShowSuccessModal(true);
        setModalVisible(false);
        setDepositAmount('');
        setSavingsDuration(null);
        setSelectedPaymentMethod(null);
      }
    } catch (error: any) {
      console.error('Error starting savings plan:', error);
      Alert.alert(
        t('common.error'),
        error.message || t('common.savingsPlanFailed'),
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
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
      <TouchableOpacity style={styles.investmentCard} activeOpacity={0.95}>
        <LinearGradient
          colors={['rgba(227,242,253,0.8)', 'rgba(187,222,251,0.7)']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>${(item.amount - item.amount * item.fee).toFixed(2)}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{t('common.active')}</Text>
            </View>
          </View>
          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('common.duration')}</Text>
              <Text style={styles.detailValue}>{item.duration} {t('common.weeks')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('common.maturityDate')}</Text>
              <Text style={styles.detailValue}>{new Date(item.maturityDate).toLocaleDateString()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('common.progress')}</Text>
              <Text style={styles.detailValue}>{progress.toFixed(1)}%</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderMaturedPlan = ({ item }: { item: MaturedSavingsPlan }) => {
    return (
      <MagicalCard style={styles.planCard}>
        <View style={styles.planHeader}>
          <Ionicons name="checkmark-circle" size={24} color="#1976D2" style={styles.planIcon} />
          <Text style={styles.planTitle}>{t('common.Matured Savings Plan')}</Text>
        </View>
        <View style={styles.planDetails}>
          <Text style={styles.planDetail}>
            {t('common.amount')}: ${(item.amount-item.fee*item.amount).toFixed(2)}
          </Text>
          <Text style={styles.planDetail}>
            {t('common.Matured on')}: {new Date(item.maturityDate).toLocaleDateString()}
          </Text>
          {item.status === 'pending_action' && (
            <TouchableOpacity
              style={styles.MaturedButton}
              onPress={() => handleMaturedAction(item)}
            >
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.actionButtonText}>{t('common.Take Action')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          {item.status === 'withdrawn' && (
            <Text style={styles.statusText}>
              Withdrawn: ${item.withdrawal_amount?.toFixed(2)}
            </Text>
          )}
          {item.status === 'invested' && (
            <Text style={styles.statusText}>
              Invested: ${item.investment_amount?.toFixed(2)}
            </Text>
          )}
        </View>
      </MagicalCard>
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

  const weekOptions = Array.from({ length: 11 }, (_, i) => 10 + i); 

  const loadUser = async () => {
    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (supabaseUser) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email,
          accountCreationDate: new Date(supabaseUser.created_at)
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadPaymentMethods = async () => {
    const paymentService = PaymentService.getInstance();
    const methods = await paymentService.getPaymentMethods();
    setPaymentMethods(methods);
  };

  const loadTransactions = async () => {
    if (!user?.id) return;
    
    try {
      const { data: transactionsData, error } = await supabase
        .from('transactions')
        .select(`
          *,
          payment_method:payment_methods(last4, bank_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadPaymentMethods();
      loadTransactions();
      loadSavingsPlans();
    }
  }, [user]);

  const loadSavingsPlans = async () => {
    if (!user?.id) return;
    
    try {
      const { data: activePlans, error: activeError } = await supabase
        .from('savings_plans')
        .select(`
          *,
          payment_method:payment_methods(
            id,
            stripe_payment_method_id,
            last4,
            bank_name,
            account_type
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;

      const { data: maturedPlans, error: maturedError } = await supabase
        .from('savings_plans')
        .select(`
          *,
          payment_method:payment_methods(
            id,
            stripe_payment_method_id,
            last4,
            bank_name,
            account_type
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'matured')
        .order('created_at', { ascending: false });

      if (maturedError) throw maturedError;

      setActiveSavingsPlans(activePlans.map(plan => ({
        id: plan.id,
        amount: plan.amount,
        originalAmount: plan.original_amount,
        fee: plan.fee,
        duration: plan.duration,
        startDate: plan.start_date,
        maturityDate: plan.maturity_date,
        paymentMethod: plan.payment_method
      })));

      setMaturedPlans(maturedPlans.map(plan => ({
        id: plan.id,
        amount: plan.amount,
        originalAmount: plan.original_amount,
        fee: plan.fee,
        duration: plan.duration,
        startDate: plan.start_date,
        maturityDate: plan.maturity_date,
        paymentMethod: plan.payment_method,
        status: (plan.status === 'withdrawn' || plan.status === 'invested' ? plan.status : 'pending_action') as 'pending_action' | 'withdrawn' | 'invested',
        withdrawal_amount: plan.withdrawal_amount,
        investment_amount: plan.investment_amount,
        action_date: plan.action_date
      })));
    } catch (error) {
      console.error('Error loading savings plans:', error);
    }
  };

  const handleViewAllActiveSavings = () => {
    setShowAllActiveSavings(true);
  };

  const checkMaturedPlans = async () => {
    try {
      const now = new Date();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get active plans that have matured
      const { data: maturedData, error: maturedError } = await supabase
        .from('savings_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .lte('maturity_date', now.toISOString());

      if (maturedError) throw maturedError;

      if (maturedData && maturedData.length > 0) {
        // Update matured plans in the database
        const { error: updateError } = await supabase
          .from('savings_plans')
          .update({ status: 'matured' })
          .in('id', maturedData.map(plan => plan.id));

        if (updateError) throw updateError;

        // Refresh the plans
        await loadSavingsPlans();
      }
    } catch (error) {
      console.error('Error checking matured plans:', error);
    }
  };

  const handleMaturedAction = async (plan: MaturedSavingsPlan) => {
    router.push({ pathname: '/save/matured-action', params: { planId: plan.id } });
  };

  useEffect(() => {
    checkMaturedPlans();
    const interval = setInterval(checkMaturedPlans, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImages[selectedBackground]}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>{t('common.title')}</Text>
              <MagicalButton
                style={styles.notificationButton}
                onPress={() => {}}
              >
                <Ionicons name="notifications-outline" size={24} color="#000" />
              </MagicalButton>
            </View>
          </View>

          <LinearGradient
            colors={['#E3F2FD', '#BBDEFB']} 
            style={styles.balanceSection}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceContainer}>
              <MagicalCard style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                  <Text style={styles.balanceLabel}>{t('common.totalSaved')}</Text>
                  <Ionicons name="information-circle-outline" size={20} color="#FFF" />
                </View>  
                <Text style={styles.balanceAmount}>
                ${activeSavingsPlans.reduce((sum, plan) => sum + (plan.amount - plan.amount * plan.fee), 0).toFixed(2)}
                </Text>
              </MagicalCard>
            </View>
          </LinearGradient>

          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setModalVisible(true)}
            >
              <Image 
                source={require('../../assets/home/save.png')} 
                style={styles.actionImage}
              />
              <Text style={styles.actionText}>{t('common.newSavings')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('../analytics/analytics')}
            >
              <Image 
                source={require('../../assets/home/analytics.png')} 
                style={styles.actionImage}
              />
              <Text style={styles.actionText}>{t('common.analytics')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('../reports/reports')}
            >
              <Image 
                source={require('../../assets/home/reports.png')} 
                style={styles.actionImage}
              />
              <Text style={styles.actionText}>{t('common.reports')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('common.activeSavings')}</Text>
              {activeSavingsPlans.length > 3 && !showAllActiveSavings && (
                <MagicalButton style={styles.viewAllButton} onPress={handleViewAllActiveSavings}>
                  <Text style={styles.viewAllText}>{t('common.viewAll')}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#000" />
                </MagicalButton>
              )}
            </View>
            
            {activeSavingsPlans.length === 0 ? (
              <MagicalCard style={styles.emptyState}>
                <Image 
                  source={require('../../assets/home/save.png')} 
                  style={styles.emptyStateIcon}
                />
                <Text style={styles.emptyStateText}>{t('common.noActivePlans')}</Text>
                <Text style={styles.emptyStateSubtext}>{t('common.startSaving')}</Text>
                <LinearGradient
                  colors={['#2196F3', '#1976D2']}
                  style={styles.connectPaymentGradient}
                >
                  <MagicalButton 
                    style={styles.emptyStateButton}
                    onPress={() => setModalVisible(true)}
                  >
                    <Text style={styles.emptyStateButtonText}>{t('common.startNow')}</Text>
                  </MagicalButton>
                </LinearGradient>
              </MagicalCard>
            ) : (
              <FlatList
                data={showAllActiveSavings ? activeSavingsPlans : activeSavingsPlans.slice(0, 3)}
                renderItem={({ item }) => (
                  <MagicalCard style={styles.planCard}>
                    {renderSavingsPlan({ item })}
                  </MagicalCard>
                )}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.plansList}
              />
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('common.matured')}</Text>
              <MagicalButton style={styles.viewAllButton} onPress={() => {}}>
                <Text style={styles.viewAllText}>{t('common.viewAll')}</Text>
                <Ionicons name="chevron-forward" size={16} color="#000" />
              </MagicalButton>
            </View>
            
            {maturedPlans.length === 0 ? (
              <MagicalCard style={styles.emptyState}>
                <Image 
                  source={require('../../assets/home/gold.png')} 
                  style={styles.emptyStateIcon}
                />
                <Text style={styles.emptyStateText}>{t('common.noMaturedPlans')}</Text>
                <Text style={styles.emptyStateSubtext}>{t('common.keepSaving')}</Text>
              </MagicalCard>
            ) : (
              <FlatList
                data={maturedPlans}
                renderItem={renderMaturedPlan}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.plansList}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.howItWorks')}</Text>
            <View style={styles.howItWorksContainer}>
              <FlatList
                ref={flatListRef}
                data={splashSlides}
                renderItem={renderSplashItem}
                keyExtractor={(_item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleSplashScroll}
                snapToInterval={width}
                decelerationRate="fast"
              />
              <View style={styles.dotsContainer}>
                {splashSlides.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === activeSplashIndex && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

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
        />

        <View style={styles.bottomMenuContainer}>
          <View style={styles.menuPartLeft}>
            <TouchableOpacity style={styles.menuItem} onPress={goHome}>
              <Image source={require('../../assets/home/home2.png')} style={{ width: 24, height: 24 }} />
              <Text style={styles.menuText}>{t('common.home')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={goInvest}>
              <Image source={require('../../assets/home/invest2.png')} style={{ width: 24, height: 24 }} />
              <Text style={styles.menuText}>{t('common.invest')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.investButtonWrapper}>
            <TouchableOpacity style={styles.investButton}>
              <Image source={require('../../assets/home/save.png')} style={{ width: 32, height: 32 }} />
              <Text style={styles.investText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuPartRight}>
            <TouchableOpacity style={styles.menuItem} onPress={goInbox}>
              <Image source={require('../../assets/home/bell2.png')} style={{ width: 19, height: 24 }} />
              <Text style={styles.menuText}>{t('common.inbox')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={goProfile}>
              <Image source={require('../../assets/home/profile2.png')} style={{ width: 19, height: 24 }} />
              <Text style={styles.menuText}>{t('common.profile')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <Modal
        visible={showConnectBank}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConnectBank(false)}
      >
        <View style={[styles.modalOverlay, { zIndex: 1000 }]}>
          <View style={[styles.bankModalContent, { zIndex: 1001 }]}>
            <ConnectBankAccount
              onSuccess={async () => {
                setShowConnectBank(false);
                await loadPaymentMethods();
              }}
              onCancel={() => setShowConnectBank(false)}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showConnectCard}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConnectCard(false)}
      >
        <View style={[styles.modalOverlay, { zIndex: 1000 }]}>
          <View style={[styles.bankModalContent, { zIndex: 1001 }]}>
            <ConnectDebitCard
              onSuccess={async () => {
                setShowConnectCard(false);
                await loadPaymentMethods();
              }}
              onCancel={() => setShowConnectCard(false)}
            />
          </View>
        </View>
      </Modal>

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        amount={successDetails.amount}
        duration={successDetails.duration}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    padding: 24,
    paddingTop: 50,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Satoshi',
    color: '#000',
    fontWeight: 'bold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceContainer: {
    marginTop: 8,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Poppins',
  },
  balanceAmount: {
    fontSize: 36,
    color: '#000',
    fontFamily: 'Satoshi',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  balanceTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 14,
    color: '#4CAF50',
    fontFamily: 'Poppins',
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
    marginTop: 24
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  MaturedButton: {
    alignItems: 'center',
    width: '45%',
    marginTop: 30
  },
  actionImage: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Satoshi',
    textAlign: 'center',
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Satoshi',
    color: '#000',
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewAllText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins',
    marginRight: 4,
  },
  plansList: {
    paddingRight: 24,
  },
  planCard: {
    borderRadius: 20,
    padding: 24,
    marginRight: 16,
    width: width - 96,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planDetails: {
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi',
    color: '#000',
    fontWeight: 'bold',
  },
  planDetail: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Poppins',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  emptyState: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
   
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  howItWorksContainer: {
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B0BEC5',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFF',
    width: 12,
    height: 12,
    borderRadius: 6,
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
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
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
    zIndex: 1001,
  },
  modalScrollView: {
    maxHeight: '100%',
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
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
    borderRadius: 12,
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  iosPicker: {
    height: 150,
  },
  androidPickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    overflow: 'hidden',
  },
  androidPicker: {
    height: 50,
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
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
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 20

  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentMethodContainer: {
    marginTop: 10,
  },
  paymentMethodButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 10,
  },
  selectedPaymentMethod: {
    borderColor: '#2196F3',
    backgroundColor: '#2196F3',
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
  },
  selectedPaymentMethodText: {
    color: 'white',
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
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#FFFFFF',
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
  bankModalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
  connectPaymentButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  connectPaymentGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
    borderRadius:12
  },
  connectPaymentText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceSection: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  feeInfoContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  feeInfoText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  successModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successModalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2196F3',
  },
  checkmark: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 12,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  successDetails: {
    width: '100%',
    marginBottom: 24,
  },
  successDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  successDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  successButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  successButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  successButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  maturedDetails: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  maturedAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  maturedDate: {
    fontSize: 16,
    color: '#666',
  },
  actionInputs: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  planIcon: {
    marginRight: 8,
  },
  actionButtonGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  investmentCard: {
    marginBottom: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    width: '120%', 
    alignSelf: 'center',
  },
  cardGradient: {
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: 'Satoshi',
    color: '#000',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  cardDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins',
  },
  detailValue: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
});