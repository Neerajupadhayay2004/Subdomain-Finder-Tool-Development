"use client";

import { FileText, Table as TableIcon } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { Subdomain } from "@/lib/types";

interface ExportButtonsProps {
  data: Subdomain[];
  domain: string;
}

export default function ExportButtons({ data, domain }: ExportButtonsProps) {
  const exportCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${domain}_subdomains.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Subdomain Report for ${domain}`, 14, 15);
    doc.text(`Total Subdomains Found: ${data.length}`, 14, 25);
    
    const tableData = data.map(sub => [
      sub.domain,
      sub.ip || "N/A",
      sub.status || "N/A",
      sub.abuseScore !== undefined && sub.abuseScore !== null ? `${sub.abuseScore}%` : "N/A",
      sub.provider,
      sub.screenshot ? "Yes" : "No"
    ]);

    autoTable(doc, {
      head: [["Subdomain", "IP Address", "Status", "Abuse Score", "Source", "Preview"]],
      body: tableData,
      startY: 35,
    });

    doc.save(`${domain}_report.pdf`);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={exportCSV}
        disabled={data.length === 0}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
      >
        <TableIcon className="w-4 h-4" />
        Export CSV
      </button>
      <button
        onClick={exportPDF}
        disabled={data.length === 0}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        <FileText className="w-4 h-4" />
        Export PDF
      </button>
    </div>
  );
}
