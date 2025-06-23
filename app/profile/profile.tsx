import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  FlatList,
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
import Toast from 'react-native-toast-message';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  created_at: string;
}

const backgroundImages = [
  require('../../assets/backgrounds/bg1.png'),
  require('../../assets/backgrounds/bg2.png'),
  require('../../assets/backgrounds/bg3.png'),
  require('../../assets/backgrounds/bg4.png'),  
  require('../../assets/backgrounds/bg5.png'),
  require('../../assets/backgrounds/bg6.png'),
  require('../../assets/backgrounds/bg7.png'),
  require('../../assets/backgrounds/bg8.png'),
  require('../../assets/backgrounds/bg9.png'),
  require('../../assets/backgrounds/bg10.png'),
  require('../../assets/backgrounds/bg11.png'),
  require('../../assets/backgrounds/bg12.png'),
  require('../../assets/backgrounds/bg13.png'),
  require('../../assets/backgrounds/bg14.png'),
  require('../../assets/backgrounds/bg15.png'),
  require('../../assets/backgrounds/bg16.png'),
  require('../../assets/backgrounds/bg17.png'),
  require('../../assets/backgrounds/bg18.png'),
  require('../../assets/backgrounds/bg19.png'),
  require('../../assets/backgrounds/bg20.png'),
  require('../../assets/backgrounds/bg21.png'),
  require('../../assets/backgrounds/bg22.png'),
];

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
    language: 'en',
    backgroundImage: 'bg7.png'
  });
  const [selectedBackground, setSelectedBackground] = useState(0);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [tempSelectedBackground, setTempSelectedBackground] = useState(0);

  const { i18n } = useTranslation();

  useEffect(() => {
    fetchUserProfile();
    loadSavedBackground();
  }, []);

  useEffect(() => {
    console.log('Modal visibility:', isEditModalVisible); 
  }, [isEditModalVisible]);

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
      if (!user) return;
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                full_name: user.user_metadata?.full_name || '',
                email: user.email,
                phone_number: user.user_metadata?.phone_number || '',
              }
            ])
            .select()
            .single();

          if (createError) throw createError;
          setUserProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('common.profileError'),
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
      });
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
    console.log('handleEditProfile called'); 
    if (userProfile) {
      console.log('Setting edited profile with:', userProfile); 
      setEditedProfile({
        full_name: userProfile.full_name,
        email: userProfile.email,
        phone_number: userProfile.phone_number
      });
    }
    console.log('Setting modal visible to true'); 
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

  const handleBackgroundImageSelect = async () => {
    setIsSettingsModalVisible(false);
    setTimeout(() => {
      setShowBackgroundSelector(true);
    }, 300);
  };

  const loadSavedBackground = async () => {
    try {
      const savedIndex = await AsyncStorage.getItem('background-index');
      if (savedIndex !== null) {
        const index = parseInt(savedIndex);
        setSelectedBackground(index);
        setTempSelectedBackground(index);
      }
    } catch (error) {
      console.error('Error loading background:', error);
    }
  };

  const handleBackgroundSelect = (index: number) => {
    setTempSelectedBackground(index);
  };

  const handleSaveBackground = async () => {
    try {
      await AsyncStorage.setItem('background-index', tempSelectedBackground.toString());
      setSelectedBackground(tempSelectedBackground);
      setShowBackgroundSelector(false);
      
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('common.backgroundUpdated'),
        position: 'top',
        visibilityTime: 3000,
        autoHide: true,
        onHide: () => {
          router.push('../home/home');
        }
      });
    } catch (error) {
      console.error('Error saving background:', error);
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('common.backgroundUpdateFailed'),
        position: 'top',
        visibilityTime: 3000,
        autoHide: true
      });
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImages[selectedBackground]}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 255)', 'rgba(255, 255, 255, 255)']}
          style={styles.gradient}
        >
          <ScrollView style={styles.mainContent} contentContainerStyle={styles.scrollContent}>
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                <LinearGradient
                  colors={['#2196F3', '#1976D2']}
                  style={styles.profileImageGradient}
                >
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
                </LinearGradient>
              </View>
              <Animated.Text style={[styles.profileName, { opacity: fadeAnim }]}>
                {userProfile?.full_name || t('profile.name')}
              </Animated.Text>
              <Text style={styles.profileEmail}>{userProfile?.email}</Text>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>{t('common.accountInfo')}</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoItem}>
                    <Ionicons name="mail-outline" size={20} color="#1976D2" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>{t('common.email')}</Text>
                      <Text style={styles.infoValue}>{userProfile?.email}</Text>
                    </View>
                  </View>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoItem}>
                    <Ionicons name="call-outline" size={20} color="#1976D2" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>{t('common.phone')}</Text>
                      <Text style={styles.infoValue}>{userProfile?.phone_number || '-'}</Text>
                    </View>
                  </View>
                  <View style={styles.infoDivider} />
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={20} color="#1976D2" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>{t('common.memberSince')}</Text>
                      <Text style={styles.infoValue}>
                        {userProfile?.created_at
                          ? new Date(userProfile.created_at).toLocaleDateString()
                          : '-'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleEditProfile}
                >
                  <LinearGradient
                    colors={['#2196F3', '#1976D2']}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>{t('common.editProfile')}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => setIsSettingsModalVisible(true)}
                >
                  <LinearGradient
                    colors={['#2196F3', '#1976D2']}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>{t('common.settings')}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionButton, styles.logoutButton]} 
                  onPress={handleLogout}
                >
                  <LinearGradient
                    colors={['#FF5252', '#D32F2F']}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>{t('common.logout')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          <Modal
            animationType="slide"
            transparent={true}
            visible={isEditModalVisible}
            onRequestClose={() => setIsEditModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('common.editProfile')}</Text>
                  <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
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
                  onPress={handleSaveProfile}
                >
                  <LinearGradient
                    colors={['#2196F3', '#1976D2']}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.settingsScroll}>
                  <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>{t('common.language')}</Text>
                    <View style={styles.settingItem}>
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
                  <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>{t('common.security')}</Text>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>{t('common.biometricLogin')}</Text>
                      <Switch
                        value={settings.biometricLogin}
                        onValueChange={(value) => handleSettingsChange('biometricLogin', value)}
                        trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                        thumbColor={settings.biometricLogin ? '#1976D2' : '#F5F5F5'}
                      />
                    </View>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>{t('common.twoFactorAuth')}</Text>
                      <Switch
                        value={settings.twoFactorAuth}
                        onValueChange={(value) => handleSettingsChange('twoFactorAuth', value)}
                        trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                        thumbColor={settings.twoFactorAuth ? '#1976D2' : '#F5F5F5'}
                      />
                    </View>
                  </View>
                  <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>{t('common.preferences')}</Text>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>{t('common.autoSave')}</Text>
                      <Switch
                        value={settings.autoSave}
                        onValueChange={(value) => handleSettingsChange('autoSave', value)}
                        trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                        thumbColor={settings.autoSave ? '#1976D2' : '#F5F5F5'}
                      />
                    </View>
                  </View>
                  <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>{t('common.background')}</Text>
                    <View style={styles.settingItem}>
                      <TouchableOpacity 
                        style={styles.backgroundButton}
                        onPress={handleBackgroundImageSelect}
                      >
                        <LinearGradient
                          colors={['#2196F3', '#1976D2']}
                          style={styles.backgroundButtonGradient}
                        >
                          <Ionicons name="image-outline" size={20} color="#FFFFFF" />
                          <Text style={styles.backgroundButtonText}>{t('common.changeBackground')}</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>

                <TouchableOpacity style={styles.saveButton} onPress={handleSettingsSave}>
                  <LinearGradient
                    colors={['#2196F3', '#1976D2']}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Modal
            visible={showBackgroundSelector}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowBackgroundSelector(false)}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { maxHeight: '80%' }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('common.selectBackground')}</Text>
                  <TouchableOpacity onPress={() => setShowBackgroundSelector(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={backgroundImages}
                  numColumns={2}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={[
                        styles.backgroundOption,
                        tempSelectedBackground === index && styles.selectedBackground
                      ]}
                      onPress={() => handleBackgroundSelect(index)}
                    >
                      <ImageBackground
                        source={item}
                        style={styles.backgroundPreview}
                        resizeMode="cover"
                      >
                        {tempSelectedBackground === index && (
                          <View style={styles.selectedOverlay}>
                            <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                          </View>
                        )}
                      </ImageBackground>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(_, index) => index.toString()}
                  contentContainerStyle={styles.backgroundGrid}
                />

                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={handleSaveBackground}
                >
                  <LinearGradient
                    colors={['#2196F3', '#1976D2']}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <View style={styles.bottomMenuContainer}>
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
            <View style={styles.investButtonWrapper}>
                <TouchableOpacity style={styles.investButton} onPress={goSavings}>
                    <Image source={require('../../assets/home/save.png')} style={{ width: 32, height: 32 }} />
                <Animated.Text style={[styles.investText, { opacity: fadeAnim }]}>
                  {t('common.save')}
                </Animated.Text>
                </TouchableOpacity>
            </View>
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
    backgroundColor: '#FFFFFF',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
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
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImageGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    color: '#1976D2',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
  },
  profileInfo: {
    gap: 24,
  },
  infoSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '500',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 100
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
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
    color: '#1976D2',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 8,
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsScroll: {
    maxHeight: '80%',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  languageOption: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    minWidth: 100,
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: '#1976D2',
  },
  languageText: {
    fontSize: 14,
    color: '#666',
  },
  selectedLanguageText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  currencySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyOption: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedCurrency: {
    backgroundColor: '#1976D2',
  },
  currencyText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCurrencyText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  backgroundButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  backgroundButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  backgroundButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  backgroundGrid: {
    padding: 16,
    gap: 16,
  },
  backgroundOption: {
    flex: 1,
    aspectRatio: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedBackground: {
    borderColor: '#1976D2',
  },
  backgroundPreview: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(25, 118, 210, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 