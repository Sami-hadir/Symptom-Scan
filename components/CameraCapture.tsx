import React, { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface CameraCaptureProps {
  onPhotoTaken: (photoSrc: string) => void;
  onBack: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onPhotoTaken, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          video: { facingMode: { ideal: 'environment' } }
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Failed to get environment camera, trying default camera.', err);
        try {
            const fallbackConstraints: MediaStreamConstraints = { video: true };
            stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
             if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (finalErr) {
            console.error("Error accessing camera:", finalErr);
            setError(t('errorCamera'));
        }
      }
    };

    startCamera();

    return () => {
      // Cleanup: stop all tracks on component unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [t]);

  const handleCapture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onPhotoTaken(dataUrl);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative my-4 w-full" role="alert">
          <strong className="font-bold">{t('errorTitle')}: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
         <div className="w-full relative">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg shadow-md bg-slate-900" />
         </div>
      )}
      <div className="mt-6 flex w-full justify-center items-center gap-4">
        <button onClick={onBack} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-6 rounded-full transition">
          {t('backButton')}
        </button>
        <button 
            onClick={handleCapture} 
            disabled={!!error}
            className="bg-primary hover:bg-primary-dark text-white font-bold p-4 rounded-full transition disabled:bg-slate-300 disabled:cursor-not-allowed"
            aria-label={t('captureButton')}
        >
            <ion-icon name="camera" class="text-3xl"></ion-icon>
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;