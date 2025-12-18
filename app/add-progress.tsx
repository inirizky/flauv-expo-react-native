import { useResult } from '@/stores/useResult';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';


export default function AddProgrees() {
	const cameraRef = useRef(null);
	const drawer = useRef(null)
	const [facing, setFacing] = useState<CameraType>('back');
	const [permission, requestPermission] = useCameraPermissions();
	const [photoUri, setPhotoUri] = useState(null);
	const [loading, setLoading] = useState(false);
	const [notes, setNotes] = useState("")
	const router = useRouter()
	const [openCamera, setOpenCamera] = useState(false)
	const { result } = useResult();
	const data = result;
	const queryClient = useQueryClient()
	if (!permission) {
		// Camera permissions are still loading.
		return <View />;
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet.
		return (
			<View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
				<Text style={styles.message}>We need your permission to show the camera</Text>
				<Button onPress={requestPermission}>Grant Permission</Button>
			</View>
		);
	}

	const takePicture = async () => {
		if (cameraRef.current) {
			const photo = await cameraRef.current.takePictureAsync();

			const compressed = await ImageManipulator.manipulateAsync(
				photo.uri,
				[{ resize: { width: 800 } }],
				{
					compress: 0.5, // nilai antara 0 - 1
					format: ImageManipulator.SaveFormat.JPEG,
				}
			);
			setPhotoUri(compressed.uri);
			setOpenCamera(false)
			// drawer.current?.expand()
			// console.log(photo);

		}
	};






	// console.log(result)
	const generateProgress = async () => {
		setLoading(true);

		try {
			if (!photoUri) {
				alert('Please take a photo first');
				setLoading(false);
				return;
			}

			// Validasi data plant
			if (!data?.id || !data?.name) {
				alert('Plant data not found');
				setLoading(false);
				return;
			}

			const formData = new FormData();

			// Tambahkan file foto
			formData.append("file", {
				uri: photoUri,
				name: "photo.jpg",
				type: "image/jpeg",
			});

			// Tambahkan notes (string, bukan object)
			formData.append("notes", notes || "");

			// Tambahkan name dari data plant
			formData.append("name", data.name);
			formData.append("plantId", data.id);

			// Tambahkan progress history (jika ada)
			// Format sebagai JSON string jika backend expect JSON
			const progressHistory = data.plantProgress || [];
			const filteredHistory = progressHistory.slice(-3).map((item: any) => ({
				growthStage: item.growthStage,
				progressType: item.progressType,
				condition: item.condition
			}));
			formData.append("progress", JSON.stringify(filteredHistory));

			const token = await SecureStore.getItemAsync("auth-token");

			// Fix URL - tambahkan plantId parameter
			const res = await fetch(
				`${process.env.EXPO_PUBLIC_BASE_URL}/api/plant-progress/generate`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						// Jangan set Content-Type, biar FormData yang handle
					},
					body: formData,
				}
			);

			const responseData = await res.json();

			// console.log(responseData);


			if (responseData.status === 200) {
				// Success - navigate ke result
				queryClient.invalidateQueries({ queryKey: ['detailPlant', data.id] });
				// alert("ASIK")
				router.replace({
					pathname: '/detail/[id]',
					params: { id: data.id }
				})

			} else {
				// Handle error dari backend
				alert(responseData.message || 'Failed to generate progress');
			}
		} catch (error) {
			console.error('Error generating progress:', error);
			alert('An error occurred while generating progress');
		} finally {
			setLoading(false);
		}
	};


	return (
		<View style={{ flex: 1 }}>

			{!photoUri && (
				<View style={{ flex: 1, justifyContent: "space-between" }}>
					{/* Camera */}
					<View style={{ height: 550 }}>
						<CameraView style={styles.camera} facing={facing} ref={cameraRef} />
					</View>

					{/* Bottom bar */}
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
							paddingHorizontal: 24,
							paddingBottom: 24,
						}}
					>
						<Ionicons name="image" size={32} />

						<TouchableOpacity
							onPress={takePicture}
							style={{
								borderColor: "black",
								borderWidth: 2,
								borderRadius: 100,
								padding: 8,
							}}
						>
							<Ionicons name="aperture-outline" size={64} />
						</TouchableOpacity>

						<Ionicons name="sync-circle" size={40} />
					</View>
				</View>
			)}


			{photoUri && (

				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
					<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
						<View style={{ height: 500, width: "100%" }}>
							<Image
								transition={500}
								source={{ uri: photoUri }}
								style={{
									height: "100%",
									width: "100%",
									borderRadius: 8,
								}}
								contentFit="cover"
							/>
						</View>

						{/* Form */}
						<View style={{ padding: 24 }}>
							<TextInput
								mode="flat"
								onChangeText={setNotes}
								placeholder="Notes"
								autoCapitalize="none"
							/>
						</View>
					</ScrollView>

					{/* Tombol fixed bawah */}
					<View
						style={{
							padding: 16,
							backgroundColor: "white",
							borderTopWidth: 1,
							borderTopColor: "#ddd",
						}}
					>
						<TouchableOpacity
							style={{
								backgroundColor: "#379f20ff",
								width: "100%",
								alignItems: "center",
								justifyContent: "center",
								padding: 14,
								borderRadius: 10,
							}}
							disabled={loading}
							onPress={generateProgress}
						>
							<Text style={{ color: "white", fontSize: 16 }}>
								{loading ? "Loading..." : "Add Progress"}
							</Text>
						</TouchableOpacity>
					</View>
				</KeyboardAvoidingView>
			)}
		</View>

	);
}



const styles = StyleSheet.create({
	backButton: {
		position: 'absolute',
		top: 40, // sesuaikan dengan StatusBar jika perlu
		left: 20,
		zIndex: 10,
		flexDirection: 'row',
		alignItems: 'center',
		padding: 8,
		backgroundColor: 'rgba(0,0,0,0.4)',
		borderRadius: 20,
	},
	previewContainer: {
		flex: 1,
		alignItems: "center",
		padding: 20,
	},
	preview: {
		width: "100%",
		height: 400,
		borderRadius: 10,
	},
	container: {
		flex: 1,
		// justifyContent: 'center',

	},
	message: {
		textAlign: 'center',
		paddingBottom: 10,
	},
	camera: {
		flex: 1,
		height: 600,

	},
	buttonContainer: {
		position: 'absolute',
		bottom: 64,
		flexDirection: 'row',
		backgroundColor: 'transparent',
		width: '100%',
		paddingHorizontal: 64,
	},
	button: {

		alignItems: 'center',
		padding: 8,
	},
	text: {
		fontSize: 24,
		fontWeight: 'bold',
		color: 'white',
	},
});
