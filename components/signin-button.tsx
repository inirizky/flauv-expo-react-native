import { useAuth } from '@/lib/auth-provider';
import { router } from 'expo-router';
import { Keyboard, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export function SignIn({ username, password }: { username: string, password: string }) {
	const { signIn } = useAuth();
	const [loading, setLoading] = useState(false);

	const handleSignIn = async () => {
		Keyboard.dismiss();
		setLoading(true);

		await new Promise((r) => setTimeout(r, 150));

		try {
			await signIn(username, password);
		} catch (error) {
			console.error('Sign in error:', error);
		} finally {
			setLoading(false);
		}
	};

	const isDisabled = !username || !password || loading;

	return (
		<TouchableOpacity
			style={[
				styles.button,
				isDisabled && styles.buttonDisabled
			]}
			onPress={handleSignIn}
			disabled={isDisabled}
			activeOpacity={0.8}
		>
			{loading ? (
				<ActivityIndicator size="small" color="#ffffff" />
			) : (
				<>
					<Text style={styles.buttonText}>Sign In</Text>
					<Ionicons name="arrow-forward" size={20} color="#ffffff" />
				</>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#10b981',
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 16,
		gap: 8,
		elevation: 2,
		shadowColor: '#10b981',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
	},
	buttonDisabled: {
		backgroundColor: '#d1d5db',
		shadowOpacity: 0,
		elevation: 0,
	},
	buttonText: {
		fontSize: 18,
		fontWeight: '700',
		color: '#ffffff',
		letterSpacing: 0.5,
	},
});