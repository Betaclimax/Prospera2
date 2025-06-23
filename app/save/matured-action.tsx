import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../../lib/supabase';

export default function MaturedActionPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { planId } = useLocalSearchParams();
  const [plan, setPlan] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [investAmount, setInvestAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) return;
      const { data, error } = await supabase
        .from('savings_plans')
        .select('*')
        .eq('id', planId)
        .single();
      if (error) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Could not load plan.' });
        router.back();
      } else {
        setPlan(data);
      }
    };
    fetchPlan();
  }, [planId]);

  const handleConfirm = async () => {
    if (!plan) return;
    const withdrawValue = parseFloat(withdrawAmount) || 0;
    const investValue = parseFloat(investAmount) || 0;
    const totalAmount = withdrawValue + investValue;
    if (totalAmount !== plan.amount) {
      Toast.show({
        type: 'error',
        text1: t('common.Invalid Amount'),
        text2: t('common.Withdrawal and investment amounts must equal the total savings amount'),
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');
      const { error: updateError } = await supabase
        .from('savings_plans')
        .update({
          status: totalAmount === plan.amount ? 'withdrawn' : 'invested',
          withdrawal_amount: withdrawValue,
          investment_amount: investValue,
          action_date: new Date().toISOString()
        })
        .eq('id', plan.id);
      if (updateError) throw updateError;
      if (investValue > 0) {
        const investmentEndDate = new Date();
        investmentEndDate.setMonth(investmentEndDate.getMonth() + 6);
        const { error: investmentError } = await supabase
          .from('investments')
          .insert({
            user_id: user.id,
            amount: investValue,
            return_amount: investValue * 1.1,
            start_date: new Date().toISOString(),
            end_date: investmentEndDate.toISOString(),
            status: 'active'
          });
        if (investmentError) throw investmentError;
      }
      Toast.show({
        type: 'success',
        text1: t('common.Success'),
        text2: t('common.Your matured savings have been processed'),
        position: 'top',
        visibilityTime: 3000,
      });
      router.replace('/save/savings');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('common.Failed to process matured savings'),
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>{t('common.Matured Savings Plan')}</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.Plan Details')}</Text>
            {plan ? (
              <>
                <Text style={styles.detailLabel}>{t('common.Total Amount')}</Text>
                <Text style={styles.detailValue}>${plan.amount?.toFixed(2)}</Text>
                <Text style={styles.detailLabel}>{t('common.Matured on')}</Text>
                <Text style={styles.detailValue}>{new Date(plan.maturity_date).toLocaleDateString()}</Text>
              </>
            ) : (
              <Text>{t('common.Loading...')}</Text>
            )}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.Withdraw')}</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="0.00"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('common.invest')}</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={investAmount}
                onChangeText={setInvestAmount}
                placeholder="0.00"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <View style={styles.transactionSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('common.Withdraw')}</Text>
              <Text style={styles.summaryValue}>${withdrawAmount || '0.00'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('common.invest')}</Text>
              <Text style={styles.summaryValue}>${investAmount || '0.00'}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotal}>{t('common.total')}</Text>
              <Text style={styles.summaryTotalValue}>${plan ? plan.amount?.toFixed(2) : '0.00'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            disabled={loading}
          >
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.confirmButtonGradient}
            >
              <Text style={styles.confirmButtonText}>{loading ? t('common.Processing...') : t('common.Confirm Action')}</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  card: {
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
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    color: '#000',
    fontWeight: '500',
    marginBottom: 8,
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
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '600',
  },
}); 