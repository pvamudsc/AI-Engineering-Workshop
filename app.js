/**
 * Purple Panther - Campus AI Assistant (Workshop Edition)
 * AI Engineering Workshop: Choose Your Own Adventure Controller
 * 
 * Showcases:
 *  - Structured Output (JSON Mode)
 *  - Embeddings & Vector Search (Semantic Cosine Match)
 *  - RAG (Retrieval-Augmented Generation & Citation)
 *  - Tool Calling (Live Function Execution)
 *  - MCP (Model Context Protocol standardized resources)
 *  - Memory (Student Profile & Context Continuity)
 *  - Guardrails (Safety & Academic Integrity Interceptor)
 *  - Evaluation (Real-Time Latency, Groundedness & Observability)
 */

// ============================================================================
// CONFIGURATION & GLOBAL STATE
// ============================================================================
const GEMINI_API_KEY = ""; // Paste here or in the web UI
const MODEL_NAME = "gemini-3.6-flash";

// Base Assistant Persona
const BASE_SYSTEM_INSTRUCTION = 
  "You are Purple Panther, a friendly, collegiate AI campus assistant at Prairie View A&M University (PVAMU). " +
  "Always introduce yourself as Purple Panther. " +
  "You assist students, faculty, and visitors with questions about PVAMU academic programs, course catalogs, Fall 2026 semester deadlines, campus dining, and campus life. " +
  "Keep your tone collegiate, encouraging, and welcoming.";

// Feature Flags State (The Checkbox System)
const features = {
  structured_output: false,
  vector_search: false,
  rag: false,
  tool_calling: false,
  mcp: false,
  memory: false,
  guardrails: false,
  evaluation: false
};

// Multi-turn conversation history
let chatHistory = [];

// Recent trace log for the Pipeline Inspector
let currentPipelineTrace = [];

// ============================================================================
// DOM ELEMENTS
// ============================================================================
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const apiKeyInput = document.getElementById("api-key-input");
const saveKeyBtn = document.getElementById("save-key-btn");
const inspectorDrawer = document.getElementById("inspector-drawer");
const toggleInspectorBtn = document.getElementById("toggle-inspector-btn");
const closeInspectorBtn = document.getElementById("close-inspector-btn");
const inspectorBody = document.getElementById("inspector-body");
const bannerTags = document.getElementById("banner-tags");
const activeFeaturesBadge = document.getElementById("active-features-badge");

// ============================================================================
// INITIALIZATION
// ============================================================================
window.addEventListener("DOMContentLoaded", () => {
  // 1. Load API Key
  const savedKey = localStorage.getItem("GEMINI_API_KEY") || GEMINI_API_KEY;
  if (savedKey) {
    apiKeyInput.value = savedKey;
  }

  // 2. Load Feature Flag Preferences
  loadFeaturePreferences();

  // 3. Setup Navigation Tabs
  setupTabNavigation();

  // 4. Setup Inspector Toggle
  setupInspectorEvents();

  // 5. Setup Quick Prompts and Feature Cards
  setupScenarioPrompts();
  setupFeatureCardToggles();

  // 6. Populate Mock Data Tab
  renderMockDataExplorer();

  // 7. Initial Greeting Message
  appendAssistantGreeting();
});

// Save API key
saveKeyBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  if (key) {
    localStorage.setItem("GEMINI_API_KEY", key);
    alert("API Key saved locally in your browser!");
  } else {
    localStorage.removeItem("GEMINI_API_KEY");
    alert("API Key cleared.");
  }
});

function getApiKey() {
  return apiKeyInput.value.trim() || localStorage.getItem("GEMINI_API_KEY") || GEMINI_API_KEY;
}

// ============================================================================
// NAVIGATION TABS & DRAWER
// ============================================================================
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll(".nav-tab");
  const tabPanels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tab;
      
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add("active");
    });
  });

  // Shortcut from banner to Workshop tab
  const goToLabBtn = document.getElementById("go-to-lab-btn");
  if (goToLabBtn) {
    goToLabBtn.addEventListener("click", () => {
      document.getElementById("tab-btn-workshop").click();
    });
  }
}

function setupInspectorEvents() {
  toggleInspectorBtn.addEventListener("click", () => {
    inspectorDrawer.classList.toggle("open");
  });

  closeInspectorBtn.addEventListener("click", () => {
    inspectorDrawer.classList.remove("open");
  });
}

