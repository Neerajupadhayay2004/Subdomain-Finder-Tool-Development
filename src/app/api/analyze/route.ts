import { NextResponse } from "next/server";
import { analyzeSubdomains } from "@/services/gemini";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { subdomains, scanId } = await req.json();
    if (!subdomains || !Array.isArray(subdomains)) {
      return NextResponse.json({ error: "Subdomains array is required" }, { status: 400 });
    }

    const analysis = await analyzeSubdomains(subdomains);

    if (scanId) {
      await prisma.scan.update({
        where: { id: scanId },
        data: { analysis },
      });
    }

    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json({ error: "Failed to analyze subdomains" }, { status: 500 });
  }
}
