// Detects a global keystroke sequence and fires a callback.
// Ignores input/textarea focus so users can still type normally.
import { useEffect, useRef, useCallback } from 'react';

export function useKeySequence(sequence, callback) {
  const bufferRef = useRef('');
  const stableCallback = useCallback(callback, [callback]);

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

      // Only track printable characters
      if (e.key.length !== 1) return;

      bufferRef.current += e.key;
      const len = sequence.length;
      if (bufferRef.current.length > len) {
        bufferRef.current = bufferRef.current.slice(-len);
      }
      if (bufferRef.current === sequence) {
        bufferRef.current = '';
        stableCallback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [sequence, stableCallback]);
}