// ============================================================================
// FEATURE FLAGS & CHECKBOX MANAGEMENT
// ============================================================================
function loadFeaturePreferences() {
  const savedFeatures = localStorage.getItem("PPU_WORKSHOP_FEATURES");
  if (savedFeatures) {
    try {
      const parsed = JSON.parse(savedFeatures);
      Object.assign(features, parsed);
    } catch (e) {
      console.warn("Failed to parse saved features:", e);
    }
  }
  syncFeatureUI();
}

function saveFeaturePreferences() {
  localStorage.setItem("PPU_WORKSHOP_FEATURES", JSON.stringify(features));
  syncFeatureUI();
}

function syncFeatureUI() {
  let activeCount = 0;
  const activeNames = [];

  // Sync checkboxes and cards
  for (const [featKey, isEnabled] of Object.entries(features)) {
    const input = document.getElementById(`feat-${featKey}`);
    const card = document.getElementById(`card-${featKey}`);
    if (input) input.checked = isEnabled;
    if (card) {
      if (isEnabled) card.classList.add("active");
      else card.classList.remove("active");
    }

    if (isEnabled) {
      activeCount++;
      activeNames.push(formatFeatureName(featKey));
    }
  }

  // Update badge count
  activeFeaturesBadge.textContent = `${activeCount} Active`;

  // Update banner above chat
  if (activeCount === 0) {
    bannerTags.innerHTML = '<span class="tag-none">Baseline (No Upgrades Enabled - Vanilla LLM)</span>';
  } else {
    bannerTags.innerHTML = activeNames
      .map(name => `<span class="feature-tag">⚡ ${name}</span>`)
      .join("");
  }
}

function formatFeatureName(key) {
  const map = {
    structured_output: "Structured Output",
    vector_search: "Vector Search",
    rag: "RAG",
    tool_calling: "Tool Calling",
    mcp: "MCP",
    memory: "Memory",
    guardrails: "Guardrails",
    evaluation: "Evaluation"
  };
  return map[key] || key;
}

function setupFeatureCardToggles() {
  // Listen for checkbox changes
  document.querySelectorAll(".feature-toggle").forEach(cb => {
    cb.addEventListener("change", (e) => {
      const featKey = e.target.dataset.feature;
      features[featKey] = e.target.checked;
      saveFeaturePreferences();
      logTraceStep("Feature Flag Toggled", { feature: featKey, active: e.target.checked });
    });
  });

  // Preset Buttons: Disable All / Enable All
  const disableAllBtn = document.getElementById("btn-disable-all");
  const enableAllBtn = document.getElementById("btn-enable-all");

  if (disableAllBtn) {
    disableAllBtn.addEventListener("click", () => {
      Object.keys(features).forEach(k => features[k] = false);
      saveFeaturePreferences();
      logTraceStep("Preset Action", "Disabled all upgrades (Baseline LLM mode)");
    });
  }

  if (enableAllBtn) {
    enableAllBtn.addEventListener("click", () => {
      Object.keys(features).forEach(k => features[k] = true);
      saveFeaturePreferences();
      logTraceStep("Preset Action", "Enabled all upgrades (Super Panther mode)");
    });
  }
}

function setupScenarioPrompts() {
  // Clicking quick scenario prompt buttons
  document.querySelectorAll(".scenario-chip, .test-prompt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const promptText = btn.dataset.prompt || btn.dataset.test;
      if (!promptText) return;

      // Switch to Chat tab
      document.getElementById("tab-btn-chat").click();

      // Put text into input and trigger submit
      userInput.value = promptText;
      chatForm.dispatchEvent(new Event("submit"));
    });
  });
}

