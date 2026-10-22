import { useEffect, useState } from 'react';
import { Image, type ImageStyle } from 'expo-image';
import type { StyleProp } from 'react-native';
import { useAuth } from '../context/AuthContext';

const WODMATCH = process.env.EXPO_PUBLIC_WODMATCH_URL;
const API_KEY = process.env.EXPO_PUBLIC_MOBILE_API_KEY;
const FALLBACK = 'https://res.cloudinary.com/dkz9knsgj/image/upload/v1759215063/20162309_100925_1_vlr3yb.png';

type Props = { src?: string | null; style?: StyleProp<ImageStyle> };

export default function GetImage({ src, style }: Props) {
  const { accessToken } = useAuth();
  const [failed, setFailed] = useState(false);

  // si l'image a échoué (token expiré par exemple), on retente quand le token change
  useEffect(() => setFailed(false), [src, accessToken]);

  const isDirect = !!src && /^(https?:|file:|blob:)/.test(src);

  const source = !src || failed
    ? { uri: FALLBACK }
    : isDirect
      ? { uri: src }
      : {
          uri: `${WODMATCH}/api/images/get-one-photo/${src}`,
          headers: {
            'x-client': 'mobile',
            ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          cacheKey: src, // le cache ne dépend pas du token, qui change à chaque refresh
        };

  return (
    <Image
      source={source}
      style={style}
      contentFit="cover"
      transition={150}
      cachePolicy="memory-disk"
      onError={() => setFailed(true)}
    />
  );
}