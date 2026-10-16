import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function Index() {
  const [message, setMessage] = useState('Chargement...');

  useEffect(() => {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/api`;
    fetch(url)
      .then((res) => setMessage(`Statut relance ${res.status}\nURL : ${url}`))
      .catch((err) => setMessage(`Erreur : ${err.message}\nURL : ${url}`));
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{message}</Text>
    </View>
  );
}