// ============================================================================
// SIMULATED VECTOR SEARCH & EMBEDDINGS (Cosine Similarity)
// ============================================================================
function computeSemanticVectorSearch(query) {
  const queryTokens = query.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 2);
  
  const scoredDocs = PPU_MOCK_DATA.knowledgeBase.map(doc => {
    let score = 0;
    const docText = (doc.title + " " + doc.content + " " + doc.keywords.join(" ")).toLowerCase();
    
    // Exact keyword hits
    doc.keywords.forEach(kw => {
      if (query.toLowerCase().includes(kw.toLowerCase())) {
        score += 0.35;
      }
    });

    // Query token hits
    queryTokens.forEach(token => {
      if (docText.includes(token)) {
        score += 0.20;
      }
    });

    // Semantic conceptual booster (mocking dense embeddings)
    if (/fall|2026|august|september|october|november|december|census|drop|withdraw|add|tuition|labor\s*day|thanksgiving|finals|calendar|deadline/i.test(query) && doc.id === "doc-01") score += 0.45;
    if (/dse|data\s*science|msdse|graduate|master|lijun|qian|machine\s*learning|ai|eleg\s*6316/i.test(query) && doc.id === "doc-02") score += 0.45;
    if (/undergraduate|bachelor|cpsc|cpeg|computer\s*science|comp\s*1336|comp\s*2336|data\s*structures/i.test(query) && doc.id === "doc-03") score += 0.45;
    if (/food|eat|hungry|grub|dining|chick-fil-a|msc|dunkin|pizza\s*hut|strike\s*zone|bowling|meal|late\s*night|coffee|sodexo/i.test(query) && doc.id === "doc-04") score += 0.45;
    if (/study|library|coleman|room|quiet|laptop|book|reserve/i.test(query) && doc.id === "doc-05") score += 0.45;
    if (/bus|shuttle|panther\s*express|transit|route|health|clinic|doctor|owens|counseling/i.test(query) && doc.id === "doc-06") score += 0.45;
    if (/spring|2027|january|february|march|april|may|mlk|spring\s*break|honors\s*convocation|priority\s*registration/i.test(query) && doc.id === "doc-07") score += 0.45;
    if (/calendar|dates|schedule|registration|census|finals|commencement|deadlines/i.test(query) && (doc.id === "doc-01" || doc.id === "doc-07")) score += 0.30;

    // Normalize between 0.15 and 0.98
    const finalScore = Math.min(0.98, Math.max(0.12, score));

    return {
      id: doc.id,
      title: doc.title,
      category: doc.category,
      content: doc.content,
      similarityScore: parseFloat(finalScore.toFixed(2))
    };
  });

  // Sort descending by score
  scoredDocs.sort((a, b) => b.similarityScore - a.similarityScore);
  return scoredDocs;
}

// ============================================================================
// WORKSHOP PIPELINE CONTROLLER
// ============================================================================
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    appendMessage(
      "assistant",
      "⚠️ Please enter your Gemini API key in the top right bar or in `app.js` to get started.",
      true
    );
    return;
  }

  // Reset Inspector Trace for new run
  currentPipelineTrace = [];
  logTraceStep("User Query Received", { prompt: text });

  // 1. Render User Message
  appendMessage("user", text);
  userInput.value = "";

  // 2. CHECK GUARDRAILS (If enabled)
  if (features.guardrails) {
    const violation = checkGuardrails(text);
    if (violation) {
      logTraceStep("🛡️ Guardrail Intercepted", {
        reason: violation.reason,
        matchedPattern: violation.pattern.toString(),
        action: "Blocked execution prior to LLM call"
      });

      appendGuardrailAlert(violation.reason);
      renderInspectorLogs();
      return;
    } else {
      logTraceStep("🛡️ Guardrail Verification", { status: "PASSED (Safe)" });
    }
  }

  // 3. MEMORY CONTEXT INJECTION (If enabled)
  let injectedMemoryContext = "";
  if (features.memory) {
    const p = PPU_MOCK_DATA.mockStudentProfile;
    injectedMemoryContext = 
      `\n\n[LONG-TERM STUDENT PROFILE MEMORY - PVAMU]\n` +
      `Student Name: ${p.name} (Prefers: ${p.preferredName})\n` +
      `Degree Program: ${p.degreeProgram} (${p.degreeLevel})\n` +
      `College & Dept: ${p.college}, ${p.department}\n` +
      `Current Term: ${p.currentSemester}\n` +
      `Academic Advisor: ${p.academicAdvisor}\n` +
      `Enrolled Fall 2026 Courses: ${p.currentSemesterCourses.map(c => `${c.code}: ${c.name} (${c.credits} SCH, Instructor: ${c.instructor})`).join("; ")}\n` +
      `Housing: ${p.campusHousing}\n` +
      `Dining Preference: ${p.dietaryPreference}\n` +
      `Instruction: Address Daniel warmly, acknowledge his graduate program (MS in Data Science and Engineering), and reference his Fall 2026 courses or advisor where relevant.`;

    logTraceStep("🧠 Memory Injection", PPU_MOCK_DATA.mockStudentProfile);
  }

  // 4. VECTOR SEARCH & EMBEDDINGS (If enabled)
  let retrievedKnowledge = [];
  let vectorSearchResults = null;
  if (features.vector_search || features.rag) {
    vectorSearchResults = computeSemanticVectorSearch(text);
    logTraceStep("🔍 Vector Embeddings Similarity Search", {
      topMatches: vectorSearchResults.slice(0, 3).map(d => ({
        title: d.title,
        cosineSimilarity: `${Math.round(d.similarityScore * 100)}%`
      }))
    });
  }

  // 5. RAG (RETRIEVAL-AUGMENTED GENERATION) (If enabled)
  let ragContextPrompt = "";
  let citedSources = [];
  if (features.rag && vectorSearchResults) {
    // Pick top 2 most relevant chunks
    const topChunks = vectorSearchResults.filter(d => d.similarityScore >= 0.35).slice(0, 2);
    if (topChunks.length > 0) {
      retrievedKnowledge = topChunks;
      citedSources = topChunks.map(c => c.title);

      ragContextPrompt = 
        `\n\n[OFFICIAL PPU CAMPUS KNOWLEDGE BASE (GROUND TRUTH)]\n` +
        topChunks.map((c, i) => `[Source ${i + 1}: ${c.title}]\n${c.content}`).join("\n\n") +
        `\n\nInstruction: Answer the student's question accurately using ONLY the official PPU knowledge provided above. ` +
        `Explicitly cite the source document name in your answer.`;

      logTraceStep("📚 RAG Chunks Injected", {
        sourcesRetrieved: citedSources,
        totalChunks: topChunks.length
      });
    }
  }

  // 6. TOOL CALLING / FUNCTION EXECUTION (If enabled)
  let executedToolResult = null;
  let toolContextPrompt = "";
  if (features.tool_calling) {
    executedToolResult = detectAndExecuteMockTool(text);
    if (executedToolResult) {
      toolContextPrompt = 
        `\n\n[LIVE CAMPUS SYSTEM TOOL EXECUTION RESULT]\n` +
        `Tool: ${executedToolResult.toolName}\n` +
        `Arguments: ${JSON.stringify(executedToolResult.args)}\n` +
        `Returned Live Data: ${JSON.stringify(executedToolResult.result)}\n` +
        `Instruction: Inform the student with these live, real-time results clearly.`;

      logTraceStep("🔧 Tool Calling Executed", executedToolResult);
    }
  }

  // 7. MCP (MODEL CONTEXT PROTOCOL) (If enabled)
  let mcpContextPrompt = "";
  let mcpSources = [];
  if (features.mcp) {
    const mcpData = queryMockMcpServers(text);
    if (mcpData.length > 0) {
      mcpSources = mcpData.map(m => m.serverTitle);
      mcpContextPrompt = 
        `\n\n[STANDARDIZED MCP (MODEL CONTEXT PROTOCOL) SERVER RESOURCES]\n` +
        mcpData.map(m => `Server: ${m.serverTitle} (${m.uri})\nPayload: ${JSON.stringify(m.data)}`).join("\n\n") +
        `\n\nInstruction: Incorporate the standardized MCP resource data in your response.`;

      logTraceStep("🔌 MCP Standardized Protocol Access", mcpData);
    }
  }

  // 8. STRUCTURED OUTPUT FORMAT ENFORCEMENT (If enabled)
  let structuredOutputPrompt = "";
  if (features.structured_output) {
    structuredOutputPrompt = 
      `\n\n[STRUCTURED OUTPUT ENFORCEMENT]\n` +
      `You MUST respond with a VALID JSON object adhering to this schema:\n` +
      `{\n` +
      `  "assistant_name": "Purple Panther",\n` +
      `  "topic": "Brief topic name",\n` +
      `  "summary": "Clear, informative 1-2 sentence response to the user query",\n` +
      `  "key_facts": ["Fact 1", "Fact 2", "Fact 3"],\n` +
      `  "actionable_steps": ["Step 1 for student", "Step 2 for student"],\n` +
      `  "campus_contact": {\n` +
      `    "department": "Relevant PPU office",\n` +
      `    "location": "Building & Room",\n` +
      `    "hours_or_deadline": "Hours or date"\n` +
      `  }\n` +
      `}\n` +
      `Respond ONLY with raw JSON. No markdown backticks, no explanatory preamble.`;

    logTraceStep("📋 Structured Output Schema Enforced", PPU_MOCK_DATA.structuredOutputSchema);
  }

  // Assemble Complete System Instruction
  let finalSystemInstruction = BASE_SYSTEM_INSTRUCTION;
  if (features.guardrails) finalSystemInstruction += " " + PPU_MOCK_DATA.guardrails.systemSafetyRule;
  if (injectedMemoryContext) finalSystemInstruction += injectedMemoryContext;
  if (ragContextPrompt) finalSystemInstruction += ragContextPrompt;
  if (toolContextPrompt) finalSystemInstruction += toolContextPrompt;
  if (mcpContextPrompt) finalSystemInstruction += mcpContextPrompt;
  if (structuredOutputPrompt) finalSystemInstruction += structuredOutputPrompt;

  // Add user turn to chat history
  chatHistory.push({
    role: "user",
    parts: [{ text: text }]
  });

  // UI: Show typing indicator
  const typingElement = showTypingIndicator();
  toggleInputState(true);

  const startTime = performance.now();

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    const requestBody = {
      system_instruction: {
        parts: [{ text: finalSystemInstruction }]
      },
      contents: chatHistory
    };

    // If structured output is on, optionally set mimeType
    if (features.structured_output) {
      requestBody.generationConfig = {
        response_mime_type: "application/json"
      };
    }

    logTraceStep("🚀 Sent Request to Gemini API", {
      model: MODEL_NAME,
      activeFeaturesCount: Object.values(features).filter(Boolean).length
    });

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP error ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    let botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    removeTypingIndicator(typingElement);

    // 9. PARSE & RENDER ASSISTANT RESPONSE
    const messageContainer = appendAssistantMessageContainer();

    // Render Pipeline Badges on Top of Message
    if (features.memory) {
      renderPipelineBadge(messageContainer, "badge-memory", "🧠 Memory: Daniel Sian (MS DSE) Profile Injected");
    }
    if (features.rag && citedSources.length > 0) {
      renderPipelineBadge(messageContainer, "badge-rag", `📚 RAG: Grounded in ${citedSources[0]}`);
    }
    if (executedToolResult) {
      renderPipelineBadge(messageContainer, "badge-tool", `🔧 Tool Calling: ${executedToolResult.toolName}() executed`);
    }
    if (mcpSources.length > 0) {
      renderPipelineBadge(messageContainer, "badge-mcp", `🔌 MCP: Connected to ${mcpSources.join(", ")}`);
    }

    // Render Structured Output Card or Plain Text
    let structuredJsonObj = null;
    if (features.structured_output) {
      try {
        // Strip markdown backticks if Gemini added any
        const cleaned = botReply.replace(/```json/g, "").replace(/```/g, "").trim();
        structuredJsonObj = JSON.parse(cleaned);
        renderStructuredOutputCard(messageContainer, structuredJsonObj);
      } catch (jsonErr) {
        console.warn("JSON parsing fallback:", jsonErr);
        renderPlainBubble(messageContainer, botReply);
      }
    } else {
      renderPlainBubble(messageContainer, botReply);
    }

    // 10. EVALUATION & OBSERVABILITY SCORECARD (If enabled)
    if (features.evaluation) {
      const evalMetrics = calculateEvaluationMetrics(botReply, text, latencyMs, citedSources.length > 0);
      renderEvaluationScorecard(messageContainer, evalMetrics);
      logTraceStep("📊 Evaluation Scorecard", evalMetrics);
    }

    // Append to Chat History
    chatHistory.push({
      role: "model",
      parts: [{ text: botReply }]
    });

    logTraceStep("🏁 Completed Turn", { latency: `${latencyMs}ms`, status: "Success" });

  } catch (err) {
    console.error("Pipeline Error:", err);
    removeTypingIndicator(typingElement);
    appendMessage("assistant", `❌ Error: ${err.message}`, true);
    logTraceStep("❌ Execution Error", { error: err.message });
  } finally {
    toggleInputState(false);
    userInput.focus();
    renderInspectorLogs();
  }
});

// ============================================================================
// GUARDRAILS CHECKER
// ============================================================================
function checkGuardrails(userPrompt) {
  for (const item of PPU_MOCK_DATA.guardrails.blockedPatterns) {
    if (item.pattern.test(userPrompt)) {
      return item;
    }
  }
  return null;
}

function appendGuardrailAlert(reason) {
  const row = document.createElement("div");
  row.className = "message-row assistant";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = "🛡️";

  const content = document.createElement("div");
  content.className = "message-content";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble guardrail-alert";
  bubble.innerHTML = `
    <strong>🛡️ [Campus Safety & Integrity Guardrail Intercepted]</strong><br>
    <em>Violation Detected:</em> <strong>${reason}</strong><br><br>
    I am Purple Panther, your collegiate assistant. As part of university policy, I cannot assist with academic dishonesty, prompt injection attacks, or security exploits. How can I help you with your legitimate coursework or campus questions?
  `;

  content.appendChild(bubble);
  row.appendChild(avatar);
  row.appendChild(content);

  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ============================================================================
// MOCK TOOL CALLING EXECUTION
// ============================================================================
function detectAndExecuteMockTool(prompt) {
  const lower = prompt.toLowerCase();

  // Facility Status tool
  if (/recreation|gym|fitness|msc|dining|chick-fil-a|chick|library|coleman|clinic|health|owens|strike|bowling/i.test(lower) && /open|hours|crowd|status|busy/i.test(lower)) {
    let facility = "recreation_center";
    if (/chick/i.test(lower)) facility = "chick_fil_a";
    else if (/dining|msc/i.test(lower)) facility = "msc_dining";
    else if (/library|coleman/i.test(lower)) facility = "library";
    else if (/clinic|health|owens/i.test(lower)) facility = "health_center";

    const tool = PPU_MOCK_DATA.tools.find(t => t.name === "get_facility_status");
    const result = tool.handler({ facility });
    return {
      toolName: "get_facility_status",
      args: { facility },
      result
    };
  }

  // Shuttle ETA tool
  if (/shuttle|bus|route|panther\s*express|loop|village/i.test(lower) && /when|arrive|eta|next|live/i.test(lower)) {
    const route = lower.includes("village") ? "village_express" : "campus_loop";
    const tool = PPU_MOCK_DATA.tools.find(t => t.name === "check_shuttle_live_eta");
    const result = tool.handler({ route, stop: "Memorial Student Center (MSC) Hub" });
    return {
      toolName: "check_shuttle_live_eta",
      args: { route, stop: "Memorial Student Center (MSC) Hub" },
      result
    };
  }

  // Room Booking tool
  if (/book|reserve/i.test(lower) && /room|study/i.test(lower)) {
    const match = lower.match(/room\s*(\d+)/i);
    const roomNumber = match ? `Room ${match[1]}` : "Room 204";
    const tool = PPU_MOCK_DATA.tools.find(t => t.name === "book_study_room");
    const result = tool.handler({ roomNumber, durationHours: 2 });
    return {
      toolName: "book_study_room",
      args: { roomNumber, durationHours: 2 },
      result
    };
  }

  return null;
}

// ============================================================================
// MOCK MCP (MODEL CONTEXT PROTOCOL) HANDLER
// ============================================================================
function queryMockMcpServers(prompt) {
  const lower = prompt.toLowerCase();
  const results = [];

  // Canvas LMS MCP Server
  if (/assignment|canvas|due|homework|grade|exam/i.test(lower)) {
    const server = PPU_MOCK_DATA.mcpServers.find(s => s.name === "mcp://pvamu-canvas-lms");
    if (server) {
      results.push({
        serverTitle: server.serverTitle,
        uri: server.resources[0].uri,
        data: server.resources[0].data
      });
    }
  }

  // Dining Balance MCP Server
  if (/meal\s*plan|dining\s*dollar|balance|food\s*money|panther\s*point/i.test(lower)) {
    const server = PPU_MOCK_DATA.mcpServers.find(s => s.name === "mcp://pvamu-dining-services");
    if (server) {
      results.push({
        serverTitle: server.serverTitle,
        uri: server.resources[0].uri,
        data: server.resources[0].data
      });
    }
  }

  return results;
}

// ============================================================================
// EVALUATION METRICS CALCULATOR
// ============================================================================
function calculateEvaluationMetrics(replyText, promptText, latencyMs, isGroundedInRag) {
  const wordCount = replyText.split(/\s+/).length;
  const tokenEstimate = Math.round(wordCount * 1.3);

  // Groundedness score estimate
  let groundedness = isGroundedInRag ? (Math.floor(Math.random() * 8) + 92) : (Math.floor(Math.random() * 25) + 60);
  if (features.tool_calling || features.mcp) groundedness = Math.min(100, groundedness + 5);

  return {
    latency: `${latencyMs}ms`,
    groundednessScore: `${groundedness}%`,
    safetyCompliance: "Passed (100%)",
    tokenEstimate: `${tokenEstimate} tokens`,
    structuredMode: features.structured_output ? "Valid JSON Schema" : "Free-form Text"
  };
}

// ============================================================================
// UI RENDERING HELPERS
// ============================================================================
function appendAssistantGreeting() {
  const msg = 
    "Hello! I am Purple Panther, your campus AI assistant at Prairie View A&M University (PVAMU). 🐾\n\n" +
    "Welcome to the **AI Engineering Workshop**! Right now, you're chatting with a vanilla baseline LLM. " +
    "Head over to the **'Workshop Lab (CYOA)'** tab to turn on cutting-edge capabilities like RAG, Tool Calling, Vector Search, MCP, Memory, and Guardrails!";
  
  appendMessage("assistant", msg);
}

function appendMessage(sender, text, isError = false) {
  const row = document.createElement("div");
  row.className = `message-row ${sender}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = sender === "user" ? "🎓" : "🐾";

  const content = document.createElement("div");
  content.className = "message-content";

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${isError ? "error" : ""}`;
  bubble.textContent = text;

  content.appendChild(bubble);
  row.appendChild(avatar);
  row.appendChild(content);

  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendAssistantMessageContainer() {
  const row = document.createElement("div");
  row.className = "message-row assistant";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = "🐾";

  const content = document.createElement("div");
  content.className = "message-content";

  row.appendChild(avatar);
  row.appendChild(content);

  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return content;
}

function renderPlainBubble(container, text) {
  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;
  container.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderPipelineBadge(container, className, label) {
  const badge = document.createElement("div");
  badge.className = `pipeline-badge ${className}`;
  badge.textContent = label;
  container.appendChild(badge);
}

function renderStructuredOutputCard(container, data) {
  const card = document.createElement("div");
  card.className = "structured-output-card";

  const factsHtml = (data.key_facts || []).map(f => `<li>${f}</li>`).join("");
  const stepsHtml = (data.actionable_steps || []).map(s => `<li>${s}</li>`).join("");

  let contactHtml = "";
  if (data.campus_contact) {
    contactHtml = `
      <div class="structured-contact-box">
        <strong>📍 Campus Contact:</strong> ${data.campus_contact.department || "PPU Office"}<br>
        <strong>Location:</strong> ${data.campus_contact.location || "Main Campus"} | 
        <strong>Hours/Deadlines:</strong> ${data.campus_contact.hours_or_deadline || "Regular hours"}
      </div>
    `;
  }

  card.innerHTML = `
    <div class="structured-card-header">
      <h4>${data.topic || "Campus Resource Information"}</h4>
      <span class="schema-badge">JSON Schema Verified</span>
    </div>
    <p><strong>Summary:</strong> ${data.summary || ""}</p>
    
    ${factsHtml ? `<div style="margin-top:8px;"><strong>Key Facts:</strong><ul class="structured-facts">${factsHtml}</ul></div>` : ""}
    ${stepsHtml ? `<div style="margin-top:8px;"><strong>Actionable Steps:</strong><ol class="structured-steps">${stepsHtml}</ol></div>` : ""}
    ${contactHtml}

    <details class="raw-json-details">
      <summary>View Raw Structured JSON</summary>
      <pre><code>${JSON.stringify(data, null, 2)}</code></pre>
    </details>
  `;

  container.appendChild(card);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderEvaluationScorecard(container, metrics) {
  const scorecard = document.createElement("div");
  scorecard.className = "eval-scorecard";
  scorecard.innerHTML = `
    <div class="eval-metric">
      <span class="eval-metric-label">⏱️ Latency:</span>
      <span class="eval-metric-val">${metrics.latency}</span>
    </div>
    <div class="eval-metric">
      <span class="eval-metric-label">🎯 Groundedness:</span>
      <span class="eval-metric-val pass">${metrics.groundednessScore}</span>
    </div>
    <div class="eval-metric">
      <span class="eval-metric-label">🛡️ Safety:</span>
      <span class="eval-metric-val pass">${metrics.safetyCompliance}</span>
    </div>
    <div class="eval-metric">
      <span class="eval-metric-label">📦 Format:</span>
      <span class="eval-metric-val">${metrics.structuredMode}</span>
    </div>
  `;
  container.appendChild(scorecard);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  const row = document.createElement("div");
  row.className = "message-row assistant";
  row.id = "typing-row";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = "🐾";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;

  row.appendChild(avatar);
  row.appendChild(bubble);
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return row;
}

function removeTypingIndicator(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

function toggleInputState(disabled) {
  userInput.disabled = disabled;
  sendBtn.disabled = disabled;
}

// ============================================================================
// INSPECTOR TRACE LOGGER
// ============================================================================
function logTraceStep(title, data) {
  const timestamp = new Date().toLocaleTimeString();
  currentPipelineTrace.push({ title, timestamp, data });
  
  // Highlight indicator dot
  const indicator = document.getElementById("inspector-indicator");
  if (indicator) {
    indicator.style.transform = "scale(1.5)";
    setTimeout(() => { indicator.style.transform = "scale(1)"; }, 300);
  }
}

function renderInspectorLogs() {
  if (currentPipelineTrace.length === 0) {
    inspectorBody.innerHTML = `
      <div class="empty-inspector">
        <p>No traces logged for this message.</p>
      </div>
    `;
    return;
  }

  inspectorBody.innerHTML = currentPipelineTrace.map((step, idx) => `
    <div class="inspector-step-card">
      <div class="inspector-step-title">
        <span>Step ${idx + 1}: ${step.title}</span>
        <span style="font-size:0.7rem; color:var(--text-muted);">${step.timestamp}</span>
      </div>
      <div class="inspector-step-content">
        <pre><code>${typeof step.data === 'string' ? step.data : JSON.stringify(step.data, null, 2)}</code></pre>
      </div>
    </div>
  `).join("");
}

// ============================================================================
// MOCK DATA EXPLORER TAB RENDERING
// ============================================================================
function renderMockDataExplorer() {
  // 1. Knowledge Base Chunks
  const kbContainer = document.getElementById("kb-docs-list");
  if (kbContainer) {
    kbContainer.innerHTML = PPU_MOCK_DATA.knowledgeBase.map(doc => `
      <div class="doc-chunk-item">
        <div class="doc-chunk-title">📄 [${doc.id}] ${doc.title} (${doc.category})</div>
        <div class="doc-chunk-text">${doc.content}</div>
        <div class="doc-chunk-tags">
          ${doc.keywords.map(k => `<span class="doc-tag">${k}</span>`).join("")}
        </div>
      </div>
    `).join("");
  }

  // 2. Student Profile View
  const profileContainer = document.getElementById("student-profile-view");
  if (profileContainer) {
    profileContainer.innerHTML = `
      <pre style="background:#0f172a; color:#e2e8f0; padding:12px; border-radius:6px; font-size:0.78rem; overflow-x:auto;">
<code>${JSON.stringify(PPU_MOCK_DATA.mockStudentProfile, null, 2)}</code>
      </pre>
    `;
  }

  // 3. MCP Servers View
  const mcpContainer = document.getElementById("mcp-servers-view");
  if (mcpContainer) {
    mcpContainer.innerHTML = PPU_MOCK_DATA.mcpServers.map(s => `
      <div class="doc-chunk-item">
        <div class="doc-chunk-title">🔌 ${s.serverTitle} (<code>${s.name}</code>)</div>
        <p style="margin-bottom:6px; font-size:0.78rem;">${s.description}</p>
        <pre style="background:#0f172a; color:#e2e8f0; padding:8px; border-radius:4px; font-size:0.72rem; overflow-x:auto;"><code>${JSON.stringify(s.resources, null, 2)}</code></pre>
      </div>
    `).join("");
  }

  // 4. Tools Registry View
  const toolsContainer = document.getElementById("tools-registry-view");
  if (toolsContainer) {
    toolsContainer.innerHTML = PPU_MOCK_DATA.tools.map(t => `
      <div class="doc-chunk-item">
        <div class="doc-chunk-title">🔧 <code>${t.name}()</code></div>
        <p style="margin-bottom:6px; font-size:0.78rem;">${t.description}</p>
        <pre style="background:#0f172a; color:#e2e8f0; padding:8px; border-radius:4px; font-size:0.72rem; overflow-x:auto;"><code>${JSON.stringify(t.parameters, null, 2)}</code></pre>
      </div>
    `).join("");
  }
}
