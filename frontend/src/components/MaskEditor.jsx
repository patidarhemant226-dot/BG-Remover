import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Scissors, Eraser, RotateCcw, Check, X, Move } from 'lucide-react';

export default function MaskEditor({ originalURL, resultURL, onSave, onCancel }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('erase'); // erase | restore
  const [brushSize, setBrushSize] = useState(30);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    contextRef.current = ctx;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = resultURL;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const origImg = new Image();
      origImg.crossOrigin = 'anonymous';
      origImg.src = originalURL;
      origImg.onload = () => {
        const pattern = ctx.createPattern(origImg, 'no-repeat');
        contextRef.current.restorePattern = pattern;
      };

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };
  }, [resultURL, originalURL]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (isPanning) return;
    const { x, y } = getCanvasCoords(e);
    setIsDrawing(true);
    
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    if (mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = ctx.restorePattern;
    }
    
    ctx.lineWidth = brushSize;
    lastMousePos.current = { x, y };
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);
    const ctx = contextRef.current;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    lastMousePos.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    contextRef.current.closePath();
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      onSave(blob);
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/90 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Scissors size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">Refine Mask</h3>
            <p className="text-slate-400 text-xs">Brush over edges to perfect the cutout</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="px-6 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 font-medium transition-colors">
            Discard
          </button>
          <button onClick={handleExport} className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 hover:scale-105 transition-all flex items-center gap-2">
            <Check size={18} /> Apply Changes
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-12">
        {/* Background checkerboard */}
        <div className="absolute inset-0 opacity-20 pointer-events-none checker-grid" />
        
        {/* Original Image as ghost reference */}
        <img src={originalURL} alt="" className="absolute max-w-full max-h-full object-contain opacity-30 pointer-events-none" />

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="relative max-w-full max-h-full object-contain cursor-crosshair shadow-2xl"
          style={{ touchAction: 'none' }}
        />

        {/* Floating Toolbar */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-4">
          <div className="glass-panel p-3 rounded-[2rem] flex flex-col gap-3 border-white/20">
            <button 
              onClick={() => setMode('erase')}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${mode === 'erase' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10'}`}
              title="Erase (Remove Background)"
            >
              <Eraser size={24} />
            </button>
            <button 
              onClick={() => setMode('restore')}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${mode === 'restore' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10'}`}
              title="Restore (Bring Back)"
            >
              <RotateCcw size={24} />
            </button>
            
            <div className="w-full h-px bg-white/10 my-1" />
            
            <div className="flex flex-col items-center gap-4 py-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest vertical-text">Size</span>
              <input 
                type="range" 
                min="5" 
                max="100" 
                value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-32 -rotate-90 origin-center accent-blue-600"
              />
              <span className="text-xs font-bold text-white mt-8">{brushSize}px</span>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white/60 text-xs font-medium">
          Tip: Use <span className="text-blue-400 font-bold">Erase</span> for stray pixels and <span className="text-blue-400 font-bold">Restore</span> for missed subject parts.
        </div>
      </div>
    </div>
  );
}
