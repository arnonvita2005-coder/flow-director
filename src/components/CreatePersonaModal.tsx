import React, { useState } from 'react';
import { X, UserPlus, Upload, Sparkles, RefreshCw, Check, Camera, ShieldCheck } from 'lucide-react';
import type { Persona } from '../types';
import { analyzeFaceWithGemini } from '../services/promptCompiler';

interface CreatePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPersona: Persona) => void;
  apiKey?: string;
}

export const CreatePersonaModal: React.FC<CreatePersonaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  apiKey
}) => {
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [wardrobeName, setWardrobeName] = useState('ชุดประจำตัวลำลอง');
  const [wardrobeDesc, setWardrobeDesc] = useState('casual street hoodie or t-shirt');
  const [isScanning, setIsScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);

  // Face DNA attributes
  const [faceShape, setFaceShape] = useState('');
  const [eyeDetails, setEyeDetails] = useState('');
  const [hairStyle, setHairStyle] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [facialHair, setFacialHair] = useState('');
  const [signatureFeatures, setSignatureFeatures] = useState('');

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhotoUrl(result);
      setScanDone(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAutoScan = async () => {
    if (!photoUrl) return;
    setIsScanning(true);
    try {
      const dna = await analyzeFaceWithGemini(photoUrl, apiKey);
      setFaceShape(dna.faceShape);
      setEyeDetails(dna.eyeDetails);
      setHairStyle(dna.hairStyle);
      setSkinTone(dna.skinTone);
      setFacialHair(dna.facialHair);
      setSignatureFeatures(dna.signatureFeatures);
      setScanDone(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = `persona_${Date.now()}`;
    const newPersona: Persona = {
      id: newId,
      name: name.trim(),
      isDefault: false,
      avatarUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      referenceImages: photoUrl
        ? [
            {
              id: `ref_${Date.now()}`,
              url: photoUrl,
              angle: 'front',
              label: 'Front View (Real Photo)'
            }
          ]
        : [],
      faceDna: {
        faceShape: faceShape || 'proportional defined facial bone structure',
        eyeDetails: eyeDetails || 'natural authentic eye shape and clear gaze',
        hairStyle: hairStyle || 'contemporary natural hairstyle',
        skinTone: skinTone || 'authentic natural skin texture with subtle pores',
        facialHair: facialHair || 'clean shaven',
        signatureFeatures: signatureFeatures || 'unique friendly smile'
      },
      wardrobes: [
        {
          id: `wardrobe_${Date.now()}`,
          name: wardrobeName || 'ชุดลำลอง',
          description: wardrobeDesc || 'casual comfortable clothing',
          category: 'casual'
        }
      ],
      activeWardrobeId: `wardrobe_${Date.now()}`,
      props: []
    };

    onSave(newPersona);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">เพิ่มเพื่อน / บุคคลร่วมฉาก (ล็อกหน้าจริง)</h3>
            <p className="text-xs text-slate-400">อัปโหลดรูปหน้าจริงของเพื่อน เพื่อให้ AI วาดหน้าเหมือนเพื่อน 100%</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Friend Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              ชื่อเพื่อน / ตัวละคร <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น: บาส (เพื่อนสนิท) หรือ พี่ก้อง"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Photo Upload & AI Scan */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <label className="block text-slate-300 font-semibold">
              รูปถ่ายหน้าจริงของเพื่อน (เซลฟี่หรือรูปหน้าชัดๆ)
            </label>

            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="Friend Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-slate-600" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg cursor-pointer transition-colors text-xs font-medium">
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>{photoUrl ? 'เปลี่ยนรูปถ่ายเพื่อน' : 'อัปโหลดรูป / ถ่ายจากมือถือ'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>

                {photoUrl && (
                  <div>
                    <button
                      type="button"
                      disabled={isScanning}
                      onClick={handleAutoScan}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>กำลังอ่านใบหน้าเพื่อน...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>AI สแกนหน้าเพื่อนอัตโนมัติ</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {scanDone && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-lg text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>AI ถอดรหัสโครงหน้าของเพื่อนเรียบร้อยแล้ว! พร้อมล็อกความเหมือน</span>
              </div>
            )}
          </div>

          {/* Forensic Face DNA (Auto-filled or manual) */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold">
              รหัสโครงหน้าของเพื่อน (Face DNA):
            </label>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block mb-0.5">รูปหน้า & กราม:</span>
                <input
                  type="text"
                  placeholder="เช่น: โครงหน้าเหลี่ยม สันกรามคม"
                  value={faceShape}
                  onChange={(e) => setFaceShape(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">ดวงตา & คิ้ว:</span>
                <input
                  type="text"
                  placeholder="เช่น: ตากลมโต คิ้วเข้ม"
                  value={eyeDetails}
                  onChange={(e) => setEyeDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">ทรงผม:</span>
                <input
                  type="text"
                  placeholder="เช่น: ผมสั้นรองทรง หรือ ผมยาวดัดลอน"
                  value={hairStyle}
                  onChange={(e) => setHairStyle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">สีผิว / จุดเด่น:</span>
                <input
                  type="text"
                  placeholder="เช่น: ผิวขาวเหลือง ใส่แว่นตากรอบดำ"
                  value={signatureFeatures}
                  onChange={(e) => setSignatureFeatures(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Friend's Default Wardrobe */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              ชุดเสื้อผ้าประจำตัวของเพื่อนในเรื่อง
            </label>
            <input
              type="text"
              placeholder="เช่น: เสื้อยืดสีดำโอเวอร์ไซส์ กางเกงยีนส์ หรือ เสื้อแจ็กเก็ตสีเขียวขี้ม้า"
              value={wardrobeName}
              onChange={(e) => {
                setWardrobeName(e.target.value);
                setWardrobeDesc(e.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>บันทึกเพื่อนเข้าสตูดิโอ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
