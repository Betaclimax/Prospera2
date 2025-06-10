import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const router = useRouter();
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const validateForm = () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('common.enterEmail'),
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
        autoHide: true,
      });
      return false;
    }

    if (!email.includes('@')) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('common.enterValidEmail'),
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
        autoHide: true,
      });
      return false;
    }

    if (!password) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('common.enterPassword'),
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
        autoHide: true,
      });
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        Toast.show({
          type: 'success',
          text1: t('common.success'),
          text2: t('common.loginSuccessful'),
          position: 'top',
          visibilityTime: 3000,
          topOffset: 50,
          autoHide: true,
        });

        router.push('../home/home');
      }
    } catch (error: any) {
      console.error('Error:', error);
      Toast.show({
        type: 'error',
        text1: t('common.loginFailed'),
        text2: t('common.invalidCredentials'),
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
        autoHide: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('../signup/signup');
  };

  const handleForgetPassword = () => {
    router.push('../forgot-password/forgot-password');
  };

  return (
    <View style={styles.container}>
      {/* Top Image Section */}
      <Image
        source={require('@/assets/images/logo.png')}
        style={styles.welcomeImage}
        resizeMode="contain"
      />
      <View>
        <Text style={styles.headtext}>{t('common.welcomeprospera')}</Text>
      </View>
      {/* Form Container */}
      <View style={styles.formContainer}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('common.emailPlaceholder')}
            placeholderTextColor="#999999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.icon}>✉️</Text>
        </View>
        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('common.passwordPlaceholder')}
            placeholderTextColor="#999999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Text style={styles.icon}>🔒</Text>
        </View>
        {/* Remember Me and Forget Password */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Text style={styles.checkmark}>✔</Text>}
            </View>
            <Animated.Text style={[styles.optionText, { opacity: fadeAnim }]}>
              {t('common.rememberMe')}
            </Animated.Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleForgetPassword}>
            <Animated.Text style={[styles.forgetText, { opacity: fadeAnim }]}>
              {t('common.forgotPassword')}
            </Animated.Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.nextButton, loading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Animated.Text style={[styles.nextButtonText, { opacity: fadeAnim }]}>
              {loading ? t('common.signingIn') : t('common.loginButton')}
            </Animated.Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={handleSignUp}
          >
            <Animated.Text style={[styles.nextButtonText, { opacity: fadeAnim }]}>
              {t('common.signUp')}
            </Animated.Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6e6e6',
    alignItems: 'center',
  },
  welcomeImage: {
    width: '100%',
    height: '30%',
    marginTop: 50,
  },
  headtext: {
    fontFamily: "satoshi",
    fontSize: 30,
    alignItems: 'center'
  },
  formContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F9F9F9',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    fontFamily: 'Satoshi',
    color: '#333333',
  },
  icon: {
    fontSize: 20,
    color: '#999999',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#fff',
    borderColor: '#000',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  optionText: {
    color: '#333333',
    fontSize: 14,
    fontFamily: 'Satoshi',
  },
  forgetText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Satoshi',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '35%',
    gap: 10,
  },
  nextButton: {
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#4BCFFA',
    paddingVertical: 15,
    width: '48%',
    borderRadius: 10,
    marginBottom: 20,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Satoshi',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  disabledButton: {
    opacity: 0.7,
  },
});