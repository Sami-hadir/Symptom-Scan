import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { HouseIcon } from './icons/HouseIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { MedicalCrossIcon } from './icons/MedicalCrossIcon';

interface ActionCardProps {
  urgency: 'green' | 'yellow' | 'red';
}

export const ActionCard: React.FC<ActionCardProps> = ({ urgency }) => {
  const { t } = useLanguage();

  const urgencyConfig = {
    green: {
      icon: <HouseIcon className="w-8 h-8 text-success-dark" />,
      title: t('actionCardTitleGreen'),
      description: t('actionCardDescGreen'),
      style: 'bg-success/10 border-success text-success-dark',
    },
    yellow: {
      icon: <CalendarIcon className="w-8 h-8 text-warning-dark" />,
      title: t('actionCardTitleYellow'),
      description: t('actionCardDescYellow'),
      style: 'bg-warning/10 border-warning text-warning-dark',
    },
    red: {
      icon: <MedicalCrossIcon className="w-8 h-8 text-danger-dark" />,
      title: t('actionCardTitleRed'),
      description: t('actionCardDescRed'),
      style: 'bg-danger/10 border-danger text-danger-dark',
    },
  };

  const config = urgencyConfig[urgency];

  return (
    <div>
        <h3 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2">{t('recommendedAction')}</h3>
        <div className={`p-4 rounded-lg flex items-center space-x-4 rtl:space-x-reverse border-r-4 rtl:border-r-0 rtl:border-l-4 ${config.style}`}>
        <div className="flex-shrink-0">
            {config.icon}
        </div>
        <div>
            <h4 className="font-bold text-lg">{config.title}</h4>
            <p className="text-sm">{config.description}</p>
        </div>
        </div>
    </div>
  );
};