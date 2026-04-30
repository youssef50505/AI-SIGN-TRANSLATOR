# ◈ AI Sign Language Translator ◈

A professional, real-time AI-powered sign language translator built with **React**, **MediaPipe**, **TensorFlow.js**, and **Google Gemini**.

---

![Dark Mode](https://img.shields.io/badge/Theme-Dark%20%2F%20Light-blueviolet?style=for-the-badge)
![Languages](https://img.shields.io/badge/Languages-English%20%2F%20Arabic-green?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-TensorFlow.js%20%2B%20Gemini-orange?style=for-the-badge)

## ✨ Key Features

- **⚡ Real-time Hand Tracking** — High-performance MediaPipe detection (21 landmarks/hand).
- **🧠 Dual Recognition Engine** — Hybrid system combining rule-based logic (40+ signs) and Teachable KNN AI.
- **🎙️ Training Studio** — In-app UI to train and persist custom signs instantly.
- **📏 Advanced Normalization** — Hand size, distance, and position invariant logic.
- **🛡️ Temporal Smoothing** — Multi-frame buffer to eliminate flickering and transitional noise.
- **✨ Gemini Contextualization** — Automatically builds natural sentences from sign sequences.
- **🌍 Full Bilingual Support** — English and Arabic UI with automatic RTL layout switching.
- **🔊 Multi-lingual TTS** — Text-to-speech for both Arabic and English.
- **🌑 Premium Aesthetics** — Glassmorphism design with animated mesh gradients and smooth Framer Motion transitions.

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **CV/ML:** MediaPipe Hands + TensorFlow.js (KNN)
- **Generative AI:** Google Gemini (Generative Language API)
- **Styling:** Vanilla CSS (Glassmorphism + CSS Variables)
- **Animations:** Framer Motion
- **Icons:** Lucide React

## 🚀 Installation & Setup

1. **Clone the Repo:**
   ```bash
   git clone https://github.com/youssef50505/AI-SIGN-TRANSLATOR.git
   cd AI-SIGN-TRANSLATOR
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Get a Gemini API Key:**
   Visit [Google AI Studio](https://aistudio.google.com/) to get a free API key.

4. **Run the App:**
   ```bash
   npm run dev
   ```

5. **Configure API:**
   Open the app, click **API Settings** (⚙️), and paste your Gemini key to enable sentence building.

## 📖 How to Use

- **Translator Mode:** Just sign in front of the camera. The app will detect signs and add them to the history.
- **Training Mode:** Switch to "AI Training Studio", type a label, and hold "Record" while performing the sign.
- **Dictionary:** Click the 📖 icon to see all built-in hand patterns.
- **Switching Language:** Click the 🌐 AR/EN button to flip the entire UI and logic.

## 📂 Dictionary Preview

### 🖐️ One Hand Signs
*Hello, Yes, No, I love you, Go, Stop, Good, Peace, OK, Help, Sorry, Thank you, My name is, Success, Hungry, Happy, Friend, School, Home, Family, Want, Water, Eat, Wait, Think.*

### 🤲 Two Hand Signs
*I need help, Come here, Good morning, Good night, I am fine, How are you, Thank you very much, Beautiful, I don't know, Please help me, I am happy, I am sad, Clap.*

---

**Developed with ❤️ by Youssef**
