import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePalmData, PalmLandmark } from '../hooks/usePalmData';
import { WebcamCapture } from '../components/WebcamCapture';
import { LogOut, CheckCircle, XCircle, Loader, Hand } from 'lucide-react';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { hasRegistered, loading, registerPalm, verifyPalm } = usePalmData();
  const [isCapturing, setIsCapturing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);

  const handleCapture = async (landmarks: PalmLandmark[]) => {
    setIsCapturing(true);
    setMessage(null);

    try {
      if (!hasRegistered) {
        await registerPalm(landmarks);
        setMessage({ type: 'success', text: 'Palm registered successfully!' });
        setShowWebcam(false);
      } else {
        const isVerified = await verifyPalm(landmarks);
        if (isVerified) {
          setMessage({ type: 'success', text: 'Verification successful! Welcome back!' });
        } else {
          setMessage({ type: 'error', text: 'Verification failed. Please try again.' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setIsCapturing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="w-12 h-12 text-green-600 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Hand className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {hasRegistered ? 'Palm Verification' : 'Palm Registration'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {hasRegistered
                    ? 'Verify your identity using your palm'
                    : 'Register your palm for secure authentication'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasRegistered ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-green-600 font-medium">Registered</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-gray-400" />
                  <span className="text-gray-600 font-medium">Not Registered</span>
                </>
              )}
            </div>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {!showWebcam ? (
            <div className="text-center py-12">
              <p className="text-gray-700 mb-6 text-lg">
                {hasRegistered
                  ? 'Click below to verify your palm and access your account'
                  : 'Click below to enable your webcam and register your palm'}
              </p>
              <button
                onClick={() => setShowWebcam(true)}
                className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-lg text-lg"
              >
                {hasRegistered ? 'Start Verification' : 'Enable Webcam for Registration'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <WebcamCapture onCapture={handleCapture} isCapturing={isCapturing} />
              <div className="text-center">
                <button
                  onClick={() => setShowWebcam(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">First Login</h4>
                <p className="text-gray-600">Enable webcam and position your palm within the frame to register your biometric data</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Subsequent Logins</h4>
                <p className="text-gray-600">Verify your identity by showing your palm to the camera for quick and secure access</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Secure Storage</h4>
                <p className="text-gray-600">Your palm data is encrypted and securely stored with row-level security</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
