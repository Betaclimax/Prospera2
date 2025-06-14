import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { supabase } from '../../lib/supabase';

export default function signup() {
  const router = useRouter();
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: '+1', name: 'United States' });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const countryCodes = [
    { code: '+93', name: 'Afghanistan' },
    { code: '+355', name: 'Albania' },
    { code: '+213', name: 'Algeria' },
    { code: '+376', name: 'Andorra' },
    { code: '+244', name: 'Angola' },
    { code: '+1', name: 'Antigua and Barbuda' },
    { code: '+54', name: 'Argentina' },
    { code: '+374', name: 'Armenia' },
    { code: '+61', name: 'Australia' },
    { code: '+43', name: 'Austria' },
    { code: '+994', name: 'Azerbaijan' },
    { code: '+1', name: 'Bahamas' },
    { code: '+973', name: 'Bahrain' },
    { code: '+880', name: 'Bangladesh' },
    { code: '+1', name: 'Barbados' },
    { code: '+375', name: 'Belarus' },
    { code: '+32', name: 'Belgium' },
    { code: '+501', name: 'Belize' },
    { code: '+229', name: 'Benin' },
    { code: '+975', name: 'Bhutan' },
    { code: '+591', name: 'Bolivia' },
    { code: '+387', name: 'Bosnia and Herzegovina' },
    { code: '+267', name: 'Botswana' },
    { code: '+55', name: 'Brazil' },
    { code: '+673', name: 'Brunei' },
    { code: '+359', name: 'Bulgaria' },
    { code: '+226', name: 'Burkina Faso' },
    { code: '+257', name: 'Burundi' },
    { code: '+855', name: 'Cambodia' },
    { code: '+237', name: 'Cameroon' },
    { code: '+1', name: 'Canada' },
    { code: '+238', name: 'Cape Verde' },
    { code: '+236', name: 'Central African Republic' },
    { code: '+235', name: 'Chad' },
    { code: '+56', name: 'Chile' },
    { code: '+86', name: 'China' },
    { code: '+57', name: 'Colombia' },
    { code: '+269', name: 'Comoros' },
    { code: '+242', name: 'Congo' },
    { code: '+506', name: 'Costa Rica' },
    { code: '+385', name: 'Croatia' },
    { code: '+53', name: 'Cuba' },
    { code: '+357', name: 'Cyprus' },
    { code: '+420', name: 'Czech Republic' },
    { code: '+45', name: 'Denmark' },
    { code: '+253', name: 'Djibouti' },
    { code: '+1', name: 'Dominica' },
    { code: '+1', name: 'Dominican Republic' },
    { code: '+670', name: 'East Timor' },
    { code: '+593', name: 'Ecuador' },
    { code: '+20', name: 'Egypt' },
    { code: '+503', name: 'El Salvador' },
    { code: '+240', name: 'Equatorial Guinea' },
    { code: '+291', name: 'Eritrea' },
    { code: '+372', name: 'Estonia' },
    { code: '+251', name: 'Ethiopia' },
    { code: '+679', name: 'Fiji' },
    { code: '+358', name: 'Finland' },
    { code: '+33', name: 'France' },
    { code: '+241', name: 'Gabon' },
    { code: '+220', name: 'Gambia' },
    { code: '+995', name: 'Georgia' },
    { code: '+49', name: 'Germany' },
    { code: '+233', name: 'Ghana' },
    { code: '+30', name: 'Greece' },
    { code: '+1', name: 'Grenada' },
    { code: '+502', name: 'Guatemala' },
    { code: '+224', name: 'Guinea' },
    { code: '+245', name: 'Guinea-Bissau' },
    { code: '+592', name: 'Guyana' },
    { code: '+509', name: 'Haiti' },
    { code: '+504', name: 'Honduras' },
    { code: '+852', name: 'Hong Kong' },
    { code: '+36', name: 'Hungary' },
    { code: '+354', name: 'Iceland' },
    { code: '+91', name: 'India' },
    { code: '+62', name: 'Indonesia' },
    { code: '+98', name: 'Iran' },
    { code: '+964', name: 'Iraq' },
    { code: '+353', name: 'Ireland' },
    { code: '+972', name: 'Israel' },
    { code: '+39', name: 'Italy' },
    { code: '+1', name: 'Jamaica' },
    { code: '+81', name: 'Japan' },
    { code: '+962', name: 'Jordan' },
    { code: '+7', name: 'Kazakhstan' },
    { code: '+254', name: 'Kenya' },
    { code: '+686', name: 'Kiribati' },
    { code: '+82', name: 'Korea, North' },
    { code: '+82', name: 'Korea, South' },
    { code: '+965', name: 'Kuwait' },
    { code: '+996', name: 'Kyrgyzstan' },
    { code: '+856', name: 'Laos' },
    { code: '+371', name: 'Latvia' },
    { code: '+961', name: 'Lebanon' },
    { code: '+266', name: 'Lesotho' },
    { code: '+231', name: 'Liberia' },
    { code: '+218', name: 'Libya' },
    { code: '+423', name: 'Liechtenstein' },
    { code: '+370', name: 'Lithuania' },
    { code: '+352', name: 'Luxembourg' },
    { code: '+853', name: 'Macau' },
    { code: '+389', name: 'Macedonia' },
    { code: '+261', name: 'Madagascar' },
    { code: '+265', name: 'Malawi' },
    { code: '+60', name: 'Malaysia' },
    { code: '+960', name: 'Maldives' },
    { code: '+223', name: 'Mali' },
    { code: '+356', name: 'Malta' },
    { code: '+692', name: 'Marshall Islands' },
    { code: '+222', name: 'Mauritania' },
    { code: '+230', name: 'Mauritius' },
    { code: '+52', name: 'Mexico' },
    { code: '+691', name: 'Micronesia' },
    { code: '+373', name: 'Moldova' },
    { code: '+377', name: 'Monaco' },
    { code: '+976', name: 'Mongolia' },
    { code: '+382', name: 'Montenegro' },
    { code: '+212', name: 'Morocco' },
    { code: '+258', name: 'Mozambique' },
    { code: '+95', name: 'Myanmar' },
    { code: '+264', name: 'Namibia' },
    { code: '+674', name: 'Nauru' },
    { code: '+977', name: 'Nepal' },
    { code: '+31', name: 'Netherlands' },
    { code: '+64', name: 'New Zealand' },
    { code: '+505', name: 'Nicaragua' },
    { code: '+227', name: 'Niger' },
    { code: '+234', name: 'Nigeria' },
    { code: '+47', name: 'Norway' },
    { code: '+968', name: 'Oman' },
    { code: '+92', name: 'Pakistan' },
    { code: '+680', name: 'Palau' },
    { code: '+970', name: 'Palestine' },
    { code: '+507', name: 'Panama' },
    { code: '+675', name: 'Papua New Guinea' },
    { code: '+595', name: 'Paraguay' },
    { code: '+51', name: 'Peru' },
    { code: '+63', name: 'Philippines' },
    { code: '+48', name: 'Poland' },
    { code: '+351', name: 'Portugal' },
    { code: '+974', name: 'Qatar' },
    { code: '+40', name: 'Romania' },
    { code: '+7', name: 'Russia' },
    { code: '+250', name: 'Rwanda' },
    { code: '+1', name: 'Saint Kitts and Nevis' },
    { code: '+1', name: 'Saint Lucia' },
    { code: '+1', name: 'Saint Vincent and the Grenadines' },
    { code: '+685', name: 'Samoa' },
    { code: '+378', name: 'San Marino' },
    { code: '+239', name: 'Sao Tome and Principe' },
    { code: '+966', name: 'Saudi Arabia' },
    { code: '+221', name: 'Senegal' },
    { code: '+381', name: 'Serbia' },
    { code: '+248', name: 'Seychelles' },
    { code: '+232', name: 'Sierra Leone' },
    { code: '+65', name: 'Singapore' },
    { code: '+421', name: 'Slovakia' },
    { code: '+386', name: 'Slovenia' },
    { code: '+677', name: 'Solomon Islands' },
    { code: '+252', name: 'Somalia' },
    { code: '+27', name: 'South Africa' },
    { code: '+211', name: 'South Sudan' },
    { code: '+34', name: 'Spain' },
    { code: '+94', name: 'Sri Lanka' },
    { code: '+249', name: 'Sudan' },
    { code: '+597', name: 'Suriname' },
    { code: '+268', name: 'Swaziland' },
    { code: '+46', name: 'Sweden' },
    { code: '+41', name: 'Switzerland' },
    { code: '+963', name: 'Syria' },
    { code: '+886', name: 'Taiwan' },
    { code: '+992', name: 'Tajikistan' },
    { code: '+255', name: 'Tanzania' },
    { code: '+66', name: 'Thailand' },
    { code: '+670', name: 'Timor-Leste' },
    { code: '+228', name: 'Togo' },
    { code: '+676', name: 'Tonga' },
    { code: '+1', name: 'Trinidad and Tobago' },
    { code: '+216', name: 'Tunisia' },
    { code: '+90', name: 'Turkey' },
    { code: '+993', name: 'Turkmenistan' },
    { code: '+688', name: 'Tuvalu' },
    { code: '+256', name: 'Uganda' },
    { code: '+380', name: 'Ukraine' },
    { code: '+971', name: 'United Arab Emirates' },
    { code: '+44', name: 'United Kingdom' },
    { code: '+1', name: 'United States' },
    { code: '+598', name: 'Uruguay' },
    { code: '+998', name: 'Uzbekistan' },
    { code: '+678', name: 'Vanuatu' },
    { code: '+379', name: 'Vatican City' },
    { code: '+58', name: 'Venezuela' },
    { code: '+84', name: 'Vietnam' },
    { code: '+967', name: 'Yemen' },
    { code: '+260', name: 'Zambia' },
    { code: '+263', name: 'Zimbabwe' }
  ];

  const filteredCountries = countryCodes.filter(country => 
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery)
  );

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
    const errors = [];

    if (!name.trim()) {
      errors.push(t('common.enterFullName'));
    }

    if (!email.trim()) {
      errors.push(t('common.enterEmail'));
    } else if (!email.includes('@')) {
      errors.push(t('common.enterValidEmail'));
    }

    if (!phonenumber.trim()) {
      errors.push(t('common.enterPhone'));
    }

    if (!password) {
      errors.push(t('common.enterPassword'));
    } else if (password.length < 6) {
      errors.push(t('common.passwordLength'));
    }

    if (!confirmPassword) {
      errors.push(t('common.confirmPassword'));
    } else if (password !== confirmPassword) {
      errors.push(t('common.passwordsMatch'));
    }

    if (errors.length > 0) {
      Toast.show({
        type: 'error',
        text1: t('common.validationError'),
        text2: errors[0],
        position: 'top',
        visibilityTime: 3000,
        topOffset: 50,
        autoHide: true,
      });
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone_number: `${selectedCountry.code}${phonenumber}`,
          },
          emailRedirectTo: undefined,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: name,
              email: email,
              phone_number: `${selectedCountry.code}${phonenumber}`,
              password: password,
            },
          ]);

        if (profileError) throw profileError;

        Toast.show({
          type: 'success',
          text1: t('common.success'),
          text2: t('common.accountCreated'),
          position: 'top',
          visibilityTime: 3000,
          topOffset: 50,
          autoHide: true,
        });

        router.push({
          pathname: './verification',
          params: { email }
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: error.message || t('common.error'),
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
    router.push('../login/login');
  };

  const handleForgetPassword = () => {
    // router.push('/forget-password'); 
  };

  const handleBack = () => {
    router.back();
  };

  const handleCountrySelect = (country: { code: string; name: string }) => {
    setSelectedCountry(country);
    setShowCountryModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Image
          source={require('@/assets/home/Left Icon.png')}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Top Image Section */}
      <Image
        source={require('@/assets/images/logo.png')}
        style={styles.welcomeImage}
        resizeMode="contain"
      />
        <View>
          <Text style={styles.headtext}>{t('common.createaccount')}</Text>
        </View>
      {/* Form Container */}
      <View style={styles.formContainer}>
        {/* Full name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('common.fullNamePlaceholder')}
            placeholderTextColor="#999999"
            value={name}
            onChangeText={setName}
            autoCapitalize="none"
          />
          <Text style={styles.icon}>👤</Text>
        </View>
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
        {/* Country Code Modal */}
        <Modal
          visible={showCountryModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCountryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('common.selectCountry')}</Text>
                <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              
              {/* Search Input */}
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('common.searchCountry')}
                  placeholderTextColor="#999999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                />
                <Text style={styles.searchIcon}>🔍</Text>
              </View>

              <FlatList
                data={filteredCountries}
                keyExtractor={(item, index) => `${item.code}-${item.name}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.countryItem}
                    onPress={() => handleCountrySelect(item)}
                  >
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={styles.countryCode}>{item.code}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
        {/* Phone number Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.countryCodeButton}
            onPress={() => setShowCountryModal(true)}
          >
            <Text style={styles.countryCodeText}>{selectedCountry.code}</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            placeholder={t('common.phonePlaceholder')}
            placeholderTextColor="#999999"
            value={phonenumber}
            onChangeText={setPhonenumber}
            keyboardType="phone-pad"
          />
          <Text style={styles.icon}>📞</Text>
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
        {/* Password confirm Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('common.confirmPasswordPlaceholder')}
            placeholderTextColor="#999999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <Text style={styles.icon}>🔒</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.nextButton, loading && styles.disabledButton]} 
          onPress={handleNext}
          disabled={loading}
        >
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.buttonGradient}
          >
            <Text style={styles.nextButtonText}>
              {loading ? t('common.creatingAccount') : t('common.signUpButton')}
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
    backgroundColor: '#e6e6e6',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  backIcon: {
    width: 33,
    height: 33,
    marginLeft: -13,
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
    borderColor: '#E0E0E0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#F54D4D',
    borderColor: '#F54D4D',
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
    color: '#F54D4D',
    fontSize: 14,
    fontFamily: 'Satoshi',
  },
  nextButton: {
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100%',
    borderRadius: 10,
    marginBottom: 20,
    marginTop: '2%',
    overflow: 'hidden',
  },
  buttonGradient: {
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 207, 250, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    gap: 8,
  },
  signupText: {
    color: '#333333',
    fontSize: 16,
    fontFamily: 'Satoshi',
  },
  signupLink: {
    color: '#4BCFFA',
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Satoshi',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  countryName: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    color: '#333',
  },
  countryCode: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    color: '#666',
  },
  countryCodeButton: {
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    marginRight: 10,
  },
  countryCodeText: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    color: '#333333',
  },
  phoneInput: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontFamily: 'Satoshi',
    color: '#333333',
  },
  searchIcon: {
    fontSize: 20,
    color: '#999999',
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
});