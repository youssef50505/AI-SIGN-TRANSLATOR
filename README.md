# ◈ AI Sign Language Translator ◈

A professional, real-time AI-powered sign language translator built with React, MediaPipe, TensorFlow.js, and Google Gemini.

![Dark Mode](https://img.shields.io/badge/Theme-Dark%20%2F%20Light-blueviolet)
![Languages](https://img.shields.io/badge/Languages-English%20%2F%20Arabic-green)
![AI](https://img.shields.io/badge/AI-TensorFlow.js%20%2B%20Gemini-orange)

## ✨ Features

- **Real-time Hand Tracking** — MediaPipe detects both hands with 21 landmarks each
- **Dual Recognition System** — Rule-based dictionary (25+ one-hand + 17 two-hand signs) + Teachable AI (KNN Classifier)
- **AI Training Studio** — Train custom signs in seconds by holding a button
- **Landmark Normalization** — Scale & position invariant recognition with aspect ratio correction
- **Temporal Smoothing** — 5-frame buffer eliminates false detections
- **Context Translation** — Google Gemini builds natural sentences from detected words
- **Bilingual Support** — Full Arabic/English UI with RTL layout
- **Dark/Light Mode** — Premium glassmorphism design with animated mesh gradients
- **Text-to-Speech** — Detected signs are spoken aloud in selected language
- **Export/Import Models** — Save and share trained AI models as JSON files
- **Sign Dictionary** — Interactive reference showing all available signs with emoji finger guides

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/youssef50505/AI-SIGN-TRANSLATOR.git
cd AI-SIGN-TRANSLATOR

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser and allow camera access.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React** | UI Framework |
| **MediaPipe** | Hand Landmark Detection |
| **TensorFlow.js** | KNN Classifier for custom signs |
| **Google Gemini** | Natural language sentence building |
| **Framer Motion** | Smooth animations |
| **Lucide React** | Premium icons |

## 📖 How It Works

1. **Camera captures** your hands in real-time
2. **MediaPipe extracts** 21 3D landmarks per hand
3. **Normalization engine** makes landmarks position/scale invariant
4. **Recognition runs** through AI model first, then falls back to rule-based dictionary
5. **Temporal smoothing** ensures only stable, consistent signs are registered
6. **Gemini AI** combines detected words into grammatically correct sentences

## 🎯 Built-in Signs

### One Hand (25 signs)
Hello, Yes, No, I love you, Go, Stop, Good, Peace, OK, Help, Sorry, Thank you, My name is, Success, Hungry, Happy, Friend, School, Home, Family, Want, Water, Eat, Wait, Think

### Two Hands (17 signs)
I need help, Come here, Good morning, Good night, I am fine, How are you, Thank you very much, Beautiful, I don't know, Please help me, I am happy, I am sad, Clap, and more...

## 📝 License

MIT License — Feel free to use, modify, and distribute.

---

**Built with ❤️ by Youssef**
