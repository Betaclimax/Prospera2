import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

interface Currency {
  code: string;
  name: string;
  rate: number;
  flag: string;
  region: string;
}

const currencies: Currency[] = [
  { 
    code: 'USD', 
    name: 'US Dollar', 
    rate: 1,
    flag: '🇺🇸',
    region: 'North America'
  },
  { 
    code: 'MXN', 
    name: 'Mexican Peso', 
    rate: 16.85,
    flag: '🇲🇽',
    region: 'Latin America'
  },
  { 
    code: 'CAD', 
    name: 'Canadian Dollar', 
    rate: 1.35,
    flag: '🇨🇦',
    region: 'North America'
  },
  { 
    code: 'BRL', 
    name: 'Brazilian Real', 
    rate: 5.05,
    flag: '🇧🇷',
    region: 'Latin America'
  },
  { 
    code: 'COP', 
    name: 'Colombian Peso', 
    rate: 3900,
    flag: '🇨🇴',
    region: 'Latin America'
  },
  { 
    code: 'CLP', 
    name: 'Chilean Peso', 
    rate: 950,
    flag: '🇨🇱',
    region: 'Latin America'
  },
  { 
    code: 'PEN', 
    name: 'Peruvian Sol', 
    rate: 3.70,
    flag: '🇵🇪',
    region: 'Latin America'
  },
  { 
    code: 'ARS', 
    name: 'Argentine Peso', 
    rate: 850,
    flag: '🇦🇷',
    region: 'Latin America'
  },
];

export default function Exchange() {
  const { t } = useTranslation();
  const router = useRouter();
  const [fromCurrency, setFromCurrency] = useState<Currency>(currencies[0]);
  const [toCurrency, setToCurrency] = useState<Currency>(currencies[1]);
  const [amount, setAmount] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);

  useEffect(() => {
    calculateExchange();
  }, [amount, fromCurrency, toCurrency]);

  const calculateExchange = () => {
    if (!amount) {
      setEstimatedAmount(0);
      return;
    }
    const baseAmount = parseFloat(amount);
    const rate = toCurrency.rate / fromCurrency.rate;
    const fee = baseAmount * 0.01; // 1% fee
    setEstimatedAmount((baseAmount * rate) - fee);
  };

  const handleExchange = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('common.enterValidAmount'),
        position: 'top',
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: t('common.success'),
      text2: t('common.exchangeSuccess'),
      position: 'top',
    });
  };

  const renderCurrencySelector = (isFrom: boolean) => {
    const selectedCurrency = isFrom ? fromCurrency : toCurrency;
    const setSelectedCurrency = isFrom ? setFromCurrency : setToCurrency;
    const showSelector = isFrom ? showFromSelector : showToSelector;
    const setShowSelector = isFrom ? setShowFromSelector : setShowToSelector;

    return (
      <View style={styles.currencySelector}>
        <TouchableOpacity 
          style={styles.currencyButton}
          onPress={() => setShowSelector(!showSelector)}
        >
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyFlag}>{selectedCurrency.flag}</Text>
            <View>
              <Text style={styles.currencyCode}>{selectedCurrency.code}</Text>
              <Text style={styles.currencyName}>{selectedCurrency.name}</Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={24} color="#1976D2" />
        </TouchableOpacity>

        {showSelector && (
          <View style={styles.currencyList}>
            <ScrollView style={styles.currencyScroll}>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={styles.currencyItem}
                  onPress={() => {
                    setSelectedCurrency(currency);
                    setShowSelector(false);
                  }}
                >
                  <Text style={styles.currencyFlag}>{currency.flag}</Text>
                  <View>
                    <Text style={styles.currencyCode}>{currency.code}</Text>
                    <Text style={styles.currencyName}>{currency.name}</Text>
                  </View>
                  <Text style={styles.currencyRegion}>{currency.region}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E3F2FD', '#BBDEFB']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('common.exchangeTitle')}</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.exchangeCard}>
          <Text style={styles.sectionTitle}>{t('common.fromCurrency')}</Text>
          {renderCurrencySelector(true)}
          
          <View style={styles.amountInput}>
            <Text style={styles.currencySymbol}>{fromCurrency.code}</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder={t('common.enterAmount')}
              keyboardType="decimal-pad"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.swapButton}>
            <TouchableOpacity 
              onPress={() => {
                const temp = fromCurrency;
                setFromCurrency(toCurrency);
                setToCurrency(temp);
              }}
            >
              <Ionicons name="swap-vertical" size={24} color="#1976D2" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>{t('common.toCurrency')}</Text>
          {renderCurrencySelector(false)}

          <View style={styles.estimatedAmount}>
            <Text style={styles.estimatedLabel}>{t('common.estimatedAmount')}</Text>
            <Text style={styles.estimatedValue}>
              {toCurrency.code} {estimatedAmount.toFixed(2)}
            </Text>
          </View>

          <View style={styles.exchangeInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('common.exchangeRate')}</Text>
              <Text style={styles.infoValue}>
                1 {fromCurrency.code} = {(toCurrency.rate / fromCurrency.rate).toFixed(4)} {toCurrency.code}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('common.fee')}</Text>
              <Text style={styles.infoValue}>
                {fromCurrency.code} {(parseFloat(amount || '0') * 0.01).toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.exchangeButton}
            onPress={handleExchange}
          >
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.exchangeButtonGradient}
            >
              <Text style={styles.exchangeButtonText}>{t('common.exchangeNow')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.recentExchanges}>
          <Text style={styles.sectionTitle}>{t('common.recentExchanges')}</Text>
          <View style={styles.recentList}>
            {[1, 2, 3].map((_, index) => (
              <View key={index} style={styles.recentItem}>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentAmount}>$1,000 USD → $16,850 MXN</Text>
                  <Text style={styles.recentDate}>Today, 14:30</Text>
                </View>
                <Text style={styles.recentStatus}>Completed</Text>
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
  exchangeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 12,
  },
  currencySelector: {
    marginBottom: 20,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  currencyCode: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '600',
    color: '#000',
  },
  currencyName: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#666',
  },
  currencyRegion: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#666',
    marginLeft: 'auto',
  },
  currencyList: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
    maxHeight: 300,
  },
  currencyScroll: {
    maxHeight: 300,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '600',
    color: '#1976D2',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Satoshi',
    color: '#000',
  },
  swapButton: {
    alignItems: 'center',
    marginVertical: 20,
  },
  estimatedAmount: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  estimatedLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#1976D2',
    marginBottom: 4,
  },
  estimatedValue: {
    fontSize: 24,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#1976D2',
  },
  exchangeInfo: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    fontWeight: '600',
    color: '#000',
  },
  exchangeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  exchangeButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  exchangeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '600',
  },
  recentExchanges: {
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
  recentAmount: {
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
  recentStatus: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#4CAF50',
    fontWeight: '600',
  },
}); 