import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

type Investment = {
  id: number;
  user_id: string;
  amount: number;
  start_date: string;
  end_date: string;
  interest_rate: number;
  status: 'active' | 'matured' | 'withdrawn';
  profit: number;
  expected_return: number;
  created_at?: string;
};

export default function InvestmentAnalytics() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('6M');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) throw new Error('User not found');
      const user = JSON.parse(userStr);

      const endDate = new Date();
      const startDate = new Date();
      
      switch (selectedPeriod) {
        case '1M': startDate.setMonth(endDate.getMonth() - 1); break;
        case '3M': startDate.setMonth(endDate.getMonth() - 3); break;
        case '6M': startDate.setMonth(endDate.getMonth() - 6); break;
        case '1Y': startDate.setFullYear(endDate.getFullYear() - 1); break;
        case 'ALL': startDate.setFullYear(endDate.getFullYear() - 5); break;
      }

      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_date', startDate.toISOString())
        .lte('start_date', endDate.toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;
      setInvestments(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalExpectedReturn = investments.reduce((sum, inv) => sum + inv.expected_return, 0);
    const totalProfit = investments.reduce((sum, inv) => sum + inv.profit, 0);
    const activeInvestments = investments.filter(inv => inv.status === 'active');
    const maturedInvestments = investments.filter(inv => inv.status === 'matured');
    
    const avgROI = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
    const avgInterestRate = investments.length > 0 
      ? investments.reduce((sum, inv) => sum + inv.interest_rate, 0) / investments.length * 100 
      : 0;

    return {
      totalInvested,
      totalExpectedReturn,
      totalProfit,
      activeInvestments: activeInvestments.length,
      maturedInvestments: maturedInvestments.length,
      avgROI,
      avgInterestRate
    };
  };

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

  const renderMetrics = () => {
    const metrics = calculateMetrics();
    
    return (
      <View style={styles.metricsContainer}>
        <View style={styles.metricRow}>
          <LinearGradient
            colors={['#E3F2FD', '#BBDEFB']}
            style={styles.metricCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.metricHeader}>
              <Ionicons name="trending-up" size={24} color="#1976D2" />
              <Text style={styles.metricLabel}>{t('common.totalInvested')}</Text>
            </View>
            <Text style={styles.metricValue}>${metrics.totalInvested.toLocaleString()}</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9']}
            style={styles.metricCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.metricHeader}>
              <Ionicons name="wallet-outline" size={24} color="#4CAF50" />
              <Text style={styles.metricLabel}>{t('common.expectedReturn')}</Text>
            </View>
            <Text style={styles.metricValue}>${metrics.totalExpectedReturn.toLocaleString()}</Text>
          </LinearGradient>
        </View>

        <View style={styles.metricRow}>
          <LinearGradient
            colors={['#FFF3E0', '#FFE0B2']}
            style={styles.metricCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.metricHeader}>
              <Ionicons name="cash-outline" size={24} color="#FF9800" />
              <Text style={styles.metricLabel}>{t('common.totalProfit')}</Text>
            </View>
            <Text style={styles.metricValue}>${metrics.totalProfit.toLocaleString()}</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#F3E5F5', '#E1BEE7']}
            style={styles.metricCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.metricHeader}>
              <Ionicons name="pie-chart-outline" size={24} color="#9C27B0" />
              <Text style={styles.metricLabel}>{t('common.activeInvestments')}</Text>
            </View>
            <Text style={styles.metricValue}>{metrics.activeInvestments}</Text>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderPerformanceChart = () => {
    const metrics = calculateMetrics();
    const performanceData = [
      { label: 'Invested', value: metrics.totalInvested, color: '#1976D2' },
      { label: 'Profit', value: metrics.totalProfit, color: '#4CAF50' },
    ];

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{t('common.portfolioBreakdown')}</Text>
        <View style={styles.chartWrapper}>
          {performanceData.map((item, index) => (
            <View key={index} style={styles.chartItem}>
              <View style={styles.chartBarContainer}>
                <View 
                  style={[
                    styles.chartBar, 
                    { 
                      width: `${(item.value / (metrics.totalInvested + metrics.totalProfit)) * 100}%`,
                      backgroundColor: item.color 
                    }
                  ]} 
                />
              </View>
              <View style={styles.chartLabelContainer}>
                <View style={[styles.chartColorDot, { backgroundColor: item.color }]} />
                <Text style={styles.chartLabel}>{item.label}</Text>
                <Text style={styles.chartValue}>${item.value.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderInvestmentList = () => (
    <View style={styles.investmentListContainer}>
      <Text style={styles.sectionTitle}>{t('common.recentInvestments')}</Text>
      {investments.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="trending-up-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>{t('common.noInvestments')}</Text>
        </View>
      ) : (
        investments.slice(0, 5).map((investment) => (
          <View key={investment.id} style={styles.investmentItem}>
            <View style={styles.investmentHeader}>
              <Text style={styles.investmentAmount}>${investment.amount.toLocaleString()}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: investment.status === 'active' ? '#4CAF50' : '#FFA000' }
              ]}>
                <Text style={styles.statusText}>{t(`common.statuses.${investment.status}`)}</Text>
              </View>
            </View>
            <View style={styles.investmentDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('common.profit')}</Text>
                <Text style={styles.detailValue}>${investment.profit.toFixed(2)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('common.interestRate')}</Text>
                <Text style={styles.detailValue}>{(investment.interest_rate * 100).toFixed(1)}%</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('common.startDate')}</Text>
                <Text style={styles.detailValue}>{new Date(investment.start_date).toLocaleDateString()}</Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const goBack = () => router.back();
  const goHome = () => router.push('../home/home');
  const goInvest = () => router.push('./invest');
  const goInbox = () => router.push('../inbox/inbox');
  const goProfile = () => router.push('../profile/profile');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={goBack}
              >
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('common.investmentAnalytics')}</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#1976D2" />
            </TouchableOpacity>
          </View>
        </View>

        {renderPeriodSelector()}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976D2" />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {renderMetrics()}
            {renderPerformanceChart()}
            {renderInvestmentList()}
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1976D2',
    fontFamily: 'Satoshi',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    fontFamily: 'Satoshi',
    textAlign: 'center',
  },
  metricsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Satoshi',
    marginLeft: 8,
    opacity: 0.8,
  },
  metricValue: {
    color: '#000000',
    fontSize: 24,
    fontFamily: 'Satoshi',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metricChange: {
    color: '#1976D2',
    fontSize: 12,
    fontFamily: 'Satoshi',
    opacity: 0.8,
  },
  chartContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  chartTitle: {
    color: '#000000',
    fontSize: 18,
    fontFamily: 'Satoshi',
    fontWeight: '600',
    marginBottom: 16,
  },
  chartWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartItem: {
    marginBottom: 16,
  },
  chartBarContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  chartBar: {
    height: '100%',
    borderRadius: 4,
  },
  chartLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  chartLabel: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Satoshi',
  },
  chartValue: {
    fontSize: 14,
    color: '#1976D2',
    fontFamily: 'Satoshi',
    fontWeight: '600',
  },
  investmentListContainer: {
    paddingHorizontal: 24,
    marginBottom: 104,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi',
    color: '#1976D2',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Satoshi',
    marginTop: 16,
  },
  investmentItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  investmentAmount: {
    fontSize: 18,
    fontFamily: 'Satoshi',
    color: '#000000',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Satoshi',
    fontWeight: '600',
  },
  investmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Satoshi',
  },
  detailValue: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Satoshi',
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