import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function localAnalysis(subdomains: string[]) {
  const highValuePatterns = ["dev", "stage", "api", "vpn", "mail", "admin", "test", "portal", "internal"];
  const foundPatterns = subdomains.filter(s => 
    highValuePatterns.some(pattern => s.toLowerCase().includes(pattern))
  );

  return `### Automated Asset Analysis (Local Fallback)
  
- **Found ${subdomains.length} total subdomains.**
- **High-Value Targets Identified:** ${foundPatterns.length > 0 ? foundPatterns.slice(0, 10).join(", ") : "None detected via common naming patterns."}
- **Security Recommendation:** Ensure all identified ${foundPatterns.length > 0 ? "high-value" : "exposed"} assets have proper authentication and are monitored for vulnerabilities.
- **Note:** AI-powered deep analysis was unreachable, providing rule-based summary instead.`;
}

export async function analyzeSubdomains(subdomains: string[]) {
  if (!GEMINI_API_KEY) return "AI Analysis not available: API Key missing.";

  // Limit subdomains to avoid prompt size issues
  const limitedSubdomains = subdomains.slice(0, 50);
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a security expert. Analyze the following list of subdomains for a target domain. 
  Identify potential high-value targets (like dev, stage, api, vpn, mail), architectural patterns, and potential security risks. 
  Provide a concise, professional summary in 3-4 bullet points.
  
  Subdomains:
  ${limitedSubdomains.join(", ")}
  
  ${subdomains.length > 50 ? `(Note: Analysis limited to first 50 of ${subdomains.length} subdomains)` : ""}`;

  let retries = 2;
  while (retries > 0) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });
      const response = await result.response;
      return response.text();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Gemini API Error (Retries left: ${retries - 1}):`, errorMessage);
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
      } else {
        console.error("Gemini API permanently failed, using local fallback.");
        return localAnalysis(subdomains);
      }
    }
  }
  return localAnalysis(subdomains);
}
