const API_URL = process.env.EXPO_PUBLIC_WODMATCH_URL;

export const imageUrl = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}/api/images/get-one-photo/${path}`; // ne pas encoder les "/"
};