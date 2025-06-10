import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { changeLanguage } from '../constants/i18n';

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = async () => {
    const newLanguage = i18n.language === 'es' ? 'en' : 'es';
    await changeLanguage(newLanguage);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, i18n.language === 'es' && styles.activeOption]}
        onPress={() => {
          if (i18n.language !== 'es') {
            toggleLanguage();
          }
        }}
      >
        <Text style={[styles.optionText, i18n.language === 'es' && styles.activeOptionText]}>
          Español
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, i18n.language === 'en' && styles.activeOption]}
        onPress={() => {
          if (i18n.language !== 'en') {
            toggleLanguage();
          }
        }}
      >
        <Text style={[styles.optionText, i18n.language === 'en' && styles.activeOptionText]}>
          English
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 8,
  },
  option: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeOption: {
    backgroundColor: 'rgba(75, 207, 250, 0.1)',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Satoshi',
  },
  activeOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 