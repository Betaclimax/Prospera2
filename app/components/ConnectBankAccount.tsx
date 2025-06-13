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

  const handleConnect = async () => {
    try {
      if (!accountNumber || !routingNumber || !bankName) {
        Alert.alert(t('common.error'), t('common.fillAllFields'));
        return;
      }

      // Pass the account details to onSuccess
      onSuccess({
        accountNumber,
        routingNumber,
        accountType,
        bankName,
      });
      
      // Then navigate to payments page
      router.push('../payments/payments');
    } catch (error) {
      Alert.alert(t('common.error'), t('common.connectionFailed'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('common.connectAccount')}</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('common.bankName')}</Text>
        <TextInput
          style={styles.input}
          value={bankName}
          onChangeText={setBankName}
          placeholder={t('common.enterBankName')}
          placeholderTextColor="#999"
        />
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
            <Text style={[
              styles.accountTypeText,
              accountType === 'checking' && styles.selectedAccountTypeText,
            ]}>{t('common.checking')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.accountTypeButton,
              accountType === 'savings' && styles.selectedAccountType,
            ]}
            onPress={() => setAccountType('savings')}
          >
            <Text style={[
              styles.accountTypeText,
              accountType === 'savings' && styles.selectedAccountTypeText,
            ]}>{t('common.savings')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('common.accountNumber')}</Text>
        <TextInput
          style={styles.input}
          value={accountNumber}
          onChangeText={setAccountNumber}
          placeholder={t('common.enterAccountNumber')}
          placeholderTextColor="#999"
          keyboardType="numeric"
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('common.routingNumber')}</Text>
        <TextInput
          style={styles.input}
          value={routingNumber}
          onChangeText={setRoutingNumber}
          placeholder={t('common.enterRoutingNumber')}
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
          <LinearGradient
            colors={['#4A90E2', '#357ABD']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.connectButtonText}>{t('common.connectAccount')}</Text>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  accountTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountTypeButton: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedAccountType: {
    borderColor: '#4A90E2',
    backgroundColor: '#4A90E2',
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