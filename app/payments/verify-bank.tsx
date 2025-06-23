import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function VerifyBank() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [amount1, setAmount1] = useState('');
  const [amount2, setAmount2] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    try {
      if (!amount1 || !amount2) {
        Alert.alert(t('common.error'), t('common.fillAllFields'));
        return;
      }

      const amount1Num = parseFloat(amount1);
      const amount2Num = parseFloat(amount2);

      if (isNaN(amount1Num) || isNaN(amount2Num)) {
        Alert.alert(t('common.error'), 'Please enter valid amounts');
        return;
      }

      if (!params.paymentMethodId || !params.customerId) {
        Alert.alert(t('common.error'), 'Missing payment information. Please try connecting your bank account again.');
        return;
      }

      setIsLoading(true);

      console.log('Verifying with amounts:', [amount1Num, amount2Num]);
      console.log('Payment Method ID:', params.paymentMethodId);
      console.log('Customer ID:', params.customerId);

      const response = await fetch('http://localhost:3000/api/verify-bank-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          paymentMethodId: params.paymentMethodId,
          customerId: params.customerId,
          amounts: [amount1Num, amount2Num],
        }),
      });

      const data = await response.json();
      console.log('Verification response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify bank account');
      }

      if (data.success) {
        Alert.alert(
          'Success',
          'Your bank account has been verified successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                if (params.depositAmount && params.savingsDuration) {
                  router.push({
                    pathname: '../save/savings',
                    params: {
                      verified: 'true',
                      paymentMethodId: params.paymentMethodId,
                      depositAmount: params.depositAmount,
                      savingsDuration: params.savingsDuration,
                    }
                  });
                } else {
                  router.push('../payments/payments');
                }
              }
            }
          ]
        );
      } else {
        throw new Error('Verification failed');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      Alert.alert(
        t('common.error'),
        error.message || t('common.verificationFailed'),
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('common.verifyBankAccount')}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Please enter the two small deposit amounts that were sent to your bank account.
          These amounts will appear in your bank statement.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>First Amount</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              value={amount1}
              onChangeText={setAmount1}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Second Amount</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              value={amount2}
              onChangeText={setAmount2}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.verifyButton, isLoading && styles.disabledButton]} 
          onPress={handleVerify}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'Verifying...' : t('common.verify')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 50
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  verifyButton: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.7,
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
  },
}); 