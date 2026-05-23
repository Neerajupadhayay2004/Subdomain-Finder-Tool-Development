import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scan = await prisma.scan.findUnique({
      where: { id },
      include: {
        subdomains: {
          orderBy: { domain: "asc" },
        },
      },
    });

    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    return NextResponse.json(scan);
  } catch {
    return NextResponse.json({ error: "Failed to fetch scan details" }, { status: 500 });
  }
}
