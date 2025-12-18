import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRef, useState } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { Drawer } from './ui/drawer';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { File } from "expo-file-system";
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as SecureStore from "expo-secure-store";
import { useResult } from '@/stores/useResult';
import { Button } from 'react-native-paper';

export function Camera() {
	const cameraRef = useRef(null);
	const drawer = useRef(null)
	const [facing, setFacing] = useState<CameraType>('back');
	const [permission, requestPermission] = useCameraPermissions();
	const [photoUri, setPhotoUri] = useState(null);
	const [loading, setLoading] = useState(false);
	const { setResult } = useResult()
	const router = useRouter()

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
			drawer.current?.expand()
			console.log(photo);

		}
	};
	const generateAI = async () => {
		setLoading(true)
		if (photoUri) {

			const formData = new FormData();
			formData.append("file", {
				uri: photoUri,
				name: "photo.jpg",
				type: "image/jpeg",
			});

			const token = await SecureStore.getItemAsync("auth-token");
			const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/plant/generate`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
					body: formData
				}
			)

			const data = await res.json()

			if (data) {
				setLoading(false)
				setResult({
					...data,
					photoUri
				})
				router.push('/result')

			}

			// setResult({
			// 	// ...data,
			// 	photoUri
			// })
			// router.push('/result')
			// setLoading(false)
		}
	};

	return (
		<View style={{ flex: 1 }}>

			<View style={{ justifyContent: 'space-between', flexDirection: 'column', flex: 1 }}>
				<View style={{ height: 550 }}>
					<CameraView style={styles.camera} facing={facing} ref={cameraRef} />
				</View>
				<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 }}>
					<View>
						<Ionicons name="image" size={32} />
					</View>
					<TouchableOpacity
						onPress={takePicture}
						style={{
							borderColor: 'black',
							borderWidth: 2,
							borderRadius: 100,
							padding: 8,
						}}
					>
						<Ionicons name="aperture-outline" size={64} />
					</TouchableOpacity>

					<View>
						<Ionicons name="sync-circle" size={40} />
					</View>
				</View>
				{/* <TouchableOpacity style={styles.button} onPress={takePicture}>

				</TouchableOpacity> */}
			</View>



			<Drawer containerStyle={{ height: '100%', }} ref={drawer} enableClose={false} snapPoints={['90%']}>
				{!loading ?
					(
						<View style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'column', }}>
							{photoUri && (
								<View style={{ padding: 16, height: 500 }}>
									<Image source={{ uri: photoUri }} style={{ height: '100%', borderRadius: 8 }} />
								</View>
							)}

							<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 }}>
								<Button mode='contained' onPress={async () => {
									if (photoUri) {
										try {
											const file = new File(photoUri);

											// Cek keberadaan lewat properti, bukan method
											if (file.exists) {
												file.delete();  // hapus file
											}
											console.log("SUCESS HAPUS");

										} catch (err) {
											console.error("Gagal menghapus foto:", err);
										}
									}

									setPhotoUri(null);
									setResult(null);
									drawer.current?.close()

								}}>Retake</Button>
								<Button mode='contained-tonal' onPress={generateAI}>Generate AI</Button>
							</View>
						</View>
					)
					:
					(

						<View>
							<ActivityIndicator size="large" />
							<Text>Loading...</Text>
						</View>

					)
				}
			</Drawer>
		</View >
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
