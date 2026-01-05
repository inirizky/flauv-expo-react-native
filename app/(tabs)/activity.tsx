import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

export default function ActivityScreen() {
	const isFocused = useIsFocused();
	const router = useRouter();

	const { isPending, error, data } = useQuery({
		queryKey: ['plantProgressList'],
		queryFn: async () => (await api.get('/plant-progress')).data.data,
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 5,
	});

	console.log(data);


	const formatDateTime = (date: string) => {
		const now = new Date();
		const activityDate = new Date(date);
		const diffMs = now.getTime() - activityDate.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		// Relative time
		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;

		// Absolute time
		return activityDate.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	};

	const getProgressIcon = (progressType: string) => {
		const iconMap: { [key: string]: string } = {
			watered: 'water',
			fertilized: 'sprout',
			repotted: 'flower',
			pruned: 'cut',
			'new leaf': 'leaf',
			'new flower': 'flower-tulip',
			'leaf unfurling': 'leaf',
			blooming: 'flower',
			'pest treated': 'bug',
		};
		return iconMap[progressType?.toLowerCase()] || 'camera-plus';
	};

	const getProgressColor = (progressType: string) => {
		const colorMap: { [key: string]: string } = {
			watered: '#3b82f6',
			fertilized: '#10b981',
			repotted: '#8b5cf6',
			'new leaf': '#22c55e',
			'new flower': '#ec4899',
			pruned: '#f59e0b',
		};
		return colorMap[progressType?.toLowerCase()] || '#6b7280';
	};

	const getConditionStyle = (condition: string) => {
		switch (condition?.toLowerCase()) {
			case 'healthy':
				return { bg: '#d1fae5', text: '#065f46' };
			case 'wilted':
			case 'overwatered':
			case 'underwatered':
			case 'yellowing':
				return { bg: '#fef3c7', text: '#78350f' };
			case 'pest detected':
			case 'fungal infection':
				return { bg: '#fee2e2', text: '#991b1b' };
			default:
				return { bg: '#f3f4f6', text: '#6b7280' };
		}
	};

	const renderActivityItem = ({ item, index }: { item: any; index: number }) => {
		const iconName = getProgressIcon(item.progressType);
		const iconColor = getProgressColor(item.progressType);
		const conditionStyle = getConditionStyle(item.condition);
		const isLast = index === data?.length - 1;

		console.log(item);

		return (
			<TouchableOpacity
				style={styles.activityItem}
				onPress={() => router.push({
					pathname: '/detail/[id]',
					params: { id: item?.userPlantId }
				})}
				activeOpacity={0.7}
			>
				{/* Timeline Line */}
				{!isLast && <View style={styles.timelineLine} />}

				{/* Icon Circle */}
				<View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
					<MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
				</View>

				{/* Content */}
				<View style={styles.activityContent}>
					<View style={styles.activityHeader}>
						<Text style={styles.plantName}>{item?.userPlant?.name}</Text>
						<Text style={styles.timeText}>{formatDateTime(item?.createdAt)}</Text>
					</View>

					<View style={styles.activityBody}>
						<View style={styles.activityTextContainer}>
							<Text style={styles.activityText}>
								<Text style={styles.activityAction}>{item.progressType}</Text>
								{item.notes && (
									<Text style={styles.activityNotes}> - {item.notes}</Text>
								)}
							</Text>
						</View>

						{/* Condition Badge */}
						<View style={[styles.conditionBadge, { backgroundColor: conditionStyle.bg }]}>
							<Text style={[styles.conditionText, { color: conditionStyle.text }]}>
								{item?.condition}
							</Text>
						</View>
					</View>

					{/* Growth Stage */}
					{item.growthStage && (
						<View style={styles.growthStageContainer}>
							<MaterialCommunityIcons name="leaf" size={14} color="#6b7280" />
							<Text style={styles.growthStageText}>{item.growthStage}</Text>
						</View>
					)}
				</View>
			</TouchableOpacity>
		);
	};

	const renderEmptyState = () => (
		<View style={styles.emptyState}>
			<View style={styles.emptyIconContainer}>
				<MaterialCommunityIcons name="timeline-clock" size={64} color="#d1d5db" />
			</View>
			<Text style={styles.emptyTitle}>No Activity Yet</Text>
			<Text style={styles.emptySubtitle}>
				Start tracking your plant progress to see your activity here
			</Text>
		</View>
	);

	if (isPending) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#10b981" />
					<Text style={styles.loadingText}>Loading activities...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (error) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.errorContainer}>
					<Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
					<Text style={styles.errorText}>Failed to load activities</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<View>
					<Text style={styles.title}>Activity</Text>
					<Text style={styles.subtitle}>
						{data?.length || 0} {data?.length === 1 ? 'update' : 'updates'}
					</Text>
				</View>

				{/* Filter Button (Optional) */}
				<TouchableOpacity style={styles.filterButton}>
					<Ionicons name="filter" size={20} color="#6b7280" />
				</TouchableOpacity>
			</View>

			{/* Activity List */}
			<FlatList
				data={data}
				renderItem={renderActivityItem}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={[
					styles.listContent,
					(!data || data.length === 0) && styles.listContentEmpty
				]}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={renderEmptyState}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#f3f4f6',
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		color: '#1f2937',
	},
	subtitle: {
		fontSize: 14,
		color: '#6b7280',
		marginTop: 2,
	},
	filterButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#f3f4f6',
		justifyContent: 'center',
		alignItems: 'center',
	},
	listContent: {
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 24,
	},
	listContentEmpty: {
		flex: 1,
	},
	activityItem: {
		flexDirection: 'row',
		marginBottom: 24,
		position: 'relative',
	},
	timelineLine: {
		position: 'absolute',
		left: 19,
		top: 48,
		bottom: -24,
		width: 2,
		backgroundColor: '#e5e7eb',
	},
	iconCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	activityContent: {
		flex: 1,
		gap: 8,
	},
	activityHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	plantName: {
		fontSize: 16,
		fontWeight: '700',
		color: '#1f2937',
	},
	timeText: {
		fontSize: 12,
		color: '#9ca3af',
	},
	activityBody: {
		gap: 8,
	},
	activityTextContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
	},
	activityText: {
		fontSize: 14,
		color: '#4b5563',
		lineHeight: 20,
	},
	activityAction: {
		fontWeight: '600',
		color: '#1f2937',
		textTransform: 'capitalize',
	},
	activityNotes: {
		color: '#6b7280',
	},
	conditionBadge: {
		alignSelf: 'flex-start',
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
	},
	conditionText: {
		fontSize: 12,
		fontWeight: '600',
		textTransform: 'capitalize',
	},
	growthStageContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	growthStageText: {
		fontSize: 12,
		color: '#6b7280',
		textTransform: 'capitalize',
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
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 16,
		paddingHorizontal: 32,
	},
	errorText: {
		fontSize: 16,
		color: '#ef4444',
		textAlign: 'center',
	},
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 32,
		gap: 16,
	},
	emptyIconContainer: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: '#f9fafb',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 8,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#1f2937',
	},
	emptySubtitle: {
		fontSize: 14,
		color: '#6b7280',
		textAlign: 'center',
		lineHeight: 20,
	},
});