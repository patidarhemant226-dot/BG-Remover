import React from 'react';
import { History, X, Clock, Trash2, Download } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, history, onClear }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-500 ease-out border-l border-slate-100">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">History</h3>
              <p className="text-xs text-slate-400 font-medium">Your recent removals</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <History size={48} className="mb-4 text-slate-200" />
              <p className="text-slate-500 font-bold italic">No history yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Process some images to see them here.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {history.map((item) => (
                <div key={item.id} className="group relative rounded-2xl bg-slate-50/50 p-4 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all shadow-sm hover:shadow-md">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 checker-grid shrink-0 border border-slate-200">
                      <img src={item.resultURL} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          <Clock size={10} />
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm truncate">Removal Result</h4>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-white border border-slate-100 text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="p-8 border-t border-slate-100">
            <button 
              onClick={onClear}
              className="w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
