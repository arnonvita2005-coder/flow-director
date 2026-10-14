import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shirt, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Camera, 
  Info,
  Check,
  Sparkles,
  RefreshCw,
  Package,
  Image as ImageIcon,
  Edit2,
  UserPlus,
  Star,
  Lock
} from 'lucide-react';
import type { Persona, WardrobePreset, PropAsset } from '../types';
import { analyzeFaceWithGemini } from '../services/promptCompiler';
import { compressImage } from '../services/storage';
import { checkImageQuality } from '../utils/imageQualityChecker';

interface PersonaManagerProps {
  persona: Persona;
  allPersonas: Persona[];
  onSelectPersona: (personaId: string) => void;
  onOpenCreatePersonaModal: () => void;
  onUpdatePersona: (updated: Persona) => void;
  onSetMainPersona?: (personaId: string) => void;
  onDeletePersona?: (personaId: string) => void;
  apiKey?: string;
}

export const PersonaManager: React.FC<PersonaManagerProps> = ({
  persona,
  allPersonas,
  onSelectPersona,
  onOpenCreatePersonaModal,
  onUpdatePersona,
  onSetMainPersona,
  onDeletePersona,
  apiKey
}) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'dna' | 'wardrobe' | 'props'>('photos');
  const [newWardrobeName, setNewWardrobeName] = useState('');
  const [newWardrobeDesc, setNewWardrobeDesc] = useState('');
  const [newPropName, setNewPropName] = useState('');
  const [newPropDesc, setNewPropDesc] = useState('');
  const [newPropCategory, setNewPropCategory] = useState<PropAsset['category']>('vehicle');
  const [newPropPhoto, setNewPropPhoto] = useState('');
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(persona.name);
  const [saveToast, setSaveToast] = useState('');

  // Keep tempName in sync when persona changes
  useEffect(() => {
    setTempName(persona.name);
  }, [persona.id, persona.name]);

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3500);
  };

  const handleSaveName = () => {
    if (!tempName.trim()) return;
    onUpdatePersona({
      ...persona,
      name: tempName.trim()
    });
    setIsEditingName(false);
    triggerToast(`✅ บันทึกชื่อ "${tempName.trim()}" เรียบร้อยแล้ว!`);
  };

  const handleFileUpload = async (angle: 'front' | 'angle_45' | 'profile' | 'close_up', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await compressImage(file, 720, 720, 0.82);
      const quality = await checkImageQuality(url);

      const existingIndex = persona.referenceImages.findIndex((r) => r.angle === angle);
      let updatedRefs: Persona['referenceImages'];

      if (existingIndex >= 0) {
        updatedRefs = persona.referenceImages.map((ref, idx) =>
          idx === existingIndex ? { ...ref, url, qualityReport: quality } : ref
        );
      } else {
        const labels: Record<string, string> = {
          front: 'Front View (หน้าตรง)',
          angle_45: '45° Angle (มุมเฉียง 45 องศา)',
          profile: 'Side Profile (ด้านข้าง 90 องศา)',
          close_up: 'Close-Up (โคลสอัพใบหน้า)'
        };
        updatedRefs = [
          ...persona.referenceImages,
          {
            id: `ref_${Date.now()}_${angle}`,
            url,
            angle,
            label: labels[angle] || angle,
            qualityReport: quality
          }
        ];
      }

      onUpdatePersona({
        ...persona,
        referenceImages: updatedRefs,
        avatarUrl: angle === 'front' ? url : (persona.avatarUrl || url)
      });
      triggerToast('✅ บันทึกรูปถ่ายและตรวจคุณภาพเรียบร้อยแล้ว!');
    } catch (err) {
      console.error('Failed to compress turnaround image', err);
    }
  };

  const handleDeletePhoto = (angle: 'front' | 'angle_45' | 'profile' | 'close_up') => {
    const updatedRefs = persona.referenceImages.filter((r) => r.angle !== angle);
    onUpdatePersona({
      ...persona,
      referenceImages: updatedRefs
    });
    triggerToast('ลบรูปภาพอ้างอิงเรียบร้อยแล้ว');
  };

  const handleUpdateDna = (field: keyof Persona['faceDna'], value: string) => {
    onUpdatePersona({
      ...persona,
      faceDna: {
        ...persona.faceDna,
        [field]: value
      }
    });
  };

  const handleAddWardrobe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWardrobeName.trim()) return;

    const newPreset: WardrobePreset = {
      id: `wardrobe_${Date.now()}`,
      name: newWardrobeName,
      description: newWardrobeDesc || newWardrobeName,
      category: 'casual'
    };

    onUpdatePersona({
      ...persona,
      wardrobes: [...persona.wardrobes, newPreset],
      activeWardrobeId: newPreset.id
    });

    setNewWardrobeName('');
    setNewWardrobeDesc('');
  };

  const handleDeleteWardrobe = (id: string) => {
    if (persona.wardrobes.length <= 1) return;
    const remaining = persona.wardrobes.filter((w) => w.id !== id);
    onUpdatePersona({
      ...persona,
      wardrobes: remaining,
      activeWardrobeId: persona.activeWardrobeId === id ? remaining[0].id : persona.activeWardrobeId
    });
  };

  const handleAutoScanFace = async () => {
    const targetImage = persona.referenceImages[0]?.url || persona.avatarUrl;
    if (!targetImage) return;

    setIsScanningFace(true);
    setScanSuccessMessage('');
    try {
      const result = await analyzeFaceWithGemini(targetImage, apiKey);
      onUpdatePersona({
        ...persona,
        faceDna: {
          faceShape: result.faceShape,
          eyeDetails: result.eyeDetails,
          hairStyle: result.hairStyle,
          skinTone: result.skinTone,
          facialHair: result.facialHair,
          signatureFeatures: result.signatureFeatures
        }
      });
      setScanSuccessMessage('✨ AI สแกนใบหน้าและกรอกรหัส Face DNA เรียบร้อยแล้ว!');
      setActiveTab('dna');
      setTimeout(() => setScanSuccessMessage(''), 4000);
    } finally {
      setIsScanningFace(false);
    }
  };

  const handleAddProp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropName.trim()) return;

    const newProp: PropAsset = {
      id: `prop_${Date.now()}`,
      name: newPropName,
      description: newPropDesc || newPropName,
      category: newPropCategory,
      photoUrl: newPropPhoto || undefined
    };

    onUpdatePersona({
      ...persona,
      props: [...(persona.props || []), newProp]
    });
    triggerToast(`✅ บันทึกอุปกรณ์ "${newPropName}" ลงเครื่องเรียบร้อยแล้ว!`);

    setNewPropName('');
    setNewPropDesc('');
    setNewPropPhoto('');
  };

  const handleDeleteProp = (id: string) => {
    onUpdatePersona({
      ...persona,
      props: (persona.props || []).filter((p) => p.id !== id)
    });
    triggerToast('ลบอุปกรณ์เรียบร้อยแล้ว');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative">
      {/* Real-time Save Toast Banner */}
      {saveToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <Check className="w-4 h-4 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* 1. Character Selector Carousel (Easy 1-tap switching between Me and Friends) */}
      <div className="mb-4 bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 pl-1 shrink-0">ตัวละคร:</span>
          <div className="flex items-center gap-1.5">
            {allPersonas.map((p) => {
              const isCurrent = p.id === persona.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPersona(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <img
                    src={p.avatarUrl || p.referenceImages[0]?.url}
                    alt={p.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>{p.name}</span>
                  {p.isDefault && <span className="text-[10px] opacity-75">(เรา)</span>}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onOpenCreatePersonaModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 border border-purple-500/40 shrink-0 cursor-pointer transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ เพิ่มเพื่อน</span>
        </button>
      </div>

      {/* Top Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md shrink-0">
            <img
              src={persona.avatarUrl || persona.referenceImages[0]?.url}
              alt={persona.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-slate-950 border border-indigo-500 rounded-lg px-2.5 py-1 text-sm text-white font-bold focus:outline-none"
                    placeholder="พิมพ์ชื่อตัวละคร"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 cursor-pointer"
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={() => {
                      setTempName(persona.name);
                      setIsEditingName(false);
                    }}
                    className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs hover:text-white cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">{persona.name}</h2>
                  <button
                    onClick={() => {
                      setTempName(persona.name);
                      setIsEditingName(true);
                    }}
                    title="แตะเพื่อเปลี่ยนชื่อตัวละครนี้"
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>เปลี่ยนชื่อ</span>
                  </button>
                </div>
              )}

              {persona.isDefault ? (
                <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> My AI Twin (ตัวละครหลัก)
                </span>
              ) : (
                onSetMainPersona && (
                  <button
                    onClick={() => onSetMainPersona(persona.id)}
                    title="ตั้งตัวละครนี้เป็นตัวละครหลัก (My AI Twin)"
                    className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 font-semibold transition-all cursor-pointer"
                  >
                    <Star className="w-3 h-3 text-amber-400" />
                    <span>ตั้งเป็นตัวละครหลัก</span>
                  </button>
                )
              )}

              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <ShieldCheck className="w-3 h-3" /> Identity Locked
              </span>
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                💾 บันทึกในเครื่องแล้ว
              </span>

              {!persona.isDefault && onDeletePersona && (
                <button
                  onClick={() => onDeletePersona(persona.id)}
                  title="ลบตัวละครเพื่อนคนนี้"
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/40 text-red-400 hover:bg-red-900/50 border border-red-500/30 text-[11px] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>ลบตัวละคร</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400">
              ชุดที่ใส่อยู่:{' '}
              <span className="text-indigo-300 font-medium">
                {persona.wardrobes.find((w) => w.id === persona.activeWardrobeId)?.name || 'Default'}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls & Tab Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAutoScanFace}
            disabled={isScanningFace}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isScanningFace ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังอ่านใบหน้า...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI สแกนหน้าอัตโนมัติ</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'photos'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>My AI Twin (รูป 3 มุม)</span>
            </button>
            <button
              onClick={() => setActiveTab('dna')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'dna'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Face DNA</span>
            </button>
            <button
              onClick={() => setActiveTab('wardrobe')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'wardrobe'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Wardrobe</span>
            </button>
            <button
              onClick={() => setActiveTab('props')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'props'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Hero Props</span>
            </button>
          </div>
        </div>
      </div>

      {scanSuccessMessage && (
        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{scanSuccessMessage}</span>
        </div>
      )}

      {/* Tab 1: 3-Angle Real Face Photos (Priority 1: Front, 45°, Profile) */}
      {activeTab === 'photos' && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-200">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-indigo-100">
                ระบบล็อกหน้าจริง My AI Twin (3 มุมอ้างอิงหลัก):
              </p>
              <p className="text-slate-300">
                ควรอัปโหลดรูปหน้าจริงของคุณครบ 3 มุม (หน้าตรง, มุม 45 องศา, ด้านข้าง) แสงธรรมชาติ ไม่ใส่ฟิลเตอร์เบลอ เพื่อให้โมเดล AI ล็อกมิติโครงหน้าได้แม่นยำที่สุด
              </p>
            </div>
          </div>

          {/* The 3 Core Turnaround Slots (+ Optional close up) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              {
                angle: 'front' as const,
                title: '1. หน้าตรง (Front View)',
                desc: 'ตามองตรง แสงสว่างสม่ำเสมอ',
                badge: 'จำเป็นที่สุด'
              },
              {
                angle: 'angle_45' as const,
                title: '2. มุมเฉียง 45° (Three-Quarter)',
                desc: 'หันเฉียง 45 องศา เห็นสันกราม',
                badge: 'แนะนำ'
              },
              {
                angle: 'profile' as const,
                title: '3. ด้านข้าง 90° (Side Profile)',
                desc: 'หันข้าง 90 องศา เห็นสันจมูก',
                badge: 'แนะนำ'
              }
            ].map((slot) => {
              const ref = persona.referenceImages.find((r) => r.angle === slot.angle);
              const quality = ref?.qualityReport;

              return (
                <div
                  key={slot.angle}
                  className="bg-slate-950 rounded-2xl border border-slate-800 p-3 flex flex-col justify-between hover:border-indigo-500/40 transition-all shadow-md group"
                >
                  <div>
                    {/* Header of Card */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{slot.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {slot.badge}
                      </span>
                    </div>

                    {/* Image Preview / Placeholder */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80 mb-2 flex items-center justify-center">
                      {ref?.url ? (
                        <img
                          src={ref.url}
                          alt={slot.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center p-3 text-slate-500 flex flex-col items-center gap-1.5">
                          <Camera className="w-8 h-8 opacity-40 text-slate-400" />
                          <span className="text-[11px] text-slate-400 font-medium">{slot.desc}</span>
                        </div>
                      )}

                      {/* Quality Score Badge overlay */}
                      {quality && (
                        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-md font-bold text-[10px] backdrop-blur-md shadow-lg ${
                          quality.score >= 75 ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' :
                          quality.score >= 50 ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40' :
                          'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                        }`}>
                          คะแนน {quality.score}/100
                        </div>
                      )}
                    </div>

                    {/* Quality Insights Details */}
                    {quality ? (
                      <div className="bg-slate-900/80 rounded-xl p-2 mb-2 text-[10px] space-y-1 text-slate-300 border border-slate-800/60">
                        <div className="flex justify-between">
                          <span className="text-slate-400">ความคมชัด:</span>
                          <span className="font-semibold text-slate-200">
                            {quality.sharpness === 'sharp' ? 'คมชัดดี ✅' : quality.sharpness === 'acceptable' ? 'พอใช้ได้ ⚡' : 'เบลอ/สั่น ⚠️'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">แสงสว่าง:</span>
                          <span className="font-semibold text-slate-200">
                            {quality.brightness === 'good' ? 'เหมาะสม ✅' : quality.brightness === 'too_dark' ? 'มืดไป ⚠️' : 'สว่างจ้าไป ⚠️'}
                          </span>
                        </div>
                        {quality.warnings.length > 0 && (
                          <div className="text-amber-400 text-[9px] pt-0.5">
                            ⚠️ {quality.warnings[0]}
                          </div>
                        )}
                      </div>
                    ) : ref?.url ? (
                      <div className="text-[10px] text-slate-400 text-center mb-2">
                        รูปถ่ายพร้อมส่งต่อเป็น Master Reference
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 text-center mb-2">
                        ยังไม่มีรูปอ้างอิงมุมนี้
                      </div>
                    )}
                  </div>

                  {/* Actions (Upload + Delete) */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <label className="flex-1 py-2 px-2 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 rounded-xl text-indigo-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95">
                      <Camera className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{ref?.url ? 'เปลี่ยนรูป' : 'ถ่ายรูป / อัปโหลด'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(slot.angle, e)}
                      />
                    </label>

                    {ref?.url && (
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(slot.angle)}
                        title="ลบรูปอ้างอิงมุมนี้"
                        className="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 rounded-xl text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Privacy & Realistic Disclaimer Notice */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>ความปลอดภัยและความเป็นส่วนตัว (Privacy Notice):</span>
            </div>
            <p>
              รูปถ่ายใบหน้าจริงของคุณได้รับการจัดเก็บอยู่บนเครื่องโทรศัพท์/เบราว์เซอร์นี้เท่านั้น (IndexedDB) ไม่มีการอัปโหลดสู่ระบบคลาวด์ภายนอกจนกว่าคุณจะกดส่งต่อหรือสั่งสร้างวิดีโอ
            </p>
            <p className="text-slate-500 text-[10px]">
              * หมายเหตุ: คุณภาพความเหมือนจริงขึ้นอยู่กับขีดความสามารถของโมเดลวิดีโอ (Veo/Flow) ระบบช่วยล็อก DNA และส่งภาพ Reference เพื่อความแม่นยำสูงสุด
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Forensic Face DNA */}
      {activeTab === 'dna' && (
        <div className="space-y-3.5">
          <p className="text-xs text-slate-400">
            คำอธิบายลักษณะใบหน้าเชิงลึก (DNA Prompt Anchors) ที่จะถูกส่งไปผสมกับรูปภาพ เพื่อป้องกันไม่ให้โมเดล AI สุ่มใบหน้าเปลี่ยนไปในแต่ละฉาก:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">รูปหน้า (Face Shape & Jawline)</label>
              <input
                type="text"
                value={persona.faceDna.faceShape}
                onChange={(e) => handleUpdateDna('faceShape', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">ดวงตาและคิ้ว (Eyes & Brows)</label>
              <input
                type="text"
                value={persona.faceDna.eyeDetails}
                onChange={(e) => handleUpdateDna('eyeDetails', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">ทรงผมและสีผม (Hair Style)</label>
              <input
                type="text"
                value={persona.faceDna.hairStyle}
                onChange={(e) => handleUpdateDna('hairStyle', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">โทนสีผิวและเนื้อผิว (Skin Texture)</label>
              <input
                type="text"
                value={persona.faceDna.skinTone}
                onChange={(e) => handleUpdateDna('skinTone', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">หนวด/เครา (Facial Hair)</label>
              <input
                type="text"
                value={persona.faceDna.facialHair}
                onChange={(e) => handleUpdateDna('facialHair', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">จุดเด่นเฉพาะตัว (Signature Traits: ลักยิ้ม, ไฝ, ฯลฯ)</label>
              <input
                type="text"
                value={persona.faceDna.signatureFeatures}
                onChange={(e) => handleUpdateDna('signatureFeatures', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Wardrobe Locker */}
      {activeTab === 'wardrobe' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            เลือกล็อกชุดประจำตัว เพื่อให้ทุกฉากที่สร้างออกมา ตัวละครสวมใส่ชุดเดิมเสมอ ไม่เปลี่ยนชุดตามใจ AI:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {persona.wardrobes.map((w) => {
              const isSelected = persona.activeWardrobeId === w.id;
              return (
                <div
                  key={w.id}
                  onClick={() => onUpdatePersona({ ...persona, activeWardrobeId: w.id })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-white">{w.name}</span>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWardrobe(w.id);
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="ลบชุดนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{w.description}</p>
                </div>
              );
            })}
          </div>

          {/* Add New Wardrobe Form */}
          <form onSubmit={handleAddWardrobe} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs flex flex-col md:flex-row gap-2.5 items-end">
            <div className="flex-1 w-full">
              <label className="block text-slate-400 font-medium mb-1">ชื่อชุดใหม่</label>
              <input
                type="text"
                placeholder="เช่น: Business Suit สีกรม"
                value={newWardrobeName}
                onChange={(e) => setNewWardrobeName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex-[2] w-full">
              <label className="block text-slate-400 font-medium mb-1">รายละเอียดเครื่องแต่งกาย (Prompt)</label>
              <input
                type="text"
                placeholder="เช่น: tailored navy blue suit with white dress shirt and silver cufflink"
                value={newWardrobeDesc}
                onChange={(e) => setNewWardrobeDesc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มชุด</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Hero Props & Scene Assets */}
      {activeTab === 'props' && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-200">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-100">Hero Props & Signature Assets (อุปกรณ์และสิ่งของประจำเรื่อง):</p>
              <p className="text-slate-300">
                ล็อกอุปกรณ์ชิ้นสำคัญ เช่น <strong>เรือของเรา, โต๊ะทำงาน, เตียง, รถมอเตอร์ไซค์, แก้วโปรด หรืออาวุธ/อุปกรณ์</strong> เพื่อให้ AI สร้างฉากที่มีสิ่งของชิ้นเดิมเสมอ ไม่สุ่มเปลี่ยนโมเดลเรือหรือดีไซน์โต๊ะไปมาในแต่ละคัต
              </p>
            </div>
          </div>

          {/* Existing Props Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(persona.props || []).map((prop) => (
              <div
                key={prop.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 relative flex flex-col justify-between"
              >
                <div>
                  {prop.photoUrl && (
                    <div className="w-full h-28 rounded-lg overflow-hidden bg-slate-900 mb-2.5">
                      <img src={prop.photoUrl} alt={prop.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{prop.name}</span>
                    <button
                      onClick={() => handleDeleteProp(prop.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="ลบสิ่งของนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 capitalize mb-2">
                    {prop.category.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-slate-300 line-clamp-2">{prop.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Prop Form */}
          <form onSubmit={handleAddProp} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs space-y-3">
            <span className="font-bold text-white block text-xs">+ เพิ่มอุปกรณ์/พร็อพประจำตัวชิ้นใหม่ (เรือ, โต๊ะ, เตียง, อุปกรณ์ ฯลฯ)</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-slate-400 font-medium mb-1">ชื่ออุปกรณ์ / สิ่งของ</label>
                <input
                  type="text"
                  placeholder="เช่น: เรือไม้ของผม หรือ โต๊ะทำงานไม้สั่งตัด"
                  value={newPropName}
                  onChange={(e) => setNewPropName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">หมวดหมู่</label>
                <select
                  value={newPropCategory}
                  onChange={(e) => setNewPropCategory(e.target.value as PropAsset['category'])}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="vehicle">ยานพาหนะ (เรือ, รถ, มอเตอร์ไซค์)</option>
                  <option value="furniture">เฟอร์นิเจอร์ (โต๊ะ, เตียง, เก้าอี้)</option>
                  <option value="gear_prop">อุปกรณ์ประจำตัว (ปืน, แกดเจ็ต, แก้ว)</option>
                  <option value="custom">ของสะสม / อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">ลิงก์รูปอ้างอิง หรืออัปโหลด (ถ้ามี)</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="URL รูปภาพอ้างอิง"
                    value={newPropPhoto}
                    onChange={(e) => setNewPropPhoto(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <label className="px-2.5 py-2 bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 rounded-lg cursor-pointer flex items-center justify-center">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const compressed = await compressImage(file, 720, 720, 0.82);
                          setNewPropPhoto(compressed);
                        } catch (err) {
                          console.error('Failed to compress prop image', err);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">รายละเอียดทางกายภาพ (สี, วัสดุ, ลวดลาย, เครื่องยนต์)</label>
              <textarea
                rows={2}
                placeholder="เช่น: traditional handcrafted teak wood longtail boat with turquoise-cyan hull, woven bow garland, and custom chrome propeller engine"
                value={newPropDesc}
                onChange={(e) => setNewPropDesc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>บันทึกอุปกรณ์ลงคลัง</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
