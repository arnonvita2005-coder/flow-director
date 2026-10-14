import React, { useState } from 'react';
import { X, Copy, Check, Zap } from 'lucide-react';

interface FlowIntegrationHelperProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlowIntegrationHelper: React.FC<FlowIntegrationHelperProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  // Standalone bookmarklet / userscript that injects a floating button on flow.google
  const helperScript = `// ==UserScript==
// @name         Flow Director Companion
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Injects a quick floating button in flow.google to paste Flow Director prompts instantly
// @match        https://flow.google/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const btn = document.createElement('button');
    btn.innerHTML = '🎬 Paste from Flow Director';
    btn.style.position = 'fixed';
    btn.style.bottom = '20px';
    btn.style.right = '20px';
    btn.style.zIndex = '99999';
    btn.style.padding = '10px 16px';
    btn.style.backgroundColor = '#6366f1';
    btn.style.color = '#ffffff';
    btn.style.border = 'none';
    btn.style.borderRadius = '12px';
    btn.style.fontWeight = 'bold';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.4)';
    
    btn.onclick = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const textarea = document.querySelector('textarea, [contenteditable="true"]');
            if (textarea) {
                if (textarea.tagName === 'TEXTAREA') {
                    textarea.value = text;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    textarea.innerText = text;
                }
                alert('✨ Prompt จาก Flow Director ถูกวางลงใน Flow เรียบร้อยแล้ว!');
            } else {
                alert('กรุณาคลิกเลือกกล่อง Prompt ในหน้า Flow ก่อนกดปุ่มนี้ครับ');
            }
        } catch (e) {
            alert('กรุณาอนุญาตสิทธิ์การเข้าถึง Clipboard ใน Browser');
        }
    };
    document.body.appendChild(btn);
})();`;

  const handleCopyScript = async () => {
    await navigator.clipboard.writeText(helperScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">วิธีเชื่อมต่อ Flow Director เข้ากับ Google Flow</h3>
            <p className="text-xs text-slate-400">วิธีสั่งการและส่งข้อมูลจากแอปนี้ไปยัง flow.google ให้สะดวกที่สุด</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Method 1: Current Google Flow Handoff */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[11px]">
                1
              </span>
              <span>ขั้นตอนส่งต่อภาพและ Prompt ไปยัง Google Flow (ใช้งานได้ทันที)</span>
            </div>
            
            <p className="text-slate-300">
              ปัจจุบัน Google Flow กำหนดให้ผู้ใช้ต้องอัปโหลดภาพใบหน้าอ้างอิงด้วยตนเองบนหน้าเว็บ <a href="https://flow.google" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">flow.google</a> เพื่อความปลอดภัย โดย Flow Director ช่วยเตรียมข้อมูลให้พร้อมดังนี้:
            </p>

            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
              <li>
                <strong>เตรียมภาพ Reference:</strong> แตะปุ่มดาวน์โหลดรูปภาพหน้าจริง (หน้าตรง หรือ 45 องศา) จากแท็บ <strong>My AI Twin</strong> หรือใน <strong>Easy Story Creator</strong>
              </li>
              <li>
                <strong>อัปโหลดใน Google Flow:</strong> เปิดเว็บ <a href="https://flow.google" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">flow.google</a> แล้วลาก/อัปโหลดภาพ Reference เข้าสู่ช่อง Reference Image ของโมเดล
              </li>
              <li>
                <strong>วาง Prompt:</strong> แตะปุ่ม <strong>"คัดลอก Prompt"</strong> จาก Flow Director แล้ววางลงในช่องป้อนคำสั่งของ Flow
              </li>
              <li>
                <strong>สั่งสร้างวิดีโอ:</strong> กดปุ่ม Generate ใน Flow โดยตัวละครจะล็อกมิติโครงหน้าตามภาพ Reference และรหัส Face DNA อย่างแม่นยำ
              </li>
            </ol>
          </div>

          {/* Method 2: Veo Direct API Architecture Proposal */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[11px]">
                2
              </span>
              <span>ข้อเสนอสถาปัตยกรรมเชื่อมต่อ Veo API โดยตรงอย่างปลอดภัย (Backend Architecture)</span>
            </div>

            <p className="text-slate-300">
              สำหรับการเชื่อมต่อกับ Google Veo API แบบอัตโนมัติ (ไม่ต้องเปิดเว็บ flow.google แยก) <strong>ต้องไม่เปิดเผย API Key ใน Frontend/เบราว์เซอร์</strong> เพื่อความปลอดภัยสูงสุด:
            </p>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 text-[11px] text-slate-300">
              <div className="font-semibold text-white">โครงสร้างสถาปัตยกรรมที่แนะนำ (Production-Ready Architecture):</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><strong className="text-slate-200">Frontend (Flow Director Web/PWA):</strong> ผู้ใช้สร้าง Prompt และเลือกภาพ Reference จากเครื่อง → ส่ง Payload ผ่าน HTTPS ไปยัง Backend ของเรา</li>
                <li><strong className="text-slate-200">Secure Backend Proxy (Cloud Run / Cloud Functions):</strong> เซิร์ฟเวอร์ทำหน้าที่เป็นตัวกลาง รับคำสั่ง ตรวจสอบสิทธิ์ผู้ใช้ (Token Auth)</li>
                <li><strong className="text-slate-200">Secret Management:</strong> จัดเก็บ Google Cloud Veo API Key ใน Secret Manager / Environment Variables บนเซิร์ฟเวอร์เท่านั้น ไม่รั่วไหลสู่เบราว์เซอร์</li>
                <li><strong className="text-slate-200">Async Task & Webhook:</strong> ส่งคำสั่งไปยัง Google Vertex AI / Veo API → รับสถานะการเรนเดอร์แบบเบื้องหลัง (Job Polling) → สตรีมวิดีโอที่เสร็จแล้วกลับมาแสดงในแอปทันที</li>
              </ul>
            </div>
          </div>

          {/* Method 3: Companion Script */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[11px]">
                  3
                </span>
                <span>แอดวานซ์: ติดตั้ง Companion Script ใน Tampermonkey / Chrome</span>
              </div>
              <button
                onClick={handleCopyScript}
                className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center gap-1 transition-colors"
              >
                {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'คัดลอกแล้ว' : 'คัดลอก Userscript'}</span>
              </button>
            </div>
            <p className="text-slate-400">
              สคริปต์นี้จะสร้างปุ่มลอย <strong>"🎬 Paste from Flow Director"</strong> ไว้ที่มุมขวาล่างของเว็บ flow.google
              เพียงกดปุ่มเดียว Prompt จากแอปนี้จะถูกหยอดลงช่องป้อนข้อความของ Flow ทันที:
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 max-h-32 overflow-y-auto">
              <pre>{helperScript}</pre>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
