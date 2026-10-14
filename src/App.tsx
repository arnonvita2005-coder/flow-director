import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PersonaManager } from './components/PersonaManager';
import { DirectorStudio } from './components/DirectorStudio';
import { StoryboardTimeline } from './components/StoryboardTimeline';
import { ApiKeyModal } from './components/ApiKeyModal';
import { FlowIntegrationHelper } from './components/FlowIntegrationHelper';
import { MobileQrModal } from './components/MobileQrModal';
import { CreatePersonaModal } from './components/CreatePersonaModal';
import { BackupModal } from './components/BackupModal';
import type { Persona, ShotConfig } from './types';
import { INITIAL_PERSONAS, INITIAL_PROJECT } from './services/mockData';
import { DEFAULT_NEGATIVE_PROMPT, compileVeoPrompt } from './services/promptCompiler';
import { idbGet, idbSet, safeLocalStorageSet } from './services/storage';
import { User, Clapperboard, Film, Copy, Check, ExternalLink } from 'lucide-react';

export function App() {
  // Load saved state or fall back to defaults
  const [personas, setPersonas] = useState<Persona[]>(() => {
    const saved = localStorage.getItem('flow_director_personas');
    if (saved) {
      try {
        const parsed: Persona[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p) => ({
            ...p,
            props: p.props || []
          }));
        }
      } catch (e) {
        return INITIAL_PERSONAS;
      }
    }
    return INITIAL_PERSONAS;
  });

  const [activePersonaId, setActivePersonaId] = useState<string>(() => {
    return personas[0]?.id || INITIAL_PERSONAS[0].id;
  });

  const [shots, setShots] = useState<ShotConfig[]>(() => {
    const saved = localStorage.getItem('flow_director_shots');
    return saved ? JSON.parse(saved) : INITIAL_PROJECT.shots;
  });

  const [activeShotId, setActiveShotId] = useState<string>(() => {
    return shots[0]?.id || INITIAL_PROJECT.shots[0].id;
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('flow_director_gemini_api_key') || '';
  });

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isHelperModalOpen, setIsHelperModalOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isCreateFriendModalOpen, setIsCreateFriendModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isDockMode, setIsDockMode] = useState(false);
  const [isStorageReady, setIsStorageReady] = useState(false);

  // Mobile navigation tab state
  const [mobileTab, setMobileTab] = useState<'twin' | 'director' | 'story'>('director');
  const [mobileCopied, setMobileCopied] = useState(false);

  const localWifiIp = '192.168.1.47';

  // Load from IndexedDB on initial mount
  useEffect(() => {
    async function loadFromDB() {
      try {
        const idbPersonas = await idbGet<Persona[]>('flow_director_personas');
        if (idbPersonas && Array.isArray(idbPersonas) && idbPersonas.length > 0) {
          setPersonas(idbPersonas);
        }
        const idbShots = await idbGet<ShotConfig[]>('flow_director_shots');
        if (idbShots && Array.isArray(idbShots) && idbShots.length > 0) {
          setShots(idbShots);
        }
        const idbKey = await idbGet<string>('flow_director_gemini_api_key');
        if (idbKey) {
          setApiKey(idbKey);
        }
      } catch (e) {
        console.warn('[Storage] Failed to load from IndexedDB', e);
      } finally {
        setIsStorageReady(true);
      }
    }
    loadFromDB();
  }, []);

  // Sync to IndexedDB and localStorage safely ONLY AFTER storage is ready
  useEffect(() => {
    if (!isStorageReady) return;
    idbSet('flow_director_personas', personas);
    safeLocalStorageSet('flow_director_personas', JSON.stringify(personas));
  }, [personas, isStorageReady]);

  useEffect(() => {
    if (!isStorageReady) return;
    idbSet('flow_director_shots', shots);
    safeLocalStorageSet('flow_director_shots', JSON.stringify(shots));
  }, [shots, isStorageReady]);

  useEffect(() => {
    if (!isStorageReady) return;
    if (apiKey) {
      idbSet('flow_director_gemini_api_key', apiKey);
      safeLocalStorageSet('flow_director_gemini_api_key', apiKey);
    } else {
      idbSet('flow_director_gemini_api_key', '');
      try {
        localStorage.removeItem('flow_director_gemini_api_key');
      } catch {}
    }
  }, [apiKey, isStorageReady]);

  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0];
  const activeShot = shots.find((s) => s.id === activeShotId) || shots[0];
  const activeShotIndex = shots.findIndex((s) => s.id === activeShotId);

  const handleUpdatePersona = (updated: Persona) => {
    setPersonas((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleCreateFriend = (newPersona: Persona) => {
    setPersonas((prev) => [...prev, newPersona]);
    setActivePersonaId(newPersona.id);
    setMobileTab('twin');
    const currentSecondary = activeShot.secondaryPersonaIds || [];
    handleUpdateShot({
      ...activeShot,
      secondaryPersonaIds: [...currentSecondary, newPersona.id]
    });
  };

  const handleDeletePersona = (id: string) => {
    if (personas.length <= 1) return;
    const remaining = personas.filter((p) => p.id !== id);
    setPersonas(remaining);
    if (activePersonaId === id) {
      setActivePersonaId(remaining[0].id);
    }
  };

  const handleUpdateShot = (updated: ShotConfig) => {
    setShots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleLoadTemplateStoryboard = (newShots: ShotConfig[]) => {
    setShots(newShots);
    if (newShots.length > 0) {
      setActiveShotId(newShots[0].id);
    }
  };

  const handleAddShot = () => {
    const lastShot = shots[shots.length - 1] || activeShot;
    const newIndex = shots.length + 1;
    const newShot: ShotConfig = {
      id: `shot_${Date.now()}`,
      title: `Shot ${newIndex}: Next Progression`,
      userPrompt: '',
      framing: lastShot.framing === 'close_up' ? 'medium_shot' : 'close_up',
      cameraMovement: lastShot.cameraMovement === 'slow_dolly_in' ? 'steadycam_tracking' : 'slow_dolly_in',
      lighting: lastShot.lighting, // Keep continuous scene lighting!
      lens: lastShot.lens,
      motionPacing: lastShot.motionPacing,
      sceneEnvironment: lastShot.sceneEnvironment,
      characterAction: 'continuing movement naturally within the environment',
      characterEmotion: 'consistent emotional state',
      durationSeconds: 5,
      compiledPrompt: '',
      negativePrompt: DEFAULT_NEGATIVE_PROMPT
    };

    setShots((prev) => [...prev, newShot]);
    setActiveShotId(newShot.id);
    setMobileTab('director');
  };

  const handleDeleteShot = (id: string) => {
    if (shots.length <= 1) return;
    const remaining = shots.filter((s) => s.id !== id);
    setShots(remaining);
    if (activeShotId === id) {
      setActiveShotId(remaining[0].id);
    }
  };

  const handleRestoreData = (newPersonas: Persona[], newShots: ShotConfig[], newApiKey?: string) => {
    setPersonas(newPersonas);
    if (newPersonas.length > 0) setActivePersonaId(newPersonas[0].id);
    setShots(newShots);
    if (newShots.length > 0) setActiveShotId(newShots[0].id);
    if (newApiKey !== undefined) setApiKey(newApiKey);
  };

  const handleResetData = () => {
    setPersonas(INITIAL_PERSONAS);
    setActivePersonaId(INITIAL_PERSONAS[0].id);
    setShots(INITIAL_PROJECT.shots);
    setActiveShotId(INITIAL_PROJECT.shots[0].id);
    try {
      localStorage.removeItem('flow_director_personas');
      localStorage.removeItem('flow_director_shots');
    } catch {}
  };

  const handleMobileCopyPrompt = async () => {
    const prompt = compileVeoPrompt(activeShot, activePersona, activeShotIndex, shots.length > 1, personas);
    await navigator.clipboard.writeText(prompt);
    setMobileCopied(true);
    setTimeout(() => setMobileCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 pb-20 sm:pb-0">
      {/* Top Navigation */}
      <Header
        personas={personas}
        activePersona={activePersona}
        onSelectPersona={setActivePersonaId}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenHelperModal={() => setIsHelperModalOpen(true)}
        onOpenMobileModal={() => setIsMobileModalOpen(true)}
        onOpenCreatePersonaModal={() => setIsCreateFriendModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        isDockMode={isDockMode}
        onToggleDockMode={() => setIsDockMode((prev) => !prev)}
        hasApiKey={Boolean(apiKey)}
      />

      {/* Mobile Segmented Tab Bar (Hidden on Tablets & Desktops) */}
      <div className="sm:hidden px-3 pt-3">
        <div className="grid grid-cols-3 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMobileTab('twin')}
            className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'twin'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. หน้าเรา</span>
          </button>
          <button
            onClick={() => setMobileTab('director')}
            className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'director'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>2. ผู้กำกับ</span>
          </button>
          <button
            onClick={() => setMobileTab('story')}
            className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'story'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>3. สตอรี่</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main
        className={`flex-1 w-full mx-auto p-3 sm:p-6 space-y-6 transition-all duration-300 ${
          isDockMode ? 'max-w-2xl' : 'max-w-7xl'
        }`}
      >
        {/* Section 1: Character & Face Consistency Studio */}
        <section className={`${mobileTab !== 'twin' ? 'hidden sm:block' : ''}`}>
          <PersonaManager
            persona={activePersona}
            allPersonas={personas}
            onSelectPersona={setActivePersonaId}
            onOpenCreatePersonaModal={() => setIsCreateFriendModalOpen(true)}
            onUpdatePersona={handleUpdatePersona}
            onDeletePersona={handleDeletePersona}
            apiKey={apiKey}
          />
        </section>

        {/* Section 2: Director Studio & Live Veo Prompt Generator */}
        <section className={`${mobileTab !== 'director' ? 'hidden sm:block' : ''}`}>
          <DirectorStudio
            activeShot={activeShot}
            persona={activePersona}
            allPersonas={personas}
            shotIndex={activeShotIndex}
            totalShots={shots.length}
            onUpdateShot={handleUpdateShot}
            onOpenCreateFriendModal={() => setIsCreateFriendModalOpen(true)}
            apiKey={apiKey}
          />
        </section>

        {/* Section 3: Storyboard Timeline */}
        <section className={`${mobileTab !== 'story' ? 'hidden sm:block' : ''}`}>
          <StoryboardTimeline
            shots={shots}
            activeShotId={activeShotId}
            persona={activePersona}
            onSelectShot={(id) => {
              setActiveShotId(id);
              setMobileTab('director');
            }}
            onAddShot={handleAddShot}
            onDeleteShot={handleDeleteShot}
            onLoadTemplateStoryboard={handleLoadTemplateStoryboard}
            apiKey={apiKey}
            allPersonas={personas}
          />
        </section>
      </main>

      {/* Mobile Sticky Quick Action Bar (Floating at bottom for phones) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-2.5 z-40 flex items-center gap-2">
        <button
          onClick={handleMobileCopyPrompt}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileCopied
              ? 'bg-emerald-500 text-white'
              : 'bg-indigo-600 active:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
          }`}
        >
          {mobileCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{mobileCopied ? 'คัดลอกเรียบร้อย!' : 'คัดลอก Prompt ช็อตนี้'}</span>
        </button>

        <a
          href="https://flow.google"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1 active:bg-slate-800"
        >
          <span>เปิด Flow</span>
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
        </a>
      </div>

      {/* Footer (Desktop/Tablet) */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 hidden sm:block">
        <p>
          Flow Director Studio • ออกแบบมาเพื่อเพิ่มประสิทธิภาพการใช้งานร่วมกับ{' '}
          <a
            href="https://flow.google"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline font-semibold"
          >
            Google Flow
          </a>{' '}
          และ Google Veo
        </p>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        apiKey={apiKey}
        onSaveKey={setApiKey}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      <FlowIntegrationHelper
        isOpen={isHelperModalOpen}
        onClose={() => setIsHelperModalOpen(false)}
      />

      <MobileQrModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        networkIp={localWifiIp}
      />

      <CreatePersonaModal
        isOpen={isCreateFriendModalOpen}
        onClose={() => setIsCreateFriendModalOpen(false)}
        onSave={handleCreateFriend}
        apiKey={apiKey}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        personas={personas}
        shots={shots}
        apiKey={apiKey}
        onRestoreData={handleRestoreData}
        onResetData={handleResetData}
      />
    </div>
  );
}

export default App;
