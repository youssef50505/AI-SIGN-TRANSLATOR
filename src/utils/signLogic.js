// ============================================================
// Sign Language Dictionary — Comprehensive Edition
// Format: "EnglishWord": { sig: [thumb, index, middle, ring, pinky], ar: "العربية" }
// 1 = finger extended, 0 = finger folded
// ============================================================

export const ONE_HAND_SIGNS = {
  // === Greetings & Social ===
  "Hello":       { sig: [1, 1, 1, 1, 1], ar: "مرحباً" },
  "Yes":         { sig: [1, 0, 0, 0, 0], ar: "نعم" },
  "No":          { sig: [1, 1, 0, 0, 0], ar: "لا" },
  "I love you":  { sig: [1, 1, 0, 0, 1], ar: "أحبك" },
  "Go":          { sig: [0, 1, 0, 0, 0], ar: "اذهب" },
  "Stop":        { sig: [0, 1, 1, 1, 0], ar: "توقف" },
  "Good":        { sig: [1, 0, 1, 1, 1], ar: "جيد" },
  "Peace":       { sig: [0, 1, 1, 0, 0], ar: "سلام" },
  "OK":          { sig: [1, 0, 1, 1, 0], ar: "حسناً" },
  "Help":        { sig: [0, 0, 1, 0, 0], ar: "مساعدة" },
  "Sorry":       { sig: [1, 0, 0, 0, 1], ar: "آسف" },
  "Thank you":   { sig: [0, 1, 0, 1, 0], ar: "شكراً" },
  "My name is":  { sig: [1, 1, 1, 0, 1], ar: "اسمي" },
  "Success":     { sig: [0, 1, 1, 1, 1], ar: "نجاح" },
  "Hungry":      { sig: [0, 0, 1, 1, 1], ar: "جائع" },
  "Happy":       { sig: [1, 0, 1, 0, 1], ar: "سعيد" },
  "Friend":      { sig: [0, 1, 0, 1, 1], ar: "صديق" },
  "School":      { sig: [0, 1, 0, 0, 1], ar: "مدرسة" },
  "Home":        { sig: [0, 0, 1, 1, 0], ar: "منزل" },
  "Family":      { sig: [1, 0, 0, 1, 0], ar: "عائلة" },
  "Want":        { sig: [1, 1, 1, 0, 0], ar: "أريد" },
  "Water":       { sig: [0, 1, 1, 0, 1], ar: "ماء" },
  "Eat":         { sig: [1, 1, 0, 1, 0], ar: "أكل" },
  "Wait":        { sig: [1, 1, 0, 1, 1], ar: "انتظر" },
  "Think":       { sig: [1, 0, 0, 1, 1], ar: "أفكر" },
};

export const TWO_HAND_SIGNS = {
  // === Two-hand phrases ===
  "I need help":         { sig: [[1, 1, 1, 1, 1], [0, 1, 1, 1, 0]], ar: "أحتاج مساعدة" },
  "Come here":           { sig: [[0, 1, 0, 0, 0], [0, 1, 0, 0, 0]], ar: "تعال هنا" },
  "Good morning":        { sig: [[1, 1, 1, 1, 1], [1, 0, 1, 1, 1]], ar: "صباح الخير" },
  "Good night":          { sig: [[1, 1, 1, 1, 1], [0, 0, 1, 1, 0]], ar: "تصبح على خير" },
  "I am fine":           { sig: [[1, 0, 1, 1, 1], [1, 0, 1, 1, 1]], ar: "أنا بخير" },
  "How are you":         { sig: [[1, 1, 0, 1, 1], [0, 1, 0, 1, 1]], ar: "كيف حالك" },
  "Thank you very much": { sig: [[0, 1, 1, 0, 0], [0, 1, 1, 0, 0]], ar: "شكراً جزيلاً" },
  "Beautiful":           { sig: [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1]], ar: "جميل" },
  "I don't know":        { sig: [[0, 1, 1, 1, 1], [0, 1, 1, 1, 1]], ar: "لا أعرف" },
  "Please help me":      { sig: [[0, 1, 0, 1, 0], [0, 0, 1, 0, 0]], ar: "ساعدني" },
  "I am happy":          { sig: [[1, 0, 1, 0, 1], [1, 0, 1, 0, 1]], ar: "أنا سعيد" },
  "I am sad":            { sig: [[0, 1, 1, 0, 1], [0, 1, 1, 0, 1]], ar: "أنا حزين" },
  "Clap":                { sig: [[1, 1, 1, 1, 1], [1, 1, 1, 1, 1]], ar: "تصفيق" },
  "I want to go home":   { sig: [[0, 0, 1, 1, 0], [0, 1, 0, 0, 0]], ar: "أريد الذهاب للمنزل" },
  "Let's eat together":  { sig: [[1, 1, 1, 0, 0], [1, 1, 1, 0, 0]], ar: "لنأكل معاً" },
  "More please":         { sig: [[0, 1, 0, 1, 0], [0, 1, 0, 1, 0]], ar: "المزيد من فضلك" },
  "Stop everything":     { sig: [[0, 1, 1, 1, 0], [0, 1, 1, 1, 0]], ar: "توقف عن كل شيء" },
};

// ============================================================
// Finger State Detection
// ============================================================
export const getFingerStates = (landmarks) => {
  const tips = [4, 8, 12, 16, 20];
  const pips = [2, 6, 10, 14, 18]; // corresponding pip joints
  const fingers = [];
  for (let i = 0; i < tips.length; i++) {
    const tip = landmarks[tips[i]];
    const pip = landmarks[pips[i]];
    if (i === 0) {
      // Thumb: use distance from wrist — if tip is farther from palm center, it's extended
      const wrist = landmarks[0];
      const middleMcp = landmarks[9]; // middle finger base as palm center reference
      const tipDist = Math.hypot(tip.x - middleMcp.x, tip.y - middleMcp.y);
      const pipDist = Math.hypot(pip.x - middleMcp.x, pip.y - middleMcp.y);
      fingers.push(tipDist > pipDist ? 1 : 0);
    } else {
      // Other fingers: tip above pip = extended (y axis is inverted in screen coords)
      fingers.push(tip.y < pip.y ? 1 : 0);
    }
  }
  return fingers;
};

// ============================================================
// Sign Recognition Engine
// ============================================================
const arraysEqual = (a, b) => {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export const recognizeSign = (leftHand, rightHand) => {
  let detectedWordEn = null;
  let detectedWordAr = null;
  let signType = null;

  // Priority: two-hand signs first
  if (leftHand && rightHand) {
    for (const [word, data] of Object.entries(TWO_HAND_SIGNS)) {
      if (arraysEqual(data.sig[0], leftHand) && arraysEqual(data.sig[1], rightHand)) {
        detectedWordEn = word;
        detectedWordAr = data.ar;
        signType = "two_hands";
        break;
      }
    }
  }

  // Fallback: one-hand sign
  if (!detectedWordEn) {
    const activeHand = rightHand || leftHand;
    if (activeHand) {
      for (const [word, data] of Object.entries(ONE_HAND_SIGNS)) {
        if (arraysEqual(data.sig, activeHand)) {
          detectedWordEn = word;
          detectedWordAr = data.ar;
          signType = "one_hand";
          break;
        }
      }
    }
  }

  return { detectedWordEn, detectedWordAr, signType };
};
