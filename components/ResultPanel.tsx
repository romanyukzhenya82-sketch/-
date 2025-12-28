import React, { useState } from 'react';
import { Copy, Terminal, Play, Zap, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GeneratedResult } from '../types';

interface ResultPanelProps {
  result: GeneratedResult | null;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ result, onRunAnalysis, isAnalyzing }) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'analysis'>('prompt');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (result?.prompt) {
      navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!result) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-slate-950 p-6">
        <div className="text-center max-w-md opacity-50">
          <Terminal size={64} className="mx-auto mb-6 text-slate-600" />
          <h2 className="text-2xl font-bold text-slate-300 mb-2">Ожидание конфигурации</h2>
          <p className="text-slate-500">Настройте параметры слева и нажмите "Создать Промт", чтобы получить профессиональную инструкцию для торговли.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-slate-950 overflow-hidden relative">
      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50">
        <button
          onClick={() => setActiveTab('prompt')}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'prompt' 
              ? 'border-emerald-500 text-emerald-400 bg-slate-900' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Terminal size={16} />
          Сгенерированный Промт
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-6 py-4 text-sm font-medium flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'analysis' 
              ? 'border-blue-500 text-blue-400 bg-slate-900' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Zap size={16} />
          AI Анализ Рынка (Gemini)
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {activeTab === 'prompt' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-200">Ваш профессиональный промт</h3>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
              >
                <Copy size={14} />
                {copied ? 'Скопировано!' : 'Копировать'}
              </button>
            </div>
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 shadow-inner font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
              {result.prompt}
            </div>
            
            <div className="mt-8 flex justify-center">
               <button 
                 onClick={() => {
                   setActiveTab('analysis');
                   if (!result.analysis && !isAnalyzing) {
                     onRunAnalysis();
                   }
                 }}
                 className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors border border-blue-900/50 bg-blue-950/30 px-6 py-3 rounded-full"
               >
                 <Play size={16} className="fill-current" />
                 Запустить этот промт прямо сейчас с помощью Gemini
               </button>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {!result.analysis && !isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <Zap size={48} className="text-blue-500 mb-4 opacity-80" />
                <h3 className="text-xl font-bold text-white mb-2">Запуск живого анализа</h3>
                <p className="text-slate-400 max-w-md mb-8">
                  Gemini выполнит поиск актуальной рыночной информации и применит вашу стратегию в реальном времени.
                </p>
                <button
                  onClick={onRunAnalysis}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-900/30 transition-all transform hover:scale-105"
                >
                  Запустить Анализ
                </button>
              </div>
            ) : isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold text-blue-400 animate-pulse">Анализ рынка...</h3>
                <p className="text-slate-500 mt-2">Gemini сканирует новости, графики и метрики</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                 <div className="prose prose-invert prose-emerald max-w-none">
                   <ReactMarkdown>{result.analysis || ''}</ReactMarkdown>
                 </div>
                 
                 {/* Sources */}
                 {result.groundingSources && result.groundingSources.length > 0 && (
                   <div className="mt-8 pt-6 border-t border-slate-800">
                     <h4 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                       <ExternalLink size={14} /> Источники данных
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {result.groundingSources.map((source, idx) => (
                         <a 
                           key={idx}
                           href={source.uri}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="block p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-xs text-slate-400 hover:text-blue-400 truncate"
                         >
                           {source.title || source.uri}
                         </a>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
