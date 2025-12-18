import { create } from 'zustand';

type ApiStore = {
	result: any;
	setResult: (data: any) => void;
	clearResult: () => void;
};

export const useResult = create<ApiStore>((set) => ({
	result: null,
	setResult: (data) => set({ result: data }),
	clearResult: () => set({ result: null }),
}));
