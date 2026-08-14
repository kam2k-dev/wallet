import { OAuth2Client } from "google-auth-library";
import { db } from "../db/index";
import { DbUser } from "../db/dummyDb";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleAuthToken(credentialToken: string) {
  let email = "";
  let name = "Google User";
  let avatar: string | undefined;
  let googleId = "";

  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (clientId && clientId !== "YOUR_GOOGLE_CLIENT_ID") {
    const ticket = await client.verifyIdToken({
      idToken: credentialToken,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Payload Google Token tidak valid");
    }
    email = payload.email;
    name = payload.name || payload.email.split("@")[0];
    avatar = payload.picture;
    googleId = payload.sub;
  } else {
    // Fallback decoding if GOOGLE_CLIENT_ID is not configured yet in environment
    try {
      const base64Payload = credentialToken.split(".")[1];
      const payload = JSON.parse(Buffer.from(base64Payload, "base64").toString("utf-8"));
      email = payload.email || "user@gmail.com";
      name = payload.name || payload.email?.split("@")[0] || "Google User";
      avatar = payload.picture;
      googleId = payload.sub || `g_${Date.now()}`;
    } catch {
      throw new Error("Format token credential Google tidak valid");
    }
  }

  const existingUser = await db.getUserByEmail(email);
  const now = new Date().toISOString();

  const userObj: DbUser = {
    id: existingUser?.id || googleId || `usr_${Date.now()}`,
    email,
    name,
    avatar,
    createdAt: existingUser?.createdAt || now,
    updatedAt: now,
    loginCount: (existingUser?.loginCount || 0) + 1,
  };

  const user = await db.upsertUser(userObj);
  const token = `token_google_${user.id}_${Date.now()}`;

  return { user, token };
}
