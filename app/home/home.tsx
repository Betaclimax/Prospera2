import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
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
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeSplashIndex, setActiveSplashIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const flatListRef = useRef<FlatList<any>>(null);

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
    router.push('../invest/invest');
  };
  const gosavings = () => {
    router.push('../save/savings');
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
      colors={['#000000', '#404040']}
      style={styles.container}
      start={{ x: 0.1, y: 0.3 }}
      end={{ x: 0.5, y: 0.5 }}
    >
      <ScrollView style={styles.mainContent} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
            <Text style={styles.welcomeText}>
              {t('common.welcome')} {userProfile?.full_name || ''}
            </Text>
            <TouchableOpacity onPress={goProfile}>
              <View style={styles.userIcon}>
                <Text style={styles.userInitial}>{getUserInitials()}</Text>
              </View>
            </TouchableOpacity>
          </View>
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
            <Text style={styles.sectionTitle}>{t('common.totalSaved')}</Text>
            <View style={styles.cardIcons}>
              <Image source={require('../../assets/home/gold.png')} style={styles.cardIcon} />
            </View>
          </View>
          <Text style={styles.balanceAmount}>$2,000</Text>
          <Text style={styles.Project}>{t('common.projectedGrowth')} +10%</Text>
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

        {/* Savings Progress Section */}
        <View style={styles.savingsProgressSection}>
          <View style={styles.progressCard}>
            <Text style={styles.sectionTitle}>{t('common.Week Savings Plan')}</Text>
            <Animated.View style={[styles.progressCircleContainer, {
              shadowOpacity: glowAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.5],
              }),
            }]}>
              <Svg width={140} height={140}>
                <Defs>
                  <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FFB6C1" />
                    <Stop offset="100%" stopColor="#87CEFA" />
                  </SvgLinearGradient>
                </Defs>
                {/* Background Circle */}
                <Circle
                  cx={70}
                  cy={70}
                  r={60}
                  stroke="#E0E0E0"
                  strokeWidth={10}
                  fill="none"
                />
                {/* Progress Circle */}
                <Circle
                  cx={70}
                  cy={70}
                  r={60}
                  stroke="url(#gradient)"
                  strokeWidth={10}
                  fill="none"
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - progressPercentage / 100)}
                  strokeLinecap="round"
                  rotation={-90}
                  origin="70,70"
                />
                {/* Inner Shadow Circle for 3D effect */}
                <Circle
                  cx={70}
                  cy={70}
                  r={55}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={5}
                  opacity={0.8}
                />
              </Svg>
              <View style={styles.progressCircleTextContainer}>
                <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
                <Text style={styles.progressText}>{t('common.week')} {currentWeek} {t('common.of')} {totalWeeks}</Text>
              </View>
            </Animated.View>
          </View>
        </View>
      </ScrollView>

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
    color: '#FFFFFF',
    fontWeight: '700',
  },
  userIcon: {
    padding: 15,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#00cc00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    fontFamily: 'Satoshi',
    fontSize: 19,
    fontWeight: '700',
    color: '#3D3D3D',
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
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  transferButton: {
    flex: 1,
    backgroundColor: '#288D90',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  receiveButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#288D90',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  receiveButtonText: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#288D90',
  },
  savingsProgressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#666666',
    marginTop: 4,
    marginBottom: 12,
  },
  progressCircleContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 5,
  },
  progressCircleTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 24,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#666666',
  },

  // Bottom Menu Bar
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopRightRadius: 28,
    borderTopLeftRadius: 28,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
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