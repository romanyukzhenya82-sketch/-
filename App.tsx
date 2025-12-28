import React, { useState, useEffect } from 'react';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { ResultPanel } from './components/ResultPanel';
import { PromptConfig, MarketType, TimeFrame, RiskProfile, GeneratedResult, AnalysisMode, MarketSegment } from './types';
import { generateProfessionalPrompt, performLiveAnalysis } from './services/geminiService';
import { Settings, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  const defaultConfig: PromptConfig = {
    mode: AnalysisMode.SPECIFIC,
    coin: '',
    segment: MarketSegment.ALL,
    marketType: MarketType.FUTURES,
    timeFrame: TimeFrame.INTRADAY,
    riskProfile: RiskProfile.MODERATE,
    indicators: ['RSI', 'MACD', 'Volume Profile'],
    exchanges: ['Binance', 'Bybit'],
    includeFundamental: false,
    includeSentiment: true,
    chartImage: null,
  };

  // Initialize state from localStorage if available
  const [config, setConfig] = useState<PromptConfig>(() => {
    try {
      const saved = localStorage.getItem('cryptoArchitectConfig');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure merged config has all required fields from default, and chartImage is null (don't restore large images)
        return { ...defaultConfig, ...parsed, chartImage: null };
      }
    } catch (e) {
      console.warn("Failed to load config from local storage", e);
    }
    return defaultConfig;
  });

  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Mobile navigation state
  const [mobileTab, setMobileTab] = useState<'config' | 'result'>('config');

  // Persist config to localStorage on change
  useEffect(() => {
    try {
      // Exclude chartImage from persistence to save space and avoid quota errors
      const { chartImage, ...configToSave } = config;
      localStorage.setItem('cryptoArchitectConfig', JSON.stringify(configToSave));
    } catch (e) {
      console.warn("Failed to save config to local storage", e);
    }
  }, [config]);

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    // Reset analysis when generating a new prompt
    setResult(prev => prev ? { ...prev, analysis: undefined, groundingSources: undefined } : null);
    
    try {
      const promptText = await generateProfessionalPrompt(config);
      setResult({ prompt: promptText });
      // Switch to result view on mobile after generation
      setMobileTab('result');
    } catch (e) {
      console.error(e);
      setResult({ prompt: "Произошла непредвиденная ошибка. Пожалуйста, проверьте консоль." });
      setMobileTab('result');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!result?.prompt) return;
    
    setIsAnalyzing(true);
    try {
      // Pass the chart image from config to the analysis service
      const { text, sources } = await performLiveAnalysis(result.prompt, config.chartImage);
      setResult(prev => prev ? { ...prev, analysis: text, groundingSources: sources } : null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-200 overflow-hidden">
      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex shrink-0 bg-slate-900 border-b border-slate-800 z-10">
         <button 
           className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${mobileTab === 'config' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 border-b-2 border-transparent'}`}
           onClick={() => setMobileTab('config')}
         >
           <Settings size={16} />
           Параметры
         </button>
         <button 
           className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${mobileTab === 'result' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 border-b-2 border-transparent'}`}
           onClick={() => setMobileTab('result')}
         >
           <LayoutDashboard size={16} />
           Результат
           {result && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
         </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative md:flex-row flex-col">
        {/* Sidebar / Config - Hidden on mobile if tab is 'result' */}
        <div className={`
          ${mobileTab === 'config' ? 'flex' : 'hidden'} 
          md:flex md:w-auto w-full h-full border-r border-slate-800
        `}>
          <ConfigurationPanel 
            config={config} 
            setConfig={setConfig} 
            onGenerate={handleGeneratePrompt}
            isGenerating={isGenerating}
          />
        </div>
        
        {/* Results - Hidden on mobile if tab is 'config' */}
        <main className={`
          ${mobileTab === 'result' ? 'flex' : 'hidden'} 
          md:flex flex-1 h-full relative w-full
        `}>
          <ResultPanel 
            result={result} 
            onRunAnalysis={handleRunAnalysis}
            isAnalyzing={isAnalyzing}
          />
        </main>
      </div>
    </div>
  );
};

export default App;