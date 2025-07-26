import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET || "fallback-secret-key-for-demo";
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: string, adminData?: {
  email?: string;
  fullName?: string;
  role?: string;
  token?: string;
}) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const sessionData = { 
    userId, 
    expiresAt,
    ...(adminData && { adminData })
  };
  const session = await encrypt(sessionData);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

type SessionPayload = {
  userId: string;
  expiresAt: Date;
  adminData?: {
    email?: string;
    fullName?: string;
    role?: string;
    token?: string;
  };
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.log("Failed to verify session");
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  
  if (!session) return null;
  
  const decrypted = await decrypt(session);
  return decrypted as SessionPayload | null;
}

export async function verifySession() {
  const session = await getSession();
  
  if (!session) return { isAuth: false };
  
  return {
    isAuth: true,
    userId: session.userId,
    adminData: session.adminData
  };
}