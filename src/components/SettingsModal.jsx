import { useState } from 'react';
import { initGemini } from '../utils/llm';
import { X, Key } from 'lucide-react';

const SettingsModal = ({ onClose, onSave, t }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('geminiApiKey') || '');
  const [status, setStatus] = useState('');

  const handleSave = () => {
    if (!apiKey.trim()) {
      setStatus('⚠️ Please enter an API key');
      return;
    }

    localStorage.setItem('geminiApiKey', apiKey.trim());
    const success = initGemini(apiKey.trim());
    if (success) {
      setStatus(t.connectedSuccess);
      onSave(true);
      setTimeout(onClose, 1200);
    } else {
      setStatus(t.invalidKey);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content glass-panel">
        <button className="close-btn" onClick={onClose}><X size={18} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Key size={20} style={{ color: 'var(--accent-purple)' }} />
          <h3>{t.settingsTitle}</h3>
        </div>
        <p className="modal-desc">{t.settingsDesc}</p>
        
        <input 
          type="password" 
          className="glass-input" 
          placeholder="AIzaSy..." 
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          style={{ width: '100%' }}
        />
        
        <div className="modal-actions">
          <button className="glass-button" onClick={handleSave} style={{ 
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
            color: 'white',
            border: 'none',
            padding: '12px 28px'
          }}>
            {t.saveApiKey}
          </button>
        </div>
        {status && <div className="modal-status">{status}</div>}
      </div>
    </div>
  );
};

export default SettingsModal;
