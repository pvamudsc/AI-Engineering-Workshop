# 🐾 Purple Panther - Campus AI Assistant

A beginner-friendly, minimal chatbot application designed for the **AI Engineering Workshop**. Built using vanilla **HTML, CSS, and JavaScript** and powered by the **Google Gemini API**.

---

## 🎨 Theme & Personality

- **Name:** Purple Panther
- **Theme:** Collegiate White, Royal Purple (`#4c1d95`), and Gold (`#f59e0b`)
- **Role:** Friendly AI campus assistant helping students navigate mock questions about campus resources, academic policy, tutoring, and campus life.

---

## 🏗️ Architecture

This is designed to be the simplest chatbot imaginable:

```
AI-Engineering-Workshop/
├── index.html       # Single-page UI (Header, chat history container, input form)
├── style.css        # Responsive styling with White, Purple & Gold theme
├── app.js           # Vanilla JS: handles chat state, UI updates & Gemini API call
└── README.md        # Architecture overview and quickstart guide
```

### How It Works:
1. **User Input:** The student types a question in the input box and clicks **Send** (or presses `Enter`).
2. **State & Chat History:** `app.js` maintains an array of conversation turns (`chatHistory`) formatted for multi-turn conversations.
3. **Gemini REST API:** `app.js` issues a direct `fetch` POST request to Google's Gemini API:
   ```
   https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={API_KEY}
   ```
4. **Persona (System Instruction):** The assistant is instructed to introduce itself as **Purple Panther** and provide friendly campus guidance.
5. **UI Rendering:** The assistant's response is appended to the message bubble history with smooth auto-scrolling and a loading indicator.

---

## 🚀 How to Run Locally

Because there are **no complex build steps or mandatory backend services**, running the app on `localhost` takes less than 5 seconds!

### Method 1: Using Python's Built-in Web Server (Recommended)
Open your terminal in the project directory and run:

```bash
python3 -m http.server 8000
```

Then open your browser and navigate to:
👉 **[http://localhost:8000](http://localhost:8000)**

---

### Method 2: Direct File Open
You can also simply double-click `index.html` or open it directly in Google Chrome / Safari / Firefox:
```bash
open index.html
```

---

### Method 3: VS Code Live Server
If you use VS Code, right-click `index.html` and choose **"Open with Live Server"**.

---

### Method 4: Optional 1-File FastAPI Backend
If you want to run via a Python backend server:
```bash
pip install fastapi uvicorn requests
uvicorn main:app --reload --port 8000
```
Then navigate to **[http://localhost:8000](http://localhost:8000)**.

---

## 🔑 Setting Your Gemini API Key

You can configure your Gemini API key in either of two easy ways:

1. **In the Web UI (Easiest):**
   - Paste your Gemini API key directly into the input bar in the top right header of the page and click **"Save Key"**. It will be saved in your browser's local storage.
2. **In the Code:**
   - Open [`app.js`](app.js) and paste your key into the `GEMINI_API_KEY` constant at the top:
     ```javascript
     const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
     ```

> 💡 **Get a free Gemini API key:** Visit [Google AI Studio](https://aistudio.google.com/) and click **Get API Key**.

---

## 🧪 Future Feature Pool

As the workshop progresses, you can easily build upon this foundation:
- Connecting to university knowledge bases or FAQ datasets (RAG - Retrieval-Augmented Generation)
- Adding speech-to-text / text-to-speech for voice interactions
- Implementing a FastAPI or Node.js proxy backend for enterprise security and rate limiting
- Adding quick-reply suggestions (e.g., "Where is the library?", "When is the drop deadline?")
