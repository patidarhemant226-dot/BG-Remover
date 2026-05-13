import React, { useCallback, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dropzone from './components/Dropzone';
import ProgressBar from './components/ProgressBar';
import ImagePreview from './components/ImagePreview';
import BgPicker from './components/BgPicker';
import MaskEditor from './components/MaskEditor';
import HistoryDrawer from './components/HistoryDrawer';
import { useBgRemover } from './hooks/useBgRemover';
import { applyBackground, downloadBlob } from './utils/imageUtils';
import {
  Wand2, Download, RotateCcw, Zap, ShieldCheck, Gift,
  Bot, Scissors, Layers, AlertCircle, Images
} from 'lucide-react';

/* ── Section badge ── */
const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[--primary] bg-blue-50 border border-blue-100">
    {children}
  </span>
);

/* ── Section heading ── */
const SectionHead = ({ badge, title, sub }) => (
  <div className="text-center mb-32">
    <Badge>{badge}</Badge>
    <h2 className="mt-4 text-3xl md:text-5xl font-black text-[--on-surface] tracking-tight">{title}</h2>
    {sub && <p className="mt-3 text-[--on-surface-variant] max-w-xl mx-auto">{sub}</p>}
  </div>
);

/* ── Feature card ── */
const FeatureCard = ({ icon: Icon, title, desc, iconClass }) => (
  <div className="rounded-2xl p-6 transition-all hover:-translate-y-1 duration-300"
    style={{ background: 'var(--surface)', boxShadow: '8px 8px 16px rgba(163,177,198,0.5), -8px -8px 16px rgba(255,255,255,0.9)' }}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconClass}`}
      style={{ background: 'var(--surface)', boxShadow: '4px 4px 10px rgba(163,177,198,0.5), -4px -4px 10px rgba(255,255,255,0.9)' }}>
      <Icon size={22} />
    </div>
    <h3 className="font-bold text-[--on-surface] mb-2">{title}</h3>
    <p className="text-sm text-[--on-surface-variant] leading-relaxed">{desc}</p>
  </div>
);

const FEATURES = [
  { icon: Bot,       title: 'AI-Powered Precision', iconClass: 'text-blue-600',   desc: 'Deep learning model detects hair strands, soft edges, and complex textures with pixel-perfect accuracy.' },
  { icon: Zap,       title: 'Lightning Fast',        iconClass: 'text-violet-600', desc: 'Background removed in seconds. Runs entirely in your browser — no server round-trips.' },
  { icon: ShieldCheck, title: '100% Private',         iconClass: 'text-teal-600',  desc: 'Your images never leave your device. All AI processing happens locally.' },
  { icon: Layers,    title: 'Flexible Export',        iconClass: 'text-orange-500', desc: 'Download as PNG with transparency, JPEG, or WEBP. Add solid colors or gradients.' },
  { icon: Scissors,  title: 'Smart Edge Refine',      iconClass: 'text-pink-500',  desc: 'Automatically softens hard cutout edges so results blend naturally into any background.' },
  { icon: Gift,      title: 'Always Free',            iconClass: 'text-green-600', desc: 'No hidden fees, no account required. Unlimited background removals, forever.' },
];

const EXAMPLES = [
  { label: 'Portrait', chip: 'bg-violet-500',  src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80' },
  { label: 'Product',  chip: 'bg-blue-500',    src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80' },
  { label: 'Pet',      chip: 'bg-orange-500',  src: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=500&q=80' },
  { label: 'Car',      chip: 'bg-teal-500',    src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&q=80' },
];



export default function App() {
  const { state, queue, currentItem, currentIndex, errorMsg, processFiles, reset } = useBgRemover();
  const [bgType, setBgType] = useState('transparent');
  const [customColor, setCustomColor] = useState('#ff6b6b');
  const [format, setFormat] = useState('PNG');
  const [downloading, setDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewIndex, setViewIndex] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [localHistory, setLocalHistory] = useState([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pixelpure_history');
      const saved = stored ? JSON.parse(stored) : [];
      setLocalHistory(Array.isArray(saved) ? saved : []);
    } catch (e) {
      console.error("Failed to load history:", e);
      setLocalHistory([]);
    }
  }, [state]); // Refresh when state changes (e.g. after processing)

  const clearHistory = () => {
    localStorage.removeItem('pixelpure_history');
    setLocalHistory([]);
  };

  const activeItem = queue[viewIndex] || currentItem;
  const displayResultURL = activeItem?.resultURL;
  const originalURL = activeItem?.originalURL;

  const resolvedBg = bgType === 'custom' ? customColor : bgType;
  const mimeMap = { PNG: 'image/png', JPG: 'image/jpeg', WEBP: 'image/webp' };
  const extMap  = { PNG: 'png', JPG: 'jpg', WEBP: 'webp' };

  const handleMaskSave = (blob) => {
    const url = URL.createObjectURL(blob);
    // In batch mode, we'd update the specific item in the queue.
    // For now, let's keep it simple and just update the active view index's result.
  };

  const handleDownload = useCallback(async () => {
    if (!displayResultURL || downloading) return;
    setDownloading(true);
    const blob = await applyBackground(displayResultURL, resolvedBg, mimeMap[format]);
    downloadBlob(blob, `pixelpure-result.${extMap[format]}`);
    setDownloading(false);
  }, [displayResultURL, resolvedBg, format, downloading]);

  const handleReset = () => {
    reset();
    setViewIndex(0);
  };

  return (
    <div className="min-h-screen selection:bg-blue-100" style={{ background: 'var(--surface)' }}>
      {isEditing && activeItem && (
        <MaskEditor 
          originalURL={originalURL} 
          resultURL={displayResultURL} 
          onSave={handleMaskSave} 
          onCancel={() => setIsEditing(false)} 
        />
      )}
      
      <HistoryDrawer 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)} 
        history={localHistory} 
        onClear={clearHistory} 
      />

      <Navbar onHistoryClick={() => setHistoryOpen(true)} />

      {/* ── HERO ── */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden" id="hero">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] animate-drift" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-400/10 rounded-full blur-[100px] animate-drift" style={{ animationDelay: '-5s' }} />
        </div>

        <div className="app-container relative z-10 flex flex-col items-center justify-center text-center">

          <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.85] mb-12" style={{ marginTop: '20px' }}>
            <span className="block text-slate-900 drop-shadow-sm">Remove Any</span>
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent pb-4">Background</span>
            <span className="block text-slate-900">Instantly</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed mb-16 max-w-3xl">
            Drop your image and watch AI erase the background in seconds.
            Portraits, products, pets — any subject, perfect results.
          </p>

          <div className="flex flex-col items-center gap-12 w-full">
            <a href="#tool" className="btn-modern px-14 py-6 rounded-2xl text-white font-bold text-xl flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-2xl">
              <Download size={26} /> Upload Image Free
            </a>

            <div className="flex flex-wrap justify-center gap-12 md:gap-24">
              {[['10M+','Processed'],['<1s','Speed'],['100%','Free']].map(([n,l],i) => (
                <div key={i} className="text-center group">
                  <div className="text-4xl md:text-5xl font-black text-slate-900 leading-none mb-3 group-hover:text-blue-600 transition-colors">{n}</div>
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.25em]">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL ── */}
      <section id="tool" className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50/50 py-32">
        <div className="app-container w-full flex flex-col items-center justify-center">
          <SectionHead badge="✦ Try It" title="Start Removing" sub="Upload multiple images — AI handles the batch." />

          <div className="w-full max-w-5xl mx-auto flex justify-center">
            <div className="glass-panel rounded-[3rem] p-4 md:p-8 w-full">
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100">
                {/* IDLE */}
                {state === 'idle' && <Dropzone onFiles={processFiles} />}

                {/* PROCESSING */}
                {state === 'processing' && (
                  <div className="flex flex-col gap-8 py-10">
                    {!window.crossOriginIsolated && (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                        <AlertCircle size={20} className="text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-900 font-medium leading-tight">
                          Performance Alert: Cross-Origin Isolation is disabled. The AI is running in "Safe Mode" which is 5x slower.
                        </p>
                      </div>
                    )}
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {errorMsg ? 'Processing Paused' : 'Processing Batch'}
                      </h3>
                      <p className="text-slate-500">
                        {errorMsg ? 'An error occurred' : `Handling ${currentIndex + 1} of ${queue.length} images`}
                      </p>
                    </div>
                    
                    {errorMsg ? (
                      <div className="flex flex-col items-center gap-6 p-8 rounded-[2rem] bg-red-50 border border-red-100">
                        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                          <AlertCircle size={32} />
                        </div>
                        <p className="text-red-900 font-bold text-center max-w-md">{errorMsg}</p>
                        <button onClick={handleReset} className="btn-modern bg-slate-900 px-8 py-3 rounded-xl text-white font-bold text-sm">
                          Try Again
                        </button>
                      </div>
                    ) : (
                      <ProgressBar 
                        progress={currentItem?.progress || 0} 
                        stepIdx={currentItem?.stepIdx || 0} 
                        steps={[
                          { id: 1, label: 'Scanning Image…' },
                          { id: 2, label: 'AI Extraction…' },
                          { id: 3, label: 'Edge Refinement…' },
                          { id: 4, label: 'Finalizing…' }
                        ]} 
                      />
                    )}
                  </div>
                )}

                {/* DONE */}
                {state === 'done' && (
                  <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1">
                      <div className="min-h-[450px] relative group/preview mb-8">
                        <ImagePreview originalURL={originalURL} resultURL={displayResultURL} />
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="absolute bottom-6 right-6 px-6 py-3 rounded-2xl glass-panel border-white/20 text-slate-900 font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-2xl z-50"
                        >
                          <Scissors size={18} className="text-blue-600" />
                          Edit Refinement
                        </button>
                      </div>

                      {/* Batch Selection Strip */}
                      <div className="flex gap-4 overflow-x-auto pb-4 px-2">
                        {queue.map((item, idx) => (
                          <button 
                            key={item.id} 
                            onClick={() => setViewIndex(idx)}
                            className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${viewIndex === idx ? 'border-blue-600 scale-105 shadow-lg' : 'border-slate-100 hover:border-slate-300'}`}
                          >
                            <img src={item.resultURL || item.originalURL} className="w-full h-full object-cover" alt="" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="lg:w-80 flex flex-col gap-8">
                      <div className="neu-concave p-8">
                        <div className="flex items-center gap-2 mb-8">
                          <Layers size={18} className="text-blue-600" />
                          <span className="text-xs font-black uppercase tracking-widest text-slate-900">Toolkit</span>
                        </div>
                        <BgPicker
                          selected={bgType}
                          onSelect={setBgType}
                          onCustomColor={(c) => { setCustomColor(c); setBgType('custom'); }}
                          format={format}
                          onFormatChange={setFormat}
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <button onClick={handleDownload} disabled={downloading}
                          className="btn-modern w-full py-5 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3">
                          <Download size={22} />
                          Download Current
                        </button>
                        <button onClick={handleReset}
                          className="w-full py-4 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                          <RotateCcw size={18} /> New Batch
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-32">
        <div className="app-container">
          <SectionHead badge="⚡ Why PixelPure" title="Everything You Need" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20" style={{ marginTop: '60px' }}>
            {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>


      {/* ── EXAMPLES ── */}
      <section id="examples" style={{ paddingTop: '80px', paddingBottom: '40px' }}>
        <div className="app-container">
          <SectionHead badge="✦ Gallery" title="See It In Action" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16" style={{ marginTop: '60px' }}>
            {EXAMPLES.map((ex) => (
              <div key={ex.label} className="group relative rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 hover:-translate-y-3">
                <div className="relative aspect-[3/4] overflow-hidden checker-grid">
                  <img src={ex.src} alt={ex.label} loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 group-hover:opacity-100 z-10" />
                  <img src={ex.src} alt={ex.label} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    style={{ mixBlendMode: 'multiply' }} />
                  <div className="absolute top-6 left-6 z-20">
                    <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl ${ex.chip}`}>
                      {ex.label}
                    </span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <p className="text-white text-xs font-bold flex items-center gap-2">
                      <Zap size={14} className="text-yellow-400 fill-current" /> Hover to see original
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 text-white pt-32 pb-12 border-t border-slate-900 overflow-hidden relative">
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="app-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-24">
            {/* Brand Section */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Wand2 size={24} className="text-white" />
                </div>
                <span className="text-3xl font-black tracking-tight italic">Pixel<span className="text-blue-500">Pure</span></span>
              </div>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-md mb-10">
                The world's most advanced browser-based background removal tool. 
                Private, fast, and completely free forever.
              </p>
              <div className="flex gap-4">
                {['Twitter', 'Instagram', 'Github', 'LinkedIn'].map((s) => (
                  <a key={s} href="#" className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-all group">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-white">{s[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="lg:col-span-2 lg:col-start-7">
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500 mb-8">Navigation</h4>
              <ul className="space-y-4">
                {['Features', 'Process', 'Gallery'].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase()}`} className="text-slate-400 hover:text-white transition-colors font-medium text-lg">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500 mb-8">Legal</h4>
              <ul className="space-y-4">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors font-medium text-lg">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Status */}
            <div className="lg:col-span-3">
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-500 mb-8">Status</h4>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 text-green-400 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-bold uppercase tracking-wider">All Systems Operational</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">AI Model: v2.4.0 (Stable)</p>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">
              © 2026 PIXELPURE AI. ALL RIGHTS RESERVED.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
