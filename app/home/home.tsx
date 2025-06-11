import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Share from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, FlatList, Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Toast from 'react-native-toast-message';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

const splashImages = [
  require('../../assets/home/banner1.png'),
  require('../../assets/home/banner2.png'),
  require('../../assets/home/banner3.png'),
];

// Background images array
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
];

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
}

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('Save');
  const [activeSplashIndex, setActiveSplashIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const flatListRef = useRef<FlatList<any>>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [selectedBackground, setSelectedBackground] = useState(0);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendNote, setSendNote] = useState('');
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveAmount, setReceiveAmount] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [showQRCode, setShowQRCode] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    loadSavedBackground();
  }, []);

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
    }
  };

  const loadSavedBackground = async () => {
    try {
      const savedIndex = await AsyncStorage.getItem('background-index');
      if (savedIndex !== null) {
        setSelectedBackground(parseInt(savedIndex));
      }
    } catch (error) {
      console.error('Error loading background:', error);
    }
  };

  const getUserInitials = () => {
    if (!userProfile?.full_name) return 'U';
    return userProfile.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const goProfile = () => {
    router.push('../profile/profile');
  };
  const goInbox = () => {
    router.push('../inbox/inbox');
  };
  const goInvest = () => {
    setShowQuickActions(false);
    router.push('../invest/invest');
  };
  const gosavings = () => {
    setShowQuickActions(false);
    router.push('../save/savings');
  };
  const goAnalytics = () => {
    setShowQuickActions(false);
    router.push('../analytics/analytics');
  };
  const goReports = () => {
    setShowQuickActions(false);
    router.push('../reports/reports');
  };

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeSplashIndex + 1) % splashImages.length;
      setActiveSplashIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000); 
    return () => clearInterval(interval);
  }, [activeSplashIndex]);

  const handleSplashScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveSplashIndex(index);
  };

  const renderSplashItem = ({ item }: { item: any }) => (
    <View style={styles.splashImageContainer}>
      <Image source={item} style={styles.splashImage} resizeMode="cover" />
    </View>
  );

  // Savings Progress Data
  const totalWeeks = 10;
  const currentWeek = 6; 
  const progressPercentage = (currentWeek / totalWeeks) * 100;

  // Animation for fairy tale effect (glowing)
  const glowAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnimation]);

  const handleQuickActionPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (!showQuickActions) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    
    setShowQuickActions(!showQuickActions);
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleSendMoney = () => {
    if (!sendAmount || !recipientName || !recipientEmail) {
      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('common.fillAllFields'),
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    // Show success message and close modal
    Toast.show({
      type: 'success',
      text1: t('common.success'),
      text2: t('common.moneySent'),
      position: 'top',
      visibilityTime: 3000,
    });
    setShowSendModal(false);
  };

  // Generate payment link when amount changes
  useEffect(() => {
    if (receiveAmount) {
      setPaymentLink(`https://prospera.app/pay/${userProfile?.id}/${receiveAmount}`);
    } else {
      setPaymentLink(`https://prospera.app/pay/${userProfile?.id}`);
    }
  }, [receiveAmount, userProfile?.id]);

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(paymentLink);
    Toast.show({
      type: 'success',
      text1: t('common.success'),
      text2: t('common.linkCopied'),
      position: 'top',
      visibilityTime: 3000,
    });
  };

  const handleShareLink = async () => {
    try {
      await Share.shareAsync(paymentLink, {
        mimeType: 'text/plain',
        dialogTitle: t('common.paymentRequest'),
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImages[selectedBackground]}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
          {/* Magic Button - Fixed Position */}
          <View style={styles.magicButtonWrapper}>
            <Animated.View style={[
              styles.magicButtonContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}>
              <TouchableOpacity 
                style={styles.magicButton}
                onPress={handleQuickActionPress}
              >
    <LinearGradient
                  colors={['#E3F2FD', '#BBDEFB']}
                  style={styles.magicButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="sparkles" size={20} color="#1976D2" />
                  </Animated.View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

      <ScrollView style={styles.mainContent} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
                <TouchableOpacity onPress={goProfile}>
                  <View style={styles.userIcon}>
                    <Image 
                      source={require('../../assets/home/logo.png')} 
                      style={styles.appLogo}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableOpacity>
                <View>
            <Text style={styles.welcomeText}>
              {t('common.welcome')} {userProfile?.full_name || ''}
            </Text>
                </View>
              </View>
            </View>

            {/* Quick Actions Modal */}
            <Modal
              visible={showQuickActions}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowQuickActions(false)}
            >
              <TouchableOpacity 
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowQuickActions(false)}
              >
                <View style={styles.quickActionsModal}>
                  <TouchableOpacity 
                    style={styles.quickActionButton} 
                    onPress={() => {
                      setShowQuickActions(false);
                      goAnalytics();
                    }}
                  >
                    <LinearGradient
                      colors={['#4CAF50', '#45a049']}
                      style={styles.actionGradient}
                    >
                      <Ionicons name="analytics-outline" size={24} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.quickActionText}>{t('common.analytics')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.quickActionButton} 
                    onPress={() => {
                      setShowQuickActions(false);
                      goReports();
                    }}
                  >
                    <LinearGradient
                      colors={['#2196F3', '#1976D2']}
                      style={styles.actionGradient}
                    >
                      <Ionicons name="document-text-outline" size={24} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.quickActionText}>{t('common.reports')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.quickActionButton} 
                    onPress={() => {
                      setShowQuickActions(false);
                      setShowQuickActions(true);
                    }}
                  >
                    <LinearGradient
                      colors={['#FF9800', '#F57C00']}
                      style={styles.actionGradient}
                    >
                      <Ionicons name="add-circle-outline" size={24} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.quickActionText}>{t('common.new')}</Text>
            </TouchableOpacity>
          </View>
              </TouchableOpacity>
            </Modal>

        {/* Splash Images Section */}
        <View style={styles.splashSection}>
          <View style={styles.dotsContainer}>
            {splashImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeSplashIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
          <FlatList
            ref={flatListRef}
            data={splashImages}
            renderItem={renderSplashItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleSplashScroll}
            snapToInterval={width}
            decelerationRate="fast"
          />
        </View>

            {/* Total Balance Section */}
            <LinearGradient
              colors={['#E3F2FD', '#BBDEFB']} 
              style={styles.balanceSection}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.balanceContent}>
                <View style={styles.balanceInfo}>
                  <View style={styles.balanceHeader}>
                    <Text style={styles.sectionTitle}>
                      {activeTab === 'Save' ? t('common.totalSaved') : t('common.totalInvested')}
                    </Text>
                    <View style={styles.cardIcons}>
                      <Image source={require('../../assets/home/gold.png')} style={styles.cardIcon} />
                    </View>
                  </View>
                  <Text style={styles.balanceAmount}>
                    {activeTab === 'Save' ? '$2,000' : '$5,000'}
                  </Text>
                </View>
                
                <View style={styles.balanceActions}>
          <TouchableOpacity
                    style={[styles.balanceActionButton, activeTab === 'Save' && styles.activeBalanceAction]}
            onPress={() => setActiveTab('Save')}
          >
                    <Text style={[styles.balanceActionText, activeTab === 'Save' && styles.activeBalanceActionText]}>
              {t('common.save')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
                    style={[styles.balanceActionButton, activeTab === 'Invest' && styles.activeBalanceAction]}
            onPress={() => setActiveTab('Invest')}
          >
                    <Text style={[styles.balanceActionText, activeTab === 'Invest' && styles.activeBalanceActionText]}>
              {t('common.invest')}
            </Text>
          </TouchableOpacity>
        </View>
            </View>
            </LinearGradient>

            {/* Wallet Actions */}
            <View style={styles.walletActions}>
              <View style={styles.walletActionsGrid}>
                <TouchableOpacity style={styles.walletActionButton} onPress={gosavings}>
                  <Image 
                    source={require('../../assets/home/save.png')} 
                    style={styles.walletActionImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.walletActionText}>{t('common.save')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.walletActionButton} onPress={goInvest}>
                  <Image 
                    source={require('../../assets/home/investment.png')} 
                    style={styles.walletActionImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.walletActionText}>{t('common.invest')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.walletActionButton} 
                  onPress={() => setShowSendModal(true)}
                >
                  <Image 
                    source={require('../../assets/home/send.png')} 
                    style={styles.walletActionImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.walletActionText}>{t('common.send')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.walletActionButton} 
                  onPress={() => setShowReceiveModal(true)}
                >
                  <Image 
                    source={require('../../assets/home/receive.png')} 
                    style={styles.walletActionImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.walletActionText}>{t('common.receive')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.walletActionButton}>
          <Image
                    source={require('../../assets/home/exchange.png')} 
                    style={styles.walletActionImage}
            resizeMode="contain"
          />
                  <Text style={styles.walletActionText}>{t('common.exchange')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.walletActionButton}>
                  <Image 
                    source={require('../../assets/home/cards.png')} 
                    style={styles.walletActionImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.walletActionText}>{t('common.cards')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.walletActionButton}>
                  <Image 
                    source={require('../../assets/home/analytics.png')} 
                    style={styles.walletActionImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.walletActionText}>{t('common.analytics')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.walletActionButton}>
                  <Image 
                    source={require('../../assets/home/reports.png')} 
                    style={styles.walletActionImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.walletActionText}>{t('common.reports')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Insights Section */}
            <View style={styles.insightsSection}>
              <View style={styles.insightsHeader}>
                <Text style={styles.insightsTitle}>{t('common.insights')}</Text>
                <TouchableOpacity onPress={() => router.push('../insights/insights')}>
                  <Text style={styles.viewAllText}>{t('common.viewAll')}</Text>
                </TouchableOpacity>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.insightsScrollContent}
              >
                <View style={styles.insightsCard}>
                  <Ionicons name="trending-up" size={24} color="#1976D2" />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>{t('common.insight1')}</Text>
                    <Text style={styles.insightSubtitle}>{t('common.learnMore')}</Text>
                  </View>
                </View>
                <View style={styles.insightsCard}>
                  <Ionicons name="wallet-outline" size={24} color="#1976D2" />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>{t('common.insight2')}</Text>
                    <Text style={styles.insightSubtitle}>{t('common.learnMore')}</Text>
                  </View>
                </View>
                <View style={styles.insightsCard}>
                  <Ionicons name="shield-checkmark-outline" size={24} color="#1976D2" />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>{t('common.insight3')}</Text>
                    <Text style={styles.insightSubtitle}>{t('common.learnMore')}</Text>
          </View>
        </View>
      </ScrollView>
            </View>
          </ScrollView>
      </ImageBackground>

      {/* Bottom Menu Bar */}
      <View style={styles.bottomMenuContainer}>
        {/* Left menu part */}
        <View style={styles.menuPartLeft}>
            <TouchableOpacity style={styles.menuItem}>
            <Image source={require('../../assets/home/home2.png')} style={{ width: 24, height: 24 }} />
            <Text style={styles.menuText}>{t('common.home')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={goInvest}>
            <Image source={require('../../assets/home/invest2.png')} style={{ width: 24, height: 24 }} />
            <Text style={styles.menuText}>{t('common.invest')}</Text>
            </TouchableOpacity>
        </View>

        {/* Center Invest button */}
        <View style={styles.investButtonWrapper}>
            <TouchableOpacity style={styles.investButton} onPress={gosavings}>
            <Image source={require('../../assets/home/save.png')} style={{ width: 32, height: 32 }} />
            <Text style={styles.investText}>{t('common.save')}</Text>
            </TouchableOpacity>
        </View>

        {/* Right menu part */}
        <View style={styles.menuPartRight}>
            <TouchableOpacity style={styles.menuItem} onPress={goInbox}>
            <Image source={require('../../assets/home/bell2.png')} style={{ width: 19, height: 24 }} />
            <Text style={styles.menuText}>{t('common.inbox')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={goProfile}>
            <Image source={require('../../assets/home/profile2.png')} style={{ width: 19, height: 24 }} />
            <Text style={styles.menuText}>{t('common.profile')}</Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* Send Money Modal */}
      <Modal
        visible={showSendModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSendModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('common.sendMoney')}</Text>
              <TouchableOpacity onPress={() => setShowSendModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sendForm}>
              {/* Recipient Details */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>{t('common.recipientDetails')}</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t('common.recipientName')}</Text>
                  <TextInput
                    style={styles.input}
                    value={recipientName}
                    onChangeText={setRecipientName}
                    placeholder={t('common.enterRecipientName')}
                    placeholderTextColor="#666"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{t('common.recipientEmail')}</Text>
                  <TextInput
                    style={styles.input}
                    value={recipientEmail}
                    onChangeText={setRecipientEmail}
                    placeholder={t('common.enterRecipientEmail')}
                    placeholderTextColor="#666"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Amount */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>{t('common.amount')}</Text>
                <View style={styles.amountContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={sendAmount}
                    onChangeText={setSendAmount}
                    placeholder="0.00"
                    placeholderTextColor="#666"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Note */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>{t('common.note')}</Text>
                <TextInput
                  style={[styles.input, styles.noteInput]}
                  value={sendNote}
                  onChangeText={setSendNote}
                  placeholder={t('common.addNote')}
                  placeholderTextColor="#666"
                  multiline
                />
              </View>

              {/* Transaction Summary */}
              <View style={styles.transactionSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t('common.amount')}</Text>
                  <Text style={styles.summaryValue}>${sendAmount || '0.00'}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{t('common.fee')}</Text>
                  <Text style={styles.summaryValue}>$0.00</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTotal}>{t('common.total')}</Text>
                  <Text style={styles.summaryTotalValue}>${sendAmount || '0.00'}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={handleSendMoney}
              >
                <LinearGradient
                  colors={['#2196F3', '#1976D2']}
                  style={styles.sendButtonGradient}
                >
                  <Text style={styles.sendButtonText}>{t('common.sendMoney')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Receive Money Modal */}
      <Modal
        visible={showReceiveModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReceiveModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('common.receiveMoney')}</Text>
              <TouchableOpacity onPress={() => setShowReceiveModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.receiveForm}>
              {/* Amount Input */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>{t('common.amount')}</Text>
                <View style={styles.amountContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={receiveAmount}
                    onChangeText={setReceiveAmount}
                    placeholder="0.00"
                    placeholderTextColor="#666"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* QR Code or Account Details */}
              <View style={styles.formSection}>
                <View style={styles.tabContainer}>
                  <TouchableOpacity 
                    style={[styles.tab, showQRCode && styles.activeTab]}
                    onPress={() => setShowQRCode(true)}
                  >
                    <Text style={[styles.tabText, showQRCode && styles.activeTabText]}>
                      {t('common.qrCode')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.tab, !showQRCode && styles.activeTab]}
                    onPress={() => setShowQRCode(false)}
                  >
                    <Text style={[styles.tabText, !showQRCode && styles.activeTabText]}>
                      {t('common.accountDetails')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showQRCode ? (
                  <View style={styles.qrContainer}>
                    <QRCode
                      value={paymentLink}
                      size={200}
                      backgroundColor="white"
                      color="black"
                    />
                    <Text style={styles.qrText}>{t('common.scanToPay')}</Text>
                  </View>
                ) : (
                  <View style={styles.accountDetailsContainer}>
                    <View style={styles.accountDetailRow}>
                      <Text style={styles.accountDetailLabel}>{t('common.accountName')}</Text>
                      <Text style={styles.accountDetailValue}>{userProfile?.full_name}</Text>
                    </View>
                    <View style={styles.accountDetailRow}>
                      <Text style={styles.accountDetailLabel}>{t('common.accountEmail')}</Text>
                      <Text style={styles.accountDetailValue}>{userProfile?.email}</Text>
                    </View>
                    <View style={styles.accountDetailRow}>
                      <Text style={styles.accountDetailLabel}>{t('common.accountId')}</Text>
                      <Text style={styles.accountDetailValue}>{userProfile?.id}</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Payment Link */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>{t('common.paymentLink')}</Text>
                <View style={styles.linkContainer}>
                  <Text style={styles.linkText} numberOfLines={1}>
                    {paymentLink}
                  </Text>
                  <View style={styles.linkActions}>
                    <TouchableOpacity 
                      style={styles.linkActionButton}
                      onPress={handleCopyLink}
                    >
                      <Ionicons name="copy-outline" size={20} color="#1976D2" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.linkActionButton}
                      onPress={handleShareLink}
                    >
                      <Ionicons name="share-outline" size={20} color="#1976D2" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Instructions */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>{t('common.howToReceive')}</Text>
                <View style={styles.instructionsContainer}>
                  <View style={styles.instructionStep}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>1</Text>
                    </View>
                    <Text style={styles.instructionText}>
                      {t('common.receiveStep1')}
                    </Text>
                  </View>
                  <View style={styles.instructionStep}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>2</Text>
                    </View>
                    <Text style={styles.instructionText}>
                      {t('common.receiveStep2')}
                    </Text>
                  </View>
                  <View style={styles.instructionStep}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>3</Text>
                    </View>
                    <Text style={styles.instructionText}>
                      {t('common.receiveStep3')}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Welcome Section
  welcomeSection: {
    padding: 20,
    marginBottom: 20,
    marginTop: 30,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  welcomeText: {
    fontSize: 20,
    fontFamily: 'Satoshi',
    color: '#000',
    fontWeight: '700',
  },
  welcomeSubtext: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: 4,
  },
  userIcon: {
    padding: 15,
    width: 90,
    height: 90,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  appLogo: {
    width: 70,
    height: 70,
  },
  userInitial: {
    fontFamily: 'Satoshi',
    fontSize: 19,
    fontWeight: '700',
    color: '#3D3D3D',
  },

  // Quick Actions
  quickActionsContainer: {
    position: 'relative',
    paddingHorizontal: 20,
    marginBottom: 20,
    minHeight: 80,
  },
  magicButtonWrapper: {
    position: 'absolute',
    left: 20,
    top: '33%',
    zIndex: 1000,
  },
  magicButtonContainer: {
    zIndex: 2,
  },
  magicButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  magicButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsModal: {
    position: 'absolute',
    left: 70,
    top: '33%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    gap: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  quickActionButton: {
    alignItems: 'center',
    width: 80,
  },
  actionGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#000',
    textAlign: 'center',
  },

  // Splash Images Section
  splashSection: {
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  splashImageContainer: {
    width: width,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashImage: {
    width: width - 20,
    height: 200,
    borderRadius: 15,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B0BEC5',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Total Balance Section
  balanceSection: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  balanceContent: {
    padding: 12,
  },
  balanceInfo: {
    marginBottom: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 20
  },
  cardIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  cardIcon: {
    width: 30,
    height: 35,
  },
  balanceAmount: {
    fontSize: 24,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#1976D2',
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 8,
  },
  balanceActionButton: {
    paddingVertical: 4,
  },
  activeBalanceAction: {
    borderBottomWidth: 2,
    borderBottomColor: '#1976D2',
  },
  balanceActionText: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#64B5F6',
    fontWeight: '600',
  },
  activeBalanceActionText: {
    color: '#1976D2',
  },
  walletActions: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  walletActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  walletActionButton: {
    alignItems: 'center',
    width: (width - 40 - 48) / 4, 
  },
  walletActionImage: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  walletActionText: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#000',
    textAlign: 'center',
  },

  // Insights Section
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 29,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 30
  },
  insightsTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#64B5F6',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#64B5F6',
  },
  insightsScrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  insightsCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: width * 0.7,
    marginRight: 12,
  },
  insightContent: {
    marginLeft: 12,
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#000',
    marginBottom: 4,
  },
  insightSubtitle: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#1976D2',
  },

  // Bottom Menu Bar
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
    borderTopRightRadius: 70,
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
    borderTopLeftRadius: 70,
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
sendForm: {
  maxHeight: '80%',
},
receiveForm: {
  maxHeight: '80%',
},
formSection: {
  marginBottom: 24,
},
inputContainer: {
  marginBottom: 16,
},
inputLabel: {
  fontSize: 14,
  color: '#666',
  marginBottom: 14,
},
input: {
  backgroundColor: '#F5F5F5',
  borderRadius: 12,
  padding: 12,
  fontSize: 16,
  color: '#000',
},
amountContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F5F5F5',
  borderRadius: 12,
  padding: 12,
},
currencySymbol: {
  fontSize: 24,
  color: '#1976D2',
  marginRight: 8,
},
amountInput: {
  flex: 1,
  fontSize: 24,
  color: '#000',
  padding: 0,
},
noteInput: {
  height: 80,
  textAlignVertical: 'top',
},
transactionSummary: {
  backgroundColor: '#F5F5F5',
  borderRadius: 12,
  padding: 16,
  marginBottom: 24,
},
summaryRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},
summaryLabel: {
  fontSize: 14,
  color: '#666',
},
summaryValue: {
  fontSize: 14,
  color: '#000',
  fontWeight: '500',
},
summaryDivider: {
  height: 1,
  backgroundColor: '#E0E0E0',
  marginVertical: 12,
},
summaryTotal: {
  fontSize: 16,
  color: '#1976D2',
  fontWeight: '600',
},
summaryTotalValue: {
  fontSize: 16,
  color: '#1976D2',
  fontWeight: '600',
},
sendButton: {
  borderRadius: 12,
  overflow: 'hidden',
  marginBottom: 16,
},
sendButtonGradient: {
  padding: 16,
  alignItems: 'center',
},
sendButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 'bold',
},
modalContainer: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  backgroundColor: '#FFFFFF',
  padding: 20,
  borderRadius: 16,
  width: '80%',
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
  fontFamily: 'Satoshi',
  fontWeight: '700',
  color: '#000',
},
tabContainer: {
  flexDirection: 'row',
  backgroundColor: '#F5F5F5',
  borderRadius: 12,
  padding: 4,
  marginBottom: 16,
},
tab: {
  flex: 1,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
  alignItems: 'center',
},
activeTab: {
  backgroundColor: '#FFFFFF',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
tabText: {
  fontSize: 14,
  color: '#666',
},
activeTabText: {
  color: '#1976D2',
  fontWeight: '600',
},
qrContainer: {
  alignItems: 'center',
  backgroundColor: '#FFFFFF',
  padding: 24,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
qrText: {
  marginTop: 16,
  fontSize: 14,
  color: '#666',
  textAlign: 'center',
},
accountDetailsContainer: {
  backgroundColor: '#FFFFFF',
  padding: 16,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
accountDetailRow: {
    marginBottom: 16,
},
accountDetailLabel: {
  fontSize: 16,
  color: '#666',
  marginBottom: 4,
},
accountDetailValue: {
  fontSize: 16,
  color: '#000',
  fontWeight: '500',
},
linkContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F5F5F5',
  borderRadius: 12,
  padding: 12,
},
linkText: {
  flex: 1,
  fontSize: 14,
  color: '#666',
  marginRight: 8,
},
linkActions: {
  flexDirection: 'row',
  gap: 8,
},
linkActionButton: {
  padding: 8,
},
instructionsContainer: {
  backgroundColor: '#FFFFFF',
  padding: 16,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},
instructionStep: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
},
instructionNumber: {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: '#1976D2',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},
instructionNumberText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: 'bold',
},
instructionText: {
  flex: 1,
  fontSize: 14,
  color: '#666',
},
});