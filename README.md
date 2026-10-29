# 🐾 Purple Panther - AI Campus Assistant (Workshop Edition)

An interactive, vanilla **HTML, CSS, and JavaScript** web application designed for a **30-minute "Choose Your Own Adventure" AI Engineering Workshop**.

Powered by Google's **Gemini API** (`gemini-3.6-flash`), this application showcases how to evolve a basic conversational chatbot into a production-grade AI assistant through progressive architectural upgrades.

---

## 🎨 Theme & University Setting
- **Theme:** Collegiate White, Royal Purple (`#4c1d95`), and Gold (`#f59e0b`).
- **Institution:** Mock university **Purple Panther University (PPU)**.
- **Personality:** Warm, collegiate, and encouraging campus guide named **Purple Panther**.

---

## 🚀 How to Run (Zero Dependencies)

No servers, Python environments, or build steps are required. Simply open **`index.html`** directly in your browser:

### Option 1: Direct File Open (Easiest)
- **Mac:** In terminal run:
  ```bash
  open index.html
  ```
  *Or simply double-click `index.html` in Finder.*
- **Windows:** Double-click `index.html` or open it with Chrome / Edge.

### Option 2: Local HTTP Server (Optional)
If you prefer running via a local web server:
```bash
python3 -m http.server 8000
```
Then visit: **[http://localhost:8000](http://localhost:8000)**.

---

## 🔑 Setting Your Gemini API Key

1. **In the Web UI (Easiest):**
   - Paste your Gemini API key in the top-right header input and click **"Save"**. It is saved to your browser's `localStorage`.
2. **In the Code:**
   - Open [`app.js`](app.js) and paste your key into:
     ```javascript
     const GEMINI_API_KEY = "YOUR_KEY_HERE";
     ```

---

## 📁 Repository Structure

```
AI-Engineering-Workshop/
├── index.html       # Single-page UI with Chat, Workshop Lab, and Data Explorer tabs
├── style.css        # Responsive styling with White, Purple & Gold collegiate theme
├── app.js           # Vanilla JS: CYOA pipeline controller, Gemini integration & Inspector
├── mockData.js      # Mock university knowledge base, tools, MCP servers, memory & guardrails
├── UPGRADES.md      # Detailed reference on all 8 AI engineering upgrades
├── WORKSHOP_FLOW.md # 30-minute facilitator script & step-by-step order of operations
└── README.md        # Overview and quickstart guide
```

---

## 🧭 Workshop Resources

- **[📖 Workshop Facilitator Script & Flow (`WORKSHOP_FLOW.md`)](WORKSHOP_FLOW.md):**
  The recommended 30-minute chronological agenda. Contains exact prompts to click, audience questions to ask, failure modes to highlight, and what to point out in the Live Inspector.

- **[🛠️ Upgrades & AI Concepts Guide (`UPGRADES.md`)](UPGRADES.md):**
  Detailed breakdown of all 8 upgrades:
  1. **RAG (Retrieval-Augmented Generation)**
  2. **Embeddings & Vector Search**
  3. **Tool Calling (Function Execution)**
  4. **MCP (Model Context Protocol)**
  5. **Structured Output (JSON Mode)**
  6. **Memory (Student Profile Context)**
  7. **Guardrails (Safety & Academic Integrity)**
  8. **Evaluation & Observability**

---

## 🔍 The Live Pipeline Inspector

Click the **🔍 Inspector** button in the header at any time during the presentation to slide out real-time execution traces:
- Guardrail verification status
- Injected student memory profile
- Vector embeddings cosine similarity rankings
- RAG context chunks injected into prompt
- Tool execution parameters and returned live JSON
- MCP server resource payloads
- Real-time API latency and token estimates

---

## ✏️ Customizing with Real University Data

All mock data is cleanly isolated in **[`mockData.js`](mockData.js)**. To swap in your real university information:
- Update `PPU_MOCK_DATA.knowledgeBase` with your university's real FAQ chunks.
- Update `PPU_MOCK_DATA.mockStudentProfile` with relevant student fields.
- Update `PPU_MOCK_DATA.tools` and `PPU_MOCK_DATA.mcpServers` with actual endpoints or custom mocks!
