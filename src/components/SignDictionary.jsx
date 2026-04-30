import { useState } from 'react';
import { X, BookOpen, Hand, Handshake } from 'lucide-react';
import { ONE_HAND_SIGNS, TWO_HAND_SIGNS } from '../utils/signLogic';
import { motion, AnimatePresence } from 'framer-motion';

const fingerNames = ['👍', '☝️', '🖕', '💍', '🤙'];

const renderFingers = (sig) => {
  return sig.map((s, i) => (
    <span key={i} style={{ 
      opacity: s ? 1 : 0.2, 
      fontSize: '14px',
      filter: s ? 'none' : 'grayscale(1)' 
    }}>
      {fingerNames[i]}
    </span>
  ));
};

const SignDictionary = ({ onClose, language }) => {
  const [tab, setTab] = useState('one');

  const signs = tab === 'one' ? ONE_HAND_SIGNS : TWO_HAND_SIGNS;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div 
        className="modal-content glass-panel" 
        style={{ maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <button className="close-btn" onClick={onClose}><X size={18} /></button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <BookOpen size={20} style={{ color: 'var(--accent-cyan)' }} />
          <h3 style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {language === 'ar' ? 'قاموس الإشارات' : 'Sign Dictionary'}
          </h3>
        </div>

        <div className="tabs" style={{ marginBottom: '16px', alignSelf: 'flex-start' }}>
          <button 
            className={`tab-btn ${tab === 'one' ? 'active' : ''}`}
            onClick={() => setTab('one')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px' }}
          >
            <Hand size={14} /> {language === 'ar' ? 'يد واحدة' : 'One Hand'}
          </button>
          <button 
            className={`tab-btn ${tab === 'two' ? 'active' : ''}`}
            onClick={() => setTab('two')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px' }}
          >
            <Handshake size={14} /> {language === 'ar' ? 'يدين' : 'Two Hands'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingInlineEnd: '4px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {Object.entries(signs).map(([word, data]) => (
                <div key={word} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  marginBottom: '4px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '10px',
                  borderInlineStart: '3px solid var(--accent-cyan)',
                  fontSize: '13px',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{word}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{data.ar}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {tab === 'one' 
                      ? renderFingers(data.sig) 
                      : <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>{renderFingers(data.sig[0])}</div>
                          <div style={{ display: 'flex', gap: '2px' }}>{renderFingers(data.sig[1])}</div>
                        </div>
                    }
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default SignDictionary;
