import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import CameraFeed from './components/CameraFeed';
import TranslationBoard from './components/TranslationBoard';
import Sidebar from './components/Sidebar';
import AITrainingStudio from './components/AITrainingStudio';
import SettingsModal from './components/SettingsModal';
import { processLandmarks, predictSign, getClassExampleCounts } from './utils/tfjsModel';
import { getFingerStates, recognizeSign } from './utils/signLogic';
import { buildSentence } from './utils/llm';
import { UI_TRANSLATIONS } from './utils/translations';
import SignDictionary from './components/SignDictionary';
import { Settings, Sparkles, Moon, Sun, Languages, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('translator'); 
  const [detectedSign, setDetectedSign] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [history, setHistory] = useState([]);
  const [fps, setFps] = useState(0);
  const [handsMode, setHandsMode] = useState("0 hands");
  const [sessionTime, setSessionTime] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  
  // New State for Refactor
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  const [showSettings, setShowSettings] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [sentenceBuffer, setSentenceBuffer] = useState([]);
  const [generatedSentence, setGeneratedSentence] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [currentFeatures, setCurrentFeatures] = useState(null);
  const lastSpeechTimeRef = useRef(0);
  const sentenceTimerRef = useRef(null);
  const smoothingBufferRef = useRef([]); // TEMPORAL SMOOTHING BUFFER

  // Apply Theme & RTL
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
    
    localStorage.setItem('theme', theme);
  }, [theme, language]);

  // Save Language
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'ar' : 'en');

  const handleLandmarks = async (leftHand, rightHand) => {
    try {
      const features = processLandmarks(leftHand, rightHand);
      setCurrentFeatures(features);

      if (activeTab === 'translator') {
        const isHandDetected = features.some(val => val !== 0);
        if (isHandDetected) {
          let aiResult = null;
          try {
            const result = await predictSign(features);
            if (result && result.confidences && result.label) {
              const conf = result.confidences[result.label];
              if (conf > 0.6) {
                aiResult = { label: result.label, confidence: conf };
              }
            }
          } catch (e) {
            // Model empty or error
          }
          
          let potentialSign = null;
          if (aiResult) {
            potentialSign = { word: aiResult.label, confidence: aiResult.confidence, type: 'ai_sign' };
          } else {
            // Fallback to rules
            const leftState = leftHand ? getFingerStates(leftHand) : null;
            const rightState = rightHand ? getFingerStates(rightHand) : null;
            const { detectedWordEn, detectedWordAr, signType } = recognizeSign(leftState, rightState);
            
            const displayWord = language === 'ar' && detectedWordAr ? detectedWordAr : detectedWordEn;

            if (displayWord) {
              potentialSign = { word: displayWord, confidence: 1.0, type: signType };
            }
          }

          // TEMPORAL SMOOTHING: Require 5 consecutive identical frames
          if (potentialSign) {
            smoothingBufferRef.current.push(potentialSign.word);
            if (smoothingBufferRef.current.length > 5) {
              smoothingBufferRef.current.shift(); // Keep last 5
            }
            
            // Check if all 5 frames are identical
            const allMatch = smoothingBufferRef.current.length === 5 && 
                             smoothingBufferRef.current.every(w => w === potentialSign.word);

            if (allMatch) {
              handleSignDetected(potentialSign.word, potentialSign.confidence, potentialSign.type);
            } else {
              // Wait for stabilization, do not update UI immediately to prevent flickering
            }
          } else {
            smoothingBufferRef.current = []; // Clear buffer if no hand or no sign
            setDetectedSign(null);
            setConfidence(0);
          }

        } else {
          smoothingBufferRef.current = [];
          setDetectedSign(null);
          setConfidence(0);
        }
      }
    } catch(err) {
      console.error("Error processing landmarks", err);
    }
  };

  const handleSignDetected = (word, conf, type) => {
    setDetectedSign(word);
    setConfidence(Math.round(conf * 100));
    
    const now = Date.now();
    if (word !== detectedSign || (now - lastSpeechTimeRef.current > 3000)) {
      const newEntry = {
        id: Date.now(),
        word,
        type: type || 'ai_sign',
        time: new Date().toLocaleTimeString('en-US', { hour12: false })
      };
      
      let wordAdded = false;
      setHistory(prev => {
        if (prev.length > 0 && prev[prev.length - 1].word === word && (now - prev[prev.length - 1].id < 3000)) {
          return prev;
        }
        wordAdded = true;
        return [...prev, newEntry];
      });

      if (wordAdded) {
        setSentenceBuffer(prev => {
          const newBuf = [...prev, word];
          clearTimeout(sentenceTimerRef.current);
          sentenceTimerRef.current = setTimeout(() => generateContextSentence(newBuf), 2000);
          return newBuf;
        });

        if (ttsEnabled) {
          speakWord(word);
          lastSpeechTimeRef.current = now;
        }
      }
    }
  };

  const generateContextSentence = async (words) => {
    if (words.length < 2) {
      setSentenceBuffer([]);
      return; 
    }
    
    setIsGenerating(true);
    const sentence = await buildSentence(words, language);
    setIsGenerating(false);
    setSentenceBuffer([]); 

    if (sentence) {
      setGeneratedSentence(sentence);
      if (ttsEnabled) {
        speakWord(sentence);
      }
    }
  };

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      // Set language for TTS
      if (language === 'ar') {
        utterance.lang = 'ar-SA';
      } else {
        utterance.lang = 'en-US';
      }
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setGeneratedSentence('');
  };

  const hasModelTrained = Object.keys(getClassExampleCounts() || {}).length > 0;

  const t = UI_TRANSLATIONS[language];

  return (
    <div className="app-container">
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onSave={() => {}} t={t} />}
      {showDictionary && <SignDictionary onClose={() => setShowDictionary(false)} language={language} />}

      <header className="header glass-panel">
        <div className="logo-area">
          <h1>{t.title}</h1>
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'translator' ? 'active' : ''}`}
              onClick={() => setActiveTab('translator')}
            >
              {t.tabLive}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
              onClick={() => setActiveTab('studio')}
            >
              {t.tabStudio}
            </button>
          </div>
        </div>
        <div className="top-controls">
          
          {/* Language Toggle */}
          <button className="settings-btn" onClick={toggleLanguage} title="Toggle Language">
            <Languages size={16} /> {language === 'ar' ? 'EN' : 'AR'}
          </button>

          {/* Theme Toggle */}
          <button className="settings-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button className="settings-btn" onClick={() => setShowSettings(true)}>
            <Settings size={16} /> {t.apiSettings}
          </button>

          <button className="settings-btn" onClick={() => setShowDictionary(true)} title="Sign Dictionary">
            <BookOpen size={16} />
          </button>
          
          <div className="status-indicator">
            <div className="status-dot"></div>
            {activeTab === 'studio' ? t.statusTraining : t.statusLive}
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="camera-section">
          <div className="camera-container glass-panel">
            <CameraFeed 
              onLandmarks={handleLandmarks} 
              onFpsUpdate={setFps}
              onHandsUpdate={setHandsMode}
            />
          </div>
          
          {activeTab === 'translator' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(detectedSign || hasModelTrained) ? (
                <TranslationBoard word={detectedSign} confidence={confidence} t={t} />
              ) : (
                <TranslationBoard word={null} confidence={0} t={t} />
              )}
              
              <AnimatePresence>
                {(generatedSentence || isGenerating) && (
                  <motion.div 
                    className="sentence-container"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="sentence-label"><Sparkles size={12} style={{marginRight: '4px'}}/> {t.aiContext}</div>
                    <div className="sentence-text">
                      {isGenerating ? t.buildingSentence : generatedSentence}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : null}
        </section>

        <div className="sidebar-container">
          {activeTab === 'translator' ? (
            <Sidebar 
              history={history}
              stats={{
                total: history.length,
                time: formatTime(sessionTime),
                hands: handsMode,
                fps: fps
              }}
              controls={{
                ttsEnabled,
                toggleTts: () => setTtsEnabled(!ttsEnabled),
                clearHistory
              }}
              t={t}
            />
          ) : (
            <AITrainingStudio currentFeatures={currentFeatures} t={t} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
