import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

      // Validate card number (basic check)
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        Alert.alert(t('common.error'), t('common.invalidCardNumber'));
        return;
      }

      // Validate expiry date
      const [month, year] = expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        Alert.alert(t('common.error'), t('common.invalidExpiryDate'));
        return;
      }

      if (parseInt(year) < currentYear || 
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        Alert.alert(t('common.error'), t('common.cardExpired'));
        return;
      }

      // Validate CVV
      if (cvv.length < 3 || cvv.length > 4) {
        Alert.alert(t('common.error'), t('common.invalidCVV'));
        return;
      }

      // Pass the card details to onSuccess
      onSuccess({
        cardNumber,
        expiryDate,
        cvv,
        cardholderName,
      });
      
      // Then navigate to payments page
      router.push('../payments/payments');
    } catch (error) {
      Alert.alert(t('common.error'), t('common.connectionFailed'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('common.connectDebitCard')}</Text>
      
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
        
        <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.connectButtonText}>{t('common.connectCard')}</Text>
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