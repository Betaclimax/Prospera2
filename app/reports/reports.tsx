import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function Reports() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('transactions');
  const [dateRange, setDateRange] = useState('1M');
  const [showExportModal, setShowExportModal] = useState(false);

  const mockTransactions = [
    {
      id: 1,
      type: 'deposit',
      amount: 1000,
      date: '2024-03-15',
      status: 'completed',
      description: 'weeklyDeposit'
    },
    {
      id: 2,
      type: 'withdrawal',
      amount: 500,
      date: '2024-03-10',
      status: 'completed',
      description: 'emergencyWithdrawal'
    },
    {
      id: 3,
      type: 'investment',
      amount: 2000,
      date: '2024-03-05',
      status: 'completed',
      description: 'investmentFund'
    }
  ];

  const mockSavingsReports = [
    {
      id: 1,
      planName: t('common.emergencyFund'),
      startDate: '2024-01-01',
      endDate: '2024-03-15',
      totalSaved: 5000,
      interestEarned: 250,
      status: 'active'
    },
    {
      id: 2,
      planName: t('common.vacationFund'),
      startDate: '2024-02-01',
      endDate: '2024-04-01',
      totalSaved: 3000,
      interestEarned: 150,
      status: 'completed'
    }
  ];

  const mockInvestmentReports = [
    {
      id: 1,
      fundName: t('common.growthFund'),
      investedAmount: 5000,
      currentValue: 5500,
      return: 10,
      startDate: '2024-01-01',
      status: 'active'
    },
    {
      id: 2,
      fundName: t('common.incomeFund'),
      investedAmount: 3000,
      currentValue: 3150,
      return: 5,
      startDate: '2024-02-01',
      status: 'active'
    }
  ];

  const renderTransactionItem = (transaction: any) => (
    <View style={styles.reportItem}>
      <View style={styles.reportItemHeader}>
        <View style={styles.reportItemTitle}>
          <Ionicons 
            name={transaction.type === 'deposit' ? 'arrow-down' : 'arrow-up'} 
            size={24} 
            color={transaction.type === 'deposit' ? '#4CAF50' : '#FF5252'} 
          />
          <Text style={styles.reportItemName}>{t(`common.descriptions.${transaction.description}`)}</Text>
        </View>
        <Text style={[
          styles.reportItemAmount,
          { color: transaction.type === 'deposit' ? '#4CAF50' : '#FF5252' }
        ]}>
          {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount}
        </Text>
      </View>
      <View style={styles.reportItemDetails}>
        <Text style={styles.reportItemDate}>{transaction.date}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: transaction.status === 'completed' ? '#4CAF50' : '#FFA000' }
        ]}>
          <Text style={styles.statusText}>{t(`common.statusR.${transaction.status}`)}</Text>
        </View>
      </View>
    </View>
  );

  const renderSavingsReport = (report: any) => (
    <View style={styles.reportItem}>
      <View style={styles.reportItemHeader}>
        <View style={styles.reportItemTitle}>
          <Ionicons name="wallet-outline" size={24} color="#2196F3" />
          <Text style={styles.reportItemName}>{report.planName}</Text>
        </View>
        <Text style={styles.reportItemAmount}>${report.totalSaved}</Text>
      </View>
      <View style={styles.reportItemDetails}>
        <Text style={styles.reportItemDate}>
          {report.startDate} - {report.endDate}
        </Text>
        <View style={styles.interestBadge}>
          <Text style={styles.interestText}>
            +${report.interestEarned} {t('common.interest')}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderInvestmentReport = (report: any) => (
    <View style={styles.reportItem}>
      <View style={styles.reportItemHeader}>
        <View style={styles.reportItemTitle}>
          <Ionicons name="trending-up" size={24} color="#4CAF50" />
          <Text style={styles.reportItemName}>{report.fundName}</Text>
        </View>
        <Text style={styles.reportItemAmount}>${report.currentValue}</Text>
      </View>
      <View style={styles.reportItemDetails}>
        <Text style={styles.reportItemDate}>{report.startDate}</Text>
        <View style={[
          styles.returnBadge,
          { backgroundColor: report.return >= 0 ? '#4CAF50' : '#FF5252' }
        ]}>
          <Text style={styles.returnText}>
            {report.return >= 0 ? '+' : ''}{report.return}%
          </Text>
        </View>
      </View>
    </View>
  );

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
              <Text style={styles.headerTitle}>{t('common.titleR')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.exportButton}
              onPress={() => setShowExportModal(true)}
            >
              <Ionicons name="download-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          {['transactions', 'savings', 'investments'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {t(`common.${tab}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dateRangeContainer}>
          {['1W', '1M', '3M', '6M', '1Y', 'ALL'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.dateRangeButton, dateRange === range && styles.activeDateRange]}
              onPress={() => setDateRange(range)}
            >
              <Text style={[styles.dateRangeText, dateRange === range && styles.activeDateRangeText]}>
                {t(`common.dateRange.${range}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.reportsContainer}>
          {activeTab === 'transactions' && mockTransactions.map(renderTransactionItem)}
          {activeTab === 'savings' && mockSavingsReports.map(renderSavingsReport)}
          {activeTab === 'investments' && mockInvestmentReports.map(renderInvestmentReport)}
        </View>
      </ScrollView>

      <Modal
        visible={showExportModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExportModal(false)}
      >
        <BlurView intensity={20} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('common.exportReport')}</Text>
              <TouchableOpacity onPress={() => setShowExportModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.exportOptions}>
              <TouchableOpacity style={styles.exportOption}>
                <Ionicons name="document-text-outline" size={24} color="#4CAF50" />
                <Text style={styles.exportOptionText}>{t('common.pdf')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exportOption}>
                <Ionicons name="document-outline" size={24} color="#2196F3" />
                <Text style={styles.exportOptionText}>{t('common.csv')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.exportOption}>
                <Ionicons name="mail-outline" size={24} color="#FF9800" />
                <Text style={styles.exportOptionText}>{t('common.email')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FFF',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#FFF',
  },
  activeTabText: {
    color: '#FFF',
    fontWeight: '600',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  dateRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  activeDateRange: {
    backgroundColor: '#4CAF50',
  },
  dateRangeText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  activeDateRangeText: {
    fontWeight: '600',
  },
  reportsContainer: {
    paddingHorizontal: 24,
  },
  reportItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  reportItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportItemTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportItemName: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#000',
    marginLeft: 12,
  },
  reportItemAmount: {
    fontSize: 18,
    fontFamily: 'Satoshi',
    fontWeight: 'bold',
  },
  reportItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportItemDate: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#000',
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'Poppins',
  },
  interestBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Poppins',
  },
  returnBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  returnText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Poppins',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi',
    fontWeight: 'bold',
    color: '#000',
  },
  exportOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  exportOption: {
    alignItems: 'center',
  },
  exportOptionText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666',
  },
}); 