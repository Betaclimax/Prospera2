import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, AppState, Dimensions, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  requirements: {
    type: string;
    target: number;
  };
  progress?: number;
  isCompleted?: boolean;
  unlockedAt?: string;
  metadata?: any;
  currentStreak?: number;
  longestStreak?: number;
  totalLogins?: number;
  lastLoginDate?: Date | null;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  requirements: {
    type: string;
    target: number;
  };
  isCompleted?: boolean;
  completedAt?: string;
}

export default function Achievements() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('achievements');
  const [showReward, setShowReward] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const hoverAnim = useRef(new Animated.Value(0)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const tabScaleAnim = useRef(new Animated.Value(1)).current;
  const challengeHoverAnims = useRef<Animated.Value[]>([]).current;
  const startButtonScaleAnims = useRef<Animated.Value[]>([]).current;

  const cardAnimations = useRef<Animated.Value[]>([]).current;
  useEffect(() => {
    cardAnimations.length = 0; 
    achievements.forEach(() => {
      const anim = new Animated.Value(0);
      cardAnimations.push(anim);
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        delay: cardAnimations.length * 100, 
      }).start();
    });
  }, [achievements]);

  useEffect(() => {
    challengeHoverAnims.length = 0;
    startButtonScaleAnims.length = 0;
    dailyChallenges.forEach(() => {
      challengeHoverAnims.push(new Animated.Value(0));
      startButtonScaleAnims.push(new Animated.Value(1));
    });
  }, [dailyChallenges]);

  useEffect(() => {
    fetchAchievements();
    fetchDailyChallenges();
    setupAnimations();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        fetchAchievements();
        fetchDailyChallenges();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const setupAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  };

  const fetchAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, skipping achievement fetch');
        return;
      }
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*');

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        throw achievementsError;
      }

      const { data: loginRecords, error: loginError } = await supabase
        .from('user_logins')
        .select('*')
        .eq('user_id', user.id)
        .order('login_date', { ascending: true }); 
      if (loginError) {
        console.error('Error fetching login records:', loginError);
        throw loginError;
      }

      let currentStreak = 0;
      let longestStreak = 0;
      let totalLogins = loginRecords?.length || 0;
      let consecutiveDays = 0;
      let lastLoginDate = null;

      if (loginRecords && loginRecords.length > 0) {
        for (let i = 0; i < loginRecords.length; i++) {
          const currentDate = new Date(loginRecords[i].login_date);
          const nextDate = i < loginRecords.length - 1 ? new Date(loginRecords[i + 1].login_date) : null;
          
          if (nextDate) {
            const dayDiff = Math.floor((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff === 1) {
              consecutiveDays++;
              currentStreak = Math.max(currentStreak, consecutiveDays);
            } else {
              consecutiveDays = 0;
            }
          }
        }
        
        longestStreak = currentStreak;
        lastLoginDate = new Date(loginRecords[loginRecords.length - 1].login_date);
      }

      const consistencyKing = allAchievements?.find(a => a.title === 'Consistency King');
      
      if (consistencyKing) {
        const { error: updateError } = await supabase
          .from('user_achievements')
          .upsert({
            user_id: user.id,
            achievement_id: consistencyKing.id,
            progress: currentStreak, 
            is_completed: currentStreak >= consistencyKing.requirements.target
          }, {
            onConflict: 'user_id,achievement_id'
          });

        if (updateError) {
          console.error('Error updating progress:', updateError);
        }
      }

      const { data: updatedProgress, error: updatedError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (updatedError) {
        console.error('Error fetching updated progress:', updatedError);
      }

      const achievementsWithProgress = allAchievements.map(achievement => {
        const progress = updatedProgress?.find(p => p.achievement_id === achievement.id);
        const isConsistencyKing = achievement.title === 'Consistency King';
        
        return {
          ...achievement,
          progress: progress?.progress || 0,
          isCompleted: progress?.is_completed || false,
          unlockedAt: progress?.unlocked_at,
          currentStreak: isConsistencyKing ? currentStreak : 0,
          longestStreak: isConsistencyKing ? longestStreak : 0,
          totalLogins: isConsistencyKing ? totalLogins : 0,
          lastLoginDate: isConsistencyKing ? lastLoginDate : null
        };
      });

      setAchievements(achievementsWithProgress);
    } catch (error) {
      console.error('Error in fetchAchievements:', error);
    } finally {
      setLoading(false);
    }
  };
  const recordLogin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data: existingLogin } = await supabase
        .from('user_logins')
        .select('*')
        .eq('user_id', user.id)
        .gte('login_date', today)
        .lt('login_date', new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (!existingLogin) {
        const { error } = await supabase
          .from('user_logins')
          .insert({
            user_id: user.id,
            login_date: new Date().toISOString()
          });

        if (error) {
          console.error('Error recording login:', error);
        }
      }
    } catch (error) {
      console.error('Error in recordLogin:', error);
    }
  };

  useEffect(() => {
    recordLogin(); 
    fetchAchievements();
    fetchDailyChallenges();
    setupAnimations();
  }, []);

  const fetchDailyChallenges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: challenges, error: challengesError } = await supabase
        .from('daily_challenges')
        .select('*')
        .gte('created_at', new Date().toISOString().split('T')[0]);

      if (challengesError) throw challengesError;

      const { data: userProgress, error: progressError } = await supabase
        .from('user_daily_challenges')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date().toISOString().split('T')[0]);

      if (progressError) throw progressError;

      const challengesWithProgress = challenges.map(challenge => {
        const progress = userProgress.find(p => p.challenge_id === challenge.id);
        return {
          ...challenge,
          isCompleted: progress?.is_completed || false,
          completedAt: progress?.completed_at
        };
      });

      setDailyChallenges(challengesWithProgress);
    } catch (error) {
      console.error('Error fetching daily challenges:', error);
    }
  };

  useEffect(() => {
    if (showReward) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      rotateAnim.setValue(0);
      confettiAnim.setValue(0);
    }
  }, [showReward]);

  useEffect(() => {
    Animated.spring(tabIndicatorAnim, {
      toValue: selectedTab === 'achievements' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [selectedTab]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    if (achievement.isCompleted) {
      setShowReward(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const renderAchievementCard = (achievement: Achievement, index: number) => {
    const progress = achievement.progress || 0;
    const target = achievement.requirements.target;
    const progressPercentage = Math.min((progress / target) * 100, 100);

    if (!cardAnimations[index]) {
      cardAnimations[index] = new Animated.Value(0);
      Animated.timing(cardAnimations[index], {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        delay: index * 100,
      }).start();
    }

    const isConsistencyKing = achievement.title === 'Consistency King';
    const streakInfo = isConsistencyKing ? (
      <View style={styles.streakInfo}>
        <View style={styles.streakItem}>
          <Ionicons name="flame" size={16} color="#FFD700" />
          <Text style={styles.streakText}>
            {achievement.currentStreak || 0} {t('common.days')}
          </Text>
        </View>
        <View style={styles.streakItem}>
          <Ionicons name="trophy" size={16} color="#FFD700" />
          <Text style={styles.streakText}>
            {achievement.longestStreak || 0} {t('common.days')}
          </Text>
        </View>
      </View>
    ) : null;

    return (
      <Animated.View
        key={achievement.id}
        style={[
          styles.achievementCard,
          achievement.isCompleted && styles.completedCard,
          {
            transform: [
              { scale: cardAnimations[index] },
              { translateY: cardAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })},
            ],
            opacity: cardAnimations[index],
          },
        ]}
      >
        <LinearGradient
          colors={achievement.isCompleted ? ['#4CAF50', '#2E7D32'] : ['#2196F3', '#1976D2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.achievementContent}>
            <View style={styles.achievementHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name={achievement.icon as any} size={24} color="#FFFFFF" />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
            </View>
            
            {streakInfo}
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: `${progressPercentage}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {progress}/{target}
              </Text>
            </View>

            <View style={styles.rewardContainer}>
              <View style={styles.pointsContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rewardText}>
                  {achievement.points} {t('common.points')}
                </Text>
              </View>
              {achievement.isCompleted && (
                <View style={styles.completedContainer}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.completedText}>
                    {t('common.completed')} {new Date(achievement.unlockedAt!).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderDailyChallenge = (challenge: DailyChallenge, index: number) => {
    return (
      <Animated.View
        key={challenge.id}
        style={[
          styles.challengeCard,
          challenge.isCompleted && styles.completedChallenge,
          {
            transform: [
              { scale: challengeHoverAnims[index] },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={challenge.isCompleted ? ['#4CAF50', '#2E7D32'] : ['#FF9800', '#F57C00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.challengeGradient}
        >
          <View style={styles.challengeContent}>
            <View style={styles.challengeHeader}>
              <View style={styles.challengeTitleContainer}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <View style={styles.pointsContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.challengePoints}>{challenge.points} {t('common.points')}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
            
            {challenge.isCompleted ? (
              <View style={styles.completedContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                <Text style={styles.completedText}>
                  {t('common.completed')} {new Date(challenge.completedAt!).toLocaleDateString()}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.startButton,
                  {
                    transform: [
                      { scale: startButtonScaleAnims[index] },
                    ],
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.startButtonText}>{t('common.start')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {!loading ? (
        <>
          <LinearGradient
            colors={['#E3F2FD', '#BBDEFB']}
            style={styles.header}
          >
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#1976D2" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('common.achievements')}</Text>
          </LinearGradient>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'achievements' && styles.activeTab]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedTab('achievements');
              }}
            >
              <Animated.View style={[
                styles.tabContent,
                {
                  transform: [
                    { scale: selectedTab === 'achievements' ? tabScaleAnim : 1 },
                  ],
                },
              ]}>
                <Text style={[styles.tabText, selectedTab === 'achievements' && styles.activeTabText]}>
                  {t('common.achievements')}
                </Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'challenges' && styles.activeTab]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedTab('challenges');
              }}
            >
              <Animated.View style={[
                styles.tabContent,
                {
                  transform: [
                    { scale: selectedTab === 'challenges' ? tabScaleAnim : 1 },
                  ],
                },
              ]}>
                <Text style={[styles.tabText, selectedTab === 'challenges' && styles.activeTabText]}>
                  {t('common.dailyChallenges')}
                </Text>
              </Animated.View>
            </TouchableOpacity>
            <Animated.View 
              style={[
                styles.tabIndicator,
                {
                  transform: [{
                    translateX: tabIndicatorAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, width / 2],
                    }),
                  }],
                },
              ]} 
            />
          </View>

          <ScrollView style={styles.content}>
            {selectedTab === 'achievements' ? (
              <View style={styles.achievementsContainer}>
                {achievements.map((achievement, index) => renderAchievementCard(achievement, index))}
              </View>
            ) : (
              <View style={styles.challengesContainer}>
                {dailyChallenges.map((challenge, index) => renderDailyChallenge(challenge, index))}
              </View>
            )}
          </ScrollView>

          {showReward && selectedAchievement && (
            <View style={styles.rewardModal}>
              <Animated.View
                style={[
                  styles.rewardContent,
                  {
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <View style={styles.celebrationContainer}>
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="trophy" size={64} color="#FFD700" />
                  </Animated.View>
                  <View style={styles.confettiContainer}>
                    {[...Array(30)].map((_, i) => (
                      <Animated.View
                        key={i}
                        style={[
                          styles.confetti,
                          {
                            backgroundColor: ['#FFD700', '#FF6B6B', '#4CAF50', '#2196F3'][i % 4],
                            transform: [
                              { rotate: `${Math.random() * 360}deg` },
                              { translateX: Math.random() * 200 - 100 },
                              { translateY: Math.random() * 200 - 100 },
                              {
                                scale: confettiAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 1],
                                }),
                              },
                            ],
                            opacity: confettiAnim,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.rewardTitle}>{t('common.achievementUnlocked')}</Text>
                <Text style={styles.rewardAchievement}>{selectedAchievement.title}</Text>
                <Text style={styles.rewardPoints}>+{selectedAchievement.points} {t('common.points')}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowReward(false);
                  }}
                >
                  <Text style={styles.closeButtonText}>{t('common.awesome')}</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
        </>
      ) : (
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#1976D2" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    color: '#1976D2',
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '600',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#1976D2',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: width / 2,
    height: 3,
    backgroundColor: '#1976D2',
    borderRadius: 1.5,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    color: '#666',
  },
  activeTabText: {
    color: '#1976D2',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  achievementsContainer: {
    gap: 16,
  },
  achievementCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  completedCard: {
    opacity: 0.7,
  },
  cardGradient: {
    padding: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#FFFFFF',
    minWidth: 45,
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  challengesContainer: {
    gap: 16,
  },
  challengeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  completedChallenge: {
    opacity: 0.7,
  },
  challengeGradient: {
    padding: 16,
  },
  challengeContent: {
    flex: 1,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  challengeTitleContainer: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  challengePoints: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  challengeDescription: {
    fontSize: 14,
    fontFamily: 'Satoshi',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  startButtonText: {
    color: '#1976D2',
    fontSize: 14,
    fontFamily: 'Satoshi',
    fontWeight: '600',
  },
  rewardModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardContent: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    width: '80%',
    borderRadius: 24,
  },
  celebrationContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  confettiContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: '50%',
    left: '50%',
  },
  rewardTitle: {
    fontSize: 24,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 8,
  },
  rewardAchievement: {
    fontSize: 18,
    fontFamily: 'Satoshi',
    color: '#666',
    marginBottom: 16,
  },
  rewardPoints: {
    fontSize: 32,
    fontFamily: 'Satoshi',
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Satoshi',
    fontWeight: '600',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  streakText: {
    fontSize: 12,
    fontFamily: 'Satoshi',
    color: '#FFFFFF',
    marginLeft: 4,
  },
}); 