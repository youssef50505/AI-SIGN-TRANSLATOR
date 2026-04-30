import { useState, useEffect, useRef } from 'react';
import { addExample, getClassExampleCounts, clearModel, LOCAL_STORAGE_KEY } from '../utils/tfjsModel';
import { Play, Square, Trash2, Download, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const AITrainingStudio = ({ currentFeatures, t }) => {
  const [labelName, setLabelName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedClasses, setRecordedClasses] = useState({});
  const [recordingProgress, setRecordingProgress] = useState(0);
  const targetSamples = 30;
  const intervalRef = useRef(null);

  useEffect(() => {
    updateClassCounts();
  }, []);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingProgress(prev => prev);
      }, 500);
    } else {
      setRecordingProgress(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRecording]);

  useEffect(() => {
    if (isRecording && currentFeatures && labelName.trim()) {
      const isHandDetected = currentFeatures.some(val => val !== 0);
      if (isHandDetected) {
        addExample(currentFeatures, labelName.trim());
        setRecordingProgress(prev => Math.min(prev + 1, targetSamples));
      }
    }
  }, [currentFeatures, isRecording, labelName]);

  const updateClassCounts = () => {
    setRecordedClasses(getClassExampleCounts());
  };

  const handleExport = () => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return;
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "sign_language_model.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target.result;
        JSON.parse(json); // validate
        localStorage.setItem(LOCAL_STORAGE_KEY, json);
        window.location.reload();
      } catch (err) {
        alert("Invalid model file.");
      }
    };
    reader.readAsText(file);
  };

  const toggleRecording = () => {
    if (!labelName.trim()) {
      alert(t.placeholderInput);
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      updateClassCounts();
    } else {
      setRecordingProgress(0);
      setIsRecording(true);
    }
  };

  const handleClearModel = () => {
    clearModel();
    setRecordedClasses({});
    setRecordingProgress(0);
  };

  const classCount = Object.keys(recordedClasses).length;

  return (
    <motion.div 
      className="ai-studio glass-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      <h3>{t.studioTitle}</h3>
      <p className="studio-desc">{t.studioDesc}</p>

      <div className="record-controls">
        <input 
          type="text" 
          className="glass-input" 
          placeholder={t.placeholderInput}
          value={labelName}
          onChange={(e) => setLabelName(e.target.value)}
          disabled={isRecording}
        />
        <button 
          className={`glass-button ${isRecording ? 'recording' : ''}`}
          onMouseDown={toggleRecording}
          onMouseUp={toggleRecording}
          onMouseLeave={() => isRecording && toggleRecording()}
          onTouchStart={toggleRecording}
          onTouchEnd={toggleRecording}
        >
          {isRecording ? <Square size={15} /> : <Play size={15} />}
          {isRecording ? t.recording : t.holdToRecord}
        </button>
        
        {isRecording && (
          <div className="progress-bar-container">
            <motion.div 
              className="progress-bar-fill" 
              animate={{ width: `${(recordingProgress / targetSamples) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>

      <div className="classes-list">
        <h4>{t.trainedSigns}</h4>
        {classCount === 0 ? (
          <div className="empty-state">{t.noSignsTrained}</div>
        ) : (
          Object.entries(recordedClasses).map(([label, count]) => (
            <motion.div 
              key={label} 
              className="class-item"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="class-label">{label}</span>
              <span className="class-count">{count} samples</span>
            </motion.div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        {classCount > 0 && (
          <>
            <button className="glass-button clear-btn" onClick={handleClearModel} style={{ flex: 1 }} title={t.resetModel}>
              <Trash2 size={15} />
            </button>
            <button className="glass-button" onClick={handleExport} style={{ flex: 1 }} title="Export">
              <Download size={15} />
            </button>
          </>
        )}
        <label className="glass-button" style={{ flex: 1, cursor: 'pointer' }} title="Import">
          <Upload size={15} />
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
      </div>
    </motion.div>
  );
};

export default AITrainingStudio;
