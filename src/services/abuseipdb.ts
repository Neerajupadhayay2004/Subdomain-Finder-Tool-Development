import axios from "axios";

const ABUSEIPDB_API_KEY = process.env.ABUSEIPDB_API_KEY;

export async function checkIPAbuse(ip: string) {
  if (!ABUSEIPDB_API_KEY) return null;

  try {
    const response = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
      params: {
        ipAddress: ip,
        maxAgeInDays: 90,
      },
      headers: {
        "Key": ABUSEIPDB_API_KEY,
        "Accept": "application/json",
      },
    });
    
    return response.data.data;
  } catch (error) {
    console.error("AbuseIPDB API Error:", error);
    return null;
  }
}
