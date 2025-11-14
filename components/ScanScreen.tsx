
import React, { useRef, useReducer, useCallback, useEffect } from 'react';
import { ScanResult } from '../types';
import { analyzeImage } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { processImage } from '../lib/imageProcessor';
import CameraCapture from './CameraCapture';
import { VeinProgressBar } from './VeinProgressBar';
import { PulsingHeartIcon } from './PulsingHeartIcon';

// --- Types and State Management ---

interface ScanScreenProps {
  onScanComplete: (image: string, result: ScanResult) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
  error: string | null;
}

type State = {
  step: 'selection' | 'camera' | 'preview';
  imageSrc: string | null;
  progress: number;
  loadingMessage: string;
};

type Action =
  | { type: 'SET_STEP'; payload: State['step'] }
  | { type: 'SET_IMAGE'; payload: string }
  | { type: 'START_ANALYSIS' }
  | { type: 'UPDATE_PROGRESS'; payload: { progress: number; message: string } }
  | { type: 'RESET' };
  
const initialState: State = {
  step: 'selection',
  imageSrc: null,
  progress: 0,
  loadingMessage: '',
};

const SESSION_IMAGE_KEY = 'symptom-scan-active-image';

// The reducer function simplifies state management for the component's multi-step process.
function reducer(state: State, action: Action): State {
  switch (action.type) {
    // Moves the component to a specific step (e.g., from 'selection' to 'camera').
    case 'SET_STEP':
      return { ...state, step: action.payload };
    // Sets the captured or uploaded image and moves to the 'preview' step.
    case 'SET_IMAGE':
      try {
        sessionStorage.setItem(SESSION_IMAGE_KEY, action.payload);
      } catch (e) {
        console.error("Failed to save image to session storage", e);
      }
      return { ...state, imageSrc: action.payload, step: 'preview' };
    // Initializes the state for the analysis loading sequence.
    case 'START_ANALYSIS':
      return { ...state, progress: 5, loadingMessage: '' };
    // Updates the progress bar and the accompanying text message during analysis.
    case 'UPDATE_PROGRESS':
      return { ...state, progress: action.payload.progress, loadingMessage: action.payload.message };
    // Resets the component to its initial state.
    case 'RESET':
      try {
        sessionStorage.removeItem(SESSION_IMAGE_KEY);
      } catch (e) {
        console.error("Failed to remove image from session storage", e);
      }
      return initialState;
    default:
      return state;
  }
}

// --- Component ---

const ScanScreen: React.FC<ScanScreenProps> = ({ onScanComplete, setIsLoading, setError, isLoading, error }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    try {
      const savedImage = sessionStorage.getItem(SESSION_IMAGE_KEY);
      if (savedImage && state.step === 'selection' && !state.imageSrc) {
        dispatch({ type: 'SET_IMAGE', payload: savedImage });
      }
    } catch (e) {
      console.error("Failed to retrieve image from session storage", e);
    }
  }, []);
  
  const resetScan = useCallback(() => {
    dispatch({ type: 'RESET' });
    setError(null);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setError, setIsLoading]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        dispatch({ type: 'SET_IMAGE', payload: e.target?.result as string });
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!state.imageSrc) {
      setError(t('errorSelectImage'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    dispatch({ type: 'START_ANALYSIS' });
    
    let simulationInterval: ReturnType<typeof setInterval> | undefined;

    try {
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 5, message: t('loading0') } });
      const processedImageBase64 = await processImage(state.imageSrc);
      
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 40, message: t('loading1') } });

      const analysisPromise = analyzeImage(processedImageBase64.split(',')[1], 'image/jpeg', language);
      
      let currentProgress = 40;
      simulationInterval = setInterval(() => {
        const increment = Math.max(0.5, (99 - currentProgress) * 0.05);
        currentProgress += increment;
        
        let message = t('loading2');
        if (currentProgress > 85) message = t('loading4');
        else if (currentProgress > 65) message = t('loading3');

        if (currentProgress < 99) {
          dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: currentProgress, message } });
        } else {
           if(simulationInterval) clearInterval(simulationInterval);
        }
      }, 200);

      const result = await analysisPromise;

      if(simulationInterval) clearInterval(simulationInterval);
      dispatch({ type: 'UPDATE_PROGRESS', payload: { progress: 100, message: t('loading5') } });

      setTimeout(() => {
        onScanComplete(state.imageSrc!, result);
        try {
          sessionStorage.removeItem(SESSION_IMAGE_KEY);
        } catch (e) {
          console.error("Failed to remove image from session storage after scan", e);
        }
      }, 400);

    } catch (e: any) {
      setError(e.message || t('errorUnknown'));
      setIsLoading(false);
    } finally {
      if (simulationInterval) clearInterval(simulationInterval);
    }
  }, [state.imageSrc, onScanComplete, setIsLoading, setError, language, t]);

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg shadow-xl">
        <PulsingHeartIcon />
        <h2 className="text-2xl font-semibold text-slate-700 mt-6 mb-2">{t('analyzingTitle')}</h2>
        <div className="w-full max-w-sm mt-4">
          <VeinProgressBar progress={state.progress} />
          <div className="flex justify-between items-center mt-2 text-sm font-medium text-slate-500">
            <span>{state.loadingMessage}</span>
            <span className="font-bold text-primary">{`${Math.round(state.progress)}%`}</span>
          </div>
        </div>
      </div>
    );
  }

  if (state.step === 'camera') {
    return <CameraCapture 
              onPhotoTaken={(photo) => dispatch({ type: 'SET_IMAGE', payload: photo })} 
              onBack={() => dispatch({ type: 'SET_STEP', payload: 'selection' })} 
           />;
  }
  
  const SelectionButton: React.FC<{onClick: () => void, iconName: string, title: string, subtitle: string}> = 
    ({onClick, iconName, title, subtitle}) => (
        <button onClick={onClick} className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition h-full flex flex-col justify-center items-center">
            <ion-icon name={iconName} class="text-6xl text-slate-400 mx-auto"></ion-icon>
            <p className="mt-2 text-slate-600 font-semibold">{title}</p>
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </button>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center mb-6">{t('scanTitle')}</h2>
      
      {state.step === 'selection' && (
         <div className="text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectionButton 
                    onClick={() => fileInputRef.current?.click()} 
                    iconName="cloud-upload-outline"
                    title={t('uploadButton')}
                    subtitle={t('uploadFormats')}
                />
                <SelectionButton 
                    onClick={() => dispatch({ type: 'SET_STEP', payload: 'camera' })}
                    iconName="camera-outline"
                    title={t('cameraButton')}
                    subtitle={t('cameraSubtext')}
                />
            </div>
            <input
                type="file" ref={fileInputRef} onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp" className="hidden"
            />
         </div>
      )}

      {state.step === 'preview' && state.imageSrc && (
        <div className="mb-6">
          <p className="text-center font-medium mb-4">{t('imagePreview')}</p>
          <img src={state.imageSrc} alt={t('imagePreviewAlt')} className="rounded-lg max-h-80 w-auto mx-auto shadow-md" />
        </div>
      )}
      
      <div className="bg-blue-50 border-r-4 border-blue-400 rtl:border-r-0 rtl:border-l-4 text-blue-700 p-4 rounded-md my-6">
        <h4 className="font-bold mb-2">{t('bestResultsTitle')}</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>{t('bestResults1')}</li>
          <li>{t('bestResults2')}</li>
          <li>{t('bestResults3')}</li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative my-4" role="alert">
          <strong className="font-bold">{t('errorTitle')}: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {state.step === 'preview' && (
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={resetScan}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-4 rounded-lg transition"
            >
              {t('changeImageButton')}
            </button>
          <button
            onClick={handleAnalyzeClick}
            disabled={!state.imageSrc || isLoading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <ion-icon name="analytics-outline" class="text-xl ml-2 rtl:ml-0 rtl:mr-2"></ion-icon>
            {isLoading ? t('analyzingButton') : t('analyzeButton')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ScanScreen;
