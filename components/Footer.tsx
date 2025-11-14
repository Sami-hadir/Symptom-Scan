
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-white mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-slate-500">
        <p className="text-sm font-semibold text-red-600 mb-2">
          <ion-icon name="warning" class="align-middle ml-1 rtl:ml-0 rtl:mr-1"></ion-icon>
          {t('footerDisclaimerTitle')}
        </p>
        <p className="text-xs">
          {t('footerDisclaimerText')}
        </p>
        <p className="text-xs mt-2">&copy; {new Date().getFullYear()} {t('footerCopyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;
