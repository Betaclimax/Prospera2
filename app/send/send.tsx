import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function Send() {
  const { t } = useTranslation();
  const router = useRouter();
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleSend = () => {
    if (!recipientName || !recipientEmail || !amount) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('common.fillAllFields'),
        position: 'top',
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: t('common.success'),
      text2: t('common.moneySent'),
      position: 'top',
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E3F2FD', '#BBDEFB']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('common.sendMoney')}</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.sendCard}>
          {/* Recipient Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.recipientDetails')}</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('common.recipientName')}</Text>
              <TextInput
                style={styles.input}
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder={t('common.enterRecipientName')}
                placeholderTextColor="#666"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('common.recipientEmail')}</Text>
              <TextInput
                style={styles.input}
                value={recipientEmail}
                onChangeText={setRecipientEmail}
                placeholder={t('common.enterRecipientEmail')}
                placeholderTextColor="#666"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.amount')}</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.note')}</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder={t('common.addNote')}
              placeholderTextColor="#666"
              multiline
            />
          </View>

          {/* Transaction Summary */}
          <View style={styles.transactionSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('common.amount')}</Text>
              <Text style={styles.summaryValue}>${amount || '0.00'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('common.fee')}</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotal}>{t('common.total')}</Text>
              <Text style={styles.summaryTotalValue}>${amount || '0.00'}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSend}
          >
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.sendButtonGradient}
            >
              <Text style={styles.sendButtonText}>{t('common.sendMoney')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentTransactions}>
          <Text style={styles.sectionTitle}>{t('common.recentTransactions')}</Text>
          <View style={styles.recentList}>
            {[1, 2, 3].map((_, index) => (
              <View key={index} style={styles.recentItem}>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>John Doe</Text>
                  <Text style={styles.recentDate}>Today, 14:30</Text>
                </View>
                <Text style={styles.recentAmount}>-$500.00</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#1976D2',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sendCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Satoshi',
    color: '#000',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontFamily: 'Satoshi',
    color: '#1976D2',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontFamily: 'Satoshi',
    color: '#000',
    padding: 0,
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  transactionSummary: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#000',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  summaryTotal: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    color: '#1976D2',
    fontWeight: '600',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    color: '#1976D2',
    fontWeight: '600',
  },
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '600',
  },
  recentTransactions: {
    marginTop: 24,
  },
  recentList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  recentDate: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#666',
  },
  recentAmount: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    fontWeight: '600',
    color: '#1976D2',
  },
}); 