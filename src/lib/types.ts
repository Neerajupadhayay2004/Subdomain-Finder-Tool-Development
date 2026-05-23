export interface Subdomain {
  id: string;
  scanId: string;
  domain: string;
  ip: string | null;
  status: number | null;
  provider: string;
  abuseScore: number | null;
  screenshot: string | null;
  createdAt: string;
}

export interface Scan {
  id: string;
  domain: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  analysis: string | null;
  _count?: {
    subdomains: number;
  };
}
