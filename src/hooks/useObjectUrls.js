import { useEffect, useRef } from 'react';

/**
 * Hook to manage object URLs and prevent memory leaks
 */
export function useObjectUrls() {
  const urlsRef = useRef(new Set());

  const createObjectUrl = (blob) => {
    const url = URL.createObjectURL(blob);
    urlsRef.current.add(url);
    return url;
  };

  const revokeObjectUrl = (url) => {
    if (urlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      urlsRef.current.delete(url);
    }
  };

  const cleanup = () => {
    urlsRef.current.forEach(url => URL.revokeObjectURL(url));
    urlsRef.current.clear();
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  return { createObjectUrl, revokeObjectUrl, cleanup };
}
