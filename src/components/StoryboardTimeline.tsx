import React from 'react';
import { 
  Film, 
  Plus, 
  Trash2, 
  Clock, 
  Layers, 
  Download,
  Copy,
  Check,
  Sparkles,
  Mic,
  Compass,
  Smartphone,
  Clapperboard
} from 'lucide-react';
import type { ShotConfig, Persona } from '../types';
import { compileVeoPrompt, generateFullStoryboardWithAI } from '../services/promptCompiler';

interface StoryboardTimelineProps {
  shots: ShotConfig[];
  activeShotId: string;
  persona: Persona;
  onSelectShot: (id: string) => void;
  onAddShot: () => void;
  onDeleteShot: (id: string) => void;
  onLoadTemplateStoryboard: (newShots: ShotConfig[]) => void;
  apiKey?: string;
  allPersonas?: Persona[];
}

export const StoryboardTimeline: React.FC<StoryboardTimelineProps> = ({
  shots,
  activeShotId,
  persona,
  onSelectShot,
  onAddShot,
  onDeleteShot,
  onLoadTemplateStoryboard,
  apiKey,
  allPersonas = []
}) => {
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = React.useState(false);

  const totalDuration = shots.reduce((sum, s) => sum + (s.durationSeconds || 5), 0);

  const handleApplyTemplate = async (templateType: 'podcast' | 'travel' | 'tech_review' | 'cinematic_story', label: string) => {
    setIsGeneratingStory(true);
    try {
      const generated = await generateFullStoryboardWithAI(label, templateType, persona, apiKey);
      onLoadTemplateStoryboard(generated);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleCopyAllPrompts = async () => {
    const fullScript = shots
      .map((shot, idx) => {
        const prompt = compileVeoPrompt(shot, persona, idx, shots.length > 1, allPersonas);
        return `=== ${shot.title} (${shot.durationSeconds || 5}s) ===\n${prompt}\n`;
      })
      .join('\n\n');

    await navigator.clipboard.writeText(fullScript);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ persona, shots }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `flow_storyboard_${persona.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Multi-Shot Storyboard Timeline</h3>
          <span className="text-xs text-slate-400">
            ({shots.length} ช็อต • รวม ~{totalDuration} วินาที)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAllPrompts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'คัดลอกทั้งเรื่องแล้ว' : 'Copy All Shots'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Script JSON</span>
          </button>
        </div>
      </div>

      {/* 1-Click Narrative Storyboard Templates */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <div>
            <span className="text-xs font-bold text-white block">1-Click Storyboard Presets (สร้างทั้งเรื่องใน 1 วินาที):</span>
            <span className="text-[11px] text-slate-400">สร้าง 3 ช็อตต่อเนื่องกันพร้อมคุมแสงและหน้าเหมือนอัตโนมัติ</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            disabled={isGeneratingStory}
            onClick={() => handleApplyTemplate('podcast', 'พอดแคสต์เล่าเรื่อง 3 ช็อต')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1 transition-all cursor-pointer"
          >
            <Mic className="w-3 h-3 text-pink-400" />
            <span>พอดแคสต์ (3 Shots)</span>
          </button>

          <button
            disabled={isGeneratingStory}
            onClick={() => handleApplyTemplate('travel', 'ท่องเที่ยวเดินชิลล์ 3 ช็อต')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1 transition-all cursor-pointer"
          >
            <Compass className="w-3 h-3 text-amber-400" />
            <span>ท่องเที่ยว (3 Shots)</span>
          </button>

          <button
            disabled={isGeneratingStory}
            onClick={() => handleApplyTemplate('tech_review', 'รีวิวแกดเจ็ตเทคโนโลยี 3 ช็อต')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1 transition-all cursor-pointer"
          >
            <Smartphone className="w-3 h-3 text-cyan-400" />
            <span>รีวิวของ (3 Shots)</span>
          </button>

          <button
            disabled={isGeneratingStory}
            onClick={() => handleApplyTemplate('cinematic_story', 'ภาพยนตร์ไซเบอร์พังก์ 3 ช็อต')}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1 transition-all cursor-pointer"
          >
            <Clapperboard className="w-3 h-3 text-purple-400" />
            <span>หนังสั้น (3 Shots)</span>
          </button>
        </div>
      </div>

      {/* Shots Carousel / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {shots.map((shot, idx) => {
          const isActive = shot.id === activeShotId;
          return (
            <div
              key={shot.id}
              onClick={() => onSelectShot(shot.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                isActive
                  ? 'bg-indigo-950/50 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-indigo-600/30 text-indigo-400 text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {shot.title}
                  </span>
                  {shots.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteShot(shot.id);
                      }}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="ลบช็อตนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-2">
                  {shot.characterAction || shot.userPrompt || 'ยังไม่ได้กำหนดเนื้อหา'}
                </p>

                <div className="flex flex-wrap gap-1 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {shot.framing.replace('_', ' ')}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {shot.lighting.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {shot.durationSeconds || 5}s
                </span>
                {idx > 0 && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                    <Layers className="w-2.5 h-2.5" /> Chained
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Shot Card */}
        <button
          onClick={onAddShot}
          className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950/40 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-300 transition-all cursor-pointer min-h-[130px]"
        >
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">+ เพิ่ม Shot ใหม่ (Continuity)</span>
          <span className="text-[10px] text-slate-500 text-center">คัดลอกคาแรคเตอร์และแสงต่อเนื่องอัตโนมัติ</span>
        </button>
      </div>
    </div>
  );
};
