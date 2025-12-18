import * as React from 'react';
import { Text, View } from 'react-native';
import { Button, Dialog, Portal } from 'react-native-paper';

const DialogAction = ({ text }) => {
	const [visible, setVisible] = React.useState(false);

	const hideDialog = () => setVisible(false);

	return (
		<Portal>
			<Dialog visible={visible} onDismiss={hideDialog}>
				<Dialog.Actions>
					<View>
						<Text>{text}</Text>
					</View>
					<Button onPress={() => console.log('Cancel')}>Cancel</Button>
					<Button onPress={() => console.log('Ok')}>Ok</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
};

export default DialogAction;