import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const api = axios.create({
	baseURL: `${process.env.EXPO_PUBLIC_BASE_URL}/api`,
	headers: {
		"Content-Type": "application/json",
	},
});

// Interceptor untuk menambahkan Authorization header sebelum setiap request
api.interceptors.request.use(
	async (config) => {
		const token = await SecureStore.getItemAsync("auth-token");

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);
