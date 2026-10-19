export function secureEmail(str?: string | null): string | null {
  if (!str) return null;

  const [username, domain] = str.split('@');
  if (!domain || username.length <= 8) return str;

  const masked =
    username.slice(0, 2) + '•'.repeat(username.length - 4) + username.slice(-2);

  return `${masked}@${domain}`;
}