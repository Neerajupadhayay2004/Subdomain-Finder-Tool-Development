"use client";

import { useState } from "react";
import { Search, Loader2, ShieldCheck } from "lucide-react";

interface ScanFormProps {
  onScanStarted: (domain: string) => void;
  isLoading: boolean;
}

export default function ScanForm({ onScanStarted, isLoading }: ScanFormProps) {
  const [domain, setDomain] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain) {
      onScanStarted(domain);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 flex flex-col items-center">
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/10 transform -rotate-6 overflow-hidden p-2">
            <img 
              src="https://cybergita.com/wp-content/uploads/2024/08/Cyber-Gita-T-Shrit-796x1024.png.webp" 
              alt="Cyber Gita Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
            <Search className="w-5 h-5 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-black tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
          Cyber <span className="text-blue-600">Gita</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium max-w-md">
          Advanced subdomain discovery and asset intelligence for security professionals.
        </p>
      </div>

      <div className="w-full mb-4">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 ml-1">
          Subdomain Finder Tool Development
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative group">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter target domain (e.g., google.com)"
            className="w-full px-6 py-4 text-lg bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pr-16 shadow-xl"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !domain}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white rounded-xl transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Search className="w-6 h-6" />
            )}
          </button>
        </div>
        <p className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Discover subdomains using Shodan, VirusTotal, and DNS discovery.
        </p>
      </form>
    </div>
  );
}
