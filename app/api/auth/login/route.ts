import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { readFile } from "fs/promises";
import path from "path";

const USERS_PATH = path.join(process.cwd(), "users.json");

async function getUsers() {
  try {
    const data = await readFile(USERS_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  const users = await getUsers();
  const user = users.find((u: any) => u.email === email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const valid = await compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  // For demo: just return success (implement JWT/session for production)
  return NextResponse.json({ success: true });
}
