import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

export default function Profile() {
  const router = useRouter();
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: '',
    email: '',
    phone_number: ''
  });
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    biometricLogin: false,
    twoFactorAuth: false,
    autoSave: true,
    currency: 'USD',
    language: 'en'
  });

  const { i18n } = useTranslation();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    console.log('Modal visibility:', isEditModalVisible); // Debug log for modal state
  }, [isEditModalVisible]);

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

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/login/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const goHome = () => {
    router.push('../home/home');
  };

  const goInvest = () => {
    router.push('../invest/invest');
  };

  const goInbox = () => {
    router.push('../inbox/inbox');
  };

  const goSavings = () => {
    router.push('../save/savings');
  };

  const handleEditProfile = () => {
    console.log('handleEditProfile called'); // Debug log
    if (userProfile) {
      console.log('Setting edited profile with:', userProfile); // Debug log
      setEditedProfile({
        full_name: userProfile.full_name,
        email: userProfile.email,
        phone_number: userProfile.phone_number
      });
    }
    console.log('Setting modal visible to true'); // Debug log
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: editedProfile.full_name,
            phone_number: editedProfile.phone_number
          })
          .eq('id', user.id);

        if (error) throw error;
        
        setUserProfile(prev => prev ? {
          ...prev,
          full_name: editedProfile.full_name,
          phone_number: editedProfile.phone_number
        } : null);
        
        setIsEditModalVisible(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSettingsChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSettingsSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            ...settings
          });

        if (error) throw error;
        Alert.alert('Success', 'Settings saved successfully');
        setIsSettingsModalVisible(false);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleLanguageChange = (lang: string) => {
    handleSettingsChange('language', lang);
    i18n.changeLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/logo3.png')}
        style={styles.backgroundImage}
        resizeMode="contain"
      >
        <LinearGradient
          colors={['rgba(178, 174, 174, 0.7)', 'rgba(0,0,0,0.5)']}
          style={styles.gradient}
        >
          <ScrollView style={styles.mainContent} contentContainerStyle={styles.scrollContent}>
            {/* Language Switcher */}
            <View style={styles.languageSwitcherContainer}>
              <LanguageSwitcher />
            </View>

            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                <Text style={styles.profileInitials}>
                  {userProfile?.full_name
                    ? userProfile.full_name
                        .split(' ')
                        .map(name => name[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'U'}
                </Text>
              </View>
              <Animated.Text style={[styles.profileName, { opacity: fadeAnim }]}>
                {userProfile?.full_name || t('profile.name')}
              </Animated.Text>
            </View>

            {/* Profile Information */}
            <View style={styles.profileInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t('common.email')}</Text>
                <Text style={styles.infoValue}>{userProfile?.email}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t('common.phone')}</Text>
                <Text style={styles.infoValue}>{userProfile?.phone_number}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>{t('common.memberSince')}</Text>
                <Text style={styles.infoValue}>
                  {userProfile?.created_at
                    ? new Date(userProfile.created_at).toLocaleDateString()
                    : '-'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => {
                  console.log('Edit profile button pressed'); 
                  handleEditProfile();
                }}
              >
                <Text style={styles.actionButtonText}>{t('common.editProfile')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => setIsSettingsModalVisible(true)}
              >
                <Text style={styles.actionButtonText}>{t('common.settings')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
                <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
                  {t('common.logout')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Edit Profile Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isEditModalVisible}
            onRequestClose={() => {
              console.log('Modal close requested'); // Debug log
              setIsEditModalVisible(false);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('common.editProfile')}</Text>
                  <TouchableOpacity 
                    onPress={() => {
                      console.log('Close button pressed'); 
                      setIsEditModalVisible(false);
                    }}
                  >
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t('common.name')}</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProfile.full_name}
                    onChangeText={(text) => setEditedProfile(prev => ({ ...prev, full_name: text }))}
                    placeholder={t('profile.name')}
                    placeholderTextColor="#666"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t('common.phone')}</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProfile.phone_number}
                    onChangeText={(text) => setEditedProfile(prev => ({ ...prev, phone_number: text }))}
                    placeholder={t('common.phone')}
                    placeholderTextColor="#666"
                    keyboardType="phone-pad"
                  />
                </View>

                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={() => {
                    console.log('Save button pressed'); 
                    handleSaveProfile();
                  }}
                >
                  <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Settings Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isSettingsModalVisible}
            onRequestClose={() => setIsSettingsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('common.settings')}</Text>
                  <TouchableOpacity onPress={() => setIsSettingsModalVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.settingsScroll}>
                  {/* Language Section */}
                  <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>{t('common.language')}</Text>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>{t('common.selectLanguage')}</Text>
                      <View style={styles.languageSelector}>
                        <TouchableOpacity 
                          style={[styles.languageOption, settings.language === 'en' && styles.selectedLanguage]}
                          onPress={() => handleLanguageChange('en')}
                        >
                          <Text style={[styles.languageText, settings.language === 'en' && styles.selectedLanguageText]}>
                            English
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.languageOption, settings.language === 'es' && styles.selectedLanguage]}
                          onPress={() => handleLanguageChange('es')}
                        >
                          <Text style={[styles.languageText, settings.language === 'es' && styles.selectedLanguageText]}>
                            Español
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Security Section */}
                  <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>{t('settings.security')}</Text>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>{t('settings.biometricLogin')}</Text>
                      <Switch
                        value={settings.biometricLogin}
                        onValueChange={(value) => handleSettingsChange('biometricLogin', value)}
                      />
                    </View>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>{t('settings.twoFactorAuth')}</Text>
                      <Switch
                        value={settings.twoFactorAuth}
                        onValueChange={(value) => handleSettingsChange('twoFactorAuth', value)}
                      />
                    </View>
                  </View>

                  {/* Preferences Section */}
                  <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>{t('settings.darkMode')}</Text>
                      <Switch
                        value={settings.darkMode}
                        onValueChange={(value) => handleSettingsChange('darkMode', value)}
                      />
                    </View>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>{t('settings.autoSave')}</Text>
                      <Switch
                        value={settings.autoSave}
                        onValueChange={(value) => handleSettingsChange('autoSave', value)}
                      />
                    </View>
                  </View>

                  {/* Currency Section */}
                  <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>{t('settings.currency')}</Text>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>{t('settings.selectCurrency')}</Text>
                      <View style={styles.currencySelector}>
                        <TouchableOpacity 
                          style={[styles.currencyOption, settings.currency === 'USD' && styles.selectedCurrency]}
                          onPress={() => handleSettingsChange('currency', 'USD')}
                        >
                          <Text style={styles.currencyText}>USD</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.currencyOption, settings.currency === 'EUR' && styles.selectedCurrency]}
                          onPress={() => handleSettingsChange('currency', 'EUR')}
                        >
                          <Text style={styles.currencyText}>EUR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.currencyOption, settings.currency === 'GBP' && styles.selectedCurrency]}
                          onPress={() => handleSettingsChange('currency', 'GBP')}
                        >
                          <Text style={styles.currencyText}>GBP</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </ScrollView>

                <TouchableOpacity style={styles.saveButton} onPress={handleSettingsSave}>
                  <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Bottom Navigation */}
          <View style={styles.bottomMenuContainer}>
              {/* Left menu part */}
              <View style={styles.menuPartLeft}>
                  <TouchableOpacity style={styles.menuItem} onPress={goHome}>
                      <Image source={require('../../assets/home/home2.png')} style={{ width: 24, height: 24 }} />
                  <Animated.Text style={[styles.menuText, { opacity: fadeAnim }]}>
                    {t('common.home')}
                  </Animated.Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={goInvest}>
                      <Image source={require('../../assets/home/invest2.png')} style={{ width: 24, height: 24 }} />
                  <Animated.Text style={[styles.menuText, { opacity: fadeAnim }]}>
                    {t('common.invest')}
                  </Animated.Text>
                  </TouchableOpacity>
              </View>
      
              {/* Center Invest button */}
              <View style={styles.investButtonWrapper}>
                  <TouchableOpacity style={styles.investButton} onPress={goSavings}>
                      <Image source={require('../../assets/home/save.png')} style={{ width: 32, height: 32 }} />
                  <Animated.Text style={[styles.investText, { opacity: fadeAnim }]}>
                    {t('common.save')}
                  </Animated.Text>
                  </TouchableOpacity>
              </View>
      
              {/* Right menu part */}
              <View style={styles.menuPartRight}>
                  <TouchableOpacity style={styles.menuItem} onPress={goInbox}>
                  <Image source={require('../../assets/home/bell2.png')} style={{ width: 19, height: 24 }} />
                  <Animated.Text style={[styles.menuText, { opacity: fadeAnim }]}>
                    {t('common.inbox')}
                  </Animated.Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem}>
                  <Image source={require('../../assets/home/profile2.png')} style={{ width: 19, height: 24 }} />
                  <Animated.Text style={[styles.menuText, { opacity: fadeAnim }]}>
                    {t('common.profile')}
                  </Animated.Text>
                  </TouchableOpacity>
              </View>
            </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    width: '100%',
    height: '100%'
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
  },
  gradient: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  languageSwitcherContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: '#4BCFFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'center',
  },
  profileInitials: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  profileInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  actionButtons: {
    gap: 10,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#FF3B30',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  bottomMenuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  menuPartLeft: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderTopRightRadius:70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  menuPartRight: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 33,
    borderTopLeftRadius:70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  investButtonWrapper: {
    position: 'absolute',
    left: '50%',
    bottom: 15,
    transform: [{ translateX: -40 }],
    zIndex: 20,
  },
  investButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 48,
    width: 80,
    height: 80,
  },
  investText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Satoshi',
    marginTop: 2,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  menuText: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#000000',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000, // Added zIndex
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001, // Added zIndex
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#4BCFFA',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsScroll: {
    maxHeight: '80%',
  },
  settingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  currencySelector: {
    flexDirection: 'row',
    gap: 10,
  },
  currencyOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCurrency: {
    backgroundColor: '#4BCFFA',
  },
  currencyText: {
    fontSize: 14,
    color: '#333',
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  languageOption: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    minWidth: 100,
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: '#4BCFFA',
  },
  languageText: {
    fontSize: 14,
    color: '#333',
  },
  selectedLanguageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 