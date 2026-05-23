"use client";

import { Shield, ExternalLink, Globe, Server, Eye } from "lucide-react";

interface Subdomain {
  id: string;
  domain: string;
  ip: string | null;
  status: number | null;
  provider: string;
  abuseScore?: number | null;
  screenshot?: string | null;
}

interface ResultTableProps {
  subdomains: Subdomain[];
}

export default function ResultTable({ subdomains }: ResultTableProps) {
  return (
    <div className="w-full overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Subdomain</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">IP Address</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Reputation</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Preview</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Source</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {subdomains.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                  No subdomains found. Start a scan to see results.
                </td>
              </tr>
            ) : (
              subdomains.map((sub) => (
                <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{sub.domain}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                    <div className="flex items-center gap-2">
                      <Server className="w-3 h-3" />
                      {sub.ip || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {sub.status ? (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        sub.status >= 200 && sub.status < 300 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                      }`}>
                        {sub.status}
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-xs">Offline</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {sub.abuseScore !== undefined && sub.abuseScore !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              sub.abuseScore > 50 ? "bg-red-500" : sub.abuseScore > 20 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${sub.abuseScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{sub.abuseScore}%</span>
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {sub.screenshot ? (
                      <div className="relative group/preview">
                        <button className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover/preview:block z-50 w-48 h-32 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={sub.screenshot} 
                            alt={`Preview of ${sub.domain}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-[10px] italic">No Preview</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                      <Shield className="w-3 h-3" />
                      {sub.provider}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`https://${sub.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-zinc-400 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
