import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Link, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

import { Image } from 'expo-image';
import { useAuth } from '@/lib/auth-provider';



export default function HomeScreen() {

  // const [result, setResult] = useState()

  const { isPending, error, data: result } = useQuery({
    queryKey: ['plantList'],
    queryFn: async () => (await api.get('/plant')).data.data,
    refetchOnWindowFocus: false, // ga refetch tiap window focus
    staleTime: 1000 * 60 * 5, // 5 menit, data dianggap fresh
  });

  // console.log(result);


  const router = useRouter()

  const { user } = useAuth()

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push({
          pathname: '/detail/[id]',
          params: { id: item.id }
        })}
        style={{
          // backgroundColor: "#202020ff",
          borderRadius: 8,
          overflow: "hidden",

          width: '48%', // biar bagi ruang rata antar kolom
          marginBottom: 16,
        }}
      >
        <Image
          placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
          style={{ height: 150, borderRadius: 8 }}
          contentFit="cover"
          source={{ uri: `${process.env.EXPO_PUBLIC_BASE_URL}${item?.imageUrl}` }}
        />
        <View style={{ paddingVertical: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: "600" }}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };



  return (


    <SafeAreaView style={{ gap: 8, flexDirection: 'column' }}>
      {result && (

        <FlatList
          data={result}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            // kasih jarak horizontal antar kolom
            marginBottom: 16, // kasih jarak antar baris
          }}
          contentContainerStyle={{
            // paddingBottom: 40,
            // paddingTop: 16,
            paddingHorizontal: 16
          }}
          numColumns={2} // 👉 ini penting

          stickyHeaderIndices={[0]} // 👈 header index ke-0 akan nempel
          ListHeaderComponent={
            <View style={{ paddingVertical: 16 }}>
              <Text style={{ fontSize: 18 }}>
                Welcome back! {user?.fullname}
              </Text>
            </View>
          }
        />

      )}
    </SafeAreaView>


  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
