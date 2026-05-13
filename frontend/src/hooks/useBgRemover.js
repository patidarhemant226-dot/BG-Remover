import { useState, useCallback, useRef, useEffect } from 'react';
import { removeBackground, preload } from '@imgly/background-removal';
import { blobToObjectURL } from '../utils/imageUtils';

export function useBgRemover() {
  const [state, setState] = useState('idle'); // idle | processing | done | error
  const [queue, setQueue] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [errorMsg, setErrorMsg] = useState('');
  const processingRef = useRef(false);

  // Preload model on mount
  useEffect(() => {
    preload({ model: 'small' }).catch(err => console.error("Preload failed:", err));
  }, []);

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
    setErrorMsg('');
  }, []);

  useEffect(() => {
    if (state !== 'processing' || processingRef.current) return;

    const processNext = async () => {
      const pendingIdx = queue.findIndex(item => item.status === 'pending');
      
      if (pendingIdx === -1) {
        const allFinished = queue.length > 0 && queue.every(it => it.status === 'done' || it.status === 'error');
        if (allFinished) {
          setState('done');
          processingRef.current = false;
        }
        return;
      }

      processingRef.current = true;
      setCurrentIndex(pendingIdx);
      const item = queue[pendingIdx];
      
      // Update status to processing
      setQueue(prev => prev.map((it, i) => i === pendingIdx ? { ...it, status: 'processing', progress: 0 } : it));

      // Simulated progress for the "Initializing" phase (0% to 15%)
      let fakeProgress = 0;
      const progressInterval = setInterval(() => {
        if (fakeProgress < 15) {
          fakeProgress += Math.random() * 2;
          setQueue(prev => prev.map((it, i) => 
            i === pendingIdx ? { ...it, progress: Math.min(Math.round(fakeProgress), 15), stepIdx: 0 } : it
          ));
        }
      }, 300);

      try {
        if (!window.crossOriginIsolated) {
          console.warn("Cross-Origin Isolation is not enabled. Background removal might be slow or fail.");
        }

        const config = {
          output: { format: 'image/png', quality: 1 },
          model: 'small', 
          onProgress: (p) => {
            const realProgress = Math.round(p * 100);
            const progress = Math.max(realProgress, Math.round(fakeProgress));
            
            let step = 0;
            if (progress > 10) step = 1;
            if (progress > 70) step = 2;
            if (progress > 90) step = 3;
            
            setQueue(prev => prev.map((it, i) => 
              i === pendingIdx ? { ...it, progress, stepIdx: step } : it
            ));
          }
        };

        const resultBlob = await removeBackground(item.file, config);
        clearInterval(progressInterval);
        const url = blobToObjectURL(resultBlob);

        setQueue(prev => prev.map((it, i) => 
          i === pendingIdx ? { ...it, status: 'done', resultURL: url, progress: 100 } : it
        ));

        // Save to persistent history
        const historyItem = {
          id: item.id,
          originalURL: item.originalURL,
          resultURL: url,
          timestamp: new Date().toISOString()
        };
        const existingHistory = JSON.parse(localStorage.getItem('pixelpure_history') || '[]');
        localStorage.setItem('pixelpure_history', JSON.stringify([historyItem, ...existingHistory].slice(0, 20)));

      } catch (err) {
        console.error("BG Removal Error:", err);
        let msg = err?.message || 'Processing failed';
        
        if (msg.includes('SharedArrayBuffer')) {
          msg = "Security headers (COOP/COEP) missing. Please check server configuration.";
        } else if (msg.includes('fetch')) {
          msg = "Failed to download AI model. Check your internet connection.";
        }

        setQueue(prev => prev.map((it, i) => i === pendingIdx ? { ...it, status: 'error' } : it));
        setErrorMsg(msg);
      } finally {
        processingRef.current = false;
      }
    };

    processNext();
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
    processingRef.current = false;
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

