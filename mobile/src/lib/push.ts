import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // bannière en haut de l'écran quand l'app est ouverte
    shouldShowList: true,   // la notif apparaît dans le centre de notifications
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPush(): Promise<string | null> {
  if (!Device.isDevice) return null; // pas de push sur simulateur

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data; // "ExponentPushToken[xxxx]"
}