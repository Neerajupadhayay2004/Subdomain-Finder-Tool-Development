"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { 
  ShieldCheck, 
  History, 
  Activity, 
  BarChart3, 
  Sparkles,
  LayoutDashboard,
  Settings,
  Info
} from "lucide-react";
import ScanForm from "@/components/ScanForm";
import ResultTable from "@/components/ResultTable";
import ExportButtons from "@/components/ExportButtons";
import { Subdomain, Scan } from "@/lib/types";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Subdomain[]>([]);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [targetDomain, setTargetDomain] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const fetchRecentScans = useCallback(async () => {
    try {
      const response = await axios.get("/api/scan");
      setRecentScans(response.data);
    } catch {
      console.error("Failed to fetch recent scans");
    }
  }, []);

  useEffect(() => {
    fetchRecentScans();
  }, [fetchRecentScans]);

  const [activities, setActivities] = useState<string[]>([]);

  const addActivity = (msg: string) => {
    setActivities(prev => [msg, ...prev].slice(0, 10));
  };

  const [currentScanId, setCurrentScanId] = useState<string | null>(null);

  const handleScan = async (domain: string) => {
    setLoading(true);
    setTargetDomain(domain);
    setAiAnalysis("");
    setResults([]);
    setActivities([]);
    setCurrentScanId(null);
    const toastId = toast.loading(`Scanning ${domain}...`);
    addActivity(`Starting scan for ${domain}`);
    addActivity("Querying passive OSINT sources...");

    try {
      const response = await axios.post("/api/scan", { domain });
      setResults(response.data.results);
      setCurrentScanId(response.data.scanId);
      addActivity(`Found ${response.data.results.length} subdomains`);
      addActivity("Enriching results with IP and HTTP status...");
      toast.success(`Scan completed! Found ${response.data.results.length} subdomains.`, { id: toastId });
      fetchRecentScans();
    } catch {
      toast.error("Scan failed. Please check your API keys and try again.", { id: toastId });
      addActivity("Scan failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (results.length === 0) return;
    setAnalyzing(true);
    const toastId = toast.loading("AI is analyzing assets...");

    try {
      const domains = results.map(r => r.domain);
      const response = await axios.post("/api/analyze", { subdomains: domains, scanId: currentScanId });
      setAiAnalysis(response.data.analysis);
      toast.success("Analysis complete!", { id: toastId });
    } catch {
      toast.error("AI Analysis failed.", { id: toastId });
    } finally {
      setAnalyzing(false);
    }
  };

  const loadScan = async (id: string) => {
    setLoading(true);
    setCurrentScanId(id);
    const toastId = toast.loading("Loading scan details...");
    try {
      const response = await axios.get(`/api/scan/${id}`);
      setResults(response.data.subdomains);
      setTargetDomain(response.data.domain);
      setAiAnalysis(response.data.analysis || "");
      setActivities([`Loaded historical scan for ${response.data.domain}`, `Found ${response.data.subdomains.length} assets`]);
      toast.success("Scan details loaded.", { id: toastId });
    } catch (error) {
      console.error("Load scan error:", error);
      toast.error("Failed to load scan details.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
      <Toaster position="top-right" />
      
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://cybergita.com/wp-content/uploads/2024/08/Cyber-Gita-T-Shrit-796x1024.png.webp"
              alt="Cyber Gita Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold tracking-tight">Cyber <span className="text-blue-600">Gita</span></span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-sm font-medium hover:text-blue-600 transition-colors flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button className="text-sm font-medium hover:text-blue-600 transition-colors flex items-center gap-2">
              <Activity className="w-4 h-4" /> Alerts
            </button>
            <button className="text-sm font-medium hover:text-blue-600 transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" /> Settings
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Recent Scans */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              <Activity className="w-4 h-4" /> Live Activity
            </h2>
            <div className="space-y-2">
              {activities.length === 0 ? (
                <p className="text-sm text-zinc-400">Waiting for activity...</p>
              ) : (
                activities.map((act, i) => (
                  <div key={i} className="text-xs flex gap-2 items-start animate-in slide-in-from-left-2 duration-300">
                    <span className="text-blue-500">•</span>
                    <span className="text-zinc-600 dark:text-zinc-400">{act}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-4">
              <History className="w-4 h-4" /> Recent Scans
            </h2>
            <div className="space-y-3">
              {recentScans.length === 0 ? (
                <p className="text-sm text-zinc-400">No scans yet.</p>
              ) : (
                recentScans.map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => loadScan(scan.id)}
                    className="w-full text-left p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group"
                  >
                    <div className="font-medium text-sm truncate">{scan.domain}</div>
                    <div className="text-xs text-zinc-500 mt-1 flex justify-between">
                      <span>{new Date(scan.startedAt).toLocaleDateString()}</span>
                      <span className="group-hover:text-blue-500">{scan._count?.subdomains || 0} found</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> OSINT Pro
            </h3>
            <p className="text-blue-100 text-sm mb-4">
              Unlock advanced features with paid OSINT add-ons and premium API access.
            </p>
            <button className="w-full py-2 bg-white text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          <ScanForm onScanStarted={handleScan} isLoading={loading} />

          {results.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    Results for <span className="text-blue-600">{targetDomain}</span>
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-zinc-500 text-sm">Found {results.length} unique subdomains</p>
                    {currentScanId && (
                      <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-400 font-mono">
                        ID: {currentScanId}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setResults([]);
                      setTargetDomain("");
                      setCurrentScanId(null);
                      setAiAnalysis("");
                      setActivities([]);
                    }}
                    className="text-xs font-medium text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    Clear Results
                  </button>
                  <ExportButtons data={results} domain={targetDomain} />
                </div>
              </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                      <div className="text-xs text-zinc-500 uppercase font-semibold">Live Assets</div>
                      <div className="text-2xl font-bold mt-1 text-emerald-500">
                        {results.filter(r => r.status && r.status < 400).length}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                      <div className="text-xs text-zinc-500 uppercase font-semibold">Unique IPs</div>
                      <div className="text-2xl font-bold mt-1">
                        {new Set(results.map(r => r.ip).filter(Boolean)).size}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                      <div className="text-xs text-zinc-500 uppercase font-semibold">High Risk IPs</div>
                      <div className="text-2xl font-bold mt-1 text-red-500">
                        {results.filter(r => r.abuseScore && r.abuseScore > 50).length}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                      <div className="text-xs text-zinc-500 uppercase font-semibold">Avg. Abuse</div>
                      <div className="text-2xl font-bold mt-1">
                        {results.some(r => r.abuseScore) 
                          ? Math.round(results.reduce((acc, r) => acc + (r.abuseScore || 0), 0) / results.filter(r => r.abuseScore).length) 
                          : 0}%
                      </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
                      <div className="text-xs text-zinc-500 uppercase font-semibold">Previews</div>
                      <div className="text-2xl font-bold mt-1 text-blue-500">
                        {results.filter(r => r.screenshot).length}
                      </div>
                    </div>
                  </div>

              {/* AI Analysis Section */}
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300">
                    <Sparkles className="w-5 h-5" /> AI Asset Analysis
                  </h3>
                  {!aiAnalysis && (
                    <button
                      onClick={handleAIAnalysis}
                      disabled={analyzing}
                      className="text-xs font-bold uppercase tracking-wider bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-zinc-400"
                    >
                      {analyzing ? "Analyzing..." : "Analyze with Gemini"}
                    </button>
                  )}
                </div>
                {aiAnalysis ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-blue-900 dark:text-blue-200 leading-relaxed">
                    {aiAnalysis.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-blue-600/60 dark:text-blue-400/60">
                    Click the button above to generate an AI-powered security analysis of these subdomains.
                  </p>
                )}
              </div>

              <ResultTable subdomains={results} />
            </div>
          )}

          {!results.length && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400">
                <Info className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Ready to start?</h3>
                <p className="text-zinc-500 max-w-sm mx-auto">
                  Enter a domain above to begin subdomain enumeration and asset discovery.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
