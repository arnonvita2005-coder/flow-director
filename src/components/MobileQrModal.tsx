import React, { useState } from 'react';
import { X, Smartphone, Copy, Check, Wifi } from 'lucide-react';

interface MobileQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  networkIp: string;
}

export const MobileQrModal: React.FC<MobileQrModalProps> = ({
  isOpen,
  onClose,
  networkIp
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const mobileUrl = `http://${networkIp}:5173`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mobileUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/20">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">เปิดใช้งานบนโทรศัพท์มือถือ</h3>
        <p className="text-xs text-slate-400 mb-4">
          เชื่อมต่อ Wi-Fi เดียวกันกับคอมพิวเตอร์ แล้วเปิดลิงก์นี้ในเบราว์เซอร์ของมือถือ:
        </p>

        {/* Link Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mb-4 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-400 font-semibold">
            <Wifi className="w-3.5 h-3.5" />
            <span>Wi-Fi Network URL</span>
          </div>
          <div className="font-mono text-sm font-bold text-white select-all bg-slate-900 py-1.5 px-3 rounded-lg border border-slate-800">
            {mobileUrl}
          </div>
          <button
            onClick={handleCopy}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์ไปเปิดในมือถือ'}</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-left space-y-1">
          <p className="font-semibold text-slate-300">💡 เคล็ดลับบนมือถือ:</p>
          <p>• สามารถใช้กล้องมือถือถ่ายเซลฟี่แล้วกด <strong>"AI สแกนหน้าอัตโนมัติ"</strong> ได้ทันที</p>
          <p>• กด <strong>"Add to Home Screen"</strong> ใน Safari หรือ Chrome เพื่อใช้เป็นแอปเต็มจอได้เลย</p>
        </div>

        <div className="mt-4">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
