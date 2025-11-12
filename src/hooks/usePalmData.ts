import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
      const { data, error } = await supabase
        .from('palm_data')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setStatus({
        hasRegistered: !!data,
        loading: false,
        error: null,
      });
    } catch (error) {
      setStatus({
        hasRegistered: false,
        loading: false,
        error: (error as Error).message,
      });
    }
  };

  const registerPalm = async (landmarks: PalmLandmark[]) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('palm_data')
      .upsert({
        user_id: user.id,
        landmarks_json: landmarks,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    await checkPalmRegistration();
  };

  const verifyPalm = async (landmarks: PalmLandmark[]): Promise<boolean> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('palm_data')
      .select('landmarks_json')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('No palm data registered');

    const storedLandmarks = data.landmarks_json as PalmLandmark[];
    const similarity = calculateCosineSimilarity(landmarks, storedLandmarks);

    return similarity >= 0.85;
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
