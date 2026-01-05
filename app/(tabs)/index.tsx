import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Image } from 'expo-image';
import { useAuth } from '@/lib/auth-provider';

export default function HomeScreen() {
  const { isPending, error, data: result } = useQuery({
    queryKey: ['plantList'],
    queryFn: async () => (await api.get('/plant')).data.data,
    refetchOnWindowFocus: false,
    // staleTime: 1000 * 60 * 5,
  });
  console.log(result);

  const router = useRouter();
  const { user } = useAuth();

  // Hitung jumlah tanaman yang butuh perhatian (contoh)
  const needsAttentionCount = 2;

  const renderPlantItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push({
          pathname: '/detail/[id]',
          params: { id: item.id }
        })}
        style={styles.plantCard}
      >
        <Image
          placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
          style={styles.plantImage}
          contentFit="cover"
          source={{ uri: `${process.env.EXPO_PUBLIC_BASE_URL}${item?.imageUrl}` }}
        />
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{item.name}</Text>
          <View style={styles.plantStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{item.plantProgress?.at(-1)?.condition}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCareItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.careCard}>
        <View style={styles.careIcon}>
          <Text style={styles.careIconText}>{item.icon}</Text>
        </View>
        <View style={styles.careContent}>
          <Text style={styles.careTitle}>{item.title}</Text>
          <Text style={styles.careDescription}>{item.description}</Text>
        </View>
      </View>
    );
  };

  // Data contoh untuk Today's Care
  const todaysCare = [
    {
      id: '1',
      icon: '💧',
      title: 'Water your Fiddle Leaf Fig',
      description: 'Monstera Deliciosa needs water'
    },
    {
      id: '2',
      icon: '🌱',
      title: 'Fertilize your Snake Plant',
      description: 'Use a balanced fertilizer'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Fixed/Sticky */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingIcon}>👋</Text>
          <Text style={styles.greeting}>Hello, {user?.fullname || 'Alex'}!</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Stats Cards */}
        {/* <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statLabel}>Total Plants</Text>
            <Text style={styles.statValue}>{result?.length || 0}</Text>
          </View>
          <View style={[styles.statCard, styles.statCardPink]}>
            <Text style={styles.statLabel}>Needs Attention</Text>
            <Text style={styles.statValue}>{needsAttentionCount}</Text>
          </View>
        </View> */}

        {/* Discover Section */}
        <View style={styles.discoverSection}>
          <Image
            placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
            style={styles.discoverImage}
            contentFit="cover"
            source={{ uri: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800' }}
          />
          <View style={styles.discoverContent}>
            <Text style={styles.discoverTitle}>Discover Your Plant</Text>
            <Text style={styles.discoverDescription}>
              Use your camera to identify a plant and get a custom care guide.
            </Text>
            <TouchableOpacity onPress={() => router.replace('/create')} style={styles.identifyButton}>
              <Text style={styles.identifyIcon}>📷</Text>
              <Text style={styles.identifyText}>Identify a New Plant</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Greenhouse */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Greenhouse</Text>
          {result && result.length > 0 ? (
            <FlatList
              data={result}
              renderItem={renderPlantItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.plantList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No plants yet</Text>
            </View>
          )}
        </View>

        {/* Today's Care */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Care</Text>
          {todaysCare.map((item) => (
            <View key={item.id} style={styles.careCard}>
              <View style={styles.careIcon}>
                <Text style={styles.careIconText}>{item.icon}</Text>
              </View>
              <View style={styles.careContent}>
                <Text style={styles.careTitle}>{item.title}</Text>
                <Text style={styles.careDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greetingIcon: {
    fontSize: 20,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  statCardGreen: {
    backgroundColor: '#D4E7D4',
  },
  statCardPink: {
    backgroundColor: '#F5D4D4',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  discoverSection: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  discoverImage: {
    width: '100%',
    height: 160,
  },
  discoverContent: {
    padding: 16,
  },
  discoverTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  discoverDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  identifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8BAF8B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  identifyIcon: {
    fontSize: 16,
  },
  identifyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  plantList: {
    gap: 12,
  },
  plantCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  plantImage: {
    width: '100%',
    height: 140,
  },
  plantInfo: {
    padding: 12,
  },
  plantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  plantStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    textTransform: 'capitalize',
    fontSize: 12,
    color: '#000000ff',
  },
  careCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  careIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  careIconText: {
    fontSize: 20,
  },
  careContent: {
    flex: 1,
  },
  careTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  careDescription: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});