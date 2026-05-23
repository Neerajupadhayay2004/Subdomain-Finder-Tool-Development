import axios from "axios";

const SHODAN_API_KEY = process.env.SHODAN_API_KEY;

export async function getShodanSubdomains(domain: string) {
  if (!SHODAN_API_KEY) return [];

  try {
    const response = await axios.get(`https://api.shodan.io/dns/domain/${domain}?key=${SHODAN_API_KEY}`);
    const data = response.data;
    
    if (data && data.subdomains) {
      return data.subdomains.map((sub: string) => ({
        domain: `${sub}.${domain}`,
        provider: "Shodan",
      }));
    }
    return [];
  } catch (error) {
    console.error("Shodan API Error:", error);
    return [];
  }
}
