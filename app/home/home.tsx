import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

const splashImages = [
  require('../../assets/home/banner1.png'),
  require('../../assets/home/banner2.png'),
  require('../../assets/home/banner3.png'),
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

  useEffect(() => {
    fetchUserProfile();
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

  return (
    <LinearGradient
      colors={['#FFF', '#404040']}
      style={styles.container}
      start={{ x: 0.1, y: 0.3 }}
      end={{ x: 0.5, y: 0.5 }}
    >
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

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionButton} onPress={goAnalytics}>
            <Ionicons name="analytics-outline" size={24} color="#00cc00" />
            <Text style={styles.quickActionText}>{t('common.analytics')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={goReports}>
            <Ionicons name="document-text-outline" size={24} color="#00cc00" />
            <Text style={styles.quickActionText}>{t('common.reports')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => setShowQuickActions(true)}>
            <Ionicons name="add-circle-outline" size={24} color="#00cc00" />
            <Text style={styles.quickActionText}>{t('common.new')}</Text>
          </TouchableOpacity>
        </View>

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

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Save' && styles.activeTab]}
            onPress={() => setActiveTab('Save')}
          >
            <Text style={[styles.tabText, activeTab === 'Save' && styles.activeTabText]}>
              {t('common.save')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Invest' && styles.activeTab]}
            onPress={() => setActiveTab('Invest')}
          >
            <Text style={[styles.tabText, activeTab === 'Invest' && styles.activeTabText]}>
              {t('common.invest')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Total Balance Section */}
        <LinearGradient
          colors={['#37474F', '#37474F']} 
          style={styles.balanceSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
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
          <Text style={styles.Project}>
            {activeTab === 'Save' 
              ? t('common.projectedGrowth') + ' +10%'
              : t('common.portfolioGrowth') + ' +11%'
            }
          </Text>
          <Image
            source={require('../../assets/home/line.png')}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: 0.2,
            }}
            resizeMode="contain"
          />
        </LinearGradient>

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
              <Ionicons name="trending-up" size={24} color="#00cc00" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{t('common.insight1')}</Text>
                <Text style={styles.insightSubtitle}>{t('common.learnMore')}</Text>
              </View>
            </View>
            <View style={styles.insightsCard}>
              <Ionicons name="wallet-outline" size={24} color="#00cc00" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{t('common.insight2')}</Text>
                <Text style={styles.insightSubtitle}>{t('common.learnMore')}</Text>
              </View>
            </View>
            <View style={styles.insightsCard}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#00cc00" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{t('common.insight3')}</Text>
                <Text style={styles.insightSubtitle}>{t('common.learnMore')}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Quick Actions Modal */}
      <Modal
        visible={showQuickActions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuickActions(false)}
      >
        <BlurView intensity={20} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('common.new')}</Text>
              <TouchableOpacity onPress={() => setShowQuickActions(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalAction} onPress={gosavings}>
                <Ionicons name="wallet-outline" size={24} color="#00cc00" />
                <Text style={styles.modalActionText}>{t('common.startSaving')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAction} onPress={goInvest}>
                <Ionicons name="trending-up-outline" size={24} color="#00cc00" />
                <Text style={styles.modalActionText}>{t('common.startInvesting')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Container Styles
  container: {
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(3, 3, 3, 0.1)',
    padding: 12,
    borderRadius: 12,
    width: width / 3.5,
  },
  quickActionText: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'Satoshi',
    marginTop: 8,
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

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#00cc00',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    color: '#00cc00',
  },
  activeTabText: {
    color: '#00cc00',
    fontWeight: '700',
  },

  // Balance Section
  balanceSection: {
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#00cc00',
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
    fontSize: 32,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#00cc00',
    marginBottom: 20,
  },
  Project: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    fontWeight: '400',
    color: '#00cc00',
    marginBottom: 20,
  },

  // Insights Section
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#00cc00',
  },
  insightsScrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  insightsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  insightSubtitle: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#00cc00',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi',
    fontWeight: 'bold',
    color: '#000',
  },
  modalActions: {
    gap: 16,
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  modalActionText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Satoshi',
    color: '#000',
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
});