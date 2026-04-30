import { useRef, useEffect, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const CameraFeed = ({ onLandmarks, onFpsUpdate, onHandsUpdate }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const handLandmarkerRef = useRef(null);
  const requestRef = useRef();
  const lastVideoTimeRef = useRef(-1);
  const framesRef = useRef(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    startTimeRef.current = performance.now();
  }, []);

  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        handLandmarkerRef.current = handLandmarker;
        setIsModelLoaded(true);
      } catch (error) {
        console.error("Error loading MediaPipe model:", error);
      }
    };

    initializeMediaPipe();

    return () => {
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720, facingMode: "user" } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            requestRef.current = requestAnimationFrame(predictWebcam);
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    if (isModelLoaded && videoRef.current) {
      startCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isModelLoaded]);

  const drawLandmarks = (canvasCtx, landmarks, handednesses) => {
    for (let i = 0; i < landmarks.length; i++) {
      const pts = landmarks[i];
      // Front camera is mirrored: MediaPipe "Right" = user's Left, so we invert for display
      const isUserRight = handednesses[i][0].categoryName === "Left";
      
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], 
        [0, 5], [5, 6], [6, 7], [7, 8], 
        [5, 9], [9, 10], [10, 11], [11, 12], 
        [9, 13], [13, 14], [14, 15], [15, 16], 
        [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] 
      ];

      // Premium gradient lines
      const gradient = canvasCtx.createLinearGradient(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);
      if (isUserRight) {
        gradient.addColorStop(0, '#00f5d4');
        gradient.addColorStop(1, '#4361ee');
      } else {
        gradient.addColorStop(0, '#f72585');
        gradient.addColorStop(1, '#7209b7');
      }

      canvasCtx.strokeStyle = gradient;
      canvasCtx.lineWidth = 2.5;
      canvasCtx.shadowColor = isUserRight ? '#00f5d4' : '#f72585';
      canvasCtx.shadowBlur = 12;
      canvasCtx.lineCap = 'round';

      for (const [startIdx, endIdx] of connections) {
        const start = pts[startIdx];
        const end = pts[endIdx];
        canvasCtx.beginPath();
        canvasCtx.moveTo(start.x * canvasCtx.canvas.width, start.y * canvasCtx.canvas.height);
        canvasCtx.lineTo(end.x * canvasCtx.canvas.width, end.y * canvasCtx.canvas.height);
        canvasCtx.stroke();
      }

      // Draw joints
      canvasCtx.shadowBlur = 0;
      for (let j = 0; j < pts.length; j++) {
        const pt = pts[j];
        const isTip = [4, 8, 12, 16, 20].includes(j);
        const radius = isTip ? 5 : 3;
        
        canvasCtx.beginPath();
        canvasCtx.arc(pt.x * canvasCtx.canvas.width, pt.y * canvasCtx.canvas.height, radius, 0, 2 * Math.PI);
        
        if (isTip) {
          canvasCtx.fillStyle = isUserRight ? '#00f5d4' : '#f72585';
          canvasCtx.shadowColor = isUserRight ? '#00f5d4' : '#f72585';
          canvasCtx.shadowBlur = 8;
        } else {
          canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          canvasCtx.shadowBlur = 0;
        }
        canvasCtx.fill();
      }
      canvasCtx.shadowBlur = 0;
    }
  };

  const predictWebcam = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const handLandmarker = handLandmarkerRef.current;

    if (!video || !canvas || !handLandmarker) return;

    framesRef.current++;
    const currentMs = performance.now();
    if (currentMs - startTimeRef.current >= 1000) {
      if (onFpsUpdate) onFpsUpdate(framesRef.current);
      framesRef.current = 0;
      startTimeRef.current = currentMs;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const canvasCtx = canvas.getContext("2d");
    
    canvasCtx.save();
    canvasCtx.scale(-1, 1);
    canvasCtx.translate(-canvas.width, 0);
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      
      const nowMs = performance.now();
      const results = handLandmarker.detectForVideo(video, nowMs);
      
      if (results.landmarks) {
        const numHands = results.landmarks.length;
        if (onHandsUpdate) onHandsUpdate(`${numHands} hand${numHands !== 1 ? 's' : ''}`);
        
        drawLandmarks(canvasCtx, results.landmarks, results.handednesses);

        let leftHand = null;
        let rightHand = null;

        // Front camera mirrors the image, so MediaPipe reports hands
        // opposite to what the user sees. We swap them here.
        for (let i = 0; i < numHands; i++) {
          const handCategory = results.handednesses[i][0].categoryName;
          if (handCategory === "Left") {
            // MediaPipe says "Left" but it's actually user's RIGHT hand (mirrored)
            rightHand = results.landmarks[i];
          } else {
            // MediaPipe says "Right" but it's actually user's LEFT hand (mirrored)
            leftHand = results.landmarks[i];
          }
        }

        if (onLandmarks) {
          onLandmarks(leftHand, rightHand);
        }
      }
    }

    canvasCtx.restore();
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <>
      <video 
        ref={videoRef} 
        style={{ display: 'block' }} 
        autoPlay 
        playsInline 
        muted 
      />
      <canvas 
        ref={canvasRef} 
        style={{ pointerEvents: 'none' }}
      />
      {!isModelLoaded && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          Loading Vision AI...
        </div>
      )}
    </>
  );
};

export default CameraFeed;
