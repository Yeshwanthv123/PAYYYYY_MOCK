import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface PalmLandmark {
  x: number;
  y: number;
  z: number;
}

interface PalmDataStatus {
  hasRegistered: boolean;
  loading: boolean;
  error: string | null;
}

export function usePalmData() {
  const { user } = useAuth();
  const [status, setStatus] = useState<PalmDataStatus>({
    hasRegistered: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user) {
      setStatus({ hasRegistered: false, loading: false, error: null });
      return;
    }

    checkPalmRegistration();
  }, [user]);

  const checkPalmRegistration = async () => {
    if (!user) return;
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_API_URL}/palm/status?user_id=${encodeURIComponent(user.id)}`
      );
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Failed to check palm status');

      setStatus({ hasRegistered: !!json.hasRegistered, loading: false, error: null });
    } catch (error) {
      setStatus({ hasRegistered: false, loading: false, error: (error as Error).message });
    }
  };

  const registerPalm = async (landmarks: PalmLandmark[]) => {
    if (!user) throw new Error('User not authenticated');

    const resp = await fetch(`${import.meta.env.VITE_API_URL}/palm/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, landmarks }),
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json?.error || 'Failed to register palm');

    await checkPalmRegistration();
  };

  const verifyPalm = async (landmarks: PalmLandmark[]): Promise<boolean> => {
    if (!user) throw new Error('User not authenticated');

    const resp = await fetch(`${import.meta.env.VITE_API_URL}/palm/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, landmarks }),
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json?.error || 'Verification failed');

    return !!json.isVerified;
  };

  return {
    ...status,
    registerPalm,
    verifyPalm,
    refresh: checkPalmRegistration,
  };
}

function calculateCosineSimilarity(a: PalmLandmark[], b: PalmLandmark[]): number {
  if (a.length !== b.length) return 0;

  const flatA = a.flatMap(p => [p.x, p.y, p.z]);
  const flatB = b.flatMap(p => [p.x, p.y, p.z]);

  const dotProduct = flatA.reduce((sum, val, i) => sum + val * flatB[i], 0);
  const magnitudeA = Math.sqrt(flatA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(flatB.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}
