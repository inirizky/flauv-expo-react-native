import { ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const WATERING_OPTIONS = [
	{ label: 'Every 2 Days', value: 2 },
	{ label: 'Every 3 Days', value: 3 },
	{ label: 'Every 4 Days', value: 4 },
	{ label: 'Weekly', value: 7 },
	{ label: 'Every 2 Weeks', value: 14 },
];

const SUNLIGHT_OPTIONS = [
	{ label: 'Full Sun', value: 'Full Sun', icon: 'sunny' },
	{ label: 'Partial Sun', value: 'Partial Sun', icon: 'partly-sunny' },
	{ label: 'Partial Shade', value: 'Partial Shade', icon: 'cloudy' },
	{ label: 'Full Shade', value: 'Full Shade', icon: 'moon' },
	{ label: 'Dappled Sun', value: 'Dappled Sun', icon: 'sunny-outline' },
];

const SOIL_OPTIONS = [
	{ label: 'Clay', value: 'Clay' },
	{ label: 'Sandy', value: 'Sandy' },
	{ label: 'Loamy', value: 'Loamy' },
	{ label: 'Silt', value: 'Silt' },
	{ label: 'Peat', value: 'Peat' },
	{ label: 'Chalky', value: 'Chalky' },
];

export default function EditPlant() {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [loading, setLoading] = useState(false);

	const { data, isPending } = useQuery({
		queryKey: ['detailPlant', id],
		queryFn: async () => (await api.get(`/plant/${id}`)).data.data,
		staleTime: 1000 * 60 * 5,
		enabled: !!id,
	});

	const [nameValue, setNameValue] = useState("");
	const [wateringValue, setWateringValue] = useState(null);
	const [sunlightValue, setSunlightValue] = useState("");
	const [soilValue, setSoilValue] = useState("");

	// Set initial values when data loads
	useEffect(() => {
		if (data) {
			setNameValue(data.name);
			setWateringValue(data.water_frequency);
			setSunlightValue(data.sunlight);
			setSoilValue(data.soilType);
		}
	}, [data]);

	const savePlant = async () => {
		setLoading(true);
		try {
			const body = {
				name: nameValue,
				imageUrl: data?.imageUrl,
				water_frequency: wateringValue,
				soilType: soilValue,
				sunlight: sunlightValue,
			};

			const token = await SecureStore.getItemAsync("auth-token");
			const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/plant/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				},
				body: JSON.stringify(body),
			});

			const response = await res.json();

			if (response) {
				queryClient.invalidateQueries({ queryKey: ['detailPlant', id] });
				queryClient.invalidateQueries({ queryKey: ['plantList'] });
				router.back();
			}
		} catch (error) {
			console.error('Error saving plant:', error);
			alert('Failed to save changes');
		} finally {
			setLoading(false);
		}
	};

	if (isPending) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#10b981" />
					<Text style={styles.loadingText}>Loading plant data...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<View style={styles.container}>
			{/* Back Button */}
			<TouchableOpacity
				style={styles.backButton}
				onPress={() => router.back()}
				activeOpacity={0.7}
			>
				<Ionicons name="arrow-back" size={24} color="white" />
			</TouchableOpacity>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Photo Thumbnail */}
				<View style={styles.photoContainer}>
					<Image
						placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
						style={styles.photo}
						contentFit="cover"
						source={{ uri: `${process.env.EXPO_PUBLIC_BASE_URL}${data?.imageUrl}` }}
					/>
				</View>

				{/* Form Section */}
				<View style={styles.formSection}>
					{/* Plant Name */}
					<View style={styles.inputContainer}>
						<Text style={styles.inputLabel}>Plant Name</Text>
						<View style={styles.inputWrapper}>
							<MaterialCommunityIcons name="leaf" size={20} color="#9ca3af" style={styles.inputIcon} />
							<TextInput
								value={nameValue}
								onChangeText={setNameValue}
								placeholder="Enter plant name"
								style={styles.textInput}
								placeholderTextColor="#9ca3af"
							/>
						</View>
					</View>

					{/* Watering Frequency */}
					<View style={styles.sectionContainer}>
						<Text style={styles.sectionTitle}>Watering Schedule</Text>
						<View style={styles.optionsGrid}>
							{WATERING_OPTIONS.map((option) => (
								<TouchableOpacity
									key={option.value}
									style={[
										styles.optionCard,
										wateringValue === option.value && styles.optionCardSelected
									]}
									onPress={() => setWateringValue(option.value)}
									activeOpacity={0.7}
								>
									<Ionicons
										name="water"
										size={24}
										color={wateringValue === option.value ? "#10b981" : "#9ca3af"}
									/>
									<Text style={[
										styles.optionText,
										wateringValue === option.value && styles.optionTextSelected
									]}>
										{option.label}
									</Text>
									{wateringValue === option.value && (
										<View style={styles.checkmark}>
											<Ionicons name="checkmark-circle" size={20} color="#10b981" />
										</View>
									)}
								</TouchableOpacity>
							))}
						</View>
					</View>

					{/* Sunlight */}
					<View style={styles.sectionContainer}>
						<Text style={styles.sectionTitle}>Sunlight Requirements</Text>
						<View style={styles.optionsColumn}>
							{SUNLIGHT_OPTIONS.map((option) => (
								<TouchableOpacity
									key={option.value}
									style={[
										styles.listOption,
										sunlightValue === option.value && styles.listOptionSelected
									]}
									onPress={() => setSunlightValue(option.value)}
									activeOpacity={0.7}
								>
									<View style={styles.listOptionLeft}>
										<Ionicons
											name={option.icon}
											size={24}
											color={sunlightValue === option.value ? "#10b981" : "#6b7280"}
										/>
										<Text style={[
											styles.listOptionText,
											sunlightValue === option.value && styles.listOptionTextSelected
										]}>
											{option.label}
										</Text>
									</View>
									{sunlightValue === option.value && (
										<Ionicons name="checkmark-circle" size={24} color="#10b981" />
									)}
								</TouchableOpacity>
							))}
						</View>
					</View>

					{/* Soil Type */}
					<View style={styles.sectionContainer}>
						<Text style={styles.sectionTitle}>Soil Type</Text>
						<View style={styles.optionsGrid}>
							{SOIL_OPTIONS.map((option) => (
								<TouchableOpacity
									key={option.value}
									style={[
										styles.optionCard,
										soilValue === option.value && styles.optionCardSelected
									]}
									onPress={() => setSoilValue(option.value)}
									activeOpacity={0.7}
								>
									<MaterialCommunityIcons
										name="sprout"
										size={24}
										color={soilValue === option.value ? "#10b981" : "#9ca3af"}
									/>
									<Text style={[
										styles.optionText,
										soilValue === option.value && styles.optionTextSelected
									]}>
										{option.label}
									</Text>
									{soilValue === option.value && (
										<View style={styles.checkmark}>
											<Ionicons name="checkmark-circle" size={20} color="#10b981" />
										</View>
									)}
								</TouchableOpacity>
							))}
						</View>
					</View>
				</View>
			</ScrollView>

			{/* Save Button */}
			<View style={styles.bottomActions}>
				<TouchableOpacity
					style={[styles.saveButton, loading && styles.saveButtonDisabled]}
					onPress={savePlant}
					disabled={loading}
					activeOpacity={0.8}
				>
					{loading ? (
						<ActivityIndicator size="small" color="#ffffff" />
					) : (
						<>
							<Ionicons name="checkmark" size={24} color="white" />
							<Text style={styles.saveButtonText}>Save Changes</Text>
						</>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
	},
	loadingText: {
		fontSize: 14,
		color: '#6b7280',
	},
	backButton: {
		position: "absolute",
		top: 48,
		left: 20,
		zIndex: 10,
		padding: 10,
		backgroundColor: "rgba(0,0,0,0.5)",
		borderRadius: 24,
	},
	scrollContent: {
		paddingBottom: 100,
	},
	photoContainer: {
		width: '100%',
		height: 250,
		backgroundColor: '#f3f4f6',
	},
	photo: {
		width: '100%',
		height: '100%',
	},
	formSection: {
		padding: 20,
		gap: 32,
	},
	inputContainer: {
		gap: 8,
	},
	inputLabel: {
		fontSize: 16,
		fontWeight: '600',
		color: '#1f2937',
		marginLeft: 4,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#ffffff',
		borderRadius: 12,
		borderWidth: 2,
		borderColor: '#d1d5db',
		paddingHorizontal: 16,
		height: 56,
	},
	inputIcon: {
		marginRight: 12,
	},
	textInput: {
		flex: 1,
		fontSize: 16,
		color: '#111827',
		fontWeight: '500',
	},
	sectionContainer: {
		gap: 12,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
	},
	optionsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	optionCard: {
		width: '48%',
		backgroundColor: '#f9fafb',
		borderRadius: 12,
		padding: 16,
		alignItems: 'center',
		gap: 8,
		borderWidth: 2,
		borderColor: '#e5e7eb',
		position: 'relative',
	},
	optionCardSelected: {
		backgroundColor: '#f0fdf4',
		borderColor: '#10b981',
	},
	optionText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#6b7280',
		textAlign: 'center',
	},
	optionTextSelected: {
		color: '#10b981',
	},
	checkmark: {
		position: 'absolute',
		top: 8,
		right: 8,
	},
	optionsColumn: {
		gap: 8,
	},
	listOption: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#f9fafb',
		borderRadius: 12,
		padding: 16,
		borderWidth: 2,
		borderColor: '#e5e7eb',
	},
	listOptionSelected: {
		backgroundColor: '#f0fdf4',
		borderColor: '#10b981',
	},
	listOptionLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	listOptionText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#6b7280',
	},
	listOptionTextSelected: {
		color: '#10b981',
	},
	bottomActions: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: '#ffffff',
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderTopWidth: 1,
		borderTopColor: '#f3f4f6',
	},
	saveButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#10b981',
		paddingVertical: 18,
		borderRadius: 16,
		gap: 8,
	},
	saveButtonDisabled: {
		backgroundColor: '#d1d5db',
	},
	saveButtonText: {
		fontSize: 18,
		fontWeight: '700',
		color: '#ffffff',
	},
});