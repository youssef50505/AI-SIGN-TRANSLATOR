import { motion, AnimatePresence } from 'framer-motion';

const TranslationBoard = ({ word, confidence, t }) => {
  let confColor = 'var(--success)';
  let confLabel = '●';
  if (confidence < 70) { confColor = 'var(--warning)'; confLabel = '◐'; }
  if (confidence < 50) { confColor = 'var(--danger)'; confLabel = '○'; }

  return (
    <div className="translation-board glass-panel">
      <h3>{t.detectedSign}</h3>
      <AnimatePresence mode="wait">
        {word ? (
          <motion.div 
            key={word}
            className="result-container" 
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="result">{word}</div>
            
            <div style={{ width: '100%', maxWidth: '180px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-sub)', fontWeight: 600 }}>
                <span>{t.confidence}</span>
                <span style={{ color: confColor }}>{confLabel} {confidence}%</span>
              </div>
              <div className="progress-bar-container" style={{ height: '3px', marginTop: '4px' }}>
                <motion.div 
                  className="progress-bar-fill" 
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{ background: confColor }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            className="result" 
            style={{ color: 'var(--text-sub)', fontSize: '20px', fontWeight: 400, letterSpacing: '2px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
          >
            {t.awaiting}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TranslationBoard;
