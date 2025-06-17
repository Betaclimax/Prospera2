import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

interface ConnectDebitCardProps {
  onSuccess: (cardDetails: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  }) => void;
  onCancel: () => void;
}

export default function ConnectDebitCard({ onSuccess, onCancel }: ConnectDebitCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatCardNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    return formatted;
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    // Add slash after first 2 digits
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleConnect = async () => {
    try {
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        Alert.alert(t('common.error'), t('common.fillAllFields'));
        return;
      }

      setIsLoading(true);

      // Get the user from AsyncStorage
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        throw new Error('User not found');
      }
      const user = JSON.parse(userStr);

      // Create payment method
      const response = await fetch('http://localhost:3000/api/create-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          type: 'debit_card',
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryDate,
          cvv,
          cardholderName,
          user,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to connect debit card');
      }

      const data = await response.json();

      // Store payment method in Supabase
      const { error: dbError } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type: 'debit_card',
          stripe_payment_method_id: data.paymentMethodId,
          stripe_customer_id: data.customerId,
          last4: data.last4,
          is_default: true, // Set as default payment method
          is_verified: true // Debit cards are verified immediately
        });

      if (dbError) throw dbError;

      // Pass the card details to onSuccess
      onSuccess({
        cardNumber,
        expiryDate,
        cvv,
        cardholderName,
      });
      
      // Then navigate to payments page
      router.push('../payments/payments');
    } catch (error: any) {
      console.error('Card connection error:', error);
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
      <Text style={styles.title}>{t('common.connectDebitCard')}</Text>
      <Text style={styles.subtitle}>Only debit cards are accepted. Credit cards are not allowed.</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('common.cardNumber')}</Text>
        <View style={styles.cardNumberContainer}>
          <Ionicons name="card-outline" size={24} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.cardNumberInput}
            value={cardNumber}
            onChangeText={(text) => setCardNumber(formatCardNumber(text))}
            placeholder={t('common.enterCardNumber')}
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={19} // 16 digits + 3 spaces
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>{t('common.expiryDate')}</Text>
          <TextInput
            style={styles.input}
            value={expiryDate}
            onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
            placeholder="MM/YY"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={5}
          />
        </View>

        <View style={[styles.inputContainer, { flex: 1 }]}>
          <Text style={styles.label}>{t('common.cvv')}</Text>
          <TextInput
            style={styles.input}
            value={cvv}
            onChangeText={setCvv}
            placeholder="123"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('common.cardholderName')}</Text>
        <TextInput
          style={styles.input}
          value={cardholderName}
          onChangeText={setCardholderName}
          placeholder={t('common.enterCardholderName')}
          placeholderTextColor="#999"
          autoCapitalize="words"
        />
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
              {isLoading ? 'Connecting...' : t('common.connectCard')}
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  cardNumberContainer: {
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
  cardNumberInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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