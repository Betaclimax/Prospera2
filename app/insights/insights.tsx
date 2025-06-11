import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type IconName = 'trending-up' | 'wallet-outline' | 'shield-checkmark-outline' | 'analytics-outline' | 'arrow-back' | 'arrow-forward' | 'apps-outline';

interface Insight {
  id: number;
  icon: IconName;
  title: string;
  description: string;
  category: string;
  date: string;
  image?: any;
}

export default function Insights() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    { id: 'All', name: 'All', icon: 'apps-outline' },
    { id: 'Market', name: 'Market', icon: 'trending-up' },
    { id: 'Savings', name: 'Savings', icon: 'wallet-outline' },
    { id: 'Security', name: 'Security', icon: 'shield-checkmark-outline' },
    { id: 'Analytics', name: 'Analytics', icon: 'analytics-outline' },
  ];

  const insights: Insight[] = [
    {
      id: 1,
      icon: 'trending-up',
      title: t('common.insight1'),
      description: t('common.insight1Desc'),
      category: 'Market',
      date: '2h ago',
      image: require('../../assets/home/banner1.png'),
    },
    {
      id: 2,
      icon: 'wallet-outline',
      title: t('common.insight2'),
      description: t('common.insight2Desc'),
      category: 'Savings',
      date: '5h ago',
      image: require('../../assets/home/banner2.png'),
    },
    {
      id: 3,
      icon: 'shield-checkmark-outline',
      title: t('common.insight3'),
      description: t('common.insight3Desc'),
      category: 'Security',
      date: '1d ago',
      image: require('../../assets/home/banner3.png'),
    },
    {
      id: 4,
      icon: 'analytics-outline',
      title: t('common.insight4'),
      description: t('common.insight4Desc'),
      category: 'Analytics',
      date: '2d ago',
      image: require('../../assets/home/banner1.png'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('common.insights')}</Text>
        <View style={styles.backButton} />
      </LinearGradient>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              activeCategory === category.id && styles.activeCategory
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Ionicons 
              name={category.icon as IconName} 
              size={16} 
              color={activeCategory === category.id ? '#000000' : '#FFFFFF'} 
            />
            <Text style={[
              styles.categoryText,
              activeCategory === category.id && styles.activeCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Insights List */}
      <ScrollView style={styles.insightsList} contentContainerStyle={styles.insightsListContent}>
        {insights.map((insight) => (
          <TouchableOpacity key={insight.id} style={styles.insightCard}>
            <Image source={insight.image} style={styles.insightImage} />
            <View style={styles.insightContent}>
              <View style={styles.insightHeader}>
                <View style={styles.insightIconContainer}>
                  <Ionicons name={insight.icon} size={20} color="#00cc00" />
                </View>
                <View style={styles.insightInfo}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <View style={styles.insightMeta}>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryText}>{insight.category}</Text>
                    </View>
                    <Text style={styles.insightDate}>{insight.date}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.insightDescription}>{insight.description}</Text>
              <TouchableOpacity style={styles.learnMoreButton}>
                <Text style={styles.learnMoreText}>{t('common.learnMore')}</Text>
                <Ionicons name="arrow-forward" size={16} color="#00cc00" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoriesContainer: {
    backgroundColor: '#000000',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  activeCategory: {
    backgroundColor: '#00cc00',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#FFFFFF',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#000000',
    fontWeight: '700',
  },
  insightsList: {
    flex: 1,
  },
  insightsListContent: {
    padding: 20,
  },
  insightCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  insightImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  insightContent: {
    padding: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 204, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightInfo: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  insightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: 'rgba(0, 204, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  insightDate: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#FFFFFF',
    opacity: 0.6,
  },
  insightDescription: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 16,
    lineHeight: 20,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 204, 0, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#00cc00',
    fontWeight: '600',
    marginRight: 6,
  },
}); 