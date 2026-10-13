import React, { useState } from 'react';
import { 
  User, 
  Upload, 
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
  Image as ImageIcon
} from 'lucide-react';
import type { Persona, WardrobePreset, PropAsset } from '../types';
import { analyzeFaceWithGemini } from '../services/promptCompiler';

interface PersonaManagerProps {
  persona: Persona;
  onUpdatePersona: (updated: Persona) => void;
  apiKey?: string;
}

export const PersonaManager: React.FC<PersonaManagerProps> = ({
  persona,
  onUpdatePersona,
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

  const handleFileUpload = (angle: 'front' | 'angle_45' | 'profile' | 'close_up', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      const updatedRefs = persona.referenceImages.map((ref) =>
        ref.angle === angle ? { ...ref, url } : ref
      );
      onUpdatePersona({
        ...persona,
        referenceImages: updatedRefs,
        avatarUrl: angle === 'front' ? url : persona.avatarUrl
      });
    };
    reader.readAsDataURL(file);
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

    setNewPropName('');
    setNewPropDesc('');
    setNewPropPhoto('');
  };

  const handleDeleteProp = (id: string) => {
    onUpdatePersona({
      ...persona,
      props: (persona.props || []).filter((p) => p.id !== id)
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
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
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white">{persona.name}</h2>
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <ShieldCheck className="w-3 h-3" /> Identity Locked
              </span>
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
              <span>360° Turnaround</span>
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

      {/* Tab 1: 360 Turnaround Photos */}
      {activeTab === 'photos' && (
        <div>
          <div className="flex items-start gap-2 bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3 mb-4 text-xs text-indigo-200">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-100">เคล็ดลับการทำให้หน้าเหมือนจริงที่สุด:</p>
              <p className="text-slate-300">
                อัปโหลดรูปหน้าตัวคุณในแต่ละมุม (แสงธรรมชาติชัดเจน ไม่ใส่ฟิลเตอร์เบลอ) เพื่อให้ Veo/Google Flow จดจำมิติของโครงหน้าได้แม่นยำ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {persona.referenceImages.map((ref) => (
              <div
                key={ref.id}
                className="group relative bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden hover:border-indigo-500/50 transition-all"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 mb-2">
                  <img
                    src={ref.url}
                    alt={ref.label}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <label className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-xs gap-1">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>เปลี่ยนรูป</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(ref.angle, e)}
                    />
                  </label>
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-semibold text-slate-300 block truncate">
                    {ref.label}
                  </span>
                  <span className="text-[10px] text-indigo-400 capitalize">{ref.angle.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
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
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => setNewPropPhoto(ev.target?.result as string);
                        reader.readAsDataURL(file);
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
