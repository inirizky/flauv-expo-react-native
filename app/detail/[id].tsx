import { TouchableOpacity, StyleSheet, View, Linking, ScrollView, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign, Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Image } from 'expo-image';
import { api } from '@/lib/api';
import { useCallback, useRef, useState } from 'react';
import { Drawer } from '@/components/ui/drawer';
import { Button, Dialog, Portal, Text, } from 'react-native-paper';
import { useResult } from '@/stores/useResult';

export default function DetailScreen() {

	const { id } = useLocalSearchParams();
	const [isSheetOpen, setIsSheetOpen] = useState(false)
	const [visible, setVisible] = useState(false);
	const { setResult } = useResult()
	const drawer = useRef(null)
	// callbacks
	const handleSheetChanges = useCallback((index: number) => {
		console.log('handleSheetChanges', index);
		setIsSheetOpen(index > -1);
	}, []);

	const openSheet = () => {
		drawer.current?.expand()
		setIsSheetOpen(!isSheetOpen)
	}
	const queryClient = useQueryClient()

	const router = useRouter();
	const { data } = useQuery({
		queryKey: ['detailPlant', id],
		queryFn: async () => (await api.get(`/plant/${id}`
		)).data.data,
		// staleTime: 1000 * 60 * 5,
		enabled: !!id

	});
	// const { data: plantProgress } = useQuery({
	// 	queryKey: ['plantProgress', id],
	// 	queryFn: async () => (await api.get(`/plant-progress/${id}`
	// 	)).data.data,
	// 	enabled: !!id
	// });

	const mutation = useMutation({
		mutationFn: (id) => {
			return api.delete(`/plant/${id}`)
		},
		onSuccess: async () => {
			queryClient.invalidateQueries({ queryKey: ['plantList'] });
			router.back()
		},
	})

	console.log(data);


	// PERUBAHAN: Fungsi pembantu untuk menentukan style badge berdasarkan kondisi
	const getConditionStyle = (condition: string) => {
		switch (condition) {
			case 'healthy':
				return { badge: styles.badgeHealthy, text: styles.textHealthy };
			case 'wilted':
			case 'overwatered':
			case 'underwatered':
			case 'yellowing':
				return { badge: styles.badgeWaterIssue, text: styles.textWaterIssue };
			case 'pest detected':
			case 'fungal infection':
				return { badge: styles.badgeInfestation, text: styles.textInfestation };
			case 'sunburnt':
				return { badge: styles.badgeSunburnt, text: styles.textSunburnt };
			default:
				return { badge: styles.badgeDefault, text: styles.textDefault };
		}
	};

	return (
		<View style={styles.container}>
			<ScrollView style={{ marginBottom: 90 }}>
				<View style={{ width: '100%', height: 500, overflow: 'hidden' }}>
					<Image
						source={{ uri: `${process.env.EXPO_PUBLIC_BASE_URL}${data?.imageUrl}` }}
						style={{ width: '100%', height: '100%' }}
					/>
				</View>

				<View style={{ padding: 16, gap: 16 }}>
					<View style={{ width: '80%', gap: 4 }}>
						<Text variant='headlineLarge' style={styles.name} >{data?.name}</Text>
					</View>

					{/* AMAN */}
					<View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
						<View style={{ backgroundColor: '#e7fbe4ff', paddingVertical: 8, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center', gap: 8 }}>
							<Ionicons name="water" size={24} />
							<Text variant='labelSmall' style={{ fontSize: 12, color: 'black' }}>{data?.water_frequency} Days</Text>
						</View>
						<View style={{ backgroundColor: '#e7fbe4ff', paddingVertical: 8, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' }}>
							<Ionicons name="sunny" size={24} />
							<Text variant='labelSmall' style={{ fontSize: 12, color: 'black' }}>{data?.sunlight}</Text>
						</View>
						<View style={{ backgroundColor: '#e7fbe4ff', paddingVertical: 8, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' }}>
							<Ionicons name="moon" size={24} />
							<Text variant='labelSmall' style={{ fontSize: 12, color: 'black' }}>{data?.soilType} </Text>
						</View>
					</View>

					{data?.care_instructions && (
						<View style={styles.careInstructionContainer}>
							<Text style={styles.careInstructionTitle}>Care Instructions:</Text>
							{data?.care_instructions.split('. ').filter(Boolean).map((i, index) => (
								<Text style={styles.careInstructionText} key={index}>{index + 1}. {i}.</Text>
							))}
						</View>
					)}

					<View style={{ gap: 8 }}>
						<View>
							<Text style={styles.careInstructionTitle}>Progress Plant</Text>
						</View>
						{data?.plantProgress?.map((item: any, index: number) => {
							// PERUBAHAN: Panggil fungsi pembantu untuk mendapatkan style
							const { badge: badgeStyle, text: textStyle } = getConditionStyle(item?.condition);

							return (
								<View key={index} style={styles.careInstructionContainer}>
									<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
										<View style={{ gap: 4, alignItems: 'flex-start' }}>
											<Text style={{ color: 'black', fontSize: 12 }}>{new Date(item?.createdAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</Text>
											{item.notes && <Text style={{ fontSize: 14, fontWeight: "600", color: 'black' }}>{item.notes}</Text>}
											<View style={{ flexDirection: 'row', gap: 8 }}>
												<View style={{ flexDirection: 'row', alignItems: 'center' }}>
													<MaterialCommunityIcons name="flower" size={16} color="black" />
													<Text style={{ fontSize: 12, fontWeight: "600", color: 'black' }}>{item.growthStage}</Text>
												</View>
												<View style={{ flexDirection: 'row', alignItems: 'center' }}>
													<MaterialCommunityIcons name="flower" size={16} color="black" />
													<Text style={{ fontSize: 12, fontWeight: "600", color: 'black' }}>{item.progressType}</Text>
												</View>
											</View>
										</View>

										<View>
											{/* PERUBAHAN: Terapkan style yang sudah dipilih */}
											<View style={[styles.badge, badgeStyle]}>
												<Text style={[styles.textDefault, textStyle]}>
													{item?.condition}
												</Text>
											</View>
										</View>
									</View>
								</View>
							)
						})}
					</View>
				</View>
			</ScrollView>

			<View style={{ position: 'absolute', top: 40, left: 20, right: 20, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
				<TouchableOpacity style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 20 }} onPress={() => router.back()} activeOpacity={0.7}>
					<Ionicons name="arrow-back" size={24} color="white" />
				</TouchableOpacity>
				<TouchableOpacity style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 20 }} onPress={openSheet} activeOpacity={0.7}>
					<Ionicons name="options" size={24} color="white" />
				</TouchableOpacity>
			</View>

			<View style={styles.saveButtonFixedContainer}>
				<TouchableOpacity style={styles.saveButton} onPress={() => { setResult({ ...data }); router.push({ pathname: '/add-progress' }) }} activeOpacity={0.8}>
					<Text style={styles.saveButtonText}>Add Progress</Text>
				</TouchableOpacity>
			</View>

			<Portal>
				<Dialog visible={visible} onDismiss={() => setVisible(!visible)}>
					<Dialog.Content><Text>Are you sure wanna delete {data?.name} </Text></Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setVisible(!visible)}>Cancel</Button>
						<Button onPress={() => mutation.mutate(data?.id)}>Delete</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
			<Drawer containerStyle={{ height: '100%', justifyContent: 'center', alignItems: 'center' }} ref={drawer} onChange={handleSheetChanges} snapPoints={['20%']}>
				<View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, gap: 24 }}>
					<Text style={{ fontSize: 16, fontWeight: '700', color: 'black' }}>Action</Text>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
						<Button mode='contained-tonal' onPress={() => router.push({ pathname: '/edit/[id]', params: { id: data?.id } })} style={{ borderRadius: 1000 }} ><Ionicons name="pencil" size={24} color="white" />Edit</Button>
						<Button mode='contained-tonal' onPress={() => setVisible(true)} ><Ionicons name="trash" size={24} color="white" />Delete</Button>
					</View>
				</View>
			</Drawer>
		</View>
	);
}

const styles = StyleSheet.create({
	// --- Style Badge yang Diperbarui ---
	badge: {
		paddingHorizontal: 24,
		paddingVertical: 6,
		borderRadius: 12,
	},
	// Sehat
	badgeHealthy: {
		backgroundColor: '#4ade80', // Hijau
	},
	textHealthy: {
		color: '#14532d', // Hijau Tua
	},
	// Masalah Air (Layu, Kekurangan/Kelebihan Air, Menguning)
	badgeWaterIssue: {
		backgroundColor: '#fbbf24', // Kuning/Amber
	},
	textWaterIssue: {
		color: '#78350f', // Coklat Tua
	},
	// Serangan (Hama, Jamur)
	badgeInfestation: {
		backgroundColor: '#f87171', // Merah
	},
	textInfestation: {
		color: '#7f1d1d', // Merah Tua
	},
	// Terbakar Matahari
	badgeSunburnt: {
		backgroundColor: '#fb923c', // Oranye
	},
	textSunburnt: {
		color: '#7c2d12', // Oranye Tua
	},
	// Default jika kondisi tidak dikenali
	badgeDefault: {
		backgroundColor: '#e5e5e5', // Abu-abu
	},
	textDefault: {
		color: '#525252', // Abu-abu Tua
		fontWeight: '600',
		fontSize: 12,
		textTransform: 'capitalize'
	},
	// --- Style Lainnya ---
	container: { flex: 1 },
	name: { color: "black", fontSize: 24, fontWeight: "700" },
	careInstructionContainer: {
		marginTop: 8, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#379f20ff',
	},
	careInstructionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333' },
	careInstructionText: { marginBottom: 8, fontSize: 16, lineHeight: 24, color: '#555' },
	saveButtonFixedContainer: {
		position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 16, flexDirection: 'row', gap: 8, paddingVertical: 16, backgroundColor: "white", borderTopWidth: 1, borderTopColor: '#eee',
	},
	saveButton: { flex: 1, backgroundColor: "#379f20ff", paddingVertical: 16, borderRadius: 8, justifyContent: "center", alignItems: "center", },
	saveButtonText: { color: "white", fontWeight: "bold", fontSize: 16, },
});