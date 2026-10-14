import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Film, 
  ArrowRight, 
  Clapperboard, 
  ShieldCheck, 
  Camera, 
  Compass,
  Smile,
  Cake,
  Coffee,
  Zap
} from 'lucide-react';
import type { Persona, ShotConfig, StoryGenre } from '../types';
import { generateFullStoryboardWithAI, compileVeoPrompt } from '../services/promptCompiler';

interface EasyStoryCreatorProps {
  personas: Persona[];
  activePersona: Persona;
  onSelectPersona: (personaId: string) => void;
  onApplyStoryboard: (shots: ShotConfig[]) => void;
  onOpenDirectorStudio: () => void;
  apiKey?: string;
}

interface GenreOption {
  id: StoryGenre;
  label: string;
  icon: React.ReactNode;
  hint: string;
}

const GENRES: GenreOption[] = [
  { id: 'travel', label: 'ท่องเที่ยว', icon: <Compass className="w-4 h-4 text-emerald-400" />, hint: 'ชมวิว ธรรมชาติ ชายหาด ล่องเรือ' },
  { id: 'comedy', label: 'ตลก / เฮฮา', icon: <Smile className="w-4 h-4 text-amber-400" />, hint: 'มุกฮา น่ารัก ขำขันกับเพื่อน' },
  { id: 'birthday', label: 'วันเกิด / ปาร์ตี้', icon: <Cake className="w-4 h-4 text-pink-400" />, hint: 'เป่าเค้ก งานเลี้ยง ฉลองอบอุ่น' },
  { id: 'cinematic', label: 'ภาพยนตร์', icon: <Film className="w-4 h-4 text-purple-400" />, hint: 'ซีนอารมณ์ ลึกลับ เท่ระดับฮอลลีวูด' },
  { id: 'lifestyle', label: 'ไลฟ์สไตล์', icon: <Coffee className="w-4 h-4 text-sky-400" />, hint: 'คาเฟ่ ชีวิตประจำวัน ชิลล์ๆ' },
  { id: 'action', label: 'แอ็กชัน / เรือ', icon: <Zap className="w-4 h-4 text-orange-400" />, hint: 'ตื่นเต้น ขับเรือ ความเร็ว ผจญภัย' },
];

const QUICK_IDEAS: Record<string, string[]> = {
  travel: [
    'นั่งเรือไม้ชมพระอาทิตย์ตกที่เกาะพีพี ลมพัดผม แสงสีทองสวยงาม',
    'เดินเล่นบนถนนคนเดินริมหาด ถือกล้องถ่ายรูปบรรยากาศรอบตัว',
    'ขึ้นไปยืนชมวิวพาโนรามาบนยอดเขา สูดอากาศบริสุทธิ์อย่างสดชื่น'
  ],
  comedy: [
    'แอบเดินมาเซอร์ไพรส์เพื่อน แต่สะดุดขาตัวเองจนหลุดหัวเราะทั้งคู่',
    'ลองชิมของเผ็ดแล้วทำหน้าเหวอสุดขีด ก่อนจะดื่มน้ำรวดเดียวหมด',
    'ทำท่าเต้นตลกๆ แกล้งเพื่อนริมสระน้ำจนทุกคนหัวเราะร่าเริง'
  ],
  birthday: [
    'เดินเข้ามาในห้องจัดงาน ตกแต่งลูกโป่ง แสงเทียนสว่างไสว ยิ้มดีใจ',
    'หลับตาอธิษฐานหน้าเค้กวันเกิด แล้วเป่าเทียนด้วยรอยยิ้มอบอุ่น',
    'ยกแก้วชนฉลองวันเกิดกับคนสนิท ทุกคนปรบมือและยิ้มให้กล้อง'
  ],
  cinematic: [
    'ยืนมองสายฝนในเมืองยามค่ำคืน แสงไฟนีออนสะท้อนแววตาคมกริบ',
    'ก้าวเดินออกจากเงามืดบนดาดฟ้าตึก เสื้อโค้ทพัดตามลมอย่างทรงพลัง',
    'หันหน้ามามองกล้องช้าๆ ด้วยสายตามุ่งมั่น พร้อมรับความท้าทายใหม่'
  ],
  lifestyle: [
    'นั่งจิบกาแฟริมหน้าต่างคาเฟ่กระจกใส แสงแดดยามเช้าส่องละมุน',
    'เดินเปิดสมุดจดไอเดียในสวนสาธารณะ บรรยากาศร่มรื่นสบายใจ',
    'เดินเล่นริมฟุตบาทในเมืองตอนบ่าย ยิ้มทักทายอย่างเป็นกันเอง'
  ],
  action: [
    'ขับเรือเร็วแหวกคลื่นกลางทะเลสีคราม ละอองน้ำกระเซ็น ลมพัดแรง',
    'จับหางเสือหรือพวงมาลัยด้วยความชำนาญ เร่งสปีดมุ่งหน้าสู่เกาะเป้าหมาย',
    'ชะลอเรือเข้าเทียบท่าในยามเย็น แสงอาทิตย์ตกดินสะท้อนผิวน้ำอย่างงดงาม'
  ]
};

