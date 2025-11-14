import React from 'react';
import { Screen } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { UploadIcon } from './icons/UploadIcon';
import { AnalysisIcon } from './icons/AnalysisIcon';
import { SecureIcon } from './icons/SecureIcon';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col items-center text-center h-full">
        <div className="bg-primary/20 text-primary rounded-full p-4 mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-slate-800">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
    </div>
);


const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center p-12 md:p-20 rounded-lg shadow-xl overflow-hidden relative bg-[linear-gradient(-45deg,#06b6d4,#0e7490,#1e3a8a,#3b82f6)] bg-[size:400%_400%] animate-gradient">
        <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
              {t('homeTitle')}
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8 drop-shadow-sm">
              {t('homeSubtitle')}
            </p>
            <button 
              onClick={() => onNavigate(Screen.Scan)}
              className="bg-white hover:bg-slate-100 text-primary font-bold py-4 px-8 rounded-full transition-transform transform hover:scale-105 text-lg shadow-lg"
            >
              {t('homeCTA')}
            </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="text-center">
        <h3 className="text-3xl font-bold text-slate-800 mb-12">{t('howItWorks')}</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
              icon={<UploadIcon className="w-8 h-8" />} 
              title={t('featureUploadTitle')}
              description={t('featureUploadDesc')} 
          />
          <FeatureCard 
              icon={<AnalysisIcon className="w-8 h-8" />} 
              title={t('featureAnalysisTitle')}
              description={t('featureAnalysisDesc')} 
          />
          <FeatureCard 
              icon={<SecureIcon className="w-8 h-8" />} 
              title={t('featurePrivacyTitle')}
              description={t('featurePrivacyDesc')}
          />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;