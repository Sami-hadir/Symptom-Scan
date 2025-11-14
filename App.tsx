
import React, { useState, useCallback } from 'react';
import { ScanResult, Screen } from './types';
import HomeScreen from './components/HomeScreen';
import ScanScreen from './components/ScanScreen';
import ResultsScreen from './components/ResultsScreen';
import HistoryScreen from './components/HistoryScreen';
import Header from './components/Header';
import Footer from './components/Footer';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Home);
  const [activeScan, setActiveScan] = useState<{ image: string; result: ScanResult } | null>(null);
  const [history, setHistory] = useLocalStorage<({ image: string; result: ScanResult, timestamp: string })[]>('symptom-scan-history', []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleScanComplete = useCallback((image: string, result: ScanResult) => {
    const newScan = { image, result, timestamp: new Date().toISOString() };
    setActiveScan(newScan);
    setHistory(prevHistory => [newScan, ...prevHistory]);
    setCurrentScreen(Screen.Results);
    setIsLoading(false);
  }, [setHistory]);

  const handleViewHistoryItem = useCallback((scan: { image: string; result: ScanResult }) => {
    setActiveScan(scan);
    setCurrentScreen(Screen.Results);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  const navigate = (screen: Screen) => {
    setError(null);
    if (screen !== Screen.Results) {
      setActiveScan(null);
    }
    setCurrentScreen(screen);
  };
  
  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Scan:
        return <ScanScreen 
                  onScanComplete={handleScanComplete} 
                  setIsLoading={setIsLoading}
                  setError={setError}
                  isLoading={isLoading}
                  error={error}
                />;
      case Screen.Results:
        // Simplified back navigation logic. Back always goes home. User can access history via header.
        return activeScan ? <ResultsScreen scan={activeScan} onBack={() => navigate(Screen.Home)} /> : <HomeScreen onNavigate={navigate} />;
      case Screen.History:
        return <HistoryScreen history={history} onViewItem={handleViewHistoryItem} onClearHistory={clearHistory} onNavigateHome={() => navigate(Screen.Home)} />;
      case Screen.Home:
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Header onNavigate={navigate} currentScreen={currentScreen} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderScreen()}
      </main>
      <Footer />
    </div>
  );
};

export default App;
