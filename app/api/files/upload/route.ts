import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAllowedRoots, isPathAllowed, IGNORED_NAMES, IGNORED_SUFFIXES } from "@/lib/file-access";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const rawTargetDir = formData.get("targetDir") as string || "";

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate and resolve target directory
    const allowedRoots = await getAllowedRoots();
    if (!isPathAllowed(rawTargetDir, allowedRoots)) {
      return NextResponse.json({ error: "Access denied: target directory not allowed" }, { status: 403 });
    }

    // Ensure target directory exists
    if (!fs.existsSync(rawTargetDir)) {
      return NextResponse.json({ error: "Target directory does not exist" }, { status: 404 });
    }

    const targetStat = fs.statSync(rawTargetDir);
    if (!targetStat.isDirectory()) {
      return NextResponse.json({ error: "Target is not a directory" }, { status: 400 });
    }

    const saved: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const fileName = file.name;

      // Filter out ignored names
      if (IGNORED_NAMES.has(fileName) || IGNORED_SUFFIXES.some((s) => fileName.endsWith(s))) {
        skipped.push(fileName);
        continue;
      }

      // Basic path traversal protection
      const safeName = path.basename(fileName);
      if (safeName.includes("..") || safeName.includes("/") || safeName.includes("\\")) {
        skipped.push(fileName);
        continue;
      }

      const destPath = path.join(rawTargetDir, safeName);

      // Don't overwrite directories
      if (fs.existsSync(destPath)) {
        const existingStat = fs.statSync(destPath);
        if (existingStat.isDirectory()) {
          errors.push(`${safeName}: path is an existing directory`);
          continue;
        }
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(destPath, buffer);
        saved.push(safeName);
      } catch (err) {
        errors.push(`${safeName}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return NextResponse.json({
      success: true,
      saved,
      skipped,
      errors,
      count: saved.length,
      targetDir: rawTargetDir,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
