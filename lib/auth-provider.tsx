import { createContext, PropsWithChildren, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { SplashScreen, useRouter } from "expo-router";
// 
SplashScreen.preventAutoHideAsync();

type AuthState = {
	isReady: boolean;
	isLoggedIn: boolean;
	user: any | null;
	error: string | null;
	signIn: (username: string, password: string) => Promise<void>;
	signUp: (username: string, password: string, fullname: string) => Promise<void>;
	signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState>({
	error: null,
	isReady: false,
	isLoggedIn: false,
	user: null,
	signIn: async () => { },
	signUp: async () => { },
	signOut: async () => { },
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
	const [isReady, setIsReady] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [user, setUser] = useState<any | null>(null);
	const router = useRouter();

	const TOKEN_KEY = "auth-token";

	const signIn = async (username: string, password: string) => {
		try {
			const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();

			if (data.token) {
				await SecureStore.setItemAsync("auth-token", data.token);
				setIsLoggedIn(true);
				setUser(data.data);
				// router.replace("/"); // aktifkan kalau mau langsung ke home
			} else {
				setError(data.message || "Login gagal");
				console.log(data);

			}
		} catch (err) {
			console.error("Login error:", err);
			setError("Terjadi kesalahan koneksi");
		}
	};

	const signOut = async () => {
		await SecureStore.deleteItemAsync("auth-token");
		setIsLoggedIn(false);
		setUser(null);
		router.replace("/login");
	};

	const signUp = async (username: string, password: string, fullname: string) => {
		try {
			const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password, fullname }),
			});

			const data = await res.json();

			if (data) {
				router.push("/login");
			} else {
				console.error("Signup failed:", data.message || "Unknown error");
			}
		} catch (err) {
			console.error("Signup error:", err);
		}
	};

	const restoreSession = async () => {
		try {
			const token = await SecureStore.getItemAsync("auth-token");
			if (token) {
				const res = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/users/me`, {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (res.ok) {
					const data = await res.json();

					setIsLoggedIn(true);
					setUser({
						...data, token
					});
				} else {
					console.warn("Token tidak valid, logout otomatis");
					await SecureStore.deleteItemAsync("auth-token");
					setIsLoggedIn(false);
				}
			} else {
				console.log("Tidak ada token tersimpan");
			}
		} catch (err) {
			console.error("Restore session error:", err);
		} finally {
			await new Promise((resolve) => setTimeout(resolve, 400));
			setIsReady(true);
			console.log("ready", isReady);

			await SplashScreen.hideAsync(); // ✅ Hide setelah semuanya siap
		}
	};

	useEffect(() => {
		restoreSession();
	}, []);

	return (
		<AuthContext.Provider
			value={{ isReady, isLoggedIn, user, error, signIn, signUp, signOut }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
