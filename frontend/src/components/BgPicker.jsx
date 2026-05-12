import React, { useState } from 'react';
import { Pipette } from 'lucide-react';

const PRESETS = [
  { id: 'transparent', label: 'Clear', style: null },
  { id: 'white',       label: 'White', style: { background: '#ffffff' } },
  { id: 'black',       label: 'Black', style: { background: '#111111' } },
  { id: 'gradient',    label: 'Grad',  style: { background: 'linear-gradient(135deg,#0058be,#6b38d4)' } },
];

export default function BgPicker({ selected, onSelect, onCustomColor, format, onFormatChange }) {
  const [customColor, setCustomColor] = useState('#ff6b6b');

  const handleCustom = (e) => {
    setCustomColor(e.target.value);
    onCustomColor(e.target.value);
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Background Section */}
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-5">Background Type</p>
        <div className="flex items-center gap-4 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              title={p.label}
              onClick={() => onSelect(p.id)}
              className={`w-11 h-11 rounded-2xl border-2 transition-all duration-500 active:scale-90 ${
                selected === p.id ? 'border-blue-600 shadow-xl scale-110 z-10' : 'border-transparent'
              }`}
              style={{
                ...(p.style ?? {}),
                boxShadow: selected === p.id ? '0 10px 20px rgba(37, 99, 235, 0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.05)',
                ...(p.id === 'transparent' ? {
                  background: '#f8fafc',
                  backgroundImage: 
                    'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), ' +
                    'linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), ' +
                    'linear-gradient(45deg, transparent 75%, #e2e8f0 75%), ' +
                    'linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                  backgroundSize: '12px 12px',
                  backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                } : {}),
              }}
            />
          ))}

          {/* Custom Color Picker */}
          <label
            title="Custom Color"
            className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all duration-500 active:scale-90 shadow-sm ${
              selected === 'custom' ? 'border-blue-600 shadow-xl scale-110 z-10' : 'border-transparent'
            }`}
            style={{ background: customColor }}
          >
            <Pipette size={16} className={`drop-shadow-sm ${parseInt(customColor.replace('#',''), 16) > 0xffffff/2 ? 'text-slate-900' : 'text-white'}`} />
            <input
              type="color"
              value={customColor}
              onChange={handleCustom}
              onClick={() => onSelect('custom')}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {/* Format Selection */}
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-5">Export Strategy</p>
        <div className="flex gap-2 p-2 rounded-2xl bg-slate-100 border border-slate-200">
          {['PNG', 'JPG', 'WEBP'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => onFormatChange(fmt)}
              className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                format === fmt
                  ? 'bg-white text-blue-600 shadow-lg scale-100'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
