import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Investment = {
  id: number;
  amount: number;
  startDate: string;
  endDate: string;
  interestRate: number;
  status: 'active' | 'matured' | 'withdrawn';
  profit: number;
  expectedReturn: number;
};

const MOCK_MATURED_SAVINGS = 2000;
const INTEREST_RATE = 0.10;
const FEE_RATE = 0.02;
const INVEST_MONTHS = 6;
const { width } = Dimensions.get('window');

export default function Invest() {
  const router = useRouter();
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [maturedSavings, setMaturedSavings] = useState(MOCK_MATURED_SAVINGS);
  const [investAmount, setInvestAmount] = useState('');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [t]);

  const goHome = () => router.push('../home/home');
  const goSavings = () => router.push('../save/savings');
  const goInbox = () => router.push('../inbox/inbox');
  const goProfile = () => router.push('../profile/profile');

  const handleInvest = () => {
    const amount = Number(investAmount);
    if (isNaN(amount) || amount <= 0 || amount > maturedSavings) {
      Alert.alert(t('common.invalidAmount'), t('common.enterValidAmount'));
      return;
    }

    const fee = amount * FEE_RATE;
    const netAmount = amount - fee;
    const profit = netAmount * INTEREST_RATE;
    const expectedReturn = netAmount + profit;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + INVEST_MONTHS);

    const newInvestment: Investment = {
      id: Date.now(),
      amount: netAmount,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      interestRate: INTEREST_RATE,
      status: 'active',
      profit: profit,
      expectedReturn: expectedReturn,
    };

    setInvestments([newInvestment, ...investments]);
    setMaturedSavings(maturedSavings - amount);
    setInvestAmount('');
    setShowSuccessModal(true);
  };

  const renderInvestment = (item: Investment) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.investmentCard}
      onPress={() => setSelectedInvestment(item)}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>${item.amount.toFixed(2)}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'active' ? '#4CAF50' : '#FFA000' }
          ]}>
            <Text style={styles.statusText}>{t(`common.statuses.${item.status}`)}</Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('common.profit')}</Text>
            <Text style={styles.detailValue}>${item.profit.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('common.expectedReturn')}</Text>
            <Text style={styles.detailValue}>${item.expectedReturn.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('common.end')}</Text>
            <Text style={styles.detailValue}>{new Date(item.endDate).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/home/Investbg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>{t('common.invest')}</Text>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.balanceContainer}>
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>{t('common.maturedSavings')}</Text>
                <Ionicons name="information-circle-outline" size={20} color="#666" />
              </View>
              <Text style={styles.balanceAmount}>${maturedSavings.toFixed(2)}</Text>
              <View style={styles.balanceTrend}>
                <Ionicons name="trending-up" size={16} color="#4CAF50" />
                <Text style={styles.trendText}>+2.5% {t('common.thisMonth')}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.actionGradient}
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>{t('common.newInvestment')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.actionGradient}
            >
              <Ionicons name="analytics-outline" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>{t('common.analytics')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.actionGradient}
            >
              <Ionicons name="document-text-outline" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>{t('common.reports')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.investmentForm}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>{t('common.newInvestment')}</Text>
            <TouchableOpacity>
              <Text style={styles.formHelp}>{t('common.learnMore')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('common.amountPlaceholder')}</Text>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={investAmount}
                onChangeText={setInvestAmount}
              />
            </View>
          </View>

          {investAmount ? (
            <View style={styles.calculationCard}>
              <View style={styles.calcRow}>
                <View style={styles.calcLabelContainer}>
                  <Text style={styles.calcLabel}>{t('common.fee')}</Text>
                  <Ionicons name="information-circle-outline" size={16} color="#666" />
                </View>
                <Text style={styles.calcValue}>${(Number(investAmount) * FEE_RATE).toFixed(2)}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>{t('common.netInvested')}</Text>
                <Text style={styles.calcValue}>${(Number(investAmount) * (1 - FEE_RATE)).toFixed(2)}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>{t('common.expectedReturn')}</Text>
                <Text style={styles.calcValue}>${(Number(investAmount) * (1 - FEE_RATE) * (1 + INTEREST_RATE)).toFixed(2)}</Text>
              </View>
            </View>
          ) : null}

          <TouchableOpacity 
            style={styles.investButtonContainer}
            onPress={handleInvest}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.investButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.investButtonText}>{t('common.investButton')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.investmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('common.yourInvestments')}</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>{t('common.viewAll')}</Text>
              <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {investments.length === 0 ? (
            <View style={styles.emptyState}>
              <Image 
                source={require('../../assets/home/invest2.png')} 
                style={styles.emptyStateIcon}
              />
              <Text style={styles.emptyStateText}>{t('common.noInvestments')}</Text>
              <Text style={styles.emptyStateSubtext}>{t('common.startInvesting')}</Text>
              <TouchableOpacity style={styles.emptyStateButton}>
                <Text style={styles.emptyStateButtonText}>{t('common.startNow')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            investments.map(renderInvestment)
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <BlurView intensity={20} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>{t('common.submitted')}</Text>
            <Text style={styles.modalDescription}>{t('common.submittedDescription')}</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>

      <View style={styles.bottomMenuContainer}>
        <View style={styles.menuPartLeft}>
          <TouchableOpacity style={styles.menuItem} onPress={goHome}>
            <Image source={require('../../assets/home/home2.png')} style={{ width: 24, height: 24 }} />
            <Text style={styles.menuText}>{t('common.home')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Image source={require('../../assets/home/invest2.png')} style={{ width: 24, height: 24 }} />
            <Text style={styles.menuText}>{t('common.invest')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.investButtonWrapper}>
          <TouchableOpacity style={styles.investButton} onPress={goSavings}>
            <Image source={require('../../assets/home/save.png')} style={{ width: 24, height: 24 }} />
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
    opacity: 0.9,
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
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
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  actionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  investmentForm: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    margin: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi',
    color: '#000',
    fontWeight: 'bold',
  },
  formHelp: {
    fontSize: 14,
    color: '#4CAF50',
    fontFamily: 'Poppins',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins',
    marginBottom: 8,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#000',
    fontFamily: 'Poppins',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: '#000',
    fontFamily: 'Poppins',
    paddingVertical: 16,
  },
  calculationCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calcLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calcLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins',
    marginRight: 4,
  },
  calcValue: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  investButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  investButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  investButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  investmentsSection: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  },
  viewAllText: {
    color: '#4CAF50',
    fontSize: 16,
    fontFamily: 'Poppins',
    marginRight: 4,
  },
  investmentCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardGradient: {
    padding: 24,
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
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins',
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
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
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
    color: '#666',
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    width: width - 48,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Satoshi',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '600',
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
    borderTopRightRadius: 70,
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
    borderTopLeftRadius: 70,
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
});