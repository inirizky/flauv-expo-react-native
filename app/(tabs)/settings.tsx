import { useAuth } from '@/lib/auth-provider';
import { useIsFocused } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

export default function ProfileScreen() {
	const isFocused = useIsFocused();
	const { user, signOut } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	const handleSignOut = async () => {
		setIsLoading(true);
		await signOut();
		setIsLoading(false);
	};

	// Menu items with icons
	const menuSections = [

		{
			title: 'Preferences',
			items: [
				{
					icon: 'language-outline',
					label: 'Language',
					onPress: () => console.log('Language'),
					value: 'English',
					color: '#8b5cf6',
				},
				{
					icon: 'moon-outline',
					label: 'Dark Mode',
					onPress: () => console.log('Dark Mode'),
					toggle: true,
					color: '#6366f1',
				},
				{
					icon: 'leaf-outline',
					label: 'Plant Care Reminders',
					onPress: () => console.log('Reminders'),
					toggle: true,
					color: '#22c55e',
				},
			],
		},

		{
			title: 'Legal',
			items: [
				{
					icon: 'document-text-outline',
					label: 'Privacy Policy',
					onPress: () => console.log('Privacy Policy'),
					color: '#6b7280',
				},
				{
					icon: 'shield-checkmark-outline',
					label: 'Terms of Service',
					onPress: () => console.log('Terms of Service'),
					color: '#6b7280',
				},
			],
		},
	];

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.headerTitle}>Profile</Text>
				</View>

				{/* Profile Card */}
				<View style={styles.profileCard}>
					<View style={styles.avatarContainer}>
						<View style={styles.avatar}>
							<Text style={styles.avatarText}>
								{user?.fullname?.charAt(0).toUpperCase() || 'U'}
							</Text>
						</View>
						<TouchableOpacity style={styles.editAvatarButton}>
							<Ionicons name="camera" size={16} color="white" />
						</TouchableOpacity>
					</View>

					<View style={styles.profileInfo}>
						<Text style={styles.profileName}>{user?.fullname || 'User'}</Text>
						<Text style={styles.profileUsername}>@{user?.username || 'username'}</Text>
						<Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
					</View>

					<View style={styles.statsContainer}>
						<View style={styles.statItem}>
							<Text style={styles.statValue}>12</Text>
							<Text style={styles.statLabel}>Plants</Text>
						</View>
						<View style={styles.statDivider} />
						<View style={styles.statItem}>
							<Text style={styles.statValue}>48</Text>
							<Text style={styles.statLabel}>Progress</Text>
						</View>
						<View style={styles.statDivider} />
						<View style={styles.statItem}>
							<Text style={styles.statValue}>7</Text>
							<Text style={styles.statLabel}>Days Streak</Text>
						</View>
					</View>
				</View>

				{/* Menu Sections */}
				{menuSections.map((section, sectionIndex) => (
					<View key={sectionIndex} style={styles.menuSection}>
						<Text style={styles.sectionTitle}>{section.title}</Text>
						<View style={styles.menuCard}>
							{section.items.map((item, itemIndex) => (
								<TouchableOpacity
									key={itemIndex}
									style={[
										styles.menuItem,
										itemIndex !== section.items.length - 1 && styles.menuItemBorder,
									]}
									onPress={item.onPress}
									activeOpacity={0.7}
								>
									<View style={styles.menuItemLeft}>
										<View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
											<Ionicons name={item.icon} size={22} color={item.color} />
										</View>
										<Text style={styles.menuLabel}>{item.label}</Text>
										{item.badge && (
											<View style={styles.badge}>
												<Text style={styles.badgeText}>{item.badge}</Text>
											</View>
										)}
									</View>

									<View style={styles.menuItemRight}>
										{item.value && <Text style={styles.menuValue}>{item.value}</Text>}
										{item.toggle ? (
											<View style={styles.toggle}>
												<View style={styles.toggleThumb} />
											</View>
										) : (
											<Ionicons name="chevron-forward" size={20} color="#9ca3af" />
										)}
									</View>
								</TouchableOpacity>
							))}
						</View>
					</View>
				))}

				{/* Sign Out Button */}
				<View style={styles.signOutSection}>
					<TouchableOpacity
						style={styles.signOutButton}
						onPress={handleSignOut}
						activeOpacity={0.8}
						disabled={isLoading}
					>
						<Ionicons name="log-out-outline" size={22} color="#ef4444" />
						<Text style={styles.signOutText}>
							{isLoading ? 'Signing Out...' : 'Sign Out'}
						</Text>
					</TouchableOpacity>
				</View>

				{/* App Version */}
				<View style={styles.footer}>
					<Text style={styles.versionText}>Flauv v1.0.0</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	header: {
		paddingHorizontal: 16,
		paddingVertical: 16,
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: '700',
		color: '#1f2937',
	},
	profileCard: {
		marginHorizontal: 16,
		marginBottom: 24,
		padding: 24,
		backgroundColor: '#ffffff',
		borderRadius: 16,
		alignItems: 'center',
	},
	avatarContainer: {
		position: 'relative',
		marginBottom: 16,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: '#10b981',
		justifyContent: 'center',
		alignItems: 'center',
	},
	avatarText: {
		fontSize: 36,
		fontWeight: '700',
		color: '#ffffff',
	},
	editAvatarButton: {
		position: 'absolute',
		bottom: 0,
		right: 0,
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: '#3b82f6',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 3,
		borderColor: '#ffffff',
	},
	profileInfo: {
		alignItems: 'center',
		marginBottom: 20,
	},
	profileName: {
		fontSize: 22,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 4,
	},
	profileUsername: {
		fontSize: 14,
		color: '#6b7280',
		marginBottom: 4,
	},
	profileEmail: {
		fontSize: 13,
		color: '#9ca3af',
	},
	statsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: 20,
		borderTopWidth: 1,
		borderTopColor: '#f3f4f6',
		width: '100%',
	},
	statItem: {
		flex: 1,
		alignItems: 'center',
	},
	statValue: {
		fontSize: 24,
		fontWeight: '700',
		color: '#10b981',
		marginBottom: 4,
	},
	statLabel: {
		fontSize: 12,
		color: '#6b7280',
	},
	statDivider: {
		width: 1,
		height: 40,
		backgroundColor: '#e5e7eb',
	},
	menuSection: {
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: '600',
		color: '#6b7280',
		marginLeft: 16,
		marginBottom: 8,
		textTransform: 'uppercase',
		letterSpacing: 0.5,
	},
	menuCard: {
		marginHorizontal: 16,
		backgroundColor: '#ffffff',
		borderRadius: 12,
		overflow: 'hidden',
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 16,
	},
	menuItemBorder: {
		borderBottomWidth: 1,
		borderBottomColor: '#f3f4f6',
	},
	menuItemLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	menuIcon: {
		width: 40,
		height: 40,
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	menuLabel: {
		fontSize: 16,
		color: '#1f2937',
		fontWeight: '500',
	},
	badge: {
		backgroundColor: '#ef4444',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 10,
		marginLeft: 8,
	},
	badgeText: {
		color: '#ffffff',
		fontSize: 12,
		fontWeight: '600',
	},
	menuItemRight: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	menuValue: {
		fontSize: 14,
		color: '#6b7280',
		marginRight: 4,
	},
	toggle: {
		width: 48,
		height: 28,
		borderRadius: 14,
		backgroundColor: '#10b981',
		justifyContent: 'center',
		paddingHorizontal: 2,
		alignItems: 'flex-end',
	},
	toggleThumb: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: '#ffffff',
	},
	signOutSection: {
		marginHorizontal: 16,
		marginBottom: 24,
	},
	signOutButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#ffffff',
		padding: 16,
		borderRadius: 12,
		gap: 8,
		borderWidth: 1,
		borderColor: '#fee2e2',
	},
	signOutText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#ef4444',
	},
	footer: {
		alignItems: 'center',
		paddingBottom: 32,
	},
	versionText: {
		fontSize: 12,
		color: '#9ca3af',
	},
});