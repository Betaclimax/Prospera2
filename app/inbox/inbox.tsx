import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

export default function Inbox() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('Notifications');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [selectedBackground, setSelectedBackground] = useState(0);

  useEffect(() => {
    loadSavedBackground();
  }, []);

  const loadSavedBackground = async () => {
    try {
      const savedIndex = await AsyncStorage.getItem('background-index');
      if (savedIndex !== null) {
        const index = parseInt(savedIndex);
        setSelectedBackground(index);
      }
    } catch (error) {
      console.error('Error loading background:', error);
    }
  };

  const goHome = () => {
    router.push('../home/home');
  };
  const goInvest = () => {
    router.push('../invest/invest');
  };
  const goSavings = () => {
    router.push('../save/savings')
  }
  const goProfile = () => {
    router.push('../profile/profile')
  }
  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImages[selectedBackground]}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
          <ScrollView style={styles.mainContent} contentContainerStyle={styles.scrollContent}>
            <View style={styles.welcomeSection}>
              <View style={styles.welcomeHeader}>
                <View style={styles.welcomeContent}>
                  <Text style={styles.welcomeText}>{t('common.inbox')}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.tabs, styles.fullSpaceBlock]}>
              <TouchableOpacity
                style={[styles.tab, styles.tabBorder, activeTab === 'Notifications' && styles.activeTab]}
                onPress={() => setActiveTab('Notifications')}
              >
                <Text style={[styles.label, styles.labelTypo, activeTab === 'Notifications' && styles.activeLabel]}>
                  {t('common.notifications')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab1, styles.tabBorder, activeTab === 'Promotions' && styles.activeTab]}
                onPress={() => setActiveTab('Promotions')}
              >
                <Text style={[styles.label1, styles.labelTypo, activeTab === 'Promotions' && styles.activeLabel]}>
                  {t('common.promotions')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.contentContainer}>
              {activeTab === 'Notifications' ? (
                <Text style={styles.placeholderText}>
                  {t('common.No new information is available at this time.')}
                </Text>
              ) : (
                <Text style={styles.placeholderText}>
                  {t('common.There are no current offers.')}
                </Text>
              )}
            </View>
            <View style={{ height: 120 }} />
          </ScrollView>
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
            <View style={styles.investButtonWrapper}>
              <TouchableOpacity style={styles.investButton} onPress={goSavings}>
                <Image source={require('../../assets/home/save.png')} style={{ width: 32, height: 32 }} />
                <Animated.Text style={[styles.investText, { opacity: fadeAnim }]}>
                  {t('common.save')}
                </Animated.Text>
              </TouchableOpacity>
            </View>
            <View style={styles.menuPartRight}>
              <TouchableOpacity style={styles.menuItem}>
                <Image source={require('../../assets/home/bell2.png')} style={{ width: 19, height: 24 }} />
                <Animated.Text style={[styles.menuText, { opacity: fadeAnim }]}>
                  {t('common.inbox')}
                </Animated.Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={goProfile}>
                <Image source={require('../../assets/home/profile2.png')} style={{ width: 19, height: 24 }} />
                <Animated.Text style={[styles.menuText, { opacity: fadeAnim }]}>
                  {t('common.profile')}
                </Animated.Text>
              </TouchableOpacity>
            </View>
          </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeContent: {
    position: 'relative',
    zIndex: 1,
  },
  welcomeText: {
    fontSize: 30,
    fontFamily: 'Satoshi',
    color: '#000',
    marginTop: 20,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    paddingLeft: 20,
  },
  fullSpaceBlock: {
    paddingHorizontal: 0,
    width: '100%',
  },
  tab: {
    borderColor: '#FFF',
    paddingBottom: 5,
    marginRight: 20,
  },
  tabBorder: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    justifyContent: 'center',
    borderTopEndRadius: 0,
    borderTopLeftRadius: 0,
    alignItems: 'center',
    flexDirection: 'row',
    borderStyle: 'solid',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: '#FFF',
  },
  labelTypo: {
    lineHeight: 22.4,
    fontSize: 16,
    fontStyle: 'normal',
    textAlign: 'left',
    fontFamily: 'Satoshi',
    fontWeight: '400',
  },
  label: {
    color: '#FFF',
  },
  label1: {
    color: '#FFF',
  },
  activeLabel: {
    color: '#000',
  },
  tab1: {
    borderBlockColor: 'transparent',
    paddingBottom: 5,
  },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    fontWeight: '400',
    color: '#FFF',
    lineHeight: 20,
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
  gradient: {
    flex: 1,
  },
});