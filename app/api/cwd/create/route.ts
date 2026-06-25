import { NextResponse } from "next/server";
import { mkdirSync } from "fs";
import { homedir } from "os";
import { isAbsolute, resolve } from "path";
import { allowFileRoot } from "@/lib/file-access";

function normalizeCwd(cwd: string, currentCwd?: string): string {
  if (cwd === "~") return homedir();
  if (cwd.startsWith("~/")) return resolve(homedir(), cwd.slice(2));
  if (isAbsolute(cwd)) return cwd;
  // Relative path — resolve against the user's current cwd if provided
  if (currentCwd) return resolve(currentCwd, cwd);
  return resolve(cwd);
}

// POST /api/cwd/create  body: { cwd: string, currentCwd?: string }
// Creates a directory and registers it as a file root, so the UI can switch to it.
// If cwd is a relative path, it is resolved against currentCwd.
export async function POST(req: Request) {
  try {
    const body = await req.json() as { cwd?: unknown; currentCwd?: unknown };
    const cwd = typeof body.cwd === "string" ? body.cwd.trim() : "";
    const currentCwd = typeof body.currentCwd === "string" ? body.currentCwd.trim() : undefined;

    if (!cwd) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    const normalizedCwd = normalizeCwd(cwd, currentCwd);
    mkdirSync(normalizedCwd, { recursive: true });
    allowFileRoot(normalizedCwd);

    return NextResponse.json({ success: true, cwd: normalizedCwd });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
