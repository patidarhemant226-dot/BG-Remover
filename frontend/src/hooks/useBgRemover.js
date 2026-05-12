import { useState, useCallback, useRef } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { blobToObjectURL } from '../utils/imageUtils';

const STEPS = [
  { id: 1, label: 'Scanning image…' },
  { id: 2, label: 'Detecting subject…' },
  { id: 3, label: 'Removing background…' },
  { id: 4, label: 'Finalizing…' },
];

export function useBgRemover() {
  const [state, setState] = useState('idle'); // idle | processing | done | error
  const [queue, setQueue] = useState([]); // Array of { file, originalURL, resultURL, status: 'pending' | 'processing' | 'done' | 'error', progress: 0 }
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [errorMsg, setErrorMsg] = useState('');

  const processFiles = useCallback(async (files) => {
    const newItems = files.map(file => ({
      file,
      originalURL: blobToObjectURL(file),
      resultURL: null,
      status: 'pending',
      progress: 0,
      id: Math.random().toString(36).substr(2, 9)
    }));

    setQueue(prev => [...prev, ...newItems]);
    setState('processing');
  }, []);

  // Process queue sequentially
  useEffect(() => {
    const processNext = async () => {
      const pendingIdx = queue.findIndex(item => item.status === 'pending');
      if (pendingIdx === -1) {
        if (queue.length > 0 && queue.every(item => item.status === 'done' || item.status === 'error')) {
          setState('done');
        }
        return;
      }

      setCurrentIndex(pendingIdx);
      const item = queue[pendingIdx];
      
      // Update status to processing
      setQueue(prev => prev.map((it, i) => i === pendingIdx ? { ...it, status: 'processing' } : it));

      try {
        const resultBlob = await removeBackground(item.file, {
          output: { format: 'image/png', quality: 1 },
          onProgress: (p) => {
            setQueue(prev => prev.map((it, i) => i === pendingIdx ? { ...it, progress: Math.round(p * 100) } : it));
          }
        });

        const url = blobToObjectURL(resultBlob);
        setQueue(prev => prev.map((it, i) => i === pendingIdx ? { ...it, status: 'done', resultURL: url, progress: 100 } : it));

        // Save to persistent history
        const historyItem = {
          id: item.id,
          originalURL: item.originalURL, // Note: ObjectURLs won't persist across reloads, 
          resultURL: url,               // in a real app we'd save the base64 or blob to indexedDB
          timestamp: new Date().toISOString()
        };
        const existingHistory = JSON.parse(localStorage.getItem('pixelpure_history') || '[]');
        localStorage.setItem('pixelpure_history', JSON.stringify([historyItem, ...existingHistory].slice(0, 20)));

      } catch (err) {
        setQueue(prev => prev.map((it, i) => i === pendingIdx ? { ...it, status: 'error' } : it));
        setErrorMsg(err?.message || 'Processing failed');
      }
    };

    if (state === 'processing') {
      processNext();
    }
  }, [queue, state]);

  const reset = useCallback(() => {
    queue.forEach(item => {
      if (item.originalURL) URL.revokeObjectURL(item.originalURL);
      if (item.resultURL) URL.revokeObjectURL(item.resultURL);
    });
    setQueue([]);
    setCurrentIndex(-1);
    setErrorMsg('');
    setState('idle');
  }, [queue]);

  const currentItem = currentIndex >= 0 ? queue[currentIndex] : null;

  return {
    state,
    queue,
    currentIndex,
    currentItem,
    errorMsg,
    processFiles,
    reset,
  };
}
