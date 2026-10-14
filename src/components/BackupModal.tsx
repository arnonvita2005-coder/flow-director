import React, { useRef, useState } from 'react';
import { X, Database, Download, Upload, ShieldCheck, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import type { Persona, ShotConfig } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  personas: Persona[];
  shots: ShotConfig[];
  apiKey: string;
  onRestoreData: (personas: Persona[], shots: ShotConfig[], apiKey?: string) => void;
  onResetData: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  personas,
  shots,
  apiKey: _apiKey,
  onRestoreData,
  onResetData
}) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Total props count
  const totalProps = personas.reduce((acc, p) => acc + (p.props?.length || 0), 0);

  const handleExport = () => {
    try {
      // Priority 5: Never include API Key in exported backup files
      const backupData = {
        version: '1.1',
        exportedAt: new Date().toISOString(),
        personas,
        shots
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `flow_director_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setSuccessMessage('ดาวน์โหลดไฟล์สำรองข้อมูล (JSON) เรียบร้อยแล้ว! (ไม่รวม API Key เพื่อความปลอดภัย)');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      setErrorMessage('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.personas || !Array.isArray(parsed.personas)) {
          throw new Error('โครงสร้างไฟล์ไม่ถูกต้อง');
        }

        onRestoreData(parsed.personas, parsed.shots || shots, undefined);
        setSuccessMessage('กู้คืนข้อมูลตัวละครและพร็อพทั้งหมดสำเร็จ!');
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 2000);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'ไม่สามารถอ่านไฟล์ได้';
        setErrorMessage(`ไม่สามารถอ่านไฟล์ได้: ${msg}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">หน่วยความจำ & สำรองข้อมูล</h3>
            <p className="text-xs text-slate-400">ข้อมูลของคุณจะถูกบันทึกค้างไว้ในเครื่องอัตโนมัติ ไม่ต้องถ่ายรูปใหม่</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3.5 mb-5 text-xs text-emerald-200">
          <div className="flex items-center gap-2 mb-1.5 font-semibold text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ระบบบันทึกอัตโนมัติทำงานสมบูรณ์ (Auto-Saved)</span>
          </div>
          <p className="text-slate-300 mb-2">
            ตัวละคร หน้าตา และรูปถ่ายที่คุณอัปโหลดถูกเก็บลงในหน่วยความจำของอุปกรณ์ (IndexedDB & LocalStorage) 
            เมื่อปิดเว็บหรือกลับมาเปิดใหม่ หน้าเดิมและชื่อเดิมจะยังคงอยู่ครบถ้วนครับ
          </p>
          <div className="flex items-center gap-4 text-[11px] text-emerald-400/90 pt-1 border-t border-emerald-500/20 font-medium">
            <span>👤 ตัวละครที่บันทึกไว้: {personas.length} คน</span>
            <span>🚤 พร็อพ/อุปกรณ์: {totalProps} ชิ้น</span>
            <span>🎬 ซีนสตอรี่: {shots.length} ช็อต</span>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Actions Grid */}
        <div className="space-y-3 mb-5">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-white text-xs block">ดาวน์โหลดสำรองข้อมูล (Export Backup)</span>
              <span className="text-[11px] text-slate-400">เก็บไฟล์ .json ไว้ในเครื่องหรือส่งเข้ามือถือ เพื่อความปลอดภัย 100%</span>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด .json</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-white text-xs block">กู้คืนข้อมูล (Import Backup)</span>
              <span className="text-[11px] text-slate-400">นำเข้าไฟล์สำรองข้อมูลเดิม หากคุณเปลี่ยนเครื่องหรือต้องการย้ายข้อมูล</span>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors shrink-0"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>เลือกไฟล์ .json</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </div>

        {/* Danger zone / Reset */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-[11px] text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>รีเซ็ตกลับเป็นค่าเริ่มต้นตัวอย่าง</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-red-400">ต้องการล้างข้อมูลและเริ่มใหม่ใช่ไหม?</span>
              <button
                onClick={() => {
                  onResetData();
                  setConfirmReset(false);
                  onClose();
                }}
                className="px-2.5 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-500"
              >
                ยืนยันล้าง
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs hover:text-white"
              >
                ยกเลิก
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
