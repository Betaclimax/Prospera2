import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const transactionData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [1200, 1500, 1800, 2100, 2400, 2700],
      color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
      strokeWidth: 2,
    },
  ],
};

const investmentData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [5000, 6000, 7000, 8000, 9000, 10000],
    },
  ],
};

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

export default function Reports() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('6M');
  const [selectedReport, setSelectedReport] = useState('savings');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingsPlans, setSavingsPlans] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId, selectedPeriod, selectedReport]);

  const loadUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      switch (selectedPeriod) {
        case '1M': startDate.setMonth(endDate.getMonth() - 1); break;
        case '3M': startDate.setMonth(endDate.getMonth() - 3); break;
        case '6M': startDate.setMonth(endDate.getMonth() - 6); break;
        case '1Y': startDate.setFullYear(endDate.getFullYear() - 1); break;
        case 'ALL': startDate.setFullYear(endDate.getFullYear() - 5); break;
      }
      if (selectedReport === 'savings') {
        const { data, error } = await supabase
          .from('savings_plans')
          .select('*')
          .eq('user_id', userId)
          .gte('start_date', startDate.toISOString())
          .lte('start_date', endDate.toISOString())
          .order('start_date', { ascending: true });
        if (error) throw error;
        setSavingsPlans(data || []);
      } else {
        const { data, error } = await supabase
          .from('investments')
          .select('*')
          .eq('user_id', userId)
          .gte('start_date', startDate.toISOString())
          .lte('start_date', endDate.toISOString())
          .order('start_date', { ascending: true });
        if (error) throw error;
        setInvestments(data || []);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goHome = () => router.push('../home/home');
  const goInvest = () => router.push('../invest/invest');
  const goInbox = () => router.push('../inbox/inbox');
  const goProfile = () => router.push('../profile/profile');

  const renderReportSelector = () => (
    <View style={styles.reportSelector}>
      <TouchableOpacity
        style={[
          styles.reportButton,
          selectedReport === 'savings' && styles.selectedReport,
        ]}
        onPress={() => setSelectedReport('savings')}
      >
        <Ionicons 
          name="wallet-outline" 
          size={20} 
          color={selectedReport === 'savings' ? '#FFFFFF' : '#1976D2'} 
        />
        <Text
          style={[
            styles.reportButtonText,
            selectedReport === 'savings' && styles.selectedReportText,
          ]}
        >
          {t('common.savings')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.reportButton,
          selectedReport === 'investments' && styles.selectedReport,
        ]}
        onPress={() => setSelectedReport('investments')}
      >
        <Ionicons 
          name="trending-up" 
          size={20} 
          color={selectedReport === 'investments' ? '#FFFFFF' : '#1976D2'} 
        />
        <Text
          style={[
            styles.reportButtonText,
            selectedReport === 'investments' && styles.selectedReportText,
          ]}
        >
          {t('common.investments')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPeriodSelector = () => (
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
  );

  const renderExportOptions = () => (
    <View style={styles.exportContainer}>
      <Text style={styles.exportTitle}>{t('common.exportReport')}</Text>
      <View style={styles.exportButtons}>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="document-text" size={24} color="#1976D2" />
          <Text style={styles.exportButtonText}>PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="grid-outline" size={24} color="#1976D2" />
          <Text style={styles.exportButtonText}>CSV</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const groupedSavings = savingsPlans.reduce((acc, plan) => {
    acc[plan.status] = acc[plan.status] || [];
    acc[plan.status].push(plan);
    return acc;
  }, {} as Record<string, any[]>);
  const groupedInvestments = investments.reduce((acc, inv) => {
    acc[inv.status] = acc[inv.status] || [];
    acc[inv.status].push(inv);
    return acc;
  }, {} as Record<string, any[]>);

  const totalProjectedGrowth = savingsPlans.reduce((sum, plan) => {
    // Assume 1 year projection
    const principal = plan.amount || 0;
    const rate = plan.interest_rate || 0.1; // fallback to 10% if not present
    return sum + principal * (1 + rate * 1);
  }, 0);

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
              <Text style={styles.headerTitle}>{t('common.titleR')}</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#1976D2" />
            </TouchableOpacity>
          </View>
        </View>

        {renderReportSelector()}
        {renderPeriodSelector()}

        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#E3F2FD', '#BBDEFB']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>
                {selectedReport === 'savings' ? t('common.totalSaved') : t('common.totalInvested')}
              </Text>
              <Ionicons name="trending-up" size={20} color="#1976D2" />
            </View>
            <Text style={styles.statValue}>
              {isLoading ? '...' : selectedReport === 'savings' ? `$${savingsPlans.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}` : `$${investments.reduce((sum, i) => sum + (i.amount || 0), 0).toLocaleString()}`}
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={['#E3F2FD', '#BBDEFB']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>
                {selectedReport === 'savings' ? t('common.projectedGrowth') : t('common.totalReturn')}
              </Text>
              <Ionicons name="wallet-outline" size={20} color="#1976D2" />
            </View>
            <Text style={styles.statValue}>
              {selectedReport === 'savings'
                ? isLoading
                  ? '...'
                  : `$${totalProjectedGrowth.toLocaleString()}`
                : isLoading
                  ? '...'
                  : `$${investments.reduce((sum, i) => sum + (i.expected_return || 0), 0).toLocaleString()}`}
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>
              {selectedReport === 'savings' ? t('common.savingsBreakdown') : t('common.investmentBreakdown')}
            </Text>
          </View>
          <View style={styles.chartWrapper}>
            {isLoading ? (
              <Text>{t('common.loading')}</Text>
            ) : selectedReport === 'savings' ? (
              savingsPlans.length === 0 ? (
                <Text>{t('common.noSavingsPlans')}</Text>
              ) : (
                Object.entries(groupedSavings).map(([status, plans]) => (
                  <View key={status} style={{ marginBottom: 12 }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{status.toUpperCase()}</Text>
                    {(plans as any[]).map((plan: any) => (
                      <View key={plan.id} style={{ marginBottom: 4, padding: 8, backgroundColor: '#F5F5F5', borderRadius: 8 }}>
                        <Text>{t('common.amount')}: ${plan.amount}</Text>
                        <Text>{t('common.start')}: {new Date(plan.start_date).toLocaleDateString()}</Text>
                        <Text>{t('common.duration')}: {plan.duration || '--'} {t('common.weeks')}</Text>
                      </View>
                    ))}
                  </View>
                ))
              )
            ) : (
              investments.length === 0 ? (
                <Text>{t('common.noInvestments')}</Text>
              ) : (
                Object.entries(groupedInvestments).map(([status, invs]) => (
                  <View key={status} style={{ marginBottom: 12 }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{status.toUpperCase()}</Text>
                    {(invs as any[]).map((inv: any) => (
                      <View key={inv.id} style={{ marginBottom: 4, padding: 8, backgroundColor: '#F5F5F5', borderRadius: 8 }}>
                        <Text>{t('common.amount')}: ${inv.amount}</Text>
                        <Text>{t('common.start')}: {new Date(inv.start_date).toLocaleDateString()}</Text>
                        <Text>{t('common.end')}: {inv.end_date ? new Date(inv.end_date).toLocaleDateString() : '--'}</Text>
                        <Text>{t('common.return')}: ${inv.expected_return || '--'}</Text>
                      </View>
                    ))}
                  </View>
                ))
              )
            )}
          </View>
        </View>

        {renderExportOptions()}
      </ScrollView>

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
  reportSelector: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
  selectedReport: {
    backgroundColor: '#1976D2',
  },
  reportButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#1976D2',
  },
  selectedReportText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  exportContainer: {
    marginHorizontal: 24,
    marginBottom: 104,
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  exportTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    color: '#000000',
    fontWeight: '600',
    marginBottom: 16,
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  exportButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '45%',
  },
  exportButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#1976D2',
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