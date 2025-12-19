import { useAuth } from '@/lib/auth-provider';
import { useIsFocused } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';




export default function HomeScreen() {
	const isFocused = useIsFocused()

	const { user } = useAuth()
	// console.log(result);






	return (
		<SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
			<View style={styles.container}>
				<Text style={styles.title}>My Profile 💖</Text>

				<View style={styles.card}>
					<Text style={styles.label}>Full Name</Text>
					<Text style={styles.value}>{user?.fullname}</Text>

					<Text style={styles.label}>Username</Text>
					<Text style={styles.value}>{user?.username}</Text>

					<Text style={styles.label}>Role</Text>
					<Text style={styles.value}>{user?.role}</Text>
				</View>
			</View>



		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
		backgroundColor: "#fff",
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 24,
		color: "black"
	},
	card: {
		padding: 20,
		borderRadius: 12,
		backgroundColor: "#f5f5f5",
	},
	label: {
		fontSize: 12,
		color: "black",
		marginTop: 12,
	},
	value: {
		fontSize: 16,
		fontWeight: "500",
	},
});
