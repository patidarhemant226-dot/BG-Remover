import React, { useRef, useState } from 'react';
import { Upload, FolderOpen, Clipboard } from 'lucide-react';

const CHIPS = ['Portrait', 'Product', 'Animal', 'Graphic', 'Food'];

export default function Dropzone({ onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [activeChip, setActiveChip] = useState('Portrait');

  const handleFiles = (files) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) onFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onPaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            onFile(new File([blob], 'pasted.png', { type }));
            return;
          }
        }
      }
    } catch { /* clipboard access denied */ }
  };

  return (
    <div className="flex flex-col items-center gap-14 py-10">
      {/* Main Upload Container */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative w-full max-w-3xl cursor-pointer rounded-[3rem] transition-all duration-700
          flex flex-col items-center justify-center gap-10 py-24 px-12
          border-2 border-dashed
          ${dragging
            ? 'border-blue-500 bg-blue-50/40 scale-[1.01] shadow-2xl'
            : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50 bg-white shadow-sm'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Dynamic Icon */}
        <div className="relative">
          <div className={`w-28 h-28 rounded-3xl flex items-center justify-center transition-all duration-500 ${
            dragging ? 'bg-blue-600 text-white scale-110 shadow-2xl' : 'bg-slate-50 text-blue-600 shadow-sm border border-slate-100'
          }`}>
            <Upload size={44} className={dragging ? 'animate-bounce' : 'animate-float'} />
          </div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 border border-slate-100">
            <Clipboard size={20} />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Drop & Extract</h3>
          <p className="text-base font-bold text-slate-400 max-w-xs mx-auto leading-relaxed">
            Drag your image here or <span className="text-blue-600">browse</span> to start the magic.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-5 flex-wrap justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            className="btn-modern px-10 py-5 rounded-2xl text-white font-bold text-lg flex items-center gap-3"
          >
            <FolderOpen size={20} /> Select Files
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onPaste(); }}
            className="px-10 py-5 rounded-2xl text-lg font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
          >
            Paste Image
          </button>
        </div>
      </div>

      {/* Category Selection */}
      <div className="flex flex-col items-center gap-6">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Popular Scenarios</p>
        <div className="flex flex-wrap gap-4 justify-center">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-8 py-3 rounded-2xl text-xs font-black tracking-widest uppercase transition-all duration-500 ${
                activeChip === chip
                  ? 'bg-slate-900 text-white shadow-xl scale-105'
                  : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-300 shadow-sm'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
