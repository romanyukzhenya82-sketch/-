import { GoogleGenAI } from "@google/genai";
import { AnalysisMode, MarketSegment, PromptConfig } from "../types";

// Helper to safely get the AI client with fresh environment variables
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

const getSystemInstruction = () => `
You are an elite cryptocurrency market analyst and prompt engineer. 
Your goal is to construct highly sophisticated, professional-grade prompts for LLMs (like ChatGPT, Claude, or Gemini) to analyze the crypto market.
The prompts you generate must be in RUSSIAN.
They should require the AI to act as a hedge fund trader, focusing on technical analysis (SMC, Price Action), fundamental metrics, arbitrage opportunities, and risk management.
`;

export const generateProfessionalPrompt = async (config: PromptConfig): Promise<string> => {
  const { mode, coin, segment, marketType, timeFrame, riskProfile, indicators, exchanges, includeFundamental, includeSentiment, chartImage } = config;

  if (mode === AnalysisMode.SPECIFIC && (!coin || !coin.trim())) {
     return "Пожалуйста, укажите тикер монеты.";
  }

  const exchangesList = exchanges.length > 0 ? exchanges.join(', ') : "Major CEX & DEX";
  const indicatorList = indicators.join(', ');

  let taskDescription = "";
  
  if (mode === AnalysisMode.DISCOVERY) {
    // Discovery Mode Prompt
    const segmentName = segment === MarketSegment.ALL ? "the entire crypto market" : segment;
    taskDescription = `
      TASK: Perform a Global Market Scan.
      Focus Area: ${segmentName}.
      GOAL: Identify the top 3-5 assets that currently show the best trading setup for a ${timeFrame} strategy with a ${riskProfile} risk profile.
      
      For each suggested asset, the AI must provide:
      1. Ticker & Name.
      2. Reason for selection (Technical & Fundamental).
      3. Specific Trade Setup (Entry, Targets, Stop Loss).
    `;
  } else {
    // Specific Coin Prompt
    taskDescription = `
      TASK: Deep Dive Analysis of ${coin}.
      GOAL: Provide a comprehensive trading plan for ${coin} based on a ${timeFrame} strategy.
      ${chartImage ? "(NOTE: A user provided chart image will be attached to the analysis request)" : ""}
    `;
  }

  const promptRequest = `
  Create a detailed, step-by-step prompt that a user can paste into an AI.
  
  Configuration:
  - Mode: ${mode === AnalysisMode.DISCOVERY ? "Market Discovery (Scanner)" : "Single Asset Analysis"}
  - Market Type: ${marketType}
  - Target Exchanges: ${exchangesList}
  - Indicators to use: ${indicatorList}
  - Fundamental Analysis: ${includeFundamental ? "Yes" : "No"}
  - Sentiment Analysis: ${includeSentiment ? "Yes" : "No"}

  ${taskDescription}

  The output must be a single, copy-pasteable text block in Russian. 
  
  Structure the prompt to explicitly ask for:
  1. ${mode === AnalysisMode.DISCOVERY ? "Top Picks based on Market Scan" : "Market Structure of the coin"}.
  2. COMPARATIVE ANALYSIS: Ask to check price/volume across ${exchangesList}. *Ask to present this in a Markdown Table.*
  3. PROFITABILITY: "Where is the best liquidity/lowest slippage for these trades?".
  4. Specific setups with numeric zones.
  5. Invalidations.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptRequest,
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 0.7,
      }
    });

    if (response.text) {
      return response.text;
    }
    
    return "Модель не вернула текстовый ответ.";
  } catch (error: any) {
    console.error("Error generating prompt:", error);
    return `Ошибка генерации: ${error.message}.`;
  }
};

export const performLiveAnalysis = async (generatedPrompt: string, chartImage?: string | null): Promise<{ text: string; sources: any[] }> => {
  try {
    const ai = getAiClient();
    
    const contents: any[] = [];
    
    // Add the image to the payload if it exists
    if (chartImage) {
      const base64Data = chartImage.split(',')[1];
      const mimeType = chartImage.split(';')[0].split(':')[1];
      
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    // Add the text instruction
    contents.push({
      text: `Perform the following analysis using real-time data from Google Search ${chartImage ? "AND the visual data from the attached chart image" : ""}.
      
      CRITICAL: You are acting as a live market scanner.
      
      ${chartImage ? "1. VISUAL ANALYSIS: First, analyze the attached image. Identify patterns, support/resistance levels, and indicators shown. Confirm if the visual data matches the current market sentiment found in search." : ""}
      
      2. SEARCH & DATA: 
      If the prompt asks to find the best coins, search for "top crypto gainers today", "best defi coins to buy now", "crypto arbitrage opportunities live", etc.
      If it asks for a specific coin, search for that coin's live data.

      3. COMPARISON: Check funding rates and volume across major exchanges. Format comparison as a Markdown Table.

      Original Request:
      ${generatedPrompt}`
    });

    // We must use 'parts' structure if we have multiple parts (image + text), but GoogleGenAI SDK helper handles 'contents' array smartly. 
    // However, to be 100% compliant with the new SDK guide for mixed content:
    const parts = [];
    if (chartImage) {
        const base64Data = chartImage.split(',')[1];
        const mimeType = chartImage.split(';')[0].split(':')[1];
        parts.push({ inlineData: { mimeType, data: base64Data } });
    }
    parts.push({ 
        text: `Perform analysis based on: ${generatedPrompt}. 
        ${chartImage ? "Please analyze the technical patterns in the provided image and integrate them with live search findings." : ""}
        Use markdown tables for exchange comparisons.` 
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts }, // Correct structure for multimodal
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.4, 
      }
    });

    const text = response.text || "Анализ не удался или не вернул текста.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web).filter(Boolean) || [];

    return { text, sources };
  } catch (error: any) {
    console.error("Error performing live analysis:", error);
    return { text: `Ошибка при выполнении живого анализа: ${error.message}`, sources: [] };
  }
};