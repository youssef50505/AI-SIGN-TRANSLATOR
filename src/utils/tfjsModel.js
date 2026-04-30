import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

let classifier = knnClassifier.create();
export const LOCAL_STORAGE_KEY = 'signLanguageKNNModel_v4'; // v4: Front camera hand swap + thumb fix

// Advanced Landmark Normalization with Aspect Ratio Correction
// This solves the problem of hands being too close/far or in different screen positions.
const normalizeLandmarks = (landmarks) => {
  if (!landmarks || landmarks.length === 0) return Array(21 * 3).fill(0);

  // 1. Find Wrist (Root point)
  const wrist = landmarks[0];
  const ASPECT_RATIO = 1280 / 720; // 1.777
  
  // 2. Translate all points relative to wrist AND correct aspect ratio
  const translated = landmarks.map(lm => ({
    x: (lm.x - wrist.x) * ASPECT_RATIO,
    y: lm.y - wrist.y,
    z: (lm.z || 0) - (wrist.z || 0)
  }));

  // 3. Find max distance for scaling
  let maxDist = 0;
  translated.forEach(lm => {
    maxDist = Math.max(maxDist, Math.abs(lm.x), Math.abs(lm.y), Math.abs(lm.z));
  });

  // Prevent division by zero
  if (maxDist === 0) maxDist = 1;

  // 4. Scale all points to be between -1.0 and 1.0
  const normalized = [];
  translated.forEach(lm => {
    normalized.push(lm.x / maxDist, lm.y / maxDist, lm.z / maxDist);
  });

  return normalized;
};

// Process both hands into a single 126-feature array
export const processLandmarks = (leftHand, rightHand) => {
  const leftFeatures = normalizeLandmarks(leftHand);
  const rightFeatures = normalizeLandmarks(rightHand);
  
  return [...leftFeatures, ...rightFeatures];
};

export const addExample = (features, labelId) => {
  const tensor = tf.tensor(features);
  classifier.addExample(tensor, labelId);
  tensor.dispose();
  saveModel();
};

export const predictSign = async (features) => {
  if (classifier.getNumClasses() === 0) return null;
  const tensor = tf.tensor(features);
  const result = await classifier.predictClass(tensor, 5); // Increased K to 5 for stronger noise resilience
  tensor.dispose();
  return result;
};

export const getClassExampleCounts = () => {
  if (!classifier) return {};
  return classifier.getClassExampleCount();
};

export const clearModel = () => {
  classifier.clearAllClasses();
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};

export const saveModel = () => {
  let dataset = classifier.getClassifierDataset();
  let datasetObj = {};
  Object.keys(dataset).forEach((key) => {
    let data = dataset[key].dataSync();
    datasetObj[key] = Array.from(data);
  });
  let jsonStr = JSON.stringify(datasetObj);
  localStorage.setItem(LOCAL_STORAGE_KEY, jsonStr);
};

export const loadModel = () => {
  let jsonStr = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (jsonStr) {
    let datasetObj = JSON.parse(jsonStr);
    let tensorObj = {};
    Object.keys(datasetObj).forEach((key) => {
      const array = datasetObj[key];
      const numExamples = array.length / 126;
      tensorObj[key] = tf.tensor2d(array, [numExamples, 126]);
    });
    classifier.setClassifierDataset(tensorObj);
    return true;
  }
  return false;
};

loadModel();
