import { useResult } from '@/stores/useResult';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useRef, useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	TextInput,
	ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddProgress() {
	const cameraRef = useRef(null);
	const [facing, setFacing] = useState<CameraType>('back');
	const [permission, requestPermission] = useCameraPermissions();
	const [photoUri, setPhotoUri] = useState(null);
	const [loading, setLoading] = useState(false);
	const [notes, setNotes] = useState("");
	const router = useRouter();
	const { result } = useResult();
	const data = result;
	const queryClient = useQueryClient();

	if (!permission) {
		return <View />;
	}

	if (!permission.granted) {
		return (
			<View style={styles.permissionContainer}>
				<View style={styles.permissionContent}>
					<View style={styles.iconCircle}>
						<Ionicons name="camera" size={48} color="#10b981" />
					</View>
					<Text style={styles.permissionTitle}>Camera Access Required</Text>
					<Text style={styles.permissionMessage}>
						We need camera access to track your plant progress
					</Text>
					<TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
						<Text style={styles.grantButtonText}>Grant Permission</Text>
					</TouchableOpacity>
				</View>
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
					compress: 0.5,
					format: ImageManipulator.SaveFormat.JPEG,
				}
			);
			setPhotoUri(compressed.uri);
		}
	};

	const toggleCameraFacing = () => {
		setFacing(current => (current === 'back' ? 'front' : 'back'));
	};

	const retakePhoto = () => {
		setPhotoUri(null);
		setNotes("");
	};

	const generateProgress = async () => {
		setLoading(true);

		try {
			if (!photoUri) {
				alert('Please take a photo first');
				setLoading(false);
				return;
			}

			if (!data?.id || !data?.name) {
				alert('Plant data not found');
				setLoading(false);
				return;
			}

			const formData = new FormData();
			formData.append("file", {
				uri: photoUri,
				name: "photo.jpg",
				type: "image/jpeg",
			});
			formData.append("notes", notes || "");
			formData.append("name", data.name);
			formData.append("plantId", data.id);

			const progressHistory = data.plantProgress || [];
			const filteredHistory = progressHistory.slice(-3).map((item: any) => ({
				growthStage: item.growthStage,
				progressType: item.progressType,
				condition: item.condition
			}));
			formData.append("progress", JSON.stringify(filteredHistory));

			const token = await SecureStore.getItemAsync("auth-token");
			const res = await fetch(
				`${process.env.EXPO_PUBLIC_BASE_URL}/api/plant-progress/generate`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				}
			);

			const responseData = await res.json();

			if (responseData.status === 200) {
				queryClient.invalidateQueries({ queryKey: ['detailPlant', data.id] });
				queryClient.invalidateQueries({ queryKey: ['plantProgressList'] });
				router.replace({
					pathname: '/detail/[id]',
					params: { id: data.id }
				});
			} else {
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
		<View style={styles.container}>
			{!photoUri ? (
				// Camera View
				<SafeAreaView style={styles.cameraContainer}>
					<CameraView style={styles.camera} facing={facing} ref={cameraRef}>
						{/* Top Info */}
						<View style={styles.topOverlay}>
							<View style={styles.infoCard}>
								<MaterialCommunityIcons name="leaf" size={20} color="#10b981" />
								<Text style={styles.infoText}>Track progress for {data?.name}</Text>
							</View>
						</View>

						{/* Frame Guide */}
						<View style={styles.frameGuide}>
							<View style={[styles.frameCorner, styles.cornerTopLeft]} />
							<View style={[styles.frameCorner, styles.cornerTopRight]} />
							<View style={[styles.frameCorner, styles.cornerBottomLeft]} />
							<View style={[styles.frameCorner, styles.cornerBottomRight]} />
						</View>
					</CameraView>

					{/* Controls */}
					<View style={styles.controlsContainer}>
						<View style={styles.controlsContent}>
							<TouchableOpacity style={styles.controlButton} onPress={() => router.back()}>
								<View style={styles.iconButton}>
									<Ionicons name="close" size={28} color="#1f2937" />
								</View>
								<Text style={styles.controlLabel}>Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity onPress={takePicture} style={styles.captureButtonContainer}>
								<View style={styles.captureButtonOuter}>
									<View style={styles.captureButtonInner} />
								</View>
							</TouchableOpacity>

							<TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
								<View style={styles.iconButton}>
									<Ionicons name="camera-reverse" size={28} color="#1f2937" />
								</View>
								<Text style={styles.controlLabel}>Flip</Text>
							</TouchableOpacity>
						</View>
					</View>
				</SafeAreaView>
			) : (
				// Preview & Form
				<SafeAreaView style={styles.previewContainer}>
					{/* Back Button */}
					<TouchableOpacity style={styles.backButton} onPress={retakePhoto}>
						<Ionicons name="arrow-back" size={24} color="white" />
					</TouchableOpacity>

					<KeyboardAvoidingView
						style={styles.keyboardView}
						behavior={Platform.OS === "ios" ? "padding" : "height"}
					>
						<ScrollView
							contentContainerStyle={styles.scrollContent}
							showsVerticalScrollIndicator={false}
						>
							{/* Photo Preview */}
							<View style={styles.photoContainer}>
								<Image
									source={{ uri: photoUri }}
									style={styles.photo}
									contentFit="cover"
								/>
							</View>

							{/* Form Section */}
							<View style={styles.formSection}>
								{/* Plant Info */}
								<View style={styles.plantInfoCard}>
									<View style={styles.plantInfoHeader}>
										<MaterialCommunityIcons name="leaf" size={24} color="#10b981" />
										<Text style={styles.plantInfoTitle}>{data?.name}</Text>
									</View>
									<Text style={styles.plantInfoSubtitle}>Adding new progress entry</Text>
								</View>

								{/* Notes Input */}
								<View style={styles.inputContainer}>
									<Text style={styles.inputLabel}>Notes (Optional)</Text>
									<View style={styles.inputWrapper}>
										<Ionicons name="create-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
										<TextInput
											value={notes}
											onChangeText={setNotes}
											placeholder="Add notes about this progress..."
											multiline
											numberOfLines={3}
											style={styles.textInput}
											placeholderTextColor="#9ca3af"
										/>
									</View>
								</View>

								{/* Info Box */}
								<View style={styles.infoBox}>
									<Ionicons name="information-circle-outline" size={20} color="#10b981" />
									<Text style={styles.infoBoxText}>
										Our AI will analyze the photo and automatically detect growth stage, condition, and progress type
									</Text>
								</View>
							</View>
						</ScrollView>

						{/* Bottom Actions */}
						<View style={styles.bottomActions}>
							<TouchableOpacity
								style={styles.retakeButton}
								onPress={retakePhoto}
								disabled={loading}
							>
								<Ionicons name="refresh" size={20} color="#ef4444" />
								<Text style={styles.retakeButtonText}>Retake</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[styles.submitButton, loading && styles.submitButtonDisabled]}
								onPress={generateProgress}
								disabled={loading}
							>
								{loading ? (
									<ActivityIndicator size="small" color="#ffffff" />
								) : (
									<>
										<MaterialCommunityIcons name="check" size={20} color="white" />
										<Text style={styles.submitButtonText}>Add Progress</Text>
									</>
								)}
							</TouchableOpacity>
						</View>
					</KeyboardAvoidingView>
				</SafeAreaView>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000000',
	},
	permissionContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#ffffff',
		padding: 24,
	},
	permissionContent: {
		alignItems: 'center',
		maxWidth: 320,
	},
	iconCircle: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: '#d1fae5',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 24,
	},
	permissionTitle: {
		fontSize: 24,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 12,
		textAlign: 'center',
	},
	permissionMessage: {
		fontSize: 16,
		color: '#6b7280',
		textAlign: 'center',
		lineHeight: 24,
		marginBottom: 32,
	},
	grantButton: {
		backgroundColor: '#10b981',
		paddingHorizontal: 32,
		paddingVertical: 16,
		borderRadius: 12,
		width: '100%',
	},
	grantButtonText: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'center',
	},
	cameraContainer: {
		flex: 1,
	},
	camera: {
		flex: 1,
	},
	topOverlay: {
		position: 'absolute',
		top: 20,
		left: 20,
		right: 20,
		alignItems: 'center',
	},
	infoCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 24,
		gap: 8,
	},
	infoText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#1f2937',
	},
	frameGuide: {
		position: 'absolute',
		top: '20%',
		left: '10%',
		right: '10%',
		bottom: '30%',
	},
	frameCorner: {
		position: 'absolute',
		width: 40,
		height: 40,
		borderColor: '#10b981',
		borderWidth: 3,
	},
	cornerTopLeft: {
		top: 0,
		left: 0,
		borderRightWidth: 0,
		borderBottomWidth: 0,
		borderTopLeftRadius: 8,
	},
	cornerTopRight: {
		top: 0,
		right: 0,
		borderLeftWidth: 0,
		borderBottomWidth: 0,
		borderTopRightRadius: 8,
	},
	cornerBottomLeft: {
		bottom: 0,
		left: 0,
		borderRightWidth: 0,
		borderTopWidth: 0,
		borderBottomLeftRadius: 8,
	},
	cornerBottomRight: {
		bottom: 0,
		right: 0,
		borderLeftWidth: 0,
		borderTopWidth: 0,
		borderBottomRightRadius: 8,
	},
	controlsContainer: {
		backgroundColor: '#ffffff',
		paddingTop: 24,
		paddingBottom: 40,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	controlsContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 40,
	},
	controlButton: {
		alignItems: 'center',
		gap: 8,
	},
	iconButton: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#f3f4f6',
		justifyContent: 'center',
		alignItems: 'center',
	},
	controlLabel: {
		fontSize: 12,
		fontWeight: '500',
		color: '#6b7280',
	},
	captureButtonContainer: {
		padding: 4,
	},
	captureButtonOuter: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#ffffff',
		borderWidth: 4,
		borderColor: '#10b981',
		justifyContent: 'center',
		alignItems: 'center',
	},
	captureButtonInner: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: '#10b981',
	},
	previewContainer: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	backButton: {
		position: 'absolute',
		top: 48,
		left: 20,
		zIndex: 10,
		padding: 10,
		backgroundColor: 'rgba(0,0,0,0.5)',
		borderRadius: 24,
	},
	keyboardView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 120,
	},
	photoContainer: {
		width: '100%',
		height: 400,
		backgroundColor: '#f3f4f6',
	},
	photo: {
		width: '100%',
		height: '100%',
	},
	formSection: {
		padding: 20,
		gap: 20,
	},
	plantInfoCard: {
		backgroundColor: '#f0fdf4',
		padding: 16,
		borderRadius: 12,
		borderLeftWidth: 4,
		borderLeftColor: '#10b981',
	},
	plantInfoHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		marginBottom: 4,
	},
	plantInfoTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
	},
	plantInfoSubtitle: {
		fontSize: 13,
		color: '#6b7280',
		marginLeft: 36,
	},
	inputContainer: {
		gap: 8,
	},
	inputLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: '#374151',
		marginLeft: 4,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		backgroundColor: '#ffffff',
		borderRadius: 12,
		borderWidth: 2,
		borderColor: '#d1d5db',
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	inputIcon: {
		marginRight: 12,
		marginTop: 2,
	},
	textInput: {
		flex: 1,
		fontSize: 16,
		color: '#111827',
		fontWeight: '500',
		minHeight: 80,
		textAlignVertical: 'top',
	},
	infoBox: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		backgroundColor: '#f0fdf4',
		padding: 12,
		borderRadius: 8,
		gap: 12,
	},
	infoBoxText: {
		flex: 1,
		fontSize: 13,
		color: '#047857',
		lineHeight: 18,
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
		flexDirection: 'row',
		gap: 12,
	},
	retakeButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#ffffff',
		paddingVertical: 16,
		borderRadius: 12,
		gap: 8,
		borderWidth: 2,
		borderColor: '#fee2e2',
	},
	retakeButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#ef4444',
	},
	submitButton: {
		flex: 2,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#10b981',
		paddingVertical: 16,
		borderRadius: 12,
		gap: 8,
	},
	submitButtonDisabled: {
		backgroundColor: '#d1d5db',
	},
	submitButtonText: {
		fontSize: 16,
		fontWeight: '700',
		color: '#ffffff',
	},
});