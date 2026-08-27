import React, { useState } from "react";
import { Users, RefreshCw, Globe2, List, Mail } from "lucide-react";

interface AccountGeneratorProps {
  onGenerate: (baseEmail: string, countries: string[]) => void;
  generatedAccounts: Array<{ id: string; alias: string; country: string }>;
  onSelectAccount: (email: string) => void;
}

export function AccountGenerator({ onGenerate, generatedAccounts, onSelectAccount }: AccountGeneratorProps) {
  const [baseEmail, setBaseEmail] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["US", "UK", "CA"]);
  const countries = [
    { id: "US", name: "United States", code: ".us" },
    { id: "UK", name: "United Kingdom", code: ".uk" },
    { id: "CA", name: "Canada", code: ".ca" },
    { id: "BD", name: "Bangladesh", code: ".bd" },
    { id: "IN", name: "India", code: ".in" },
    { id: "DE", name: "Germany", code: ".de" }
  ];

  const toggleCountry = (id: string) => {
    setSelectedCountries(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    if (!baseEmail) return;
    onGenerate(baseEmail, selectedCountries);
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Multi-Account Generator</h3>
        </div>
        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800 uppercase">
          Limit: 200/Session
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Base Gmail Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              type="text"
              placeholder="e.g. username@gmail.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 transition-all"
              value={baseEmail}
              onChange={(e) => setBaseEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Target Regions</label>
          <div className="grid grid-cols-3 gap-2">
            {countries.map(c => (
              <button
                key={c.id}
                onClick={() => toggleCountry(c.id)}
                className={`flex items-center gap-2 p-2 rounded-lg border text-[10px] font-bold transition-all ${
                  selectedCountries.includes(c.id)
                  ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
                  : "bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                }`}
              >
                <Globe2 className="w-3 h-3" />
                {c.id}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!baseEmail}
          className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all text-zinc-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Generate Identity Pool
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col border-t border-zinc-800">
        <div className="p-3 bg-zinc-950/50 flex items-center gap-2">
          <List className="w-3 h-3 text-zinc-500" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Identity Map</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <table className="w-full text-[10px] text-left border-collapse">
            <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800 text-zinc-500 uppercase">
              <tr>
                <th className="px-4 py-2 font-bold">Node</th>
                <th className="px-4 py-2 font-bold">Alias</th>
                <th className="px-4 py-2 font-bold">Region</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {generatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-zinc-700 italic">No identities generated</td>
                </tr>
              ) : (
                generatedAccounts.map((acc, i) => (
                  <tr 
                    key={acc.id} 
                    onClick={() => onSelectAccount(acc.alias)}
                    className="hover:bg-indigo-500/10 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-2 text-zinc-500 font-mono">#{i + 1}</td>
                    <td className="px-4 py-2 text-indigo-300 font-medium group-hover:text-indigo-400">{acc.alias}</td>
                    <td className="px-4 py-2">
                      <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 font-bold">{acc.country}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
