function readEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`variavel de ambiente ausente: ${name}`);
  }

  return value;
}

export function supabaseUrl(): string {
  return readEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function supabasePublishableKey(): string {
  return readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
}

export function supabaseSecretKey(): string {
  return readEnv("SUPABASE_SECRET_KEY");
}
