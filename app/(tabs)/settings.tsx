import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-provider';



export default function HomeScreen() {
	const isFocused = useIsFocused()
	const { user } = useAuth()

	return (
		<SafeAreaView style={{ paddingHorizontal: 16 }}>

			<View style={{ marginVertical: 16, alignItems: 'center' }}>
				<View>

				</View>
			</View>


		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
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
});
