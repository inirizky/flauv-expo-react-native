import { Image } from 'expo-image';
import { Button, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, Stack, useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState } from 'react';

export default function RegisterScreen() {

	const [fullname, setFullname] = useState("")
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const router = useRouter()
	return (

		<KeyboardAvoidingView
			style={{ flex: 1, backgroundColor: '#b4fee9ff' }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // atur offset jika pakai header
		>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', padding: 24 }}
				keyboardShouldPersistTaps="handled"
			>
				{/* Title */}
				<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
					<Text >Flauv</Text>
				</View>

				{/* Form */}
				<View style={{ marginVertical: 64, gap: 32 }}>
					<Text >Register</Text>

					<TextInput
						style={{
							borderRadius: 8,
							backgroundColor: '#A1CEDC',
							paddingLeft: 12,
						}}
						onChangeText={setFullname}
						textContentType="name"
						autoCapitalize="none"
						placeholder="Fullname"

					/>
					<TextInput
						style={{
							borderRadius: 8,
							backgroundColor: '#A1CEDC',
							paddingLeft: 12,
						}}
						onChangeText={setUsername}

						autoCapitalize="none"
						placeholder="Username"

					/>
					<TextInput
						style={{
							borderRadius: 8,
							backgroundColor: '#A1CEDC',
							paddingLeft: 12,
						}}
						onChangeText={setPassword}
						placeholder="Password"
						textContentType="password"
						secureTextEntry
						autoCapitalize="none"
					/>

					{/* <SignUp username={username} password={password} full_name={fullname} /> */}

					<View style={{ alignItems: 'center' }}>
						<Text>Already have an account?
							<Link href={'/login'}>
								<Text > SignIn Now</Text>
							</Link>
						</Text>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>


	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,

	},
	contentContainer: {
		flex: 1,
		padding: 36,
		alignItems: 'center',
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	reactLogo: {
		height: 178,
		width: 290,
		bottom: 0,
		left: 0,
		position: 'absolute',
	},
	button: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 4,
		borderRadius: 8,
		padding: 8,
		backgroundColor: '#acafb0ff',

	}
});
