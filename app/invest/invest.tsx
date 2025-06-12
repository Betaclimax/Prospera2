import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Animated, Dimensions, Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

export default function Invest() {
  const router = useRouter();
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [maturedSavings, setMaturedSavings] = useState(MOCK_MATURED_SAVINGS);
  const [investAmount, setInvestAmount] = useState('');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [selectedBackground, setSelectedBackground] = useState(0);

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
    setShowInvestmentModal(false);
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
              <Text style={styles.headerTitle}>{t('common.invest')}</Text>
                <TouchableOpacity style={styles.notificationButton}>
                  <Ionicons name="notifications-outline" size={24} color="#1976D2" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.portfolioCard}>
              <View style={styles.portfolioHeader}>
                <View>
                  <Text style={styles.portfolioLabel}>{t('common.totalPortfolio')}</Text>
                  <Text style={styles.portfolioAmount}>${maturedSavings.toFixed(2)}</Text>
                </View>
                <View style={styles.portfolioTrend}>
                  <Ionicons name="trending-up" size={20} color="#4CAF50" />
                  <Text style={styles.trendText}>+2.5% {t('common.thisMonth')}</Text>
                  </View>
                  </View>
              <View style={styles.portfolioStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>${(maturedSavings * 0.4).toFixed(2)}</Text>
                  <Text style={styles.statLabel}>{t('common.available')}</Text>
                  </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>${(maturedSavings * 0.6).toFixed(2)}</Text>
                  <Text style={styles.statLabel}>{t('common.invested')}</Text>
                </View>
              </View>
            </View>

            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setShowInvestmentModal(true)}
              >
                <LinearGradient
                  colors={['#1976D2', '#1565C0']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.actionText}>{t('common.newInvestment')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <LinearGradient
                  colors={['#4CAF50', '#43A047']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="analytics-outline" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.actionText}>{t('common.analytics')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <LinearGradient
                  colors={['#FF9800', '#FB8C00']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="document-text-outline" size={24} color="#fff" />
                </LinearGradient>
                <Text style={styles.actionText}>{t('common.reports')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.opportunitiesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('common.investmentOpportunities')}</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>{t('common.viewAll')}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#1976D2" />
                </TouchableOpacity>
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.opportunitiesList}
              >
                <TouchableOpacity style={styles.opportunityCard}>
                  <LinearGradient
                    colors={['#E3F2FD', '#BBDEFB']}
                    style={styles.opportunityGradient}
                  >
                    <View style={styles.opportunityHeader}>
                      <Text style={styles.opportunityTitle}>Fixed Term</Text>
                      <View style={styles.opportunityBadge}>
                        <Text style={styles.opportunityBadgeText}>10% APY</Text>
                      </View>
                    </View>
                    <Text style={styles.opportunityDescription}>
                      {t('common.fixedTermDescription')}
                    </Text>
                    <View style={styles.opportunityStats}>
                      <View style={styles.opportunityStat}>
                        <Text style={styles.opportunityStatLabel}>{t('common.minimum')}</Text>
                        <Text style={styles.opportunityStatValue}>$100</Text>
                      </View>
                      <View style={styles.opportunityStat}>
                        <Text style={styles.opportunityStatLabel}>{t('common.term')}</Text>
                        <Text style={styles.opportunityStatValue}>6 {t('common.months')}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.opportunityCard}>
                  <LinearGradient
                    colors={['#E8F5E9', '#C8E6C9']}
                    style={styles.opportunityGradient}
                  >
                    <View style={styles.opportunityHeader}>
                      <Text style={styles.opportunityTitle}>Growth Fund</Text>
                      <View style={[styles.opportunityBadge, { backgroundColor: '#4CAF50' }]}>
                        <Text style={styles.opportunityBadgeText}>15% APY</Text>
                      </View>
                    </View>
                    <Text style={styles.opportunityDescription}>
                      {t('common.growthFundDescription')}
                    </Text>
                    <View style={styles.opportunityStats}>
                      <View style={styles.opportunityStat}>
                        <Text style={styles.opportunityStatLabel}>{t('common.minimum')}</Text>
                        <Text style={styles.opportunityStatValue}>$500</Text>
                      </View>
                      <View style={styles.opportunityStat}>
                        <Text style={styles.opportunityStatLabel}>{t('common.term')}</Text>
                        <Text style={styles.opportunityStatValue}>12 {t('common.months')}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <View style={styles.investmentsSection}>
              <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('common.yourInvestments')}</Text>
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>{t('common.viewAll')}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#1976D2" />
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
                  <TouchableOpacity 
                    style={styles.emptyStateButton}
                    onPress={() => setShowInvestmentModal(true)}
                  >
                    <Text style={styles.emptyStateButtonText}>{t('common.startNow')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                investments.map(renderInvestment)
              )}
            </View>
          </ScrollView>

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
      
      </ImageBackground>

      <Modal
        visible={showInvestmentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInvestmentModal(false)}
      >
        <BlurView intensity={20} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('common.newInvestment')}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowInvestmentModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
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
                <View style={styles.calcHeader}>
                  <Text style={styles.calcTitle}>{t('common.investmentSummary')}</Text>
                  <View style={styles.calcPeriod}>
                    <Text style={styles.calcPeriodText}>6 {t('common.months')}</Text>
                  </View>
                </View>
                
                <View style={styles.calcDivider} />
                
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
                
                <View style={styles.calcDivider} />
                
                <View style={styles.calcRow}>
                  <Text style={styles.calcTotalLabel}>{t('common.totalReturn')}</Text>
                  <Text style={styles.calcTotalValue}>+${(Number(investAmount) * (1 - FEE_RATE) * INTEREST_RATE).toFixed(2)}</Text>
                </View>
              </View>
            ) : null}

            <TouchableOpacity 
              style={[
                styles.investButtonContainer,
                !investAmount && styles.investButtonDisabled
              ]}
              onPress={handleInvest}
              disabled={!investAmount}
            >
              <LinearGradient
                colors={investAmount ? ['#4CAF50', '#45a049'] : ['#CCCCCC', '#BBBBBB']}
                style={styles.investButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[
                  styles.investButtonText,
                  !investAmount && styles.investButtonTextDisabled
                ]}>{t('common.investButton')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Satoshi',
    color: '#1976D2',
    fontWeight: 'bold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  portfolioCard: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  portfolioLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Satoshi',
    marginBottom: 8,
  },
  portfolioAmount: {
    fontSize: 36,
    color: '#1976D2',
    fontFamily: 'Satoshi',
    fontWeight: 'bold',
  },
  portfolioTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 14,
    color: '#4CAF50',
    fontFamily: 'Satoshi',
    marginLeft: 4,
    fontWeight: '600',
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    color: '#000',
    fontFamily: 'Satoshi',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Satoshi',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 24,
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
    fontFamily: 'Satoshi',
    textAlign: 'center',
    fontWeight: '600',
  },
  opportunitiesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi',
    color: '#1976D2',
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#1976D2',
    fontSize: 14,
    fontFamily: 'Satoshi',
    marginRight: 4,
    fontWeight: '600',
  },
  opportunitiesList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  opportunityCard: {
    width: width * 0.7,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  opportunityGradient: {
    padding: 20,
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  opportunityTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi',
    color: '#1976D2',
    fontWeight: 'bold',
  },
  opportunityBadge: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  opportunityBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Satoshi',
    fontWeight: '600',
  },
  opportunityDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Satoshi',
    marginBottom: 16,
    lineHeight: 20,
  },
  opportunityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  opportunityStat: {
    flex: 1,
  },
  opportunityStatLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Satoshi',
    marginBottom: 4,
  },
  opportunityStatValue: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Satoshi',
    fontWeight: '600',
  },
  investmentsSection: {
    paddingHorizontal: 24,
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
    padding: 24,
    width: width - 48,
    maxHeight: '80%',
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
    fontWeight: 'bold',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins',
    marginBottom: 12,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  calcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calcTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi',
    color: '#000',
    fontWeight: '600',
  },
  calcPeriod: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  calcPeriodText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#4CAF50',
  },
  calcDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
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
    gap: 4,
  },
  calcLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins',
  },
  calcValue: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  calcTotalLabel: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'Satoshi',
    fontWeight: '600',
  },
  calcTotalValue: {
    fontSize: 18,
    color: '#4CAF50',
    fontFamily: 'Satoshi',
    fontWeight: '600',
  },
  investButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  investButtonDisabled: {
    opacity: 0.7,
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
  investButtonTextDisabled: {
    color: '#FFFFFF',
},
  gradient: {
    flex: 1,
  },
});