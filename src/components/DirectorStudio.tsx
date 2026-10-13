import React, { useState } from 'react';
import { 
  Sparkles, 
  Camera, 
  Sun, 
  Film, 
  Move, 
  Copy, 
  Check, 
  ExternalLink, 
  Wand2, 
  Sliders, 
  RefreshCw,
  Layers,
  Package,
  Plus,
  Users
} from 'lucide-react';
import type { 
  Persona, 
  ShotConfig, 
  ShotFraming, 
  CameraMovement, 
  LightingAtmosphere, 
  LensAesthetic 
} from '../types';
import { 
  FRAMING_DESCRIPTIONS, 
  CAMERA_DESCRIPTIONS, 
  LIGHTING_DESCRIPTIONS, 
  LENS_DESCRIPTIONS, 
  compileVeoPrompt,
  DEFAULT_NEGATIVE_PROMPT,
  refinePromptWithGemini 
} from '../services/promptCompiler';

interface DirectorStudioProps {
  activeShot: ShotConfig;
  persona: Persona;
  allPersonas: Persona[];
  shotIndex: number;
  totalShots: number;
  onUpdateShot: (updated: ShotConfig) => void;
  onOpenCreateFriendModal: () => void;
  apiKey?: string;
}

export const DirectorStudio: React.FC<DirectorStudioProps> = ({
  activeShot,
  persona,
  allPersonas,
  shotIndex,
  totalShots,
  onUpdateShot,
  onOpenCreateFriendModal,
  apiKey
}) => {
  const [naturalInput, setNaturalInput] = useState(activeShot.userPrompt || '');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);

  // Compile prompt live whenever attributes change with multi-character support
  const currentCompiledPrompt = compileVeoPrompt(
    activeShot,
    persona,
    shotIndex,
    totalShots > 1,
    allPersonas
  );

  const handleApplyNaturalPrompt = async () => {
    if (!naturalInput.trim()) return;
    setIsEnhancing(true);

    try {
      const refined = await refinePromptWithGemini(naturalInput, persona, apiKey);
      const updated: ShotConfig = {
        ...activeShot,
        userPrompt: naturalInput,
        sceneEnvironment: refined.sceneEnvironment,
        characterAction: refined.characterAction,
        characterEmotion: refined.characterEmotion,
        framing: refined.suggestedFraming,
        lighting: refined.suggestedLighting,
        cameraMovement: refined.suggestedCamera,
        compiledPrompt: '',
        negativePrompt: DEFAULT_NEGATIVE_PROMPT
      };
      onUpdateShot(updated);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(currentCompiledPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyNegative = async () => {
    await navigator.clipboard.writeText(DEFAULT_NEGATIVE_PROMPT);
    setCopiedNegative(true);
    setTimeout(() => setCopiedNegative(false), 2000);
  };

  const handleSelectTemplate = (templatePrompt: string) => {
    setNaturalInput(templatePrompt);
  };

  return (
    <div className="space-y-6">
      {/* 1. Natural Language / AI Director Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Wand2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">AI Director Prompt Assistant</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              ภาษาไทย / English
            </span>
          </div>

          {shotIndex > 0 && (
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Layers className="w-3 h-3" /> Visual Continuity Active (อ้างอิง Shot ก่อนหน้า)
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <textarea
              rows={2}
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              placeholder="พิมพ์สิ่งที่คุณต้องการ เช่น: 'ผมเดินออกจากตึกสวมสูท ถือโทรศัพท์ แดดยามเย็นส่องเข้าด้านหลัง กล้องเคลื่อนที่ตามด้านหน้า'..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
            <button
              onClick={handleApplyNaturalPrompt}
              disabled={isEnhancing || !naturalInput.trim()}
              className="absolute right-3 bottom-3.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isEnhancing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังวิเคราะห์...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>เรียบเรียง Cinematic Prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Idea Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400">
            <span className="shrink-0 text-[11px]">ไอเดียรวดเร็ว:</span>
            {[
              'เดินถือแก้วกาแฟริมหาด ยิ้มผ่อนคลาย ตอนพระอาทิตย์ตก',
              'นั่งทำงานในห้องกระจก วิวเมืองไฟนีออน สโลว์โมชั่น',
              'พูดบรรยายหน้ากล้อง มั่นใจ ยิ้มสดใส แสงสตูดิโอ',
              'เดินในตรอกโตเกียว ฝนตกพรำๆ แสงนีออนสะท้อนพื้นถนน'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectTemplate(chip)}
                className="shrink-0 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-full px-3 py-1 text-[11px] text-slate-300 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Film Director Physical Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Director Controls (ปรับแต่งมุมมองและแสง)</h3>
          </div>
          <span className="text-xs text-slate-400">
            Shot: <strong className="text-white">{activeShot.title}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Framing */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <label className="flex items-center gap-1.5 font-semibold text-slate-300 mb-2">
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Framing (ระยะภาพ)</span>
            </label>
            <select
              value={activeShot.framing}
              onChange={(e) => onUpdateShot({ ...activeShot, framing: e.target.value as ShotFraming })}
              aria-label="เลือกระยะภาพของกล้อง"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(FRAMING_DESCRIPTIONS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          {/* Camera Motion */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <label className="flex items-center gap-1.5 font-semibold text-slate-300 mb-2">
              <Move className="w-3.5 h-3.5 text-purple-400" />
              <span>Camera Move (การเคลื่อนกล้อง)</span>
            </label>
            <select
              value={activeShot.cameraMovement}
              onChange={(e) => onUpdateShot({ ...activeShot, cameraMovement: e.target.value as CameraMovement })}
              aria-label="เลือกการเคลื่อนไหวของกล้อง"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(CAMERA_DESCRIPTIONS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          {/* Lighting */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <label className="flex items-center gap-1.5 font-semibold text-slate-300 mb-2">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Lighting (บรรยากาศแสง)</span>
            </label>
            <select
              value={activeShot.lighting}
              onChange={(e) => onUpdateShot({ ...activeShot, lighting: e.target.value as LightingAtmosphere })}
              aria-label="เลือกบรรยากาศแสง"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(LIGHTING_DESCRIPTIONS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          {/* Lens */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            <label className="flex items-center gap-1.5 font-semibold text-slate-300 mb-2">
              <Film className="w-3.5 h-3.5 text-pink-400" />
              <span>Lens & Optics (เลนส์ภาพยนตร์)</span>
            </label>
            <select
              value={activeShot.lens}
              onChange={(e) => onUpdateShot({ ...activeShot, lens: e.target.value as LensAesthetic })}
              aria-label="เลือกเลนส์ภาพยนตร์"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(LENS_DESCRIPTIONS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Multi-Character Casting (บุคคลที่ 2 และ 3 / แก๊งเพื่อนในฉาก) */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <label className="font-semibold text-slate-300 text-xs">
                ตัวละครในฉากนี้ (Ensemble Cast & Friends):
              </label>
            </div>
            <span className="text-[10px] text-slate-500">ติ๊กเลือกเพื่อนร่วมฉากเพื่อล็อกหน้าจริงทุกคน</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Protagonist (Me) */}
            <span className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <img
                src={persona.avatarUrl || persona.referenceImages[0]?.url}
                alt={persona.name}
                className="w-4 h-4 rounded-full object-cover border border-indigo-400"
              />
              <span>★ ตัวเรา ({persona.name})</span>
            </span>

            {/* Other friends/personas */}
            {allPersonas
              .filter((p) => p.id !== persona.id)
              .map((friend) => {
                const isSelected = activeShot.secondaryPersonaIds?.includes(friend.id);
                return (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => {
                      const current = activeShot.secondaryPersonaIds || [];
                      const updatedIds = isSelected
                        ? current.filter((id) => id !== friend.id)
                        : [...current, friend.id];
                      onUpdateShot({ ...activeShot, secondaryPersonaIds: updatedIds });
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm shadow-purple-500/20 ring-1 ring-purple-500/50'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={friend.avatarUrl || friend.referenceImages[0]?.url}
                      alt={friend.name}
                      className="w-4 h-4 rounded-full object-cover border border-purple-400/50"
                    />
                    {isSelected ? <Check className="w-3 h-3 text-purple-400" /> : <Plus className="w-3 h-3 opacity-40" />}
                    <span>{friend.name}</span>
                  </button>
                );
              })}

            {/* Add New Friend Button */}
            <button
              type="button"
              onClick={onOpenCreateFriendModal}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-300 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              <span>+ เพิ่มเพื่อนใหม่ (อัปโหลดรูปหน้าจริง)</span>
            </button>
          </div>

            {/* Interaction input if secondary characters are selected */}
            {activeShot.secondaryPersonaIds && activeShot.secondaryPersonaIds.length > 0 && (
              <div className="pt-2 border-t border-slate-900">
                <label className="block text-[11px] text-slate-400 font-medium mb-1">
                  บทบาทและการมีปฏิสัมพันธ์ร่วมกัน (Interaction / Dynamic):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="เช่น: นั่งคุยหัวเราะกันบนเรือ, เดินเคียงข้างกันพูดคุยอย่างสนิทสนม"
                    value={activeShot.characterInteraction || ''}
                    onChange={(e) => onUpdateShot({ ...activeShot, characterInteraction: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateShot({ ...activeShot, characterInteraction: 'sitting together, conversing and sharing warm authentic laughter' })}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300"
                    >
                      นั่งคุยหัวเราะ
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateShot({ ...activeShot, characterInteraction: 'walking side by side enjoying the scenic journey together' })}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300"
                    >
                      เดินด้วยกัน
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        {/* Hero Props Selection for this Shot */}
        {persona.props && persona.props.length > 0 && (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 font-semibold text-slate-300 text-xs">
                <Package className="w-3.5 h-3.5 text-indigo-400" />
                <span>อุปกรณ์/พร็อพประจำตัวในฉากนี้ (Hero Props Continuity):</span>
              </label>
              <span className="text-[10px] text-slate-500">เลือกเพื่อให้ AI วาดสิ่งของชิ้นเดิมตลอดทั้งเรื่อง</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {persona.props.map((prop) => {
                const isSelected = activeShot.selectedPropIds?.includes(prop.id);
                return (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => {
                      const current = activeShot.selectedPropIds || [];
                      const updatedIds = isSelected
                        ? current.filter((id) => id !== prop.id)
                        : [...current, prop.id];
                      onUpdateShot({ ...activeShot, selectedPropIds: updatedIds });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 text-indigo-400" /> : <Plus className="w-3 h-3 opacity-40" />}
                    <span>{prop.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Action & Environment Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">การกระทำตัวละคร (Character Action)</label>
            <input
              type="text"
              value={activeShot.characterAction}
              onChange={(e) => onUpdateShot({ ...activeShot, characterAction: e.target.value })}
              placeholder="เช่น: walking forward while checking phone"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">ฉากหลัง/สถานที่ (Environment)</label>
            <input
              type="text"
              value={activeShot.sceneEnvironment}
              onChange={(e) => onUpdateShot({ ...activeShot, sceneEnvironment: e.target.value })}
              placeholder="เช่น: modern glass rooftop terrace overlooking city"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">อารมณ์/สีหน้า (Emotion & Expression)</label>
            <input
              type="text"
              value={activeShot.characterEmotion}
              onChange={(e) => onUpdateShot({ ...activeShot, characterEmotion: e.target.value })}
              placeholder="เช่น: confident smile, authentic warm gaze"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Compiled Prompt Ready for Google Flow */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white">Veo & Google Flow Master Prompt (พร้อมใช้งานทันที)</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPrompt}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                copiedPrompt
                  ? 'bg-emerald-500 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              }`}
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPrompt ? 'คัดลอกแล้ว!' : 'Copy Veo Prompt'}</span>
            </button>

            <a
              href="https://flow.google"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <span>วางใน Flow</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Prompt Display Box */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto selection:bg-indigo-500/30">
          {currentCompiledPrompt}
        </div>

        {/* Negative Prompt for Face Preservation */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <div className="overflow-hidden">
            <span className="font-semibold text-rose-400 block mb-0.5">Negative Prompt (ป้องกันหน้าเบี้ยว/เสียรูป):</span>
            <p className="text-slate-400 truncate font-mono text-[11px]">{DEFAULT_NEGATIVE_PROMPT}</p>
          </div>
          <button
            onClick={handleCopyNegative}
            className="shrink-0 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
          >
            {copiedNegative ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>คัดลอก</span>
          </button>
        </div>
      </div>
    </div>
  );
};
