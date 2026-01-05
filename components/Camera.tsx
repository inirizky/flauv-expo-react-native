import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Animated, ScrollView } from 'react-native';
import { useRef, useState, useEffect } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { File } from "expo-file-system";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as SecureStore from "expo-secure-store";
import { useResult } from '@/stores/useResult';
import { useQueryClient } from '@tanstack/react-query';

export function Camera() {
	const cameraRef = useRef(null);
	const [facing, setFacing] = useState<CameraType>('back');
	const [permission, requestPermission] = useCameraPermissions();
	const [photoUri, setPhotoUri] = useState(null);
	const [loading, setLoading] = useState(false);
	const [selectedPlant, setSelectedPlant] = useState(null);
	const [resultData, setResultData] = useState(null);
	const [showResult, setShowResult] = useState(false);
	const [savingPlant, setSavingPlant] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const queryClient = useQueryClient();

	// const { setResult } = useResult();
	const router = useRouter();

	// Animation values
	const slideAnim = useRef(new Animated.Value(1000)).current;
	const fadeAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (showPreview) {
			// Slide up and fade in
			Animated.parallel([
				Animated.timing(slideAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			// Reset position
			slideAnim.setValue(1000);
			fadeAnim.setValue(0);
		}
	}, [showPreview]);
	useEffect(() => {
		if (resultData?.data?.data) {
			// Add unique identifier for AI result
			const aiResult = { ...resultData.data.data, isAIResult: true };
			setSelectedPlant(aiResult);
		}
	}, [resultData]);


	const loadingTexts = [
		'Analyzing image...',
		'Identifying species...',
		'Gathering care info...',
	];

	const [loadingIndex, setLoadingIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setLoadingIndex((prev) => (prev + 1) % loadingTexts.length);
		}, 3000);

		return () => clearInterval(interval);
	}, []);
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
						We need your permission to use the camera to identify your plants
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
			setShowPreview(true);
		}
	};

	const toggleCameraFacing = () => {
		setFacing(current => (current === 'back' ? 'front' : 'back'));
	};

	const generateAI = async () => {
		setLoading(true);
		if (photoUri) {
			const formData = new FormData();
			formData.append("file", {
				uri: photoUri,
				name: "photo.jpg",
				type: "image/jpeg",
			});

			const token = await SecureStore.getItemAsync("auth-token");
			const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/plant/generate`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});

			const data = await res.json();

			if (data) {
				setLoading(false);
				setResultData({
					...data,
					photoUri,
				});
				setShowResult(true);
				// router.push('/result');
			}
		}
	};

	const retakePhoto = async () => {
		if (photoUri) {
			try {
				const file = new File(photoUri);
				if (file.exists) {
					file.delete();
				}
			} catch (err) {
				console.error("Failed to delete photo:", err);
			}
		}
		setPhotoUri(null);
		setResultData(null);
		setShowPreview(false);
	};

	const savePlant = async () => {
		setSavingPlant(true);

		if (selectedPlant) {
			const body = {
				name: selectedPlant?.name,
				imageUrl: selectedPlant?.imageUrl,
				water_frequency: selectedPlant?.water_frequency,
				soilType: selectedPlant?.soilType,
				sunlight: selectedPlant?.sunlight,
				care_instructions: selectedPlant?.care_instructions,
				plantBaseId: selectedPlant?.id || null,
			};

			const token = await SecureStore.getItemAsync("auth-token");
			const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/plant/new`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				},
				body: JSON.stringify(body),
			});

			const response = await res.json();

			if (response) {
				setSavingPlant(false);
				queryClient.invalidateQueries({ queryKey: ['plantList'] });
				router.push('/(tabs)');
			}
		}
	};
	const aiResult = resultData?.data?.data;
	const alternatives = resultData?.data?.plantBase || [];

	// Helper to check if plant is selected
	const isSelected = (plant, isAI = false) => {
		if (!selectedPlant) return false;
		if (isAI && selectedPlant.isAIResult) return true;
		if (!isAI && !selectedPlant.isAIResult && selectedPlant.id === plant.id) return true;
		return false;
	};

	return (
		<View style={styles.container}>
			<SafeAreaView style={styles.safeArea}>
				{/* Camera View */}
				{!showPreview && (
					<View style={styles.cameraContainer}>
						<CameraView style={styles.camera} facing={facing} ref={cameraRef}>
							{/* Top Overlay - Instructions */}
							<View style={styles.topOverlay}>
								<View style={styles.instructionCard}>
									<MaterialCommunityIcons name="leaf" size={24} color="#10b981" />
									<Text style={styles.instructionText}>
										Position plant in center
									</Text>
								</View>
							</View>

							{/* Center Frame Guide */}
							<View style={styles.frameGuide}>
								<View style={[styles.frameCorner, styles.cornerTopLeft]} />
								<View style={[styles.frameCorner, styles.cornerTopRight]} />
								<View style={[styles.frameCorner, styles.cornerBottomLeft]} />
								<View style={[styles.frameCorner, styles.cornerBottomRight]} />
							</View>
						</CameraView>

						{/* Bottom Controls */}
						<View style={styles.controlsContainer}>
							<View style={styles.controlsContent}>
								{/* Gallery Button */}
								<TouchableOpacity style={styles.controlButton} onPress={() => console.log('Gallery')}>
									<View style={styles.iconButton}>
										<Ionicons name="images" size={28} color="#1f2937" />
									</View>
									<Text style={styles.controlLabel}>Gallery</Text>
								</TouchableOpacity>

								{/* Capture Button */}
								<TouchableOpacity onPress={takePicture} style={styles.captureButtonContainer}>
									<View style={styles.captureButtonOuter}>
										<View style={styles.captureButtonInner} />
									</View>
								</TouchableOpacity>

								{/* Flip Camera Button */}
								<TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
									<View style={styles.iconButton}>
										<Ionicons name="camera-reverse" size={28} color="#1f2937" />
									</View>
									<Text style={styles.controlLabel}>Flip</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}

				{/* Preview Screen with Smooth Transition */}
				{showPreview && (
					<Animated.View
						style={[
							styles.previewScreen,
							{
								transform: [{ translateY: slideAnim }],
								opacity: fadeAnim,
							},
						]}
					>
						{!loading ? (
							<View style={styles.previewContainer}>
								{/* Preview Header */}
								<View style={styles.previewHeader}>
									<Text style={styles.previewTitle}>Photo Preview</Text>
									<Text style={styles.previewSubtitle}>Review your plant photo before identification</Text>
								</View>

								{/* Photo Preview */}
								{photoUri && (
									<View style={styles.photoPreviewContainer}>
										<Image source={{ uri: photoUri }} style={styles.photoPreview} contentFit="cover" />
									</View>
								)}

								{/* Action Buttons */}
								<View style={styles.actionButtonsContainer}>
									<TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
										<Ionicons name="refresh" size={24} color="#ef4444" />
										<Text style={styles.retakeButtonText}>Retake</Text>
									</TouchableOpacity>

									<TouchableOpacity style={styles.identifyButton} onPress={generateAI}>
										<MaterialCommunityIcons name="leaf" size={24} color="white" />
										<Text style={styles.identifyButtonText}>Identify Plant</Text>
									</TouchableOpacity>
								</View>

								{/* Tips */}
								<View style={styles.tipsContainer}>
									<Ionicons name="information-circle-outline" size={20} color="#6b7280" />
									<Text style={styles.tipsText}>
										Make sure the plant is clearly visible and well-lit for best results
									</Text>
								</View>
							</View>
						) : (
							<View style={styles.loadingContainer}>
								<View style={styles.loadingContent}>
									<MaterialCommunityIcons
										name="leaf"
										size={32}
										color="#10b981"
									/>

									<ActivityIndicator
										size="small"
										color="#10b981"
										style={{ marginVertical: 10 }}
									/>

									<Text style={styles.loadingTitle}>
										Identifying Plant
									</Text>

									<Text style={styles.loadingSubtitle}>
										{loadingTexts[loadingIndex]}
									</Text>
								</View>
							</View>
						)}
					</Animated.View>
				)}

				{showResult && (
					// Result State - Compact

					<View>
						<ScrollView>
							{/* Photo Thumbnail */}
							{photoUri && (
								<View style={styles.photoThumbnailContainer}>
									<Image
										placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
										style={styles.photoThumbnail}
										contentFit="cover"
										source={{ uri: photoUri }}
									/>
								</View>
							)}
							<View style={styles.resultContent}>
								{/* AI Result - Primary */}
								<TouchableOpacity
									style={[
										styles.plantCard,
										isSelected(aiResult, true) && styles.plantCardSelected
									]}
									onPress={() => setSelectedPlant({ ...aiResult, isAIResult: true })}
									activeOpacity={0.7}
								>
									<View style={styles.cardHeader}>
										<View style={styles.cardBadge}>
											<MaterialCommunityIcons name="robot" size={16} color="#10b981" />
											<Text style={styles.cardBadgeText}>AI Pick</Text>
										</View>
										{isSelected(aiResult, true) && (
											<View style={styles.selectedBadge}>
												<Ionicons name="checkmark-circle" size={20} color="#10b981" />
											</View>
										)}
									</View>

									<Text style={styles.cardName}>{aiResult?.name}</Text>
									<Text style={styles.cardLatinName}>{aiResult?.latinName}</Text>

									<View style={styles.cardStats}>
										<View style={styles.statItem}>
											<Ionicons name="water" size={16} color="#3b82f6" />
											<Text style={styles.statText}>{aiResult?.water_frequency}d</Text>
										</View>
										<View style={styles.statItem}>
											<Ionicons name="sunny" size={16} color="#f59e0b" />
											<Text style={styles.statText}>{aiResult?.sunlight}</Text>
										</View>
										<View style={styles.statItem}>
											<MaterialCommunityIcons name="sprout" size={16} color="#10b981" />
											<Text style={styles.statText}>{aiResult?.soilType}</Text>
										</View>
									</View>
								</TouchableOpacity>

								{/* Alternatives - Secondary */}
								{alternatives.length > 0 && (
									<View style={styles.alternativesSection}>
										<View style={styles.alternativesHeader}>
											<Text style={styles.alternativesTitle}>Similiar results</Text>
											<Text style={styles.alternativesCount}>{alternatives.length} found</Text>
										</View>

										{alternatives.map((plant, index) => (
											<TouchableOpacity
												key={plant.id || index}
												style={[
													styles.alternativeCard,
													isSelected(plant, false) && styles.alternativeCardSelected
												]}
												onPress={() => setSelectedPlant({ ...plant, isAIResult: false })}
												activeOpacity={0.7}
											>
												<View style={styles.alternativeLeft}>

													<View style={styles.alternativeInfo}>
														<Text style={styles.alternativeName}>{plant.name}</Text>
														<Text style={styles.cardLatinName}>{plant.latinName}</Text>
														<View style={styles.alternativeMeta}>
															<Ionicons name="people" size={12} color="#6b7280" />
															<Text style={styles.alternativeMetaText}>
																In {plant.userCount || 1} gardens
															</Text>
														</View>
													</View>
												</View>

												{isSelected(plant, false) && (
													<Ionicons name="checkmark-circle" size={24} color="#10b981" />
												)}
											</TouchableOpacity>
										))}
									</View>
								)}

								{/* Selected Plant Details */}
								{/* {selectedPlant && (
									<View style={styles.detailsSection}>
										<Text style={styles.detailsTitle}>Care Guide</Text>
										<Text style={styles.detailsText}>
											{selectedPlant?.care_instructions || 'No care instructions available.'}
										</Text>
									</View>
								)} */}

							</View>
						</ScrollView>
						<View style={styles.bottomActions}>

							<TouchableOpacity
								style={[styles.saveButton, !selectedPlant && styles.saveButtonDisabled]}
								onPress={savePlant}
								disabled={savingPlant || !selectedPlant}
							>
								<Text style={styles.saveButtonText}>
									{savingPlant ? 'Saving...' : `Save ${selectedPlant?.name || 'Plant'}`}
								</Text>
							</TouchableOpacity>
						</View>
					</View>

				)}

			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
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
		backgroundColor: '#10b981',
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
	},
	saveButtonDisabled: {
		backgroundColor: '#d1d5db',
	},
	saveButtonText: {
		fontSize: 16,
		fontWeight: '700',
		color: '#ffffff',
	},
	photoThumbnailContainer: {
		width: '100%',
		height: 500,
		backgroundColor: '#f3f4f6',
	},
	photoThumbnail: {
		width: '100%',
		height: '100%',
	},
	resultContent: {
		backgroundColor: '#f9fafb',
		flex: 1,
		padding: 20,
		marginBottom: 69,
		gap: 16,
	},
	plantCard: {
		backgroundColor: '#ffffff',
		borderRadius: 16,
		padding: 20,
		borderWidth: 2,
		borderColor: '#e5e7eb',
	},
	plantCardSelected: {
		borderColor: '#10b981',
		backgroundColor: '#f0fdf4',
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	cardBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#d1fae5',
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
		gap: 4,
	},
	cardBadgeText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#10b981',
	},
	selectedBadge: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	cardName: {
		fontSize: 24,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 4,
	},
	cardLatinName: {
		fontSize: 14,
		color: '#6b7280',
		fontStyle: 'italic',
		marginBottom: 16,
	},
	cardStats: {
		flexDirection: 'row',
		gap: 16,
	},
	statItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	statText: {
		fontSize: 13,
		color: '#4b5563',
		fontWeight: '500',
	},
	alternativesSection: {
		gap: 12,
	},
	alternativesHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	alternativesTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#4b5563',
	},
	alternativesCount: {
		fontSize: 13,
		color: '#9ca3af',
	},
	alternativeCard: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#ffffff',
		borderRadius: 12,
		padding: 12,
		borderWidth: 1,
		borderColor: '#e5e7eb',
	},
	alternativeCardSelected: {
		borderColor: '#10b981',
		backgroundColor: '#f0fdf4',
	},
	alternativeLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
		gap: 12,
	},
	alternativeImage: {
		width: 50,
		height: 50,
		borderRadius: 8,
	},
	alternativeInfo: {
		flex: 1,
		gap: 4,
	},
	alternativeName: {
		fontSize: 15,
		fontWeight: '600',
		color: '#1f2937',
	},
	alternativeMeta: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	alternativeMetaText: {
		fontSize: 12,
		color: '#6b7280',
	},
	detailsSection: {
		backgroundColor: '#f9fafb',
		padding: 16,
		borderRadius: 12,
		borderLeftWidth: 4,
		borderLeftColor: '#10b981',
	},
	detailsTitle: {
		fontSize: 16,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 8,
	},
	detailsText: {
		fontSize: 14,
		lineHeight: 22,
		color: '#4b5563',
	},
	container: {
		flex: 1,
		backgroundColor: '#000000',
	},
	safeArea: {
		flex: 1,
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
	instructionCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.95)',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 24,
		gap: 8,
	},
	instructionText: {
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
	previewScreen: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: '#ffffff',
	},
	previewContainer: {
		flex: 1,
		padding: 20,
	},
	previewHeader: {
		marginBottom: 20,
		marginTop: 20,
	},
	previewTitle: {
		fontSize: 24,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 4,
	},
	previewSubtitle: {
		fontSize: 14,
		color: '#6b7280',
	},
	photoPreviewContainer: {
		flex: 1,
		borderRadius: 16,
		overflow: 'hidden',
		backgroundColor: '#f3f4f6',
		marginBottom: 20,
	},
	photoPreview: {
		width: '100%',
		height: '100%',
	},
	actionButtonsContainer: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 16,
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
	identifyButton: {
		flex: 2,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#10b981',
		paddingVertical: 16,
		borderRadius: 12,
		gap: 8,
	},
	identifyButtonText: {
		fontSize: 16,
		fontWeight: '700',
		color: '#ffffff',
	},
	tipsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f9fafb',
		padding: 12,
		borderRadius: 8,
		gap: 8,
	},
	tipsText: {
		flex: 1,
		fontSize: 13,
		color: '#6b7280',
		lineHeight: 18,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 32,
	},
	loadingContent: {
		alignItems: 'center',
		maxWidth: 320,
	},
	loadingIconContainer: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#d1fae5',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 24,
	},
	loader: {
		marginBottom: 24,
	},
	loadingTitle: {
		fontSize: 22,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 8,
		textAlign: 'center',
	},
	loadingSubtitle: {
		fontSize: 15,
		color: '#6b7280',
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 32,
	},
	loadingSteps: {
		alignSelf: 'stretch',
		gap: 16,
	},
	loadingStep: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	stepDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: '#10b981',
	},
	stepText: {
		fontSize: 14,
		color: '#4b5563',
	},
});