import axios from "axios";

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

interface VTItem {
  id: string;
  type: string;
}

export async function getVTSubdomains(domain: string) {
  if (!VIRUSTOTAL_API_KEY) return [];

  try {
    const response = await axios.get(
      `https://www.virustotal.com/api/v3/domains/${domain}/subdomains?limit=40`,
      {
        headers: {
          "x-apikey": VIRUSTOTAL_API_KEY,
        },
      }
    );
    
    const data = response.data;
    if (data && data.data) {
      return data.data.map((item: VTItem) => ({
        domain: item.id,
        provider: "VirusTotal",
      }));
    }
    return [];
  } catch (error) {
    console.error("VirusTotal API Error:", error);
    return [];
  }
}
