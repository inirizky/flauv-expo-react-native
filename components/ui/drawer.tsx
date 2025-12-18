import React, { forwardRef, useCallback } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetView,
	BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';

// ✅ Definisikan tipe props
export interface DrawerProps {
	snapPoints?: string[] | number[];
	onChange?: (index: number) => void;
	backgroundColor?: string;
	enableClose?: boolean;
	children?: React.ReactNode;
	containerStyle?: ViewStyle;
}

export const Drawer = forwardRef<BottomSheet, DrawerProps>(
	(
		{
			snapPoints,
			onChange,
			backgroundColor,
			enableClose = true,
			children,
			containerStyle,
		},
		ref
	) => {
		const { colors } = useTheme();

		const backdrop = useCallback(
			(props: BottomSheetBackdropProps) => (
				<BottomSheetBackdrop
					{...props}
					appearsOnIndex={0}
					disappearsOnIndex={-1}
				/>
			),
			[]
		);

		return (
			<BottomSheet

				ref={ref}
				index={-1}
				snapPoints={snapPoints}
				enableDynamicSizing={false}
				enablePanDownToClose={enableClose}
				onChange={onChange}
				backdropComponent={backdrop}

				backgroundStyle={{
					backgroundColor: backgroundColor || colors.card,
				}}
			>
				<BottomSheetView style={[styles.container, containerStyle]}>
					{children}
				</BottomSheetView>
			</BottomSheet>
		);
	}
);

Drawer.displayName = 'Drawer';

const styles = StyleSheet.create({
	container: {

		// padding: 16,
	},
});
