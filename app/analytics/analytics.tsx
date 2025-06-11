import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// Mock data for charts
const savingsData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [2000, 4500, 2800, 8000, 9900, 12000],
      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      strokeWidth: 2,
    },
  ],
};

const monthlyComparisonData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [2000, 2500, 2800, 3200, 3500, 4000],
    },
  ],
};

const chartConfig = {
  backgroundGradientFrom: '#4CAF50',
  backgroundGradientTo: '#2196F3',
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  formatYLabel: (value: string) => `$${value}`,
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#4CAF50'
  },
  propsForBackgroundLines: {
    strokeDasharray: '', 
    stroke: 'rgba(255, 255, 255, 0.1)',
    strokeWidth: 1,
  },
  propsForLabels: {
    fontSize: 12,
    fontFamily: 'Poppins',
  }
};

export default function Analytics() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('6M');

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

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/home/background3.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={30} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t('common.title2')}</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#000" />
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
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('common.totalSaved')}</Text>
            <Text style={styles.statValue}>$12,000</Text>
            <Text style={styles.statChange}>+15% {t('common.vsLastMonth')}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('common.activePlans')}</Text>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statChange}>+1 {t('common.vsLastMonth')}</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{t('common.savingsTrend')}</Text>
          <View style={styles.chartWrapper}>
            <LineChart
              data={savingsData}
              width={width - 90}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={true}
            />
          </View>
        </View>

        <View style={[styles.chartContainer, { marginBottom: 100 }]}>
          <Text style={styles.chartTitle}>{t('common.monthlyComparison')}</Text>
          <View style={styles.chartWrapper}>
            <BarChart
              data={monthlyComparisonData}
              width={width - 90}
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
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  selectedPeriod: {
    backgroundColor: '#4CAF50',
  },
  periodText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  selectedPeriodText: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 8,
  },
  statLabel: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins',
    opacity: 0.8,
  },
  statValue: {
    color: '#000',
    fontSize: 24,
    fontFamily: 'Satoshi',
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statChange: {
    color: '#4CAF50',
    fontSize: 12,
    fontFamily: 'Poppins',
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  chartTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Satoshi',
    fontWeight: '600',
    marginBottom: 16,
    paddingLeft: 8,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  insightsTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Satoshi',
    fontWeight: '600',
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(78, 71, 71, 0.39)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 70,
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 20,
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
}); 