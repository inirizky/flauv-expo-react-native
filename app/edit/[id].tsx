import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react"; // Hapus useRef karena tidak digunakan untuk Drawer lagi
import * as SecureStore from "expo-secure-store";
import { useResult } from "@/stores/useResult";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DropDownPicker from 'react-native-dropdown-picker';
import { TextInput } from "react-native-paper";
import { api } from "@/lib/api";
// Hapus import yang tidak terpakai:
// import { Drawer } from "@/components/ui/drawer";
// import { Button } from "react-native-paper";
// import { BottomSheetScrollView } from "@gorhom/bottom-sheet"; 


const watering =
	[
		{ label: '1 / 2 Days', value: 2 },
		{ label: '1 / 3 Days', value: 3 },
		{ label: '1 / 4 Days', value: 4 },
		{ label: '1 / 7 Days', value: 7 },
	]
const sunlight =
	[
		{ label: 'Full Sun', value: 'Full Sun' },
		{ label: 'Partial Sun', value: 'Partial Sun', },
		{ label: 'Full Shade', value: 'Full Shade' },
		{ label: 'Partial Shade', value: 'Partial Shade' },
		{ label: 'Dappled Sun', value: 'Dappled Sun' },
	]
const soil =
	[
		{ label: 'Clay', value: 'Clay' },
		{ label: 'Sandy', value: 'Sandy' },
		{ label: 'Loamy', value: 'Loamy' },
		{ label: 'Silt', value: 'Silt' },
		{ label: 'Peat', value: 'Peat' },
		{ label: 'Chalky', value: 'Chalky' },

	]

export default function EditPlant() {
	const { id } = useLocalSearchParams();
	const { data } = useQuery({
		queryKey: ['detailPlant', id],
		queryFn: async () => (await api.get(`/plant/${id}`
		)).data.data,
		staleTime: 1000 * 60 * 5, // 5 menit, data dianggap fresh
		enabled: !!id// gunakan "enabled" bukan "subscribed"
	});

	const TOKEN_KEY = "auth-token";
	const router = useRouter();
	const [loading, setLoading] = useState(false)
	const queryClient = useQueryClient()
	const colorScheme = useColorScheme(); // 'light' atau 'dark'
	const isDark = colorScheme === 'dark';

	// State untuk dropdowns
	const [openWatering, setOpenWatering] = useState(false);
	const [openSunlight, setOpenSunlight] = useState(false);
	const [openSoil, setOpenSoil] = useState(false);

	// State untuk nilai yang dipilih
	const [nameValue, setNameValue] = useState(data?.name);
	const [wateringValue, setWateringValue] = useState(data?.water_frequency);
	const [sunlightValue, setSunslightValue] = useState(data?.sunlight);
	const [soilValue, setSoilValue] = useState(data?.soilType);


	const savePlant = async () => {
		setLoading(true)
		if (data) {

			const body = {
				name: nameValue,
				imageUrl: data?.imageUrl,
				// Menggunakan nilai dari state dropdown yang mungkin telah diubah pengguna
				water_frequency: wateringValue,
				soilType: soilValue,
				sunlight: sunlightValue,
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

	// Fungsi untuk menangani penutupan dropdown lain saat salah satu dibuka
	const onWateringOpen = () => {
		setOpenSunlight(false);
		setOpenSoil(false);
	};

	const onSunlightOpen = () => {
		setOpenWatering(false);
		setOpenSoil(false);
	};

	const onSoilOpen = () => {
		setOpenWatering(false);
		setOpenSunlight(false);
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
							<Text style={styles.dropdownLabel}>Plant Name</Text>
							<TextInput
								style={{ backgroundColor: 'transparent' }}
								mode="outlined"
								textColor="black"
								defaultValue={nameValue}
								onChangeText={(text) => setNameValue(text)}
							/>
							{/* <Text style={styles.latinName}>{data?.latinName}</Text> */}
						</View>
						{/* <View>
							<Text style={styles.matchPercent}>98%</Text>
						</View> */}
					</View>

					<View style={{ flexDirection: 'row', gap: 8 }}>



						<View style={{ zIndex: openWatering ? 3000 : 30, elevation: openWatering ? 3000 : 30, width: '50%' }}>
							<Text style={styles.dropdownLabel}>Watering Frequency</Text>
							<DropDownPicker
								open={openWatering}
								value={wateringValue}
								items={watering}
								setOpen={setOpenWatering}
								setValue={setWateringValue}
								onOpen={onWateringOpen} // Tutup dropdown lain saat ini dibuka
								placeholder="Select watering frequency"
								listMode="SCROLLVIEW"
								dropDownDirection="BOTTOM"
								style={styles.dropdown}
							/>
						</View>


						<View style={{ zIndex: openSunlight ? 2000 : 20, elevation: openSunlight ? 2000 : 20, width: '50%' }}>
							<Text style={styles.dropdownLabel}>Sunlight Needs</Text>
							<DropDownPicker
								dropDownDirection="BOTTOM"
								open={openSunlight}
								value={sunlightValue}
								items={sunlight}
								setOpen={setOpenSunlight}
								setValue={setSunslightValue}
								onOpen={onSunlightOpen} // Tutup dropdown lain saat ini dibuka
								placeholder="Select sunlight needs"
								listMode="SCROLLVIEW"
								style={styles.dropdown}
							/>
						</View>
					</View>
					<View style={{ zIndex: openSoil ? 1000 : 10, elevation: openSoil ? 1000 : 10 }}>
						<Text style={styles.dropdownLabel}>Soil Type</Text>
						<DropDownPicker
							dropDownDirection="BOTTOM"
							open={openSoil}
							value={soilValue}
							items={soil}
							setOpen={setOpenSoil}
							setValue={setSoilValue}
							onOpen={onSoilOpen} // Tutup dropdown lain saat ini dibuka
							placeholder="Select soil type"
							listMode="SCROLLVIEW"
							style={styles.dropdown}
						/>
					</View>

					{/* {data?.care_instructions && (
						<View style={styles.careInstructionContainer}>
							<Text style={styles.careInstructionTitle}>Care Instructions:</Text>
							<Text style={styles.careInstructionText}>{data?.care_instructions}</Text>
						</View>
					)} */}


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
		color: "white", // Ganti warna teks agar terlihat di background hijau
		backgroundColor: "#379f20ff",
		paddingHorizontal: 16,
		paddingVertical: 4, // Tambahkan padding vertikal
		borderRadius: 24,
		width: "auto",
		overflow: 'hidden' // Penting untuk memastikan border radius bekerja
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
		// Background yang lebih solid agar tombol terlihat jelas
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