export const EasyStoryCreator: React.FC<EasyStoryCreatorProps> = ({
  personas,
  activePersona,
  onSelectPersona,
  onApplyStoryboard,
  onOpenDirectorStudio,
  apiKey
}) => {
  const [selectedGenre, setSelectedGenre] = useState<StoryGenre>('travel');
  const [storyIdea, setStoryIdea] = useState(QUICK_IDEAS.travel[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedShots, setGeneratedShots] = useState<ShotConfig[] | null>(null);
  const [copiedShotId, setCopiedShotId] = useState<string | null>(null);

  // Reference photos count of current persona
  const refCount = activePersona.referenceImages?.filter((r) => Boolean(r.url)).length || 0;

  const handleGenerate = async () => {
    if (!storyIdea.trim()) return;
    setIsGenerating(true);
    try {
      const shots = await generateFullStoryboardWithAI(
        storyIdea.trim(),
        selectedGenre,
        activePersona,
        apiKey
      );

      // Pre-compile prompts for all 3 shots
      const compiled = shots.map((s, idx) => ({
        ...s,
        compiledPrompt: compileVeoPrompt(s, activePersona, idx, true, personas)
      }));

      setGeneratedShots(compiled);
    } catch (err) {
      console.error('Failed to generate story', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = async (shot: ShotConfig) => {
    const promptText = shot.compiledPrompt || compileVeoPrompt(shot, activePersona, 0, false, personas);
    await navigator.clipboard.writeText(promptText);
    setCopiedShotId(shot.id);
    setTimeout(() => setCopiedShotId(null), 2500);
  };

  const handleDownloadRefImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSendToTimeline = () => {
    if (!generatedShots || generatedShots.length === 0) return;
    onApplyStoryboard(generatedShots);
    onOpenDirectorStudio();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">Easy Story Creator (โหมดสร้างเรื่องง่าย)</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              มือถือแตะสร้างได้ทันที
            </span>
          </div>
          <p className="text-xs text-slate-400">
            เลือกตัวละคร เลือกแนวเรื่อง พิมพ์สิ่งที่อยากทำเป็นภาษาไทย แล้วให้ AI เนรมิต 3 ช็อตพร้อมล็อกหน้าจริงให้อัตโนมัติ
          </p>
        </div>
      </div>

      {/* Step 1: Select My AI Twin */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[11px] font-bold">1</span>
          <span>เลือก My AI Twin (ตัวละครหลักที่จะอยู่ในเรื่อง):</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {personas.map((p) => {
            const isSelected = p.id === activePersona.id;
            const photosCount = p.referenceImages?.filter((r) => Boolean(r.url)).length || 0;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPersona(p.id)}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-indigo-400/40 shrink-0">
                  <img
                    src={p.avatarUrl || p.referenceImages[0]?.url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  {p.isDefault && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-amber-400 rounded-full border border-slate-950" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate flex items-center gap-1">
                    <span>{p.name}</span>
                    {p.isDefault && <span className="text-[9px] text-amber-400">(หลัก)</span>}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-indigo-400" />
                    <span>รูปจริง: {photosCount}/3</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {refCount === 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-2.5 rounded-xl text-xs flex items-center gap-2">
            <span>⚠️ แนะนำให้อัปโหลดรูปหน้าจริงในแท็บ "1. หน้าเรา" ก่อน เพื่อให้ AI ล็อกใบหน้าได้แม่นยำครับ</span>
          </div>
        )}
      </div>

      {/* Step 2: Select Genre */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[11px] font-bold">2</span>
          <span>เลือกประเภทเรื่องราว (Genre):</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {GENRES.map((g) => {
            const isSelected = selectedGenre === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setSelectedGenre(g.id);
                  setStoryIdea(QUICK_IDEAS[g.id][0]);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-900/60 to-purple-950/60 border-indigo-400 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                {g.icon}
                <span className="text-xs font-bold">{g.label}</span>
                <span className="text-[9px] text-slate-400 truncate max-w-full hidden sm:block">{g.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Enter Thai Idea */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-[11px] font-bold">3</span>
          <span>พิมพ์สิ่งที่อยากให้ตัวเองทำในเรื่อง (ภาษาไทย):</span>
        </label>

        <textarea
          rows={3}
          value={storyIdea}
          onChange={(e) => setStoryIdea(e.target.value)}
          placeholder="พิมพ์เรื่องราว เช่น: ผมกับเพื่อนไปขับเรือชมวิวพระอาทิตย์ตกที่เกาะพีพี ลมพัดเย็นสบาย ยิ้มมีความสุข"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />

        {/* Quick Idea Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] text-slate-400 font-medium">ไอเดียตัวอย่าง:</span>
          {(QUICK_IDEAS[selectedGenre] || QUICK_IDEAS.travel).map((idea, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setStoryIdea(idea)}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-slate-800 transition-colors cursor-pointer truncate max-w-[280px]"
            >
              {idea}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Action Button */}
      <div>
        <button
          type="button"
          disabled={isGenerating || !storyIdea.trim()}
          onClick={handleGenerate}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>ผู้กำกับ AI กำลังจัดฉาก 3 ช็อตและล็อกหน้า...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>✨ เนรมิตสตอรี่บอร์ด 3 ช็อตพร้อม Prompt & ภาพอ้างอิง</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Results (3 Sequential Shots with Face Reference Binding) */}
      {generatedShots && generatedShots.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-indigo-400" />
                <span>สตอรี่บอร์ด 3 ช็อตต่อเนื่อง (ผูกหน้าจริงของ {activePersona.name})</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                ทุกช็อตผูกรหัส Face DNA และภาพอ้างอิงไว้เรียบร้อยแล้ว แตะคัดลอก Prompt เพื่อนำไปวางใน Google Flow
              </p>
            </div>

            <button
              onClick={handleSendToTimeline}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>เปิดในหน้าผู้กำกับเต็มรูปแบบ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {generatedShots.map((shot, idx) => {
              // Pick corresponding reference image angle
              const refAngle = idx === 0 ? 'front' : idx === 1 ? 'angle_45' : 'profile';
              const refImg = activePersona.referenceImages?.find((r) => r.angle === refAngle) || activePersona.referenceImages?.[0];
              const isCopied = copiedShotId === shot.id;

              return (
                <div
                  key={shot.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-3 relative hover:border-indigo-500/40 transition-all shadow-md"
                >
                  <div className="space-y-2.5">
                    {/* Shot Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span>{shot.title}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                        {shot.framing.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Reference Face Thumbnail */}
                    <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2 flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 border border-indigo-500/30 shrink-0">
                        {refImg?.url ? (
                          <img src={refImg.url} alt="Face Ref" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500">
                            ไม่มีรูป
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] min-w-0 flex-1">
                        <div className="font-semibold text-slate-200 truncate">
                          ภาพอ้างอิง: {refImg?.label || 'Master Face'}
                        </div>
                        <div className="text-indigo-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>ล็อกหน้า {activePersona.name}</span>
                        </div>
                      </div>
                      {refImg?.url && (
                        <button
                          type="button"
                          onClick={() => handleDownloadRefImage(refImg.url, `${activePersona.name}_ref_shot${idx + 1}`)}
                          title="ดาวน์โหลดภาพอ้างอิงนี้เพื่ออัปโหลดใน Google Flow"
                          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Action & Scene Summary */}
                    <div className="text-[11px] text-slate-300 space-y-1">
                      <p className="line-clamp-2">
                        <strong className="text-slate-400">การกระทำ:</strong> {shot.userPrompt || shot.characterAction}
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        <strong>ฉาก:</strong> {shot.sceneEnvironment}
                      </p>
                    </div>

                    {/* Prompt Box */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2 font-mono text-[10px] text-slate-300 line-clamp-3 select-all">
                      {shot.compiledPrompt}
                    </div>
                  </div>

                  {/* Actions for this shot */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(shot)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 active:scale-95'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'คัดลอกเรียบร้อยแล้ว!' : `คัดลอก Prompt ช็อต ${idx + 1}`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
