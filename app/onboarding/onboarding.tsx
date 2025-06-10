import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';

export default function Onboarding() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const router = useRouter();
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Draggable LanguageSwitcher state
  const [isDraggable, setIsDraggable] = useState(false);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isDraggable,
      onPanResponderGrant: () => {
       pan.extractOffset();
       pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        setIsDraggable(false);
      },
    })
  ).current;

  const screens = [
    {
      key: 'fixedTermSavings',
      image: require('@/assets/images/handphone.png'),
      imageStyle: { width: 120, height: 290 },
    },
    {
      key: 'guaranteedReturns',
      image: require('@/assets/images/handphone.png'),
      imageStyle: { width: 200, height: 400 },
    },
    {
      key: 'bankLevelSecurity',
      image: require('@/assets/images/handphone.png'),
      imageStyle: { width: 265, height: 510 },
    },
  ];

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentScreen((prev) => (prev === screens.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    if (currentScreen === screens.length - 1) {
      router.push('/login/login');
    } else {
      setCurrentScreen(currentScreen + 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Draggable Language Switcher */}
      <Animated.View
        style={[
          styles.languageSwitcherContainer,
          { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        ]}
      >
        <View
          {...panResponder.panHandlers}
          onTouchStart={() => {
            if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
            longPressTimeout.current = setTimeout(() => setIsDraggable(true), 1000);
          }}
          onTouchEnd={() => {
            if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
            if (!isDraggable) setIsDraggable(false);
          }}
          onTouchMove={() => {
            if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
          }}
        >
          <LanguageSwitcher />
        </View>
      </Animated.View>

      {/* Illustration Container */}
      <LinearGradient
        colors={['#4BCFFA', '#54BAB9']}
        style={styles.illustrationContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 0.7 }}
      >
        <Text style={styles.logoText}>Prospera</Text>
        <Image
          source={screens[currentScreen].image}
          style={[styles.image, screens[currentScreen].imageStyle]}
          resizeMode="contain"
        />
      </LinearGradient>

      {/* Text Container */}
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.titleText, { opacity: fadeAnim }]}>
          {t(`common.${screens[currentScreen].key}.title`)}
        </Animated.Text>
        <Animated.Text style={[styles.subText, { opacity: fadeAnim }]}>
          {t(`common.${screens[currentScreen].key}.description`)}
        </Animated.Text>
      </View>

      {/* Pagination and Button Container */}
      <View style={styles.bottomContainer}>
        <View style={styles.paginationContainer}>
          {screens.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentScreen === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Animated.Text style={[styles.nextButtonText, { opacity: fadeAnim }]}>
            {t('common.next')}
          </Animated.Text>
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
    justifyContent: 'space-between',
  },
  languageSwitcherContainer: {
    position: 'absolute',
    top: 80,
    left: 30,
    zIndex: 10,
  },
  illustrationContainer: {
    borderBottomLeftRadius: 190,
    width: '100%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoText: {
    position: 'absolute',
    top: 40,
    left: 40,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Satoshi',
  },
  image: {
    marginTop: 20,
  },
  textContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  titleText: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Satoshi',
    marginBottom: 10,
  },
  subText: {
    color: '#333333',
    fontSize: 16,
    fontFamily: 'Satoshi',
    lineHeight: 24,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '140%',
    marginBottom: 40,
  },
  paginationContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4BCFFA',
  },
  activeDot: {
    opacity: 1,
  },
  inactiveDot: {
    opacity: 0.3,
  },
  nextButton: {
    backgroundColor: '#4BCFFA',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    elevation: 9,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Satoshi',
  },
});