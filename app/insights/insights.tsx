import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

type IconName = 'trending-up' | 'wallet-outline' | 'shield-checkmark-outline' | 'analytics-outline' | 'arrow-back' | 'arrow-forward' | 'apps-outline';

interface Insight {
  id: number;
  icon: IconName;
  title: string;
  description: string;
  category: string;
  date: string;
  image?: any;
  trend?: 'up' | 'down' | 'neutral';
  value?: string;
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
      trend: 'up',
      value: '+15%',
    },
    {
      id: 2,
      icon: 'wallet-outline',
      title: t('common.insight2'),
      description: t('common.insight2Desc'),
      category: 'Savings',
      date: '5h ago',
      image: require('../../assets/home/banner2.png'),
      trend: 'up',
      value: '+8%',
    },
    {
      id: 3,
      icon: 'shield-checkmark-outline',
      title: t('common.insight3'),
      description: t('common.insight3Desc'),
      category: 'Security',
      date: '1d ago',
      image: require('../../assets/home/banner3.png'),
      trend: 'neutral',
    },
    {
      id: 4,
      icon: 'analytics-outline',
      title: t('common.insight4'),
      description: t('common.insight4Desc'),
      category: 'Analytics',
      date: '2d ago',
      image: require('../../assets/home/banner1.png'),
      trend: 'up',
      value: '+12%',
    },
  ];

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return '#4CAF50';
      case 'down':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('common.insights')}</Text>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="notifications-outline" size={24} color="#1976D2" />
        </TouchableOpacity>
      </View>
      <View style={styles.categoriesWrapper}>
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
                size={20} 
                color={activeCategory === category.id ? '#FFFFFF' : '#1976D2'} 
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
      </View>
      <ScrollView style={styles.insightsList} contentContainerStyle={styles.insightsListContent}>
        {insights.map((insight) => (
          <TouchableOpacity key={insight.id} style={styles.insightCard}>
            <Image source={insight.image} style={styles.insightImage} />
            <View style={styles.insightContent}>
              <View style={styles.insightHeader}>
                <View style={[styles.insightIconContainer, { backgroundColor: `${getTrendColor(insight.trend!)}15` }]}>
                  <Ionicons name={insight.icon} size={20} color={getTrendColor(insight.trend!)} />
                </View>
                <View style={styles.insightInfo}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <View style={styles.insightMeta}>
                    <View style={[styles.categoryTag, { backgroundColor: `${getTrendColor(insight.trend!)}15` }]}>
                      <Text style={[styles.categoryText, { color: getTrendColor(insight.trend!) }]}>
                        {insight.category}
                      </Text>
                    </View>
                    <Text style={styles.insightDate}>{insight.date}</Text>
                  </View>
                </View>
                {insight.value && (
                  <View style={[styles.trendValue, { backgroundColor: `${getTrendColor(insight.trend!)}15` }]}>
                    <Text style={[styles.trendValueText, { color: getTrendColor(insight.trend!) }]}>
                      {insight.value}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.insightDescription}>{insight.description}</Text>
              <TouchableOpacity style={styles.learnMoreButton}>
                <Text style={styles.learnMoreText}>{t('common.learnMore')}</Text>
                <Ionicons name="arrow-forward" size={16} color="#1976D2" />
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    color: '#1976D2',
  },
  categoriesWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 12,
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    gap: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  activeCategory: {
    backgroundColor: '#1976D2',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#1976D2',
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  insightsList: {
    flex: 1,
  },
  insightsListContent: {
    padding: 20,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightInfo: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
  },
  insightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  insightDate: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#666666',
  },
  insightDescription: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: '#1976D2',
    fontWeight: '600',
    marginRight: 6,
  },
  trendValue: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendValueText: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    fontWeight: '600',
  },
}); 