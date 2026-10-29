# 🛠️ Purple Panther AI Upgrades Reference

This document details each of the 8 core AI engineering upgrades showcased in the **Purple Panther Workshop Edition**, including the specific architectural problem each upgrade addresses, how the solution works, and how it is implemented.

---

## 1. RAG (Retrieval-Augmented Generation)

### ⚠️ The Problem
Base Large Language Models (LLMs) are trained on static, historical internet data. They have no knowledge of private, institutional, or recently updated information (e.g., Purple Panther University's specific 2026 Add/Drop deadlines, shuttle routes, or scholarship terms). When asked about these specifics, the model **hallucinates** plausible-sounding but false answers with high confidence.

### ✨ The Upgrade
**Retrieval-Augmented Generation (RAG)** bridges this gap without expensive fine-tuning or retraining. When a student asks a question, the system retrieves relevant text chunks from the university's knowledge base and injects them directly into the model's prompt context as ground truth. The model is instructed to answer strictly using the provided context and cite its sources.

### 🔬 Technical Implementation
- **Source Data:** [`mockData.js`](mockData.js) (`PPU_MOCK_DATA.knowledgeBase`).
- **Context Injection:** Relevant chunks are inserted into the Gemini system prompt:
  ```text
  [OFFICIAL PPU CAMPUS KNOWLEDGE BASE (GROUND TRUTH)]
  [Source 1: Spring 2026 Academic Calendar & Deadlines]
  Spring 2026 semester begins on January 12, 2026. The official Add/Drop deadline without a 'W' grade is February 6, 2026 at 11:59 PM...
  Instruction: Answer using ONLY the official PPU knowledge provided. Cite source names.
  ```
- **UI Feedback:** Assistant messages render a golden badge: `📚 RAG: Grounded in Spring 2026 Academic Calendar`.

---

## 2. Embeddings & Vector Search

### ⚠️ The Problem
Traditional keyword search (BM25 / lexical search) relies on exact word matches. If a student uses colloquial phrasing like *"Where can I find midnight grub and coffee?"*, lexical search often fails because the official university document uses terms like *"Dining Services"*, *"Late-Night Food"*, or *"Midnight Prowl Cafe"*.

### ✨ The Upgrade
**Vector Embeddings** convert text chunks and queries into high-dimensional numerical vectors that capture semantic meaning. Queries and documents are compared using mathematical similarity metrics (such as **Cosine Similarity**), allowing the system to match concepts regardless of vocabulary differences.

### 🔬 Technical Implementation
- **Semantic Cosine Scoring:** `app.js` (`computeSemanticVectorSearch`) scores candidate documents based on semantic token overlap and conceptual associations.
- **Top-K Retrieval:** The highest-scoring documents are ranked and passed to the RAG pipeline.
- **Inspector Trace:** Open the **🔍 Inspector** drawer to see the exact cosine similarity scores (e.g., `Midnight Prowl Cafe`: 91% match for *"midnight grub"*).

---

## 3. Tool Calling (Function Execution)

### ⚠️ The Problem
Knowledge bases and LLMs are inherently static. They cannot inspect real-time campus state (e.g., *"Is the gym crowded right now?"*) and cannot take actions in external systems (e.g., *"Book study room 204 for 2 hours"*).

### ✨ The Upgrade
**Tool Calling (Function Calling)** allows the LLM to interact with live software systems. The model is provided with formal function declarations (names, descriptions, parameter schemas). When appropriate, the model generates structured arguments to call a function, the client executes the handler against a live API or database, and the result is returned to the model to produce a final response.

### 🔬 Technical Implementation
- **Available Tools:**
  1. `get_facility_status(facility)`: Returns live operational hours, open/closed status, and crowd capacity percentage.
  2. `check_shuttle_live_eta(route, stop)`: Returns live GPS bus tracking and minute estimates.
  3. `book_study_room(roomNumber, durationHours)`: Books a library study room and returns a confirmation code.
- **UI Feedback:** Renders an emerald execution badge: `🔧 Tool Calling: get_facility_status() executed`.

---

## 4. MCP (Model Context Protocol)

### ⚠️ The Problem
Universities rely on dozens of disparate enterprise systems—Canvas LMS, dining point databases, registrar systems, and parking services. Building custom, bespoke API integrations for each service is fragile, expensive, and difficult to maintain securely.

### ✨ The Upgrade
Anthropic's open **Model Context Protocol (MCP)** provides a standardized, interoperable protocol for connecting AI models to external data sources and tools using uniform resource URIs (`mcp://...`) and standardized JSON-RPC schemas.

### 🔬 Technical Implementation
- **Standardized Mock MCP Servers:**
  - `mcp://campus-canvas-lms/courses/upcoming-assignments`: Standardized student LMS gradebook and due dates.
  - `mcp://campus-dining-services/student/meal-plan-balance`: Standardized student dining balance and guest passes.
- **Inspector Trace:** View the exact MCP server URI and JSON resource payload retrieved via the protocol.
- **UI Feedback:** Renders a blue badge: `🔌 MCP: Connected to PPU Canvas LMS Connector`.

---

## 5. Structured Output (JSON Mode)

### ⚠️ The Problem
By default, LLMs return free-form conversational prose. Frontend user interfaces, mobile apps, workflows, and relational databases cannot reliably parse paragraphs of text into clean UI cards, tables, or database rows.

### ✨ The Upgrade
**Structured Output** guarantees that the model's response adheres deterministically to a defined JSON Schema. The output is guaranteed to be syntactically valid JSON with predictable keys and types.

### 🔬 Technical Implementation
- **Schema:** Defined in [`mockData.js`](mockData.js) (`structuredOutputSchema`), enforcing:
  - `topic` (string)
  - `summary` (string)
  - `key_facts` (array of strings)
  - `actionable_steps` (array of strings)
  - `campus_contact` (object with `department`, `location`, `hours_or_deadline`)
- **UI Card Rendering:** Automatically renders a styled campus resource card with interactive tabs and an expandable raw JSON viewer.

---

## 6. Memory (Student Profile & Context Continuity)

### ⚠️ The Problem
Every API request to a stateless LLM begins with zero historical memory. The assistant has complete amnesia—it does not know the student's name, major, enrolled courses, or housing unless the student re-explains it in every prompt.

### ✨ The Upgrade
**Persistent Context / Long-Term Memory** injects the user's authenticated profile and historical preferences into the prompt pipeline. The assistant recognizes the student immediately and personalizes its guidance.

### 🔬 Technical Implementation
- **Profile Record:** `Jordan Taylor`, Junior, Computer Science (AI concentration), GPA 3.74, enrolled in *CS 330*, *AI 410*, *MATH 240*, residing in *West Residence Hall 314*.
- **System Injection:** Automatically injects the profile into the system instruction when enabled.
- **UI Feedback:** Renders a purple badge: `🧠 Memory: Jordan Taylor Profile Injected`.

---

## 7. Guardrails (Safety & Academic Integrity)

### ⚠️ The Problem
Unrestricted conversational models are vulnerable to:
1. **Prompt Injection / Jailbreaks:** Users instructing the model to *"ignore all previous instructions"* or bypass policies.
2. **Academic Dishonesty:** Students asking the AI to write entire graded essays or solve active exam questions.
3. **Cyber Exploits:** Prompts asking how to hack campus Wi-Fi or bypass firewalls.

### ✨ The Upgrade
**Guardrails** implement defensive checks at both the input and output layers:
- **Client-Side Interceptors:** High-speed pattern matching detecting exploit signatures prior to API dispatch.
- **System Policy Guardrails:** Strict negative constraints in the system prompt prohibiting ghostwriting and policy violations.

### 🔬 Technical Implementation
- If a violation is detected, execution is immediately intercepted and a red safety shield alert is displayed: `🛡️ [Campus Safety & Integrity Guardrail Intercepted]`.
- The incident is logged in the **🔍 Inspector** trace.

---

## 8. Evaluation & Observability

### ⚠️ The Problem
In AI engineering, you cannot optimize what you cannot measure. Deploying conversational AI without automated evaluation metrics leads to silent regressions in latency, increased hallucination rates, and unexpected token costs.

### ✨ The Upgrade
**AI Evaluation & Observability** provides continuous automated scoring on every response turn, measuring performance, groundedness, and safety.

### 🔬 Technical Implementation
- **Real-Time Scorecard Metrics:**
  - **⏱️ Latency:** Exact client-to-API roundtrip time in milliseconds.
  - **🎯 Groundedness Score:** Percentage metric assessing whether the response is supported by retrieved RAG/MCP context.
  - **🛡️ Safety Compliance:** Verification that safety guardrail checks passed.
  - **📦 Output Format:** Confirms adherence to JSON Schema vs free-form text.
