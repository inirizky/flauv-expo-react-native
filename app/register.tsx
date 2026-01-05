import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { SignUp } from '@/components/signup-button';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function RegisterScreen() {
	const [fullname, setFullname] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();

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
					{/* Back Button */}
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => router.back()}
						activeOpacity={0.7}
					>
						<Ionicons name="arrow-back" size={24} color="#1f2937" />
					</TouchableOpacity>

					{/* Header Section */}
					<View style={styles.headerSection}>
						<View style={styles.logoContainer}>
							<MaterialCommunityIcons name="leaf" size={64} color="#10b981" />
						</View>
						<Text style={styles.title}>Create Account</Text>
						<Text style={styles.subtitle}>Join us and start your plant care journey</Text>
					</View>

					{/* Form Section */}
					<View style={styles.formSection}>
						{/* Full Name Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>Full Name</Text>
							<View style={styles.inputWrapper}>
								<Ionicons name="person-outline" size={22} color="#9ca3af" style={styles.inputIcon} />
								<TextInput
									value={fullname}
									onChangeText={setFullname}
									placeholder="Enter your full name"
									autoCapitalize="words"
									style={styles.nativeInput}
									placeholderTextColor="#9ca3af"
								/>
							</View>
						</View>

						{/* Username Input */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>Username</Text>
							<View style={styles.inputWrapper}>
								<Ionicons name="at" size={22} color="#9ca3af" style={styles.inputIcon} />
								<TextInput
									value={username}
									onChangeText={setUsername}
									placeholder="Choose a username"
									autoCapitalize="none"
									style={styles.nativeInput}
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
									placeholder="Create a password"
									secureTextEntry={!showPassword}
									autoCapitalize="none"
									style={styles.nativeInput}
									placeholderTextColor="#9ca3af"
								/>
								<TouchableOpacity
									onPress={() => setShowPassword(!showPassword)}
									style={styles.eyeIcon}
								>
									<Ionicons
										name={showPassword ? "eye-outline" : "eye-off-outline"}
										size={22}
										color="#6b7280"
									/>
								</TouchableOpacity>
							</View>
						</View>

						{/* Password Requirements */}
						<View style={styles.requirementsContainer}>
							<Text style={styles.requirementsTitle}>Password must contain:</Text>
							<View style={styles.requirement}>
								<Ionicons
									name={password.length >= 8 ? "checkmark-circle" : "ellipse-outline"}
									size={16}
									color={password.length >= 8 ? "#10b981" : "#d1d5db"}
								/>
								<Text style={[
									styles.requirementText,
									password.length >= 8 && styles.requirementMet
								]}>
									At least 8 characters
								</Text>
							</View>
						</View>

						{/* Sign Up Button */}
						<SignUp username={username} password={password} fullname={fullname} />

						{/* Terms & Privacy */}
						<Text style={styles.termsText}>
							By signing up, you agree to our{' '}
							<Text style={styles.termsLink}>Terms of Service</Text>
							{' '}and{' '}
							<Text style={styles.termsLink}>Privacy Policy</Text>
						</Text>

						{/* Sign In Link */}
						<View style={styles.signinContainer}>
							<Text style={styles.signinText}>Already have an account? </Text>
							<Link href="/login" asChild>
								<TouchableOpacity>
									<Text style={styles.signinLink}>Sign In</Text>
								</TouchableOpacity>
							</Link>
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
		paddingVertical: 16,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#f3f4f6',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 16,
	},
	headerSection: {
		alignItems: 'center',
		marginBottom: 32,
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
	nativeInput: {
		flex: 1,
		fontSize: 16,
		color: '#111827',
		fontWeight: '500',
		paddingVertical: 0,
	},
	eyeIcon: {
		padding: 8,
	},
	requirementsContainer: {
		backgroundColor: '#f9fafb',
		padding: 12,
		borderRadius: 8,
		gap: 8,
	},
	requirementsTitle: {
		fontSize: 13,
		fontWeight: '600',
		color: '#4b5563',
	},
	requirement: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	requirementText: {
		fontSize: 13,
		color: '#9ca3af',
	},
	requirementMet: {
		color: '#10b981',
	},
	termsText: {
		fontSize: 12,
		color: '#9ca3af',
		textAlign: 'center',
		lineHeight: 18,
	},
	termsLink: {
		color: '#10b981',
		fontWeight: '600',
	},
	signinContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 8,
	},
	signinText: {
		fontSize: 14,
		color: '#6b7280',
	},
	signinLink: {
		fontSize: 14,
		fontWeight: '600',
		color: '#10b981',
	},
});