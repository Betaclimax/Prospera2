import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

interface SavingsData {
  labels: string[];
  datasets: {
    data: number[];
    color: (opacity: number) => string;
    strokeWidth: number;
  }[];
}

interface MonthlyComparisonData {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

interface AnalyticsStats {
  totalSaved: number;
  activePlans: number;
  monthlyChange: number;
  plansChange: number;
}

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  formatYLabel: (value: string) => `$${value}`,
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#1976D2'
  },
  propsForBackgroundLines: {
    strokeDasharray: '', 
    stroke: 'rgba(0, 0, 0, 0.1)',
    strokeWidth: 1,
  },
  propsForLabels: {
    fontSize: 12,
    fontFamily: 'Satoshi',
  }
};

export default function Analytics() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('6M');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedChart, setSelectedChart] = useState<'savings' | 'comparison' | null>(null);
  const [savingsData, setSavingsData] = useState<SavingsData>({
    labels: [],
    datasets: [{
      data: [],
      color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
      strokeWidth: 2,
    }],
  });
  const [monthlyComparisonData, setMonthlyComparisonData] = useState<MonthlyComparisonData>({
    labels: [],
    datasets: [{
      data: [],
    }],
  });
  const [stats, setStats] = useState<AnalyticsStats>({
    totalSaved: 0,
    activePlans: 0,
    monthlyChange: 0,
    plansChange: 0,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadAnalyticsData();
    }
  }, [userId, selectedPeriod]);

  const loadUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadAnalyticsData = async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      // Get date range based on selected period
      const endDate = new Date();
      const startDate = new Date();
      switch (selectedPeriod) {
        case '1M':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case '6M':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case '1Y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case 'ALL':
          startDate.setFullYear(endDate.getFullYear() - 5); // Show last 5 years for ALL
          break;
      }

      // Fetch savings plans
      const { data: savingsPlans, error: savingsError } = await supabase
        .from('savings_plans')
        .select('*')
        .eq('user_id', userId)
        .gte('start_date', startDate.toISOString())
        .lte('start_date', endDate.toISOString())
        .order('start_date', { ascending: true });

      if (savingsError) throw savingsError;

      // Fetch transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (transactionsError) throw transactionsError;

      // Process savings data for charts
      const monthlySavings = new Map<string, number>();
      const monthlyComparison = new Map<string, number>();

      savingsPlans?.forEach(plan => {
        const date = new Date(plan.start_date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        monthlySavings.set(monthKey, (monthlySavings.get(monthKey) || 0) + plan.amount);
      });

      transactions?.forEach(transaction => {
        if (transaction.type === 'deposit') {
          const date = new Date(transaction.created_at);
          const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
          monthlyComparison.set(monthKey, (monthlyComparison.get(monthKey) || 0) + transaction.amount);
        }
      });

      // Format data for charts
      const labels = Array.from(monthlySavings.keys()).map(key => {
        const [year, month] = key.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });
      });

      const savingsValues = Array.from(monthlySavings.values());
      const comparisonValues = Array.from(monthlyComparison.values());

      // Validate data before setting state
      if (savingsValues.length === 0) {
        savingsValues.push(0);
        labels.push(new Date().toLocaleString('default', { month: 'short' }));
      }

      if (comparisonValues.length === 0) {
        comparisonValues.push(0);
      }

      setSavingsData({
        labels,
        datasets: [{
          data: savingsValues,
          color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
          strokeWidth: 2,
        }],
      });

      setMonthlyComparisonData({
        labels,
        datasets: [{
          data: comparisonValues,
        }],
      });

      // Calculate stats
      const totalSaved = savingsPlans?.reduce((sum, plan) => sum + plan.amount, 0) || 0;
      const activePlans = savingsPlans?.filter(plan => plan.status === 'active').length || 0;

      // Calculate changes compared to previous period
      const previousEndDate = new Date(startDate);
      const previousStartDate = new Date(startDate);
      previousStartDate.setMonth(previousStartDate.getMonth() - 1);

      const { data: previousSavingsPlans } = await supabase
        .from('savings_plans')
        .select('*')
        .eq('user_id', userId)
        .gte('start_date', previousStartDate.toISOString())
        .lte('start_date', previousEndDate.toISOString());

      const previousTotalSaved = previousSavingsPlans?.reduce((sum, plan) => sum + plan.amount, 0) || 0;
      const previousActivePlans = previousSavingsPlans?.filter(plan => plan.status === 'active').length || 0;

      const monthlyChange = previousTotalSaved ? ((totalSaved - previousTotalSaved) / previousTotalSaved) * 100 : 0;
      const plansChange = previousActivePlans ? activePlans - previousActivePlans : 0;

      setStats({
        totalSaved,
        activePlans,
        monthlyChange,
        plansChange,
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goHome = () => router.push('../home/home');
  const goInvest = () => router.push('../invest/invest');
  const goInbox = () => router.push('../inbox/inbox');
  const goProfile = () => router.push('../profile/profile');

  const renderDetailsModal = () => {
    if (!selectedChart) return null;

    const isSavings = selectedChart === 'savings';
    const title = isSavings ? t('common.savingsTrend') : t('common.monthlyComparison');
    const data = isSavings ? savingsData : monthlyComparisonData;

    return (
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <BlurView intensity={20} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowDetailsModal(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.detailsChartContainer}>
                {isSavings ? (
                  <LineChart
                    data={data}
                    width={width - 64}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.detailsChart}
                    withInnerLines={true}
                    withOuterLines={true}
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    fromZero={true}
                  />
                ) : (
                  <BarChart
                    data={data}
                    width={width - 64}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.detailsChart}
                    showValuesOnTopOfBars
                    yAxisLabel=""
                    yAxisSuffix=""
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    fromZero={true}
                  />
                )}
              </View>

              <View style={styles.detailsStats}>
                <View style={styles.detailsStatCard}>
                  <View style={[styles.statIconContainer, styles.averageIcon]}>
                    <Ionicons name="analytics-outline" size={20} color="#1976D2" />
                  </View>
                  <View style={styles.detailsStatContent}>
                    <Text style={styles.detailsStatLabel}>{t('common.average')}</Text>
                    <Text style={styles.detailsStatValue}>${isSavings ? '6,500' : '3,000'}</Text>
                  </View>
                </View>
                <View style={styles.detailsStatCard}>
                  <View style={[styles.statIconContainer, styles.highestIcon]}>
                    <Ionicons name="trending-up" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.detailsStatContent}>
                    <Text style={styles.detailsStatLabel}>{t('common.highest')}</Text>
                    <Text style={styles.detailsStatValue}>${isSavings ? '12,000' : '4,000'}</Text>
                  </View>
                </View>
                <View style={styles.detailsStatCard}>
                  <View style={[styles.statIconContainer, styles.lowestIcon]}>
                    <Ionicons name="trending-down" size={20} color="#FF9800" />
                  </View>
                  <View style={styles.detailsStatContent}>
                    <Text style={styles.detailsStatLabel}>{t('common.lowest')}</Text>
                    <Text style={styles.detailsStatValue}>${isSavings ? '2,000' : '2,000'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailsInsights}>
                <Text style={styles.detailsInsightsTitle}>{t('common.insights')}</Text>
                <View style={styles.insightCard}>
                  <Ionicons name="trending-up" size={24} color="#1976D2" />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>{t('common.growthTrend')}</Text>
                    <Text style={styles.insightText}>
                      {isSavings 
                        ? t('common.savingsGrowthInsight')
                        : t('common.comparisonGrowthInsight')}
                    </Text>
                  </View>
                </View>
                <View style={styles.insightCard}>
                  <Ionicons name="calendar" size={24} color="#1976D2" />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>{t('common.periodAnalysis')}</Text>
                    <Text style={styles.insightText}>
                      {isSavings 
                        ? t('common.savingsPeriodInsight')
                        : t('common.comparisonPeriodInsight')}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </BlurView>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('common.analytics')}</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#1976D2" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.periodSelector}>
          {['1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.selectedPeriod,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period && styles.selectedPeriodText,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#E3F2FD', '#BBDEFB']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>{t('common.totalSaved')}</Text>
              <Ionicons 
                name={stats.monthlyChange >= 0 ? "trending-up" : "trending-down"} 
                size={20} 
                color={stats.monthlyChange >= 0 ? "#1976D2" : "#FF9800"} 
              />
            </View>
            <Text style={styles.statValue}>${stats.totalSaved.toFixed(2)}</Text>
            <Text style={[
              styles.statChange,
              { color: stats.monthlyChange >= 0 ? '#1976D2' : '#FF9800' }
            ]}>
              {stats.monthlyChange >= 0 ? '+' : ''}{stats.monthlyChange.toFixed(1)}% {t('common.vsLastMonth')}
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={['#E3F2FD', '#BBDEFB']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>{t('common.activePlans')}</Text>
              <Ionicons 
                name={stats.plansChange >= 0 ? "trending-up" : "trending-down"} 
                size={20} 
                color={stats.plansChange >= 0 ? "#1976D2" : "#FF9800"} 
              />
            </View>
            <Text style={styles.statValue}>{stats.activePlans}</Text>
            <Text style={[
              styles.statChange,
              { color: stats.plansChange >= 0 ? '#1976D2' : '#FF9800' }
            ]}>
              {stats.plansChange >= 0 ? '+' : ''}{stats.plansChange} {t('common.vsLastMonth')}
            </Text>
          </LinearGradient>
        </View>

        <View style={[styles.chartContainer, { marginBottom: 100 }]}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>{t('common.monthlyComparison')}</Text>
            <TouchableOpacity 
              style={styles.chartAction}
              onPress={() => {
                setSelectedChart('comparison');
                setShowDetailsModal(true);
              }}
            >
              <Text style={styles.chartActionText}>{t('common.viewDetails')}</Text>
              <Ionicons name="chevron-forward" size={16} color="#1976D2" />
            </TouchableOpacity>
          </View>
          <View style={styles.chartWrapper}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1976D2" />
              </View>
            ) : (
              <BarChart
                data={monthlyComparisonData}
                width={width - 48}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                showValuesOnTopOfBars
                yAxisLabel=""
                yAxisSuffix=""
                withVerticalLabels={true}
                withHorizontalLabels={true}
                fromZero={true}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {renderDetailsModal()}

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
          <TouchableOpacity style={styles.investButton} onPress={goInvest}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Satoshi',
    color: '#000000',
    fontWeight: 'bold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
  selectedPeriod: {
    backgroundColor: '#1976D2',
  },
  periodText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Satoshi',
  },
  selectedPeriodText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 8,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Satoshi',
    opacity: 0.8,
  },
  statValue: {
    color: '#000000',
    fontSize: 28,
    fontFamily: 'Satoshi',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statChange: {
    color: '#1976D2',
    fontSize: 12,
    fontFamily: 'Satoshi',
    opacity: 0.8,
  },
  chartContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    color: '#000000',
    fontSize: 18,
    fontFamily: 'Satoshi',
    fontWeight: '600',
  },
  chartAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartActionText: {
    color: '#1976D2',
    fontSize: 14,
    fontFamily: 'Satoshi',
    marginRight: 4,
  },
  chartWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: width - 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Satoshi',
    color: '#000000',
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    padding: 24,
  },
  detailsChartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsChart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  detailsStats: {
    marginBottom: 24,
  },
  detailsStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  averageIcon: {
    backgroundColor: '#E3F2FD',
  },
  highestIcon: {
    backgroundColor: '#E8F5E9',
  },
  lowestIcon: {
    backgroundColor: '#FFF3E0',
  },
  detailsStatContent: {
    flex: 1,
  },
  detailsStatLabel: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Satoshi',
    opacity: 0.8,
    marginBottom: 4,
  },
  detailsStatValue: {
    fontSize: 20,
    color: '#000000',
    fontFamily: 'Satoshi',
    fontWeight: 'bold',
  },
  detailsInsights: {
    marginBottom: 24,
  },
  detailsInsightsTitle: {
    fontSize: 18,
    color: '#000000',
    fontFamily: 'Satoshi',
    fontWeight: '600',
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Satoshi',
    fontWeight: '600',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Satoshi',
    opacity: 0.8,
    lineHeight: 20,
  },
  loadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
}); 