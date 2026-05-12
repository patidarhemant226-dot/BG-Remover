import React, { useRef, useState, useEffect } from 'react';

export default function ImagePreview({ originalURL, resultURL }) {
  const containerRef = useRef(null);
  const [sliderPct, setSliderPct] = useState(50);
  const dragging = useRef(false);

  const updateSlider = (clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setSliderPct(pct);
  };

  useEffect(() => {
    const onMouseMove = (e) => { if (dragging.current) updateSlider(e.clientX); };
    const onMouseUp = () => { dragging.current = false; };
    const onTouchMove = (e) => { if (dragging.current) updateSlider(e.touches[0].clientX); };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, []);

  return (
    <div className="relative w-full select-none overflow-hidden rounded-[3rem] bg-slate-100 border border-slate-200 group shadow-inner" ref={containerRef}
      style={{ minHeight: 450, maxHeight: 600 }}
    >
      {/* Before (original) */}
      <div className="absolute inset-0">
        <img src={originalURL} alt="Original" className="w-full h-full object-contain p-2" />
        <div className="absolute top-8 left-8 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white bg-slate-900/40 backdrop-blur-xl border border-white/10 z-20">
          Original
        </div>
      </div>

      {/* After (result) – clipped to slider */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPct}% 0 0)` }}
      >
        {/* checkerboard grid */}
        <div className="absolute inset-0 checker-grid" />
        <img src={resultURL} alt="Result" className="relative w-full h-full object-contain p-2" />
        <div className="absolute top-8 right-8 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white bg-blue-600/80 backdrop-blur-xl border border-white/10 z-20 shadow-xl">
          ✦ AI Removed
        </div>
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 w-1 cursor-ew-resize z-40 group/handle"
        style={{ left: `${sliderPct}%`, transform: 'translateX(-50%)' }}
        onMouseDown={() => { dragging.current = true; }}
        onTouchStart={() => { dragging.current = true; }}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] bg-white/80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-2xl transition-all duration-500 group-hover/handle:scale-110 border-[6px] border-slate-100"
        >
          <div className="flex gap-1.5">
             <div className="w-1 h-5 rounded-full bg-blue-200" />
             <div className="w-1 h-5 rounded-full bg-blue-600" />
             <div className="w-1 h-5 rounded-full bg-blue-200" />
          </div>
        </div>
      </div>

      {/* Modern Hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-3.5 rounded-2xl glass-panel border-white text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0 pointer-events-none">
        Slide to view
      </div>
    </div>
  );
}
