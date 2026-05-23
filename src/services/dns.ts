import dns from "dns/promises";
import axios from "axios";

export async function resolveIP(domain: string) {
  try {
    const addresses = await dns.resolve4(domain);
    return addresses[0];
  } catch {
    return null;
  }
}

export async function getHttpStatus(domain: string) {
  try {
    const response = await axios.get(`https://${domain}`, {
      timeout: 5000,
      validateStatus: () => true,
    });
    return response.status;
  } catch {
    try {
      const response = await axios.get(`http://${domain}`, {
        timeout: 5000,
        validateStatus: () => true,
      });
      return response.status;
    } catch {
      return null;
    }
  }
}

export async function dnsBruteforce(domain: string) {
  // A small list of common subdomains for demo purposes
  const commonSubdomains = ["www", "mail", "remote", "blog", "webmail", "server", "ns1", "ns2", "smtp", "vpn", "api", "dev", "test", "stage"];
  const results = [];

  for (const sub of commonSubdomains) {
    const target = `${sub}.${domain}`;
    const ip = await resolveIP(target);
    if (ip) {
      results.push({
        domain: target,
        ip,
        provider: "DNS Bruteforce",
      });
    }
  }
  return results;
}
