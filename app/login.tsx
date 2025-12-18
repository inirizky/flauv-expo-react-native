import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform, View, Text, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { SignIn } from '@/components/signin-button';
import { useAuth } from '@/lib/auth-provider';

export default function LoginScreen() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();
	const { error } = useAuth()
	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#d9f0e7ff' }}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
					<View style={{ marginVertical: 64, gap: 32 }}>


						<TextInput
							mode='flat'
							onChangeText={setUsername}
							placeholder="Username"
							autoCapitalize="none"
						/>
						<TextInput
							mode='flat'
							onChangeText={setPassword}
							placeholder="Password"
							textContentType="password"
							secureTextEntry
							autoCapitalize="none"
						/>
						{error && <Text style={styles.error}>{error}</Text>}
						<SignIn username={username} password={password} />
						<View style={{ alignItems: 'center' }}>
							<Text>
								Don't have an account?
								<Link href={'/register'}>
									<Text> SignUp Now</Text>
								</Link>
							</Text>
						</View>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
const styles = StyleSheet.create({
	error: {
		color: 'red',
		fontSize: 12
	},

});
