import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('../onboarding/onboarding'); 
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/home/logo.png')} 
        style={styles.icon}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: '80%',
    height: '80%',
    marginBottom: 20,
  },
});