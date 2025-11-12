import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { PalmLandmark } from '../hooks/usePalmData';

interface WebcamCaptureProps {
  onCapture: (landmarks: PalmLandmark[]) => void;
  isCapturing: boolean;
}

export function WebcamCapture({ onCapture, isCapturing }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    startWebcam();

    return () => {
      stopWebcam();
    };
  }, []);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsReady(true);
        setError(null);
      }
    } catch (err) {
      setError('Webcam not accessible. Please allow camera access and retry.');
      setIsReady(false);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePalm = () => {
    const mockLandmarks: PalmLandmark[] = Array.from({ length: 21 }, (_, i) => ({
      x: 0.3 + Math.random() * 0.4 + i * 0.01,
      y: 0.3 + Math.random() * 0.4 + i * 0.01,
      z: Math.random() * 0.1,
    }));

    onCapture(mockLandmarks);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border-2 border-red-200">
        <CameraOff className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-red-700 text-center font-medium">{error}</p>
        <button
          onClick={startWebcam}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry Camera Access
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative rounded-lg overflow-hidden bg-gray-900 shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-2xl"
          onLoadedMetadata={() => setIsReady(true)}
        />

        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <rect
            x="25"
            y="25"
            width="50"
            height="50"
            fill="none"
            stroke="rgba(34, 197, 94, 0.8)"
            strokeWidth="0.5"
            strokeDasharray="4 4"
            className="animate-pulse"
          />

          <line x1="25" y1="25" x2="30" y2="25" stroke="rgb(34, 197, 94)" strokeWidth="0.8" />
          <line x1="25" y1="25" x2="25" y2="30" stroke="rgb(34, 197, 94)" strokeWidth="0.8" />

          <line x1="75" y1="25" x2="70" y2="25" stroke="rgb(34, 197, 94)" strokeWidth="0.8" />
          <line x1="75" y1="25" x2="75" y2="30" stroke="rgb(34, 197, 94)" strokeWidth="0.8" />

          <line x1="25" y1="75" x2="30" y2="75" stroke="rgb(34, 197, 94)" strokeWidth="0.8" />
          <line x1="25" y1="75" x2="25" y2="70" stroke="rgb(34, 197, 94)" strokeWidth="0.8" />

          <line x1="75" y1="75" x2="70" y2="75" stroke="rgb(34, 197, 94)" strokeWidth="0.8" />
          <line x1="75" y1="75" x2="75" y2="70" stroke="rgb(34, 197, 94)" strokeWidth="0.8" />
        </svg>

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-white text-lg">Starting camera...</div>
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
          Place your palm in the frame
        </div>
      </div>

      <button
        onClick={capturePalm}
        disabled={!isReady || isCapturing}
        className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-lg"
      >
        <Camera className="w-5 h-5" />
        <span>{isCapturing ? 'Processing...' : 'Capture Palm'}</span>
      </button>
    </div>
  );
}
