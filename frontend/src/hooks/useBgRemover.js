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
  const [originalURL, setOriginalURL] = useState(null);
  const [resultURL, setResultURL] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const resultBlobRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    // Reset
    if (resultURL) URL.revokeObjectURL(resultURL);
    setResultURL(null);
    resultBlobRef.current = null;
    setProgress(0);
    setStepIdx(0);
    setErrorMsg('');

    const origURL = blobToObjectURL(file);
    setOriginalURL(origURL);
    setState('processing');

    // Fake step progress (real library doesn't expose steps)
    let fakeStep = 0;
    const stepTimer = setInterval(() => {
      fakeStep = Math.min(fakeStep + 1, STEPS.length - 1);
      setStepIdx(fakeStep);
    }, 1800);

    // Fake numeric progress
    let fakeProgress = 0;
    const progressTimer = setInterval(() => {
      fakeProgress = Math.min(fakeProgress + Math.random() * 8, 90);
      setProgress(Math.round(fakeProgress));
    }, 300);

    try {
      const resultBlob = await removeBackground(file, {
        output: { format: 'image/png', quality: 1 },
      });

      clearInterval(stepTimer);
      clearInterval(progressTimer);
      setProgress(100);
      setStepIdx(STEPS.length - 1);

      resultBlobRef.current = resultBlob;
      const url = blobToObjectURL(resultBlob);
      setResultURL(url);
      setState('done');
    } catch (err) {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
      setState('error');
    }
  }, [resultURL]);

  const reset = useCallback(() => {
    if (originalURL) URL.revokeObjectURL(originalURL);
    if (resultURL) URL.revokeObjectURL(resultURL);
    setOriginalURL(null);
    setResultURL(null);
    resultBlobRef.current = null;
    setProgress(0);
    setStepIdx(0);
    setErrorMsg('');
    setState('idle');
  }, [originalURL, resultURL]);

  return {
    state,
    originalURL,
    resultURL,
    resultBlob: resultBlobRef,
    progress,
    stepIdx,
    steps: STEPS,
    errorMsg,
    processFile,
    reset,
  };
}
