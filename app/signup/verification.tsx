import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../../lib/supabase';

export default function Verification() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const [codes, setCodes] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Animate text when language changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [t]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1];
    }

    const newCodes = [...codes];
    newCodes[index] = text;
    setCodes(newCodes);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerification = async () => {
    const verificationCode = codes.join('');
    if (verificationCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('common.enterCompleteCode'),
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
        autoHide: true,
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        token: verificationCode,
        type: 'signup',
        email: params.email as string,
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('common.emailVerified'),
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
        autoHide: true,
      });

      router.push('../login/login');
    } catch (error: any) {
      console.error('Error:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message || t('common.invalidCode'),
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
        autoHide: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: params.email as string,
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('common.codeResent'),
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
        autoHide: true,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message || t('common.resendFailed'),
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
        autoHide: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
        {t('common.titleVerification')}
      </Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
        {t('common.subtitle')}
      </Animated.Text>

      <View style={styles.codeContainer}>
        {codes.map((code, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={styles.codeInput}
            value={code}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.verifyButton, loading && styles.disabledButton]}
        onPress={handleVerification}
        disabled={loading}
      >
        <Animated.Text style={[styles.verifyButtonText, { opacity: fadeAnim }]}>
          {loading ? t('common.verifying') : t('common.verifyButton')}
        </Animated.Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendCode}
        disabled={loading}
      >
        <Animated.Text style={[styles.resendButtonText, { opacity: fadeAnim }]}>
          {t('common.resendButton')}
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6e6e6',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Satoshi',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Satoshi',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 10,
  },
  codeInput: {
    width: 45,
    height: 55,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Satoshi',
  },
  verifyButton: {
    backgroundColor: '#4BCFFA',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Satoshi',
  },
  resendButton: {
    padding: 10,
  },
  resendButtonText: {
    color: '#4BCFFA',
    fontSize: 16,
    fontFamily: 'Satoshi',
  },
  disabledButton: {
    opacity: 0.7,
  },
}); 