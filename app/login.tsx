import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { SignIn } from '@/components/signin-button';
import { useAuth } from '@/lib/auth-provider';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();
	const { error } = useAuth();

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				style={styles.keyboardView}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					{/* Header Section */}
					<View style={styles.headerSection}>
						<View style={styles.logoContainer}>
							<MaterialCommunityIcons name="leaf" size={64} color="#10b981" />
						</View>
						<Text style={styles.title}>Welcome Back</Text>
						<Text style={styles.subtitle}>Sign in to continue your plant journey</Text>
					</View>

					{/* Form Section */}
					<View style={styles.formSection}>
						{/* Username Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>Username</Text>
							<View style={styles.inputWrapper}>
								<Ionicons name="person-outline" size={22} color="#9ca3af" style={styles.inputIcon} />
								<TextInput

									value={username}
									onChangeText={setUsername}
									placeholder="Enter your username"
									autoCapitalize="none"
									style={styles.textInput}

									placeholderTextColor="#9ca3af"

								/>
							</View>
						</View>

						{/* Password Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>Password</Text>
							<View style={styles.inputWrapper}>
								<Ionicons name="lock-closed-outline" size={22} color="#9ca3af" style={styles.inputIcon} />
								<TextInput

									value={password}
									onChangeText={setPassword}
									placeholder="Enter your password"
									textContentType="password"
									secureTextEntry={!showPassword}
									autoCapitalize="none"
									style={styles.textInput}

									placeholderTextColor="#9ca3af"

								/>
								<TouchableOpacity
									onPress={() => setShowPassword(!showPassword)}
									style={styles.eyeIcon}
								>
									<Ionicons
										name={showPassword ? "eye-outline" : "eye-off-outline"}
										size={22}
										color="#9ca3af"
									/>
								</TouchableOpacity>
							</View>
						</View>

						{/* Error Message */}
						{error && (
							<View style={styles.errorContainer}>
								<Ionicons name="alert-circle" size={16} color="#ef4444" />
								<Text style={styles.errorText}>{error}</Text>
							</View>
						)}

						{/* Sign In Button */}
						<SignIn username={username} password={password} />

						{/* Sign Up Link */}
						<View style={styles.signupContainer}>
							<Text style={styles.signupText}>Don't have an account? </Text>

							<TouchableOpacity onPress={() => router.push('/register')}>
								<Text style={styles.signupLink}>Sign Up</Text>
							</TouchableOpacity>

						</View>
					</View>


				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	keyboardView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: 24,
		paddingVertical: 32,
	},
	headerSection: {
		alignItems: 'center',
		marginBottom: 40,
	},
	logoContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: '#d1fae5',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 24,
	},
	title: {
		fontSize: 32,
		fontWeight: '700',
		color: '#1f2937',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: '#6b7280',
		textAlign: 'center',
	},
	formSection: {
		gap: 20,
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
		alignItems: 'center',
		backgroundColor: '#f9fafb',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#e5e7eb',
		paddingHorizontal: 16,
	},
	inputIcon: {
		marginRight: 12,
	},
	textInput: {
		flex: 1,
		// backgroundColor: 'transparent',
		fontSize: 16,
		paddingHorizontal: 0,
		height: 56,
	},
	eyeIcon: {
		padding: 8,
	},
	errorContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fee2e2',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 8,
		gap: 8,
	},
	errorText: {
		color: '#ef4444',
		fontSize: 14,
		flex: 1,
	},
	forgotPassword: {
		alignSelf: 'flex-end',
	},
	forgotPasswordText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#10b981',
	},
	divider: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 8,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: '#e5e7eb',
	},
	dividerText: {
		marginHorizontal: 16,
		fontSize: 14,
		color: '#9ca3af',
	},
	socialContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 16,
	},
	socialButton: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#f9fafb',
		borderWidth: 1,
		borderColor: '#e5e7eb',
		justifyContent: 'center',
		alignItems: 'center',
	},
	signupContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 8,
	},
	signupText: {
		fontSize: 14,
		color: '#6b7280',
	},
	signupLink: {
		fontSize: 14,
		fontWeight: '600',
		color: '#10b981',
	},
	footer: {
		marginTop: 32,
		paddingTop: 24,
		borderTopWidth: 1,
		borderTopColor: '#f3f4f6',
	},
	footerText: {
		fontSize: 12,
		color: '#9ca3af',
		textAlign: 'center',
		lineHeight: 18,
	},
	footerLink: {
		color: '#10b981',
		fontWeight: '600',
	},
});