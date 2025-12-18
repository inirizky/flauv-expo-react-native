import { useAuth } from '@/lib/auth-provider';
import { router } from 'expo-router';
import { Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';


export function SignIn({ username, password }: { username: string, password: string }) {
	const { signIn } = useAuth();
	return (
		<Button mode='elevated' onPress={async () => {
			Keyboard.dismiss(); // ✅ Tutup keyboard dulu

			await new Promise((r) => setTimeout(r, 150)); // 
			signIn(username, password)

		}}>
			Sign In
		</Button>
		// <TouchableOpacity onPress={async () => {
		// 	Keyboard.dismiss(); // ✅ Tutup keyboard dulu

		// 	await new Promise((r) => setTimeout(r, 150)); // 
		// 	signIn(username, password)

		// }}>
		// 	<View style={styles.button}>

		// 		<ThemedText style={{}} darkColor='true'>
		// 			Sign in
		// 		</ThemedText>
		// 	</View>
		// </TouchableOpacity>

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