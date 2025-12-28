import React, { useRef } from 'react';
import { MarketType, TimeFrame, RiskProfile, PromptConfig, AnalysisMode, MarketSegment } from '../types';
import { Settings, Activity, TrendingUp, ShieldAlert, BarChart3, Coins, Globe2, Search, Radar, Upload, X, Image as ImageIcon } from 'lucide-react';

interface ConfigurationPanelProps {
  config: PromptConfig;
  setConfig: React.Dispatch<React.SetStateAction<PromptConfig>>;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ config, setConfig, onGenerate, isGenerating }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleIndicator = (indicator: string) => {
    setConfig(prev => {
      const exists = prev.indicators.includes(indicator);
      if (exists) {
        return { ...prev, indicators: prev.indicators.filter(i => i !== indicator) };
      } else {
        return { ...prev, indicators: [...prev.indicators, indicator] };
      }
    });
  };

  const toggleExchange = (exchange: string) => {
    setConfig(prev => {
      const exists = prev.exchanges.includes(exchange);
      if (exists) {
        return { ...prev, exchanges: prev.exchanges.filter(e => e !== exchange) };
      } else {
        return { ...prev, exchanges: [...prev.exchanges, exchange] };
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig(prev => ({ ...prev, chartImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setConfig(prev => ({ ...prev, chartImage: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const availableIndicators = ["RSI", "MACD", "Bollinger Bands", "Volume Profile", "Moving Averages", "Fibonacci", "Order Blocks (SMC)", "Open Interest"];
  const availableExchanges = ["Binance", "Bybit", "OKX", "Bitget", "Uniswap (DEX)", "dYdX (DEX)"];

  const isFormValid = config.mode === AnalysisMode.DISCOVERY || (config.mode === AnalysisMode.SPECIFIC && config.coin.trim().length > 0);

  const getSegmentLabel = (seg: MarketSegment) => {
    switch(seg) {
      case MarketSegment.ALL: return "Весь рынок";
      case MarketSegment.TOP_25: return "Топ 25 (Market Cap)";
      case MarketSegment.DEFI: return "DeFi Сектор";
      case MarketSegment.AI: return "AI & Big Data";
      case MarketSegment.MEME: return "Meme Coins";
      case MarketSegment.L1_L2: return "L1 / L2 Blockchains";
      default: return seg;
    }
  };

  return (
    <div className="bg-slate-900 h-full p-4 md:p-6 overflow-y-auto flex flex-col gap-6 w-full md:w-[400px] shrink-0 custom-scrollbar">
      <div className="flex items-center gap-3 text-emerald-400 mb-2">
        <Coins size={28} />
        <h1 className="text-xl font-bold text-white tracking-tight">Crypto Architect</h1>
      </div>

      {/* Mode Switcher */}
      <div className="bg-slate-800 p-1 rounded-xl flex">
        <button
          onClick={() => setConfig({ ...config, mode: AnalysisMode.SPECIFIC })}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all ${
            config.mode === AnalysisMode.SPECIFIC
              ? 'bg-slate-700 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Search size={14} />
          Конкретная монета
        </button>
        <button
          onClick={() => setConfig({ ...config, mode: AnalysisMode.DISCOVERY })}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all ${
            config.mode === AnalysisMode.DISCOVERY
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Radar size={14} />
          Поиск возможностей
        </button>
      </div>

      {/* Conditional Input */}
      {config.mode === AnalysisMode.SPECIFIC ? (
        <div className="space-y-2 animate-fade-in">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Криптовалюта (Тикер)</label>
          <input 
            type="text" 
            value={config.coin}
            onChange={(e) => setConfig({ ...config, coin: e.target.value.toUpperCase() })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono placeholder:text-slate-600"
            placeholder="BTC, ETH, SOL..."
          />
        </div>
      ) : (
        <div className="space-y-2 animate-fade-in">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Сектор для сканирования</label>
          <select 
            value={config.segment}
            onChange={(e) => setConfig({ ...config, segment: e.target.value as MarketSegment })}
            className="w-full bg-slate-800 border border-emerald-500/50 rounded-lg px-3 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
          >
            {Object.values(MarketSegment).map(seg => (
              <option key={seg} value={seg}>{getSegmentLabel(seg)}</option>
            ))}
          </select>
        </div>
      )}

      {/* Chart Image Upload */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon size={14} /> Скриншот Графика (Опционально)
        </label>
        
        {!config.chartImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50 rounded-lg p-4 cursor-pointer transition-all flex flex-col items-center justify-center text-slate-500 gap-2 h-24"
          >
            <Upload size={20} />
            <span className="text-xs">Нажмите для загрузки (TradingView)</span>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="hidden" 
            />
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden border border-slate-700 group">
            <img src={config.chartImage} alt="Chart Preview" className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <button 
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500/80 rounded-full text-white transition-colors"
            >
              <X size={14} />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] text-white backdrop-blur-sm">
              Изображение прикреплено
            </div>
          </div>
        )}
      </div>

      {/* Market Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Activity size={14} /> Тип Рынка
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(MarketType).map((type) => (
            <button
              key={type}
              onClick={() => setConfig({ ...config, marketType: type })}
              className={`px-1 py-2 rounded text-[11px] md:text-xs font-medium transition-all ${
                config.marketType === type 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Timeframe */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp size={14} /> Таймфрейм
        </label>
        <div className="relative">
          <select 
            value={config.timeFrame}
            onChange={(e) => setConfig({ ...config, timeFrame: e.target.value as TimeFrame })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none"
          >
            {Object.values(TimeFrame).map(tf => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>
      </div>

       {/* Exchanges */}
       <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Globe2 size={14} /> Биржи для сравнения
        </label>
        <div className="flex flex-wrap gap-2">
          {availableExchanges.map((ex) => (
            <button
              key={ex}
              onClick={() => toggleExchange(ex)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                config.exchanges.includes(ex)
                  ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
              }`}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <BarChart3 size={14} /> Индикаторы
        </label>
        <div className="flex flex-wrap gap-2">
          {availableIndicators.map((ind) => (
            <button
              key={ind}
              onClick={() => toggleIndicator(ind)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                config.indicators.includes(ind)
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Profile */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert size={14} /> Риск-профиль
        </label>
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
          {Object.values(RiskProfile).map((rp) => (
            <button
              key={rp}
              onClick={() => setConfig({ ...config, riskProfile: rp })}
              className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
                config.riskProfile === rp 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {rp === RiskProfile.CONSERVATIVE ? 'Low' : rp === RiskProfile.MODERATE ? 'Mid' : 'High'}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 mt-auto">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !isFormValid}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all ${
            isGenerating || !isFormValid
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-900/20 hover:shadow-emerald-900/40 transform hover:-translate-y-0.5 active:translate-y-0'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
              Генерация...
            </>
          ) : (
            <>
              <Settings size={20} />
              {config.mode === AnalysisMode.DISCOVERY ? 'Искать возможности' : 'Создать Промт'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};