import React from 'react';
import { 
  Clapperboard, 
  ExternalLink, 
  Sparkles, 
  Key, 
  Code2, 
  Users, 
  Smartphone,
  Columns,
  UserPlus
} from 'lucide-react';
import type { Persona } from '../types';

interface HeaderProps {
  personas: Persona[];
  activePersona: Persona;
  onSelectPersona: (personaId: string) => void;
  onOpenApiKeyModal: () => void;
  onOpenHelperModal: () => void;
  onOpenMobileModal: () => void;
  onOpenCreatePersonaModal?: () => void;
  isDockMode: boolean;
  onToggleDockMode: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  personas,
  activePersona,
  onSelectPersona,
  onOpenApiKeyModal,
  onOpenHelperModal,
  onOpenMobileModal,
  onOpenCreatePersonaModal,
  isDockMode,
  onToggleDockMode,
  hasApiKey
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Clapperboard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-base sm:text-lg text-white tracking-tight">Flow Director</span>
              <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hidden xs:inline-block">
                Veo & Flow Studio
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">สตูดิโอสั่งการและล็อกหน้าตัวละครสำหรับ Google Flow</p>
          </div>
        </div>

        {/* Center / Persona Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
          <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-slate-400 font-medium hidden md:inline">Twin:</span>
          <select
            value={activePersona.id}
            onChange={(e) => onSelectPersona(e.target.value)}
            aria-label="เลือก Digital Twin คาแรคเตอร์"
            className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1 max-w-[110px] sm:max-w-[150px] truncate"
          >
            {personas.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                {p.name}
              </option>
            ))}
          </select>

          {onOpenCreatePersonaModal && (
            <button
              onClick={onOpenCreatePersonaModal}
              title="เพิ่มเพื่อน / ตัวละครใหม่ พร้อมรูปหน้าจริง"
              className="p-1 hover:bg-slate-800 text-purple-400 rounded-md transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Access button */}
          <button
            onClick={onOpenMobileModal}
            title="เปิดบนโทรศัพท์มือถือ"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/50 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">บนมือถือ</span>
          </button>

          {/* Dock Mode toggle */}
          <button
            onClick={onToggleDockMode}
            title={isDockMode ? 'ขยายเต็มจอ' : 'ย่อเป็นโหมดจอแยก'}
            className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isDockMode
                ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{isDockMode ? 'เต็มจอ' : 'โหมดจอแยก'}</span>
          </button>

          {/* Gemini API Key */}
          <button
            onClick={onOpenApiKeyModal}
            title={hasApiKey ? 'Gemini AI Active' : 'Setup Gemini API'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              hasApiKey
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{hasApiKey ? 'Gemini AI' : 'API Key'}</span>
          </button>

          {/* Flow Injector script */}
          <button
            onClick={onOpenHelperModal}
            title="Flow Injector Script"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Script</span>
          </button>

          {/* Direct Flow Launch */}
          <a
            href="https://flow.google"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Flow</span>
            <ExternalLink className="w-3 h-3 opacity-80 hidden xs:inline" />
          </a>
        </div>
      </div>
    </header>
  );
};
