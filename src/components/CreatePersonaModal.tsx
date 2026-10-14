import React, { useState } from 'react';
import { X, UserPlus, Upload, Sparkles, RefreshCw, Check, Camera, ShieldCheck, AlertCircle } from 'lucide-react';
import type { Persona, ImageQualityReport } from '../types';
import { analyzeFaceWithGemini } from '../services/promptCompiler';
import { compressImage } from '../services/storage';
import { checkImageQuality } from '../utils/imageQualityChecker';

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
  const [qualityReport, setQualityReport] = useState<ImageQualityReport | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Face DNA attributes
  const [faceShape, setFaceShape] = useState('');
  const [eyeDetails, setEyeDetails] = useState('');
  const [hairStyle, setHairStyle] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [facialHair, setFacialHair] = useState('');
  const [signatureFeatures, setSignatureFeatures] = useState('');

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    try {
      const compressed = await compressImage(file, 720, 720, 0.82);
      setPhotoUrl(compressed);
      setScanDone(false);

      // Automated client-side quality evaluation
      const quality = await checkImageQuality(compressed);
      setQualityReport(quality);
    } catch (err) {
      console.error('Failed to compress image', err);
    }
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

    if (photoUrl && !consentGiven) {
      setErrorMsg('กรุณาแตะยอมรับความยินยอมการใช้รูปถ่ายใบหน้าจริงก่อนบันทึกครับ');
      return;
    }

    const newId = `persona_${Date.now()}`;
    const newPersona: Persona = {
      id: newId,
      name: name.trim(),
      isDefault: false,
      avatarUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      consentGiven: Boolean(consentGiven),
      referenceImages: photoUrl
        ? [
            {
              id: `ref_${Date.now()}`,
              url: photoUrl,
              angle: 'front',
              label: 'Front View (Real Photo)',
              qualityReport: qualityReport || undefined
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
            <p className="text-xs text-slate-400">อัปโหลดรูปหน้าจริง เพื่อรักษามิติโครงหน้าและเอกลักษณ์ให้ใกล้เคียงตัวจริงที่สุดเท่าที่โมเดล Veo/Flow รองรับ</p>
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

            {qualityReport && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">คุณภาพรูปอ้างอิง:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    qualityReport.score >= 75 ? 'bg-emerald-500/20 text-emerald-400' :
                    qualityReport.score >= 50 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    คะแนน {qualityReport.score}/100 ({qualityReport.score >= 75 ? 'ดีเยี่ยม' : qualityReport.score >= 50 ? 'ปานกลาง' : 'ควรเปลี่ยนรูป'})
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div>
                    ความคมชัด: <span className="text-slate-200">{
                      qualityReport.sharpness === 'sharp' ? 'คมชัดดีมาก ✅' :
                      qualityReport.sharpness === 'acceptable' ? 'พอใช้ได้ ⚡' : 'เบลอ/ไม่ชัด ⚠️'
                    }</span>
                  </div>
                  <div>
                    แสงสว่าง: <span className="text-slate-200">{
                      qualityReport.brightness === 'good' ? 'เหมาะสม ✅' :
                      qualityReport.brightness === 'too_dark' ? 'มืดเกินไป ⚠️' : 'สว่างจ้าเกินไป ⚠️'
                    }</span>
                  </div>
                </div>
                {qualityReport.warnings.length > 0 && (
                  <div className="text-amber-400/90 text-[10px] pt-1">
                    คำแนะนำ: {qualityReport.warnings.join(' • ')}
                  </div>
                )}
              </div>
            )}

            {scanDone && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-lg text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>AI ถอดรหัสโครงหน้าเรียบร้อยแล้ว! พร้อมล็อกความเหมือนสำหรับ Veo/Flow</span>
              </div>
            )}
          </div>

          {/* Forensic Face DNA (Auto-filled or manual) */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold">
              รหัสโครงหน้า (Face DNA):
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
              ชุดเสื้อผ้าประจำตัวในเรื่อง
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

          {/* Privacy Consent Agreement Checkbox */}
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="consentFriend"
              checked={consentGiven}
              onChange={(e) => {
                setConsentGiven(e.target.checked);
                if (e.target.checked) setErrorMsg('');
              }}
              className="mt-0.5 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="consentFriend" className="text-[11px] text-slate-300 leading-relaxed cursor-pointer select-none">
              <strong className="text-white block mb-0.5">ความยินยอมในการประมวลผลใบหน้า (Privacy Consent):</strong>
              ข้าพเจ้ายินยอมให้นำรูปถ่ายใบหน้าจริงนี้มาใช้ประมวลผลสำหรับสร้างวิดีโอ AI โดยระบบจะจัดเก็บบนเบราว์เซอร์ของข้าพเจ้าเท่านั้น ไม่มีการส่งไปเก็บบนเซิร์ฟเวอร์ภายนอกโดยไม่ได้รับอนุญาต
            </label>
          </div>

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-2.5 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

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
              <span>บันทึกตัวละครเข้าสตูดิโอ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
