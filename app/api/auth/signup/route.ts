import { NextRequest, NextResponse } from "next/server";
import { hash, compare } from "bcryptjs";
import { readFile, writeFile } from "fs/promises";
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

async function saveUsers(users: any[]) {
  await writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf-8");
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  const users = await getUsers();
  if (users.find((u: any) => u.email === email)) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }
  const hashed = await hash(password, 10);
  users.push({ email, password: hashed, portfolio: [], watchlist: [] });
  await saveUsers(users);
  return NextResponse.json({ success: true });
}
