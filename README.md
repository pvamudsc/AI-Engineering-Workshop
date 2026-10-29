# 🐾 Purple Panther - AI Campus Assistant (Workshop Edition)

An interactive, vanilla **HTML, CSS, and JavaScript** web application designed for a **30-minute "Choose Your Own Adventure" AI Engineering Workshop**.

Powered directly in the browser by Google's **Gemini API** (`gemini-3.6-flash`), this application showcases how to evolve a basic conversational chatbot into a production-grade AI assistant through progressive architectural upgrades.

---

## 🎨 Theme & University Setting
- **Theme:** Collegiate White, Royal Purple (`#4c1d95`), and Gold (`#f59e0b`).
- **Institution:** **Prairie View A&M University (PVAMU)** — Roy G. Perry College of Engineering.
- **Current Academic Terms:** Fall 2026 Semester & Spring 2027 Registration.
- **Student Profile:** **Daniel Sian** (`PV-839201`), 1st semester graduate student in **M.S. in Data Science & Engineering (MS DSE)**.
  - **Academic Advisor:** Dr. Lijun Qian (NENR Building, Room 332).
  - **Enrolled Courses:** `ELEG 6316` (Statistical Learning for Big Data), `COMP 5314` (Advanced Database Management Systems), and `GNEG 5304` (Engineering Probability and Statistics).
- **Personality:** Warm, collegiate, and encouraging campus assistant named **Purple Panther**.

---

## 🚀 How to Run (Zero Dependencies)

This is a pure frontend, client-side web application. No local servers, command-line build tools, or package installations are required.

Simply open **`index.html`** directly in your web browser:

- **macOS:** In your terminal, run:
  ```bash
  open index.html
  ```
  *Or double-click `index.html` in Finder.*
- **Windows:** Double-click `index.html` or right-click and choose **Open with > Google Chrome / Microsoft Edge**.
- **Linux:** Run `xdg-open index.html`.

---

## 🔑 Setting Your Gemini API Key

1. **In the Web UI (Recommended):**
   - In the top-right header, paste your Gemini API key and click **"Save"**. The key is stored locally in your browser's `localStorage` and never leaves your computer.
2. **Directly in the Code (Optional):**
   - Open [`app.js`](app.js) and update:
     ```javascript
     const GEMINI_API_KEY = "YOUR_KEY_HERE";
     ```

---

## 📁 Repository Structure

```
AI-Engineering-Workshop/
├── index.html       # Single-page UI with Chat, Workshop Lab (CYOA), and Data & MCP explorer tabs
├── style.css        # Responsive styling with White, Purple & Gold collegiate theme
├── app.js           # Vanilla JS controller: CYOA pipeline, Gemini API client & Inspector
├── mockData.js      # Authentic PVAMU ground truth, student profile, tools & MCP resources
├── UPGRADES.md      # Comprehensive technical guide to all 8 AI engineering upgrades
├── WORKSHOP_FLOW.md # 30-minute facilitator script & step-by-step order of operations
└── README.md        # Project overview and quickstart guide
```

---

## 🛠️ The 8 AI Engineering Upgrades

Presented as equal, independently toggleable modules in the **Workshop Lab** tab:

1. **RAG (Retrieval-Augmented Generation):** Injects official university knowledge chunks into the system prompt to eliminate hallucinations on registrar deadlines and course policies.
2. **Embeddings & Vector Search:** Uses cosine similarity scoring to match conversational queries (e.g. *"late-night grub and coffee"*) with official campus documents without requiring exact keywords.
3. **Tool Calling (Function Execution):** Enables the model to inspect live real-time state (`get_facility_status`, `check_shuttle_live_eta`) and take external actions (`book_study_room`).
4. **MCP (Model Context Protocol):** Connects the assistant to standardized external systems (`mcp://pvamu-canvas-lms` and `mcp://pvamu-dining-services`) via uniform resource schemas.
5. **Structured Output (JSON Mode):** Enforces a strict JSON Schema to produce predictable, UI-ready component data instead of free-form prose.
6. **Memory (Student Profile Context):** Injects Daniel Sian's persistent degree plan, courses, advisor, and housing profile for personalized continuity.
7. **Guardrails (Safety & Academic Integrity):** Pre-screen and intercept prompt injections, jailbreaks, and ghostwriting requests before they consume tokens or violate policy.
8. **Evaluation & Observability:** Automatically measures latency, groundedness score, safety compliance, and JSON Schema validity on every turn.

---

## 📚 Authentic PVAMU Campus Data

All ground truth data is cleanly maintained in **[`mockData.js`](mockData.js)** (`PVAMU_DATA`):

- **Fall 2026 Academic Calendar (16-Week Session):** First class day (Aug 24), Census drop date (Sept 9), 20th class day & major change deadline (Sept 21), Spring 2027 priority registration (Nov 2–7), Thanksgiving holiday (Nov 26–27), Last class day (Nov 30), Final exams (Dec 2–9), Graduate Commencement (Dec 10), Undergraduate Commencement (Dec 11).
- **Spring 2027 Academic Calendar (16-Week Session):** First class day (Jan 11), MLK Jr. Day (Jan 18), Census drop date (Jan 27), Midterms (March 4–6), Spring Break (March 15–20), Honors Convocation (March 17), Final exams (April 29–May 6), Graduate Commencement (May 7), Undergraduate Commencement (May 8).
- **MS in Data Science & Engineering (MS DSE):** 30 SCH curriculum, coordinator Dr. Lijun Qian (NENR 332), core courses `ELEG 6316`, `COMP 5314`, `GNEG 5304`, `ELEG 6318`, `COMP 5315`.
- **Undergraduate CS & CPEG:** ABET-accredited curriculum, course sequences (`COMP 1336` through `COMP 4314`, `CPEG 2302`–`4303`), and senior design capstones.
- **Dining on the Hill:** 
  - **MSC Dining Facility:** All-you-care-to-eat cafeteria open daily until **7:00 PM** (Dinner 4:00 PM – 7:00 PM).
  - **Chick-fil-A:** Located inside the **Memorial Student Center (MSC)**.
  - **Dunkin':** Located on the 1st floor of the **John B. Coleman Library**.
  - **Pizza Hut Express:** Located inside **The Strike Zone** (campus bowling alley & student lounge).
  - Grubhub mobile pick-up integrated across campus.
- **John B. Coleman Library:** 5 floors of study spaces, group study rooms 201–218, technology/laptop lending desk, 24/7 hours during finals.
- **Panther Express Shuttle & Owens-Franklin Health Center:** Campus transit Route A connecting student housing, MSC, and engineering complexes; walk-in medical clinic and counseling services.

---

## 🔍 The Live Pipeline Inspector

Click the **🔍 Inspector** button in the header at any point to slide out the live telemetry drawer:
- **Guardrail Interceptor:** Real-time regex pattern evaluation
- **Active Memory Profile:** Injected student identity details
- **Vector Cosine Similarity Rankings:** Scored document matches
- **Injected RAG Context:** Ground-truth prompt chunks
- **Tool Execution Log:** Parsed arguments and returned JSON
- **MCP Resource Payloads:** Simulated JSON-RPC enterprise records
- **Latency & Token Estimates:** Turn-by-turn observability metrics

---

## 🧭 Facilitator Resources
- **[`WORKSHOP_FLOW.md`](WORKSHOP_FLOW.md):** 30-minute facilitator script with the exact order of operations, talking points, audience prompts, and live inspector demo cues.
- **[`UPGRADES.md`](UPGRADES.md):** Detailed architectural explanations of the problem, upgrade, and technical implementation for each of the 8 features.
