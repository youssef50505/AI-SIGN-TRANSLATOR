import { Activity, History, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ history, stats, controls, t }) => {
  const { total, time, hands, fps } = stats;

  return (
    <div className="sidebar">
      {/* System Status Panel */}
      <div className="info-card glass-panel">
        <h3><Activity size={13} style={{ marginInlineEnd: '8px' }} /> {t.sidebarTitle}</h3>
        <div className="stat-row">
          <span>{t.totalSigns}</span>
          <strong>{total}</strong>
        </div>
        <div className="stat-row">
          <span>{t.sessionTime}</span>
          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{time}</strong>
        </div>
        <div className="stat-row">
          <span>{t.handsMode}</span>
          <strong>{hands}</strong>
        </div>
        <div className="stat-row">
          <span>{t.fps}</span>
          <strong style={{ color: fps > 20 ? 'var(--success)' : fps > 10 ? 'var(--warning)' : 'var(--danger)' }}>
            {fps}
          </strong>
        </div>
      </div>

      {/* History Panel */}
      <div className="history-card glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <h3><History size={13} style={{ marginInlineEnd: '8px' }} /> {t.historyTitle}</h3>
        <div className="history-list">
          <AnimatePresence initial={false}>
            {history.length === 0 ? (
              <div style={{ color: 'var(--text-sub)', textAlign: 'center', marginTop: '24px', fontSize: '13px', opacity: 0.6 }}>
                {t.noHistory}
              </div>
            ) : (
              history.map((item) => (
                <motion.div 
                  key={item.id} 
                  className={`history-item ${item.type}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span style={{ fontSize: '16px' }}>{item.type === 'two_hands' ? '🤲' : '🖐'}</span>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{item.word}</span>
                  <span className="time">{item.time}</span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="controls-card glass-panel">
        <div className="controls-grid">
          <button className="glass-button" onClick={controls.clearHistory}>
            <Trash2 size={15} /> {t.clearBtn}
          </button>
          <button 
            className="glass-button"
            style={{ 
              background: controls.ttsEnabled ? 'rgba(6, 214, 160, 0.1)' : '', 
              borderColor: controls.ttsEnabled ? 'rgba(6, 214, 160, 0.2)' : '',
              color: controls.ttsEnabled ? 'var(--success)' : ''
            }}
            onClick={controls.toggleTts}
          >
            {controls.ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {controls.ttsEnabled ? t.ttsOn : t.ttsOff}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
