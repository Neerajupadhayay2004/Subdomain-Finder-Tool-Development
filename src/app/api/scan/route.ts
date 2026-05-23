import { NextResponse } from "next/server";
import { startScan } from "@/services/scanner";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { domain } = await req.json();
    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    // Start scan (in a real app, this should be a background job)
    // For now, we'll await it but we could also return the scanId immediately
    const result = await startScan(domain);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Scan Error:", error);
    return NextResponse.json({ error: "Failed to start scan" }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log("Fetching recent scans...");
    const scans = await prisma.scan.findMany({
      orderBy: { startedAt: "desc" },
      take: 10,
      include: {
        _count: {
          select: { subdomains: true },
        },
      },
    });
    console.log("Scans fetched:", scans.length);
    return NextResponse.json(scans);
  } catch (error) {
    console.error("GET /api/scan error:", error);
    return NextResponse.json({ error: "Failed to fetch scans", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
