import { prisma } from "@/lib/prisma";
import { getShodanSubdomains } from "./shodan";
import { getVTSubdomains } from "./virustotal";
import { dnsBruteforce, resolveIP, getHttpStatus } from "./dns";
import { checkIPAbuse } from "./abuseipdb";

export async function startScan(domain: string) {
  // 1. Create a new scan record
  const scan = await prisma.scan.create({
    data: {
      domain,
      status: "running",
    },
  });

  const scanId = scan.id;

  try {
    // 2. Run passive discovery in parallel
    const [shodanResults, vtResults, dnsResults] = await Promise.all([
      getShodanSubdomains(domain),
      getVTSubdomains(domain),
      dnsBruteforce(domain),
    ]);

    // 3. Combine and unique results
    const allResults = [...shodanResults, ...vtResults, ...dnsResults];
    const uniqueDomains = new Map();

    for (const res of allResults) {
      if (!uniqueDomains.has(res.domain)) {
        uniqueDomains.set(res.domain, res);
      }
    }

    const results = Array.from(uniqueDomains.values());

    // 4. Enrich results (IP and Status)
    const enrichedResults = await Promise.all(
      results.map(async (res) => {
        const ip = res.ip || (await resolveIP(res.domain));
        const status = await getHttpStatus(res.domain);
        
        let abuseScore = null;
        if (ip) {
          const abuseData = await checkIPAbuse(ip);
          abuseScore = abuseData?.abuseConfidenceScore;
        }
        
        const screenshot = status && status < 400 
          ? `https://s.wordpress.com/mshots/v1/https://${res.domain}?w=800`
          : null;
        
        return {
          ...res,
          ip,
          status,
          abuseScore,
          screenshot,
        };
      })
    );

    // 5. Save results to DB
    await prisma.subdomain.createMany({
      data: enrichedResults.map((res) => ({
        scanId,
        domain: res.domain,
        ip: res.ip,
        status: res.status,
        provider: res.provider,
        abuseScore: res.abuseScore,
        screenshot: res.screenshot,
      })),
    });

    // 6. Mark scan as completed
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });

    return { scanId, results: enrichedResults };
  } catch (error) {
    console.error("Scan error:", error);
    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "failed" },
    });
    throw error;
  }
}
