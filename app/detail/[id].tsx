import { TouchableOpacity, StyleSheet, View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { api } from '@/lib/api';
import { useCallback, useRef, useState } from 'react';
import { Drawer } from '@/components/ui/drawer';
import { Button, Dialog, Portal, Text, List } from 'react-native-paper';
import { useResult } from '@/stores/useResult';

export default function DetailScreen() {
	const { id } = useLocalSearchParams();
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [visible, setVisible] = useState(false);
	const { setResult } = useResult();
	const drawer = useRef(null);
	const [expanded, setExpanded] = useState(true);
	const handleSheetChanges = useCallback((index: number) => {
		console.log('handleSheetChanges', index);
		setIsSheetOpen(index > -1);
	}, []);

	const openSheet = () => {
		drawer.current?.expand();
		setIsSheetOpen(!isSheetOpen);
	};

	const queryClient = useQueryClient();
	const router = useRouter();

	const { data } = useQuery({
		queryKey: ['detailPlant', id],
		queryFn: async () => (await api.get(`/plant/${id}`)).data.data,
		enabled: !!id,
	});

	const mutation = useMutation({
		mutationFn: (id) => {
			return api.delete(`/plant/${id}`);
		},
		onSuccess: async () => {
			queryClient.invalidateQueries({ queryKey: ['plantList'] });
			router.back();
		},
	});

	// Helper function untuk icon progress
	const getProgressIcon = (progressType: string) => {
		const iconMap: { [key: string]: string } = {
			watered: 'water',
			fertilized: 'sprout',
			repotted: 'flower',
			pruned: 'content-cut',
			'new leaf': 'leaf',
			'new flower': 'flower-tulip',
			'leaf unfurling': 'leaf',
			blooming: 'flower',
			'pest treated': 'bug',
		};
		return iconMap[progressType.toLowerCase()] || 'camera-plus';
	};

	// Helper function untuk warna icon
	const getProgressColor = (progressType: string) => {
		const colorMap: { [key: string]: string } = {
			watered: '#3b82f6',
			fertilized: '#10b981',
			repotted: '#8b5cf6',
			'new leaf': '#22c55e',
			'new flower': '#ec4899',
		};
		return colorMap[progressType.toLowerCase()] || '#6b7280';
	};

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

	// Calculate watering frequency text
	const getWateringFrequencyText = () => {
		if (!data?.water_frequency) return 'Unknown';
		if (data.water_frequency === 1) return 'Daily';
		if (data.water_frequency === 7) return 'Weekly';
		if (data.water_frequency === 14) return 'Bi-weekly';
		if (data.water_frequency >= 30) return 'Monthly';
		return `Every ${data.water_frequency} days`;
	};

	return (
		<View style={styles.container}>
			<ScrollView style={{ marginBottom: 90 }} showsVerticalScrollIndicator={false}>
				{/* Hero Image */}
				<View style={styles.heroImageContainer}>
					<Image
						source={{ uri: `${process.env.EXPO_PUBLIC_BASE_URL}${data?.imageUrl}` }}
						style={styles.heroImage}
						contentFit="cover"
					/>
				</View>

				<View style={styles.contentContainer}>
					{/* Plant Name & Latin Name */}
					<View style={styles.nameSection}>
						<Text variant="headlineLarge" style={styles.plantName}>
							{data?.name}
						</Text>
						<Text variant="bodyMedium" style={styles.latinName}>
							{data?.latinName || 'Scientific name'}
						</Text>
					</View>

					{/* Quick Info Cards */}
					<View style={styles.quickInfoContainer}>
						<View style={styles.infoCard}>
							<Ionicons name="water" size={28} color="#3b82f6" />
							<Text style={styles.infoLabel}>{getWateringFrequencyText()}</Text>
						</View>
						<View style={styles.infoCard}>
							<Ionicons name="sunny" size={28} color="#f59e0b" />
							<Text style={styles.infoLabel}>{data?.sunlight || 'Unknown'}</Text>
						</View>
						<View style={styles.infoCard}>
							<MaterialCommunityIcons name="sprout" size={28} color="#10b981" />
							<Text style={styles.infoLabel}>{data?.soilType || 'Loamy'}</Text>
						</View>
					</View>

					{/* Accordion Sections */}
					<View style={styles.accordionContainer}>
						<List.Accordion
							expanded={expanded}
							title="Care Instructions"
							titleStyle={styles.accordionTitle}
							onPress={() => setExpanded(!expanded)}
							left={(props) => <List.Icon {...props} icon="spa" color="#953bf6ff" />}
							theme={{
								colors: {
									background: 'transparent',
								},
							}}
							style={styles.accordion}

						>
							<View style={styles.accordionContent}>
								<Text style={styles.accordionText}>
									{data?.care_instructions}
								</Text>
							</View>
						</List.Accordion>
					</View>

					{/* Growth Timeline */}
					<View style={styles.timelineSection}>
						<Text style={styles.sectionTitle}>Growth Timeline</Text>
						{data?.plantProgress && data.plantProgress.length > 0 ? (
							data.plantProgress.map((item: any, index: number) => {
								const { badge: badgeStyle, text: textStyle } = getConditionStyle(item?.condition);
								const iconName = getProgressIcon(item?.progressType);
								const iconColor = getProgressColor(item?.progressType);

								return (
									<View key={index} style={styles.timelineItem}>
										<View style={styles.timelineIconContainer}>
											<View style={[styles.timelineIcon, { backgroundColor: iconColor + '20' }]}>
												<MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
											</View>
											{index < data.plantProgress.length - 1 && <View style={styles.timelineLine} />}
										</View>

										<View style={styles.timelineContent}>
											<View style={styles.timelineHeader}>
												<Text style={styles.timelineTitle}>{item?.progressType}</Text>
												<View style={[styles.conditionBadge, badgeStyle]}>
													<Text style={[styles.conditionText, textStyle]}>{item?.condition}</Text>
												</View>
											</View>
											<Text style={styles.timelineDate}>
												{new Date(item?.createdAt).toLocaleDateString('en-US', {
													month: 'short',
													day: 'numeric',
													year: 'numeric',
												})}
											</Text>
											{item?.notes && <Text style={styles.timelineNotes}>{item.notes}</Text>}
										</View>
									</View>
								);
							})
						) : (
							<View style={styles.emptyTimeline}>
								<MaterialCommunityIcons name="timeline-clock" size={48} color="#d1d5db" />
								<Text style={styles.emptyTimelineText}>No growth records yet</Text>
								<Text style={styles.emptyTimelineSubtext}>Start tracking your plant's journey!</Text>
							</View>
						)}
					</View>
				</View>
			</ScrollView>

			{/* Back & Options Buttons */}
			<View style={styles.headerButtons}>
				<TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.7}>
					<Ionicons name="arrow-back" size={24} color="white" />
				</TouchableOpacity>
				<TouchableOpacity style={styles.iconButton} onPress={openSheet} activeOpacity={0.7}>
					<Ionicons name="ellipsis-vertical" size={24} color="white" />
				</TouchableOpacity>
			</View>

			{/* Add Progress Button */}
			<View style={styles.bottomButtonContainer}>
				<TouchableOpacity
					style={styles.addProgressButton}
					onPress={() => {
						setResult({ ...data });
						router.push({ pathname: '/add-progress' });
					}}
					activeOpacity={0.8}
				>
					<MaterialCommunityIcons name="plus" size={24} color="white" />
					<Text style={styles.addProgressText}>Add Progress</Text>
				</TouchableOpacity>
			</View>

			{/* Delete Dialog */}
			<Portal>
				<Dialog visible={visible} onDismiss={() => setVisible(!visible)}>
					<Dialog.Title>Delete Plant</Dialog.Title>
					<Dialog.Content>
						<Text>Are you sure you want to delete {data?.name}?</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setVisible(!visible)}>Cancel</Button>
						<Button onPress={() => mutation.mutate(data?.id)} textColor="#ef4444">
							Delete
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>

			{/* Actions Drawer */}
			<Drawer
				containerStyle={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}
				ref={drawer}
				onChange={handleSheetChanges}
				snapPoints={['25%']}
			>
				<View style={styles.drawerContent}>
					<Text style={styles.drawerTitle}>Actions</Text>
					<View style={styles.drawerButtons}>
						<Button
							mode="contained-tonal"
							onPress={() => router.push({ pathname: '/edit/[id]', params: { id: data?.id } })}
							icon="pencil"
							style={styles.drawerButton}
						>
							Edit
						</Button>
						<Button mode="contained-tonal" onPress={() => setVisible(true)} icon="delete" textColor="#ffffffff">
							Delete
						</Button>
					</View>
				</View>
			</Drawer>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	heroImageContainer: {
		width: '100%',
		height: 300,
		overflow: 'hidden',
		backgroundColor: '#f3f4f6',
	},
	heroImage: {
		width: '100%',
		height: '100%',
	},
	contentContainer: {
		padding: 16,
		gap: 24,
	},
	nameSection: {
		gap: 4,
	},
	plantName: {
		fontSize: 28,
		fontWeight: '700',
		color: '#1f2937',
	},
	latinName: {
		fontSize: 16,
		color: '#6b7280',
		fontStyle: 'italic',
	},
	quickInfoContainer: {
		flexDirection: 'row',
		gap: 12,
		justifyContent: 'space-between',
	},
	infoCard: {
		flex: 1,
		backgroundColor: '#f9fafb',
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
		gap: 8,
	},
	infoLabel: {
		fontSize: 12,
		color: '#374151',
		fontWeight: '600',
		textAlign: 'center',
	},
	accordionContainer: {
		gap: 8,
	},
	accordion: {
		backgroundColor: '#f9fafb',
		borderRadius: 12,
	},
	accordionTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#1f2937',
	},
	accordionContent: {
		paddingHorizontal: 16,
		paddingBottom: 16,
	},
	accordionText: {
		fontSize: 14,
		lineHeight: 22,
		color: '#4b5563',
	},
	timelineSection: {
		gap: 16,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#1f2937',
	},
	timelineItem: {
		flexDirection: 'row',
		gap: 12,
	},
	timelineIconContainer: {
		alignItems: 'center',
		width: 40,
	},
	timelineIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	timelineLine: {
		flex: 1,
		width: 2,
		backgroundColor: '#e5e7eb',
		marginTop: 4,
	},
	timelineContent: {
		flex: 1,
		paddingBottom: 16,
		gap: 4,
	},
	timelineHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	timelineTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#1f2937',
		textTransform: 'capitalize',
	},
	conditionBadge: {
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
	},
	conditionText: {
		fontSize: 11,
		fontWeight: '600',
		textTransform: 'capitalize',
	},
	timelineDate: {
		fontSize: 13,
		color: '#6b7280',
	},
	timelineNotes: {
		fontSize: 14,
		color: '#4b5563',
		marginTop: 4,
	},
	emptyTimeline: {
		alignItems: 'center',
		paddingVertical: 48,
		gap: 8,
	},
	emptyTimelineText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#6b7280',
	},
	emptyTimelineSubtext: {
		fontSize: 14,
		color: '#9ca3af',
	},
	headerButtons: {
		position: 'absolute',
		top: 40,
		left: 20,
		right: 20,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	iconButton: {
		backgroundColor: 'rgba(0,0,0,0.5)',
		padding: 10,
		borderRadius: 24,
		width: 44,
		height: 44,
		justifyContent: 'center',
		alignItems: 'center',
	},
	bottomButtonContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		paddingHorizontal: 16,
		paddingVertical: 16,
		backgroundColor: 'white',
		borderTopWidth: 1,
		borderTopColor: '#f3f4f6',
	},
	addProgressButton: {
		flexDirection: 'row',
		backgroundColor: '#10b981',
		paddingVertical: 16,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 8,
	},
	addProgressText: {
		color: 'white',
		fontWeight: '700',
		fontSize: 16,
	},
	drawerContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 24,
		paddingHorizontal: 16,
	},
	drawerTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#1f2937',
	},
	drawerButtons: {
		flexDirection: 'row',
		gap: 12,
	},
	drawerButton: {
		borderRadius: 12,
	},
	// Condition Badge Styles
	badgeHealthy: {
		backgroundColor: '#d1fae5',
	},
	textHealthy: {
		color: '#065f46',
	},
	badgeWaterIssue: {
		backgroundColor: '#fef3c7',
	},
	textWaterIssue: {
		color: '#78350f',
	},
	badgeInfestation: {
		backgroundColor: '#fee2e2',
	},
	textInfestation: {
		color: '#991b1b',
	},
	badgeSunburnt: {
		backgroundColor: '#fed7aa',
	},
	textSunburnt: {
		color: '#9a3412',
	},
	badgeDefault: {
		backgroundColor: '#f3f4f6',
	},
	textDefault: {
		color: '#6b7280',
	},
});