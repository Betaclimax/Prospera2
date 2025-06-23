import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ConnectBankAccountProps {
  onSuccess: (accountDetails: {
    accountNumber: string;
    routingNumber: string;
    accountType: 'checking' | 'savings';
    bankName: string;
  }) => void;
  onCancel: () => void;
}

export default function ConnectBankAccount({ onSuccess, onCancel }: ConnectBankAccountProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      if (!accountNumber || !routingNumber || !bankName || !accountType) {
        Alert.alert(t('common.error'), t('common.fillAllFields'));
        return;
      }

      setIsLoading(true);

      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        throw new Error('User not found');
      }
      const user = JSON.parse(userStr);

      const response = await fetch('http://localhost:3000/api/create-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          type: 'bank_account',
          bankName,
          accountType,
          accountNumber,
          routingNumber,
          user,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to connect bank account');
      }

      const data = await response.json();

    
      if (data.requiresVerification) {
        Alert.alert(
          'Verification Required',
          'Your bank account has been connected and is pending verification. You will receive two small deposits in your account within 1-2 business days. Please verify these amounts to complete the setup.',
          [
            {
              text: 'OK',
              onPress: () => {
                onSuccess({
                  accountNumber,
                  routingNumber,
                  bankName,
                  accountType,
                });
                
                router.push({
                  pathname: '../payments/verify-bank',
                  params: {
                    paymentMethodId: data.paymentMethodId,
                    customerId: data.customerId,
                    verificationAmounts: data.verificationAmounts,
                  }
                });
              }
            }
          ]
        );
      } else {
        onSuccess({
          accountNumber,
          routingNumber,
          bankName,
          accountType,
        });
      }
    } catch (error: any) {
      console.error('Bank account connection error:', error);
      Alert.alert(
        t('common.error'),
        error.message || t('common.connectionFailed'),
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('common.connectBankAccount')}</Text>
      <Text style={styles.subtitle}>Connect your bank account to start saving</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('common.bankName')}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="business-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={bankName}
            onChangeText={setBankName}
            placeholder={t('common.enterBankName')}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('common.accountNumber')}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="card-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder={t('common.enterAccountNumber')}
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={17}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('common.routingNumber')}</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="swap-horizontal-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={routingNumber}
            onChangeText={setRoutingNumber}
            placeholder={t('common.enterRoutingNumber')}
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={9}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('common.accountType')}</Text>
        <View style={styles.accountTypeContainer}>
          <TouchableOpacity
            style={[
              styles.accountTypeButton,
              accountType === 'checking' && styles.selectedAccountType,
            ]}
            onPress={() => setAccountType('checking')}
          >
            <Text
              style={[
                styles.accountTypeText,
                accountType === 'checking' && styles.selectedAccountTypeText,
              ]}
            >
              {t('common.checking')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.accountTypeButton,
              accountType === 'savings' && styles.selectedAccountType,
            ]}
            onPress={() => setAccountType('savings')}
          >
            <Text
              style={[
                styles.accountTypeText,
                accountType === 'savings' && styles.selectedAccountTypeText,
              ]}
            >
              {t('common.savings')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.connectButton, isLoading && styles.disabledButton]} 
          onPress={handleConnect}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.connectButtonText}>
              {isLoading ? 'Connecting...' : t('common.connectAccount')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  testInfo: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
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
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  accountTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  accountTypeButton: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedAccountType: {
    borderColor: '#2196F3',
    backgroundColor: '#2196F3',
  },
  accountTypeText: {
    fontSize: 16,
    color: '#666',
  },
  selectedAccountTypeText: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  connectButton: {
    flex: 1,
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
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
  },
}); 