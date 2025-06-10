import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Payments() {
  const router = useRouter();
  const { t } = useTranslation();

  const goBack = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={['#f2f2f2', '#f2f2f2']}
      style={styles.container}
      start={{ x: 0.1, y: 0.1 }}
      end={{ x: 0.5, y: 0.5 }}
    >
      {/* Background Image */}
      <Image
        source={require('../../assets/home/background3.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Image source={require('../../assets/home/Left Icon.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('common.payments')}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>{t('common.welcomePayments')}</Text>
        <Text style={styles.descriptionText}>{t('common.descriptionPayments')}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.9,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
    marginTop: 30,
  },
  backButton: {
    marginRight: 15,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'Satoshi',
    color: '#000',
  },
  content: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'Satoshi',
    color: '#000',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#666',
    lineHeight: 24,
  },
}); 