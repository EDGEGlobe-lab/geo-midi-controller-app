import { SignJWT } from "jose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const TEST_SECRET = "a".repeat(48);
const TEST_APP_ID = "test-app";

async function loadSdk() {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("JWT_SECRET", TEST_SECRET);
  vi.stubEnv("VITE_APP_ID", TEST_APP_ID);
  vi.stubEnv("OAUTH_SERVER_URL", "https://auth.example.test");
  const { sdk } = await import("./_core/sdk");
  return sdk;
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("production server configuration", () => {
  it("rejects missing required production server configuration", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("JWT_SECRET", "");
    vi.stubEnv("OAUTH_SERVER_URL", "");
    vi.stubEnv("VITE_APP_ID", "");
    vi.stubEnv("BUILT_IN_FORGE_API_URL", "");
    vi.stubEnv("BUILT_IN_FORGE_API_KEY", "");
    const { validateProductionServerEnvironment } = await import("./_core/env");

    expect(() => validateProductionServerEnvironment()).toThrow(
      "Missing required production configuration"
    );
  });

  it("rejects an undersized production session secret", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "mysql://user:password@db.example.test/app");
    vi.stubEnv("JWT_SECRET", "too-short");
    vi.stubEnv("OAUTH_SERVER_URL", "https://auth.example.test");
    vi.stubEnv("VITE_APP_ID", TEST_APP_ID);
    vi.stubEnv("BUILT_IN_FORGE_API_URL", "https://forge.example.test");
    vi.stubEnv("BUILT_IN_FORGE_API_KEY", "forge-key");
    const { validateProductionServerEnvironment } = await import("./_core/env");

    expect(() => validateProductionServerEnvironment()).toThrow(
      "JWT_SECRET must be at least 32 bytes in production"
    );
  });
});

describe("session tokens", () => {
  it("creates and verifies a session token scoped to the configured app", async () => {
    const sdk = await loadSdk();
    const token = await sdk.createSessionToken("user-1", {
      name: "Session User",
      expiresInMs: 60_000,
    });

    await expect(sdk.verifySession(token)).resolves.toEqual({
      openId: "user-1",
      appId: TEST_APP_ID,
      name: "Session User",
    });
  });

  it("rejects a correctly signed token with an unexpected issuer", async () => {
    const sdk = await loadSdk();
    const secret = new TextEncoder().encode(TEST_SECRET);
    const token = await new SignJWT({
      openId: "user-1",
      appId: TEST_APP_ID,
      name: "Session User",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer("unexpected-issuer")
      .setAudience(TEST_APP_ID)
      .setSubject("user-1")
      .setExpirationTime("1h")
      .sign(secret);

    await expect(sdk.verifySession(token)).resolves.toBeNull();
  });

  it("rejects a token whose subject does not match its open ID", async () => {
    const sdk = await loadSdk();
    const secret = new TextEncoder().encode(TEST_SECRET);
    const { SESSION_ISSUER } = await import("./_core/env");
    const token = await new SignJWT({
      openId: "user-1",
      appId: TEST_APP_ID,
      name: "Session User",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer(SESSION_ISSUER)
      .setAudience(TEST_APP_ID)
      .setSubject("different-user")
      .setExpirationTime("1h")
      .sign(secret);

    await expect(sdk.verifySession(token)).resolves.toBeNull();
  });
});
