
import React from 'react';
import { ScanResult } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface HistoryScreenProps {
  history: ({ image: string; result: ScanResult; timestamp: string })[];
  onViewItem: (item: { image: string; result: ScanResult }) => void;
  onClearHistory: () => void;
  onNavigateHome: () => void; // Added for navigation
}

const urgencyStyles = {
  red: 'bg-danger',
  yellow: 'bg-warning',
  green: 'bg-success',
};

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onViewItem, onClearHistory, onNavigateHome }) => {
  const { t, language } = useLanguage();
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 pb-2 border-b">
        <h2 className="text-3xl font-bold text-slate-800">{t('historyTitle')}</h2>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm flex items-center"
          >
            <ion-icon name="trash-outline" class="mr-2 rtl:mr-0 rtl:ml-2"></ion-icon>
            {t('clearHistoryButton')}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-lg shadow-md">
          <ion-icon name="folder-open-outline" class="text-6xl text-slate-400 mx-auto"></ion-icon>
          <p className="mt-4 text-slate-600">{t('historyEmpty')}</p>
          <p className="text-sm text-slate-500">{t('historyEmptySubtext')}</p>
           <button 
              onClick={onNavigateHome}
              className="mt-6 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105"
            >
              {t('homeCTA')}
            </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer flex items-center space-x-4 rtl:space-x-reverse"
              onClick={() => onViewItem(item)}
            >
              <img src={item.image} alt={t('scanThumbnailAlt')} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
              <div className="flex-grow">
                <p className="font-semibold text-slate-800">
                  {item.result.predictions[0]?.condition || t('analysisResult')}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(item.timestamp).toLocaleString(language === 'he' ? 'he-IL' : language)}
                </p>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-sm font-medium text-slate-600 hidden sm:block">{t('urgency')}</span>
                <div className={`w-5 h-5 rounded-full ${urgencyStyles[item.result.overall_urgency]}`}></div>
              </div>
               <ion-icon name="chevron-forward-outline" class="text-slate-400 text-xl rtl:hidden"></ion-icon>
               <ion-icon name="chevron-back-outline" class="text-slate-400 text-xl hidden rtl:block"></ion-icon>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;
