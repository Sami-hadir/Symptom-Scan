import React from 'react';
import { ScanResult, Prediction } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { ActionCard } from './ActionCard';
import { SeverityMeter } from './SeverityMeter';

interface ResultsScreenProps {
  scan: { image: string; result: ScanResult };
  onBack: () => void;
}

const ResultsScreen: React.FC<{ scan: { image: string; result: ScanResult }; onBack: () => void }> = ({ scan, onBack }) => {
  const { t } = useLanguage();
  const { image, result } = scan;

  const urgencyStyles = {
    red: {
      bg: 'bg-danger/10',
      border: 'border-danger',
      text: 'text-danger-dark',
      badge: 'bg-danger text-white',
      name: t('urgencyHigh'),
    },
    yellow: {
      bg: 'bg-warning/10',
      border: 'border-warning',
      text: 'text-warning-dark',
      badge: 'bg-warning text-white',
      name: t('urgencyModerate'),
    },
    green: {
      bg: 'bg-success/10',
      border: 'border-success',
      text: 'text-success-dark',
      badge: 'bg-success text-white',
      name: t('urgencyLow'),
    },
  };

  const PredictionCard: React.FC<{ prediction: Prediction }> = ({ prediction }) => {
    const styles = urgencyStyles[prediction.urgency];
    const probabilityPercent = (prediction.probability * 100).toFixed(0);

    return (
      <div className={`border-r-4 rtl:border-r-0 rtl:border-l-4 p-4 rounded-md ${styles.bg} ${styles.border}`}>
        <div className="flex justify-between items-start">
          <div>
            <h4 className={`text-lg font-bold ${styles.text}`}>{prediction.condition}</h4>
            <p className="text-sm text-slate-600 mt-1">{prediction.description}</p>
          </div>
          <div className="text-right rtl:text-left mr-4 rtl:mr-0 rtl:ml-4 flex-shrink-0">
            <p className={`text-2xl font-bold ${styles.text}`}>{probabilityPercent}%</p>
            <p className="text-xs text-slate-500">{t('likelihood')}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="mb-6 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg transition flex items-center">
        <ion-icon name="arrow-back-outline" class="mr-2 rtl:mr-0 rtl:ml-2"></ion-icon>
        {t('backButton')}
      </button>

      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">{t('resultsTitle')}</h2>
          <img src={image} alt={t('scannedImageAlt')} className="rounded-lg shadow-md max-w-sm mx-auto w-full mb-8" />
          <SeverityMeter urgency={result.overall_urgency} />
           <div className="mt-8">
             <ActionCard urgency={result.overall_urgency} />
           </div>
        </div>
        
        <hr className="mx-8" />

        <div className="md:grid md:grid-cols-2 md:gap-8 p-6 md:p-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2">{t('possibleConditions')}</h3>
            <div className="space-y-4">
              {result.predictions.map((p, i) => (
                <PredictionCard key={i} prediction={p} />
              ))}
            </div>

            {result.product_recommendations && result.product_recommendations.length > 0 && (
              <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2">{t('productRecommendations')}</h3>
                  <div className="space-y-4">
                    {result.product_recommendations.map((prod, i) => (
                      <div key={i} className="bg-sky-50 border-r-4 rtl:border-r-0 rtl:border-l-4 border-sky-300 p-4 rounded-md">
                        <h4 className="font-bold text-sky-800">{prod.name}</h4>
                        <p className="text-sm text-sky-700 mt-1">{prod.purpose}</p>
                      </div>
                    ))}
                  </div>
              </div>
            )}
          </div>
          <div className="mt-8 md:mt-0">
            <h3 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2">{t('recommendations')}</h3>
            <div className="bg-slate-100 p-4 rounded-lg">
                <p className="text-slate-700 whitespace-pre-wrap">{result.recommendation}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8 bg-red-50 border-t border-red-200">
          <p className="text-center font-bold text-red-700">{result.disclaimer}</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;