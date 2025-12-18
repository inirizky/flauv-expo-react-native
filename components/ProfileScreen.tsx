import { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	FlatList,
	Image,
	ScrollView,
} from "react-native";

const ProfileScreen = () => {
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	// // 
	//   useEffect(() => {
	//     const loadProfile = async () => {
	//       try {
	//         const response = await authService.getProfile();
	//         setProfile(response.data.user);
	//       } catch (error) {
	//         console.error("Error fetching profile:", error);
	//       } finally {
	//         setLoading(false);
	//       }
	//     };
	//     loadProfile();
	//   }, []);

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" color="#007BFF" />
				<Text style={{ marginTop: 8 }}>Memuat profil...</Text>
			</View>
		);
	}

	if (!profile) {
		return (
			<View style={styles.center}>
				<Text style={{ color: "red", fontSize: 16 }}>
					Gagal memuat profil.
				</Text>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container}>
			{/* Header Profile */}
			{/* <View style={styles.headerCard}>
        <Image
          source={{
            uri:
              profile.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View> */}

			{/* Informasi Detail */}
			{/* <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Informasi Pribadi</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Nomor HP:</Text>
          <Text style={styles.value}>{profile.phoneNumber || "-"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Tanggal Dibuat:</Text>
          <Text style={styles.value}>
            {new Date(profile.createdAt).toLocaleDateString("id-ID")}
          </Text>
        </View>
      </View> */}

			{/* Daftar Aplikasi */}
			{/* <View style={styles.appSection}>
        <Text style={styles.sectionTitle}>Daftar Aplikasi</Text>
        <FlatList
          data={profile.applications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.appCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.appName}>{item.name}</Text>
                <Text style={styles.appInfo}>Role: {item.role}</Text>
                <Text
                  style={[
                    styles.appStatus,
                    { color: item.isActive ? "#2ECC71" : "#E74C3C" },
                  ]}
                >
                  {item.isActive ? "Aktif" : "Tidak Aktif"}
                </Text>
              </View>
            </View>
          )}
        />
      </View> */}
		</ScrollView>
	);
};

export default ProfileScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F7F9FB",
		padding: 20,
	},
	center: { flex: 1, justifyContent: "center", alignItems: "center" },
	headerCard: {
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 16,
		paddingVertical: 25,
		marginBottom: 15,
		elevation: 3,
	},
	avatar: {
		width: 90,
		height: 90,
		borderRadius: 45,
		marginBottom: 10,
	},
	name: {
		fontSize: 20,
		fontWeight: "700",
		color: "#2C3E50",
	},
	email: {
		color: "#7F8C8D",
		fontSize: 14,
		marginTop: 3,
	},
	infoCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 15,
		elevation: 2,
		marginBottom: 15,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#007BFF",
		marginBottom: 10,
	},
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	label: { fontWeight: "600", color: "#555" },
	value: { color: "#333" },
	appSection: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 15,
		elevation: 2,
	},
	appCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F0F6FF",
		padding: 10,
		borderRadius: 10,
		marginVertical: 5,
	},
	appName: { fontSize: 16, fontWeight: "bold", color: "#007BFF" },
	appInfo: { color: "#555" },
	appStatus: { fontWeight: "bold", marginTop: 3 },
});