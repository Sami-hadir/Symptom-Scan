import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SeverityMeterProps {
  urgency: 'green' | 'yellow' | 'red';
}

export const SeverityMeter: React.FC<SeverityMeterProps> = ({ urgency }) => {
  const { t } = useLanguage();

  const severityConfig = {
    green: {
      width: '25%',
      color: 'bg-success',
      label: t('severityLow'),
    },
    yellow: {
      width: '60%',
      color: 'bg-warning',
      label: t('severityModerate'),
    },
    red: {
      width: '90%',
      color: 'bg-danger',
      label: t('severityHigh'),
    },
  };

  const config = severityConfig[urgency];

  return (
    <div className="mb-6">
       <h3 className="text-xl font-semibold mb-3 text-slate-700">{t('severityAssessment')}</h3>
      <div className="w-full bg-slate-200 rounded-full h-4 shadow-inner overflow-hidden">
        <div
          className={`${config.color} h-4 rounded-full transition-all duration-700 ease-out`}
          style={{ width: config.width }}
        ></div>
      </div>
      <p className="text-center font-medium text-slate-600 mt-2">{config.label}</p>
    </div>
  );
};