
import { useState, useEffect } from 'react';

export function useLottieAnimationData(path: string | undefined) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!path) {
      return;
    }

    setAnimationData(null);
    setError(null);

    let isCancelled = false;

    const fetchData = async () => {
      try {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`Failed to fetch Lottie animation: ${response.statusText}`);
        }
        const data = await response.json();
        if (!isCancelled) {
          setAnimationData(data);
        }
      } catch (e) {
        if (!isCancelled) {
          setError(e);
          console.error(`Error loading Lottie animation from ${path}`, e);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [path]);

  return { animationData, error };
}
