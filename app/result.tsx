import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react"; // Hapus useRef karena tidak digunakan untuk Drawer lagi
import * as SecureStore from "expo-secure-store";
import { useResult } from "@/stores/useResult";
import { useQueryClient } from "@tanstack/react-query";
import DropDownPicker from 'react-native-dropdown-picker';
import { TextInput } from "react-native-paper";


export default function ResultPlant() {
	const { result } = useResult();
	const TOKEN_KEY = "auth-token";
	const router = useRouter();
	const [loading, setLoading] = useState(false)
	const queryClient = useQueryClient()
	const data = result?.data?.data;
	// const progress = result?.data?.data.progressPlan.map((i) => i
	// )

	// console.log(progress);

	const colorScheme = useColorScheme(); // 'light' atau 'dark'


	const savePlant = async () => {
		setLoading(true)
		if (data) {

			const body = {
				name: data?.name,
				imageUrl: data?.imageUrl,
				// Menggunakan nilai dari state dropdown yang mungkin telah diubah pengguna
				water_frequency: data?.water_frequency,
				soilType: data?.soilType,
				sunlight: data?.sunlight,
				care_instructions: data?.care_instructions,
			};

			const token = await SecureStore.getItemAsync(TOKEN_KEY);

			const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/plant/new`, {
				method: "POST",

				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				},
				body: JSON.stringify(body),
			});


			const response = await res.json()

			if (response) {
				setLoading(false)
				// Pindah ke tab utama setelah sukses
				router.push('/(tabs)')
				// Memperbarui daftar tanaman setelah menyimpan
				queryClient.invalidateQueries({
					queryKey: ['plantList'],
				})
			}
		}
	};


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

		<View style={{ flex: 1, backgroundColor: 'white' }}>
			{/* Tombol Back */}
			<TouchableOpacity
				style={styles.backButton}
				onPress={() => router.back()}
				activeOpacity={0.7}
			>
				<Ionicons name="arrow-back" size={24} color="white" />
			</TouchableOpacity>

			{/* Konten Scroll - Diperhatikan zIndex pada DropDownPicker */}
			{/* Tambahkan style untuk paddingBottom agar konten tidak tertutup oleh tombol Save */}
			<ScrollView
				contentContainerStyle={{ paddingBottom: 100 }}
				// Atur keyboardShouldPersistTaps untuk memastikan scrolling dan dropdown bekerja dengan baik
				keyboardShouldPersistTaps="handled"
			>

				<Image placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
					style={{ height: 400 }}
					contentFit="cover" source={{ uri: `${process.env.EXPO_PUBLIC_BASE_URL}${data?.imageUrl}` }} />


				<View style={{ padding: 16, gap: 24 }}>
					<View style={styles.headerContainer}>
						<View style={{ width: "100%" }}>

							<Text style={styles.name}>{data?.name}</Text>
							<Text style={styles.latinName}>{data?.latinName}</Text>
						</View>
						{/* <View>
							<Text style={styles.matchPercent}>98%</Text>
						</View> */}
					</View>

					<View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>

						<View style={{ backgroundColor: '#e7fbe4ff', paddingVertical: 8, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center', gap: 8 }}>

							<Ionicons name="water" size={24} />



							<Text style={{ fontSize: 12 }}>{data?.water_frequency} Days</Text>

						</View>

						<View style={{ backgroundColor: '#e7fbe4ff', paddingVertical: 8, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' }}>

							<Ionicons name="sunny" size={24} />

							<Text>{data?.sunlight}</Text>

						</View>

						<View style={{ backgroundColor: '#e7fbe4ff', paddingVertical: 8, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' }}>

							<Ionicons name="moon" size={24} />

							<Text>{data?.soilType} </Text>

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


					{result?.data?.plantBase && (
						<View style={{ gap: 8, flexDirection: 'column' }}>
							<FlatList
								data={result?.data?.plantBase}
								renderItem={renderItem}
								keyExtractor={(item) => item.id}
								columnWrapperStyle={{
									justifyContent: 'space-between',
									marginBottom: 16,
								}}
								scrollEnabled={false}
								contentContainerStyle={{
									paddingBottom: 40,

								}}
								numColumns={2}
							/>
						</View>
					)}
				</View>

			</ScrollView>


			{/* Tombol Save di bawah layar */}
			<View style={styles.saveButtonFixedContainer}>
				<TouchableOpacity style={styles.saveButton} disabled={loading} onPress={savePlant} activeOpacity={0.8}>
					<Text style={styles.saveButtonText}>
						{loading ? 'Saving...' : 'Save the plant'}
					</Text>
				</TouchableOpacity>
			</View>
		</View >

	);
}

const styles = StyleSheet.create({
	nameInput: {
		borderBottomWidth: 1,
		backgroundColor: 'white',
		fontSize: 32,
		fontWeight: "600",
		paddingVertical: 4,
		color: "black",
	},
	backButton: {
		position: "absolute",
		top: 32,
		left: 20,
		zIndex: 10,
		alignItems: "center",
		padding: 8,
		backgroundColor: "rgba(0,0,0,0.4)",
		borderRadius: 20,
	},
	headerContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	name: {
		color: "black",
		fontSize: 32,
		fontWeight: "600",
	},
	latinName: {
		color: "black",
		fontSize: 16,
	},
	matchPercent: {
		fontSize: 16,
		color: "white",
		backgroundColor: "#379f20ff",
		paddingHorizontal: 16,
		paddingVertical: 4,
		borderRadius: 24,
		width: "auto",
		overflow: 'hidden'
	},
	dropdownLabel: {
		marginBottom: 4,
		fontSize: 16,
		fontWeight: '500',
		color: '#333',
	},
	dropdown: {
		borderColor: '#ccc',
	},
	// Container Tombol Save yang FIX di bawah
	saveButtonFixedContainer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 16,
		paddingVertical: 16,
		backgroundColor: "white",
		borderTopWidth: 1,
		borderTopColor: '#eee',
	},
	saveButton: {
		flex: 1,
		backgroundColor: "#379f20ff",
		paddingVertical: 16,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	saveButtonText: {
		color: "white",
		fontWeight: "bold",
		fontSize: 16,
	},
	careInstructionContainer: {
		marginTop: 8,
		padding: 16,
		backgroundColor: '#f9f9f9',
		borderRadius: 8,
		borderLeftWidth: 4,
		borderLeftColor: '#379f20ff',
	},
	careInstructionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8,
		color: '#333',
	},
	careInstructionText: {
		fontSize: 16,
		lineHeight: 24,
		color: '#555',
	}
});