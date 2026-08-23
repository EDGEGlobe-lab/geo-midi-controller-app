export const SESSION_ISSUER = "geo-midi-controller-app";

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  githubToken: process.env.GITHUB_TOKEN ?? "",
};

export function validateProductionServerEnvironment() {
  if (!ENV.isProduction) return;

  const required = {
    DATABASE_URL: ENV.databaseUrl,
    JWT_SECRET: ENV.cookieSecret,
    OAUTH_SERVER_URL: ENV.oAuthServerUrl,
    VITE_APP_ID: ENV.appId,
    BUILT_IN_FORGE_API_URL: ENV.forgeApiUrl,
    BUILT_IN_FORGE_API_KEY: ENV.forgeApiKey,
  };
  const missing = Object.entries(required)
    .filter(([, value]) => !value.trim())
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required production configuration: ${missing.join(", ")}`
    );
  }

  if (new TextEncoder().encode(ENV.cookieSecret).length < 32) {
    throw new Error("JWT_SECRET must be at least 32 bytes in production");
  }
}
