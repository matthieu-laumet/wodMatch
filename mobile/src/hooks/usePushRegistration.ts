import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { registerForPush } from '@/lib/push';
import { useRegisterPushToken } from '@/hooks/queries';

export function usePushRegistration() {
  const { user } = useAuth();
  const { mutate } = useRegisterPushToken();

  useEffect(() => {
    if (!user?.id_user) return;
    registerForPush()
      .then(token => token && mutate({ token, platform: Platform.OS }))
      .catch(e => console.warn('push token', e));
  }, [user?.id_user]);
}