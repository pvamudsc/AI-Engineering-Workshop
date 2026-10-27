/**
 * Purple Panther - Campus AI Assistant
 * AI Engineering Workshop - Simple Chat App
 */

// ============================================================================
// CONFIGURATION
// You can paste your Gemini API key directly here, or enter it in the browser UI.
// ============================================================================
const GEMINI_API_KEY = ""; // e.g. "AIzaSy..."

// The Gemini model to use
const MODEL_NAME = "gemini-3.6-flash";

// System persona instruction guiding Purple Panther's answers
const SYSTEM_INSTRUCTION = 
  "You are Purple Panther, a friendly, encouraging, and helpful AI campus assistant for university students. " +
  "Always introduce yourself as Purple Panther. " +
  "You answer student questions about campus resources (library, financial aid, career center, health & wellness), " +
  "academic policies (grading, course drop/add deadlines, credits), campus life, and study strategies. " +
  "Keep your answers concise, approachable, and student-friendly. " +
  "If you do not know a specific university policy, provide helpful general college guidance and suggest visiting the relevant campus department.";

// ============================================================================
// STATE & DOM ELEMENTS
// ============================================================================
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const apiKeyInput = document.getElementById("api-key-input");
const saveKeyBtn = document.getElementById("save-key-btn");

// Multi-turn conversation history stored for the Gemini API
let chatHistory = [];

// ============================================================================
// INITIALIZATION
// ============================================================================
window.addEventListener("DOMContentLoaded", () => {
  // Check if API key is stored in localStorage or hardcoded in script
  const savedKey = localStorage.getItem("GEMINI_API_KEY") || GEMINI_API_KEY;
  if (savedKey) {
    apiKeyInput.value = savedKey;
  }

  // Display initial assistant greeting
  appendMessage(
    "assistant",
    "Hello! I am Purple Panther, your campus AI assistant. 🐾\n\nAsk me anything about campus resources, academic policies, tutoring, or student life!"
  );
});

// Save API key handler
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

// Helper to retrieve active API Key
function getApiKey() {
  return apiKeyInput.value.trim() || localStorage.getItem("GEMINI_API_KEY") || GEMINI_API_KEY;
}

// ============================================================================
// CHAT & GEMINI API LOGIC
// ============================================================================
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    appendMessage(
      "assistant",
      "⚠️ Please enter your Gemini API key in the top bar or set `GEMINI_API_KEY` in `app.js` to get started.",
      true
    );
    return;
  }

  // 1. Render User Message
  appendMessage("user", text);
  userInput.value = "";

  // 2. Add to multi-turn conversation history
  chatHistory.push({
    role: "user",
    parts: [{ text: text }]
  });

  // 3. Show typing indicator
  const typingElement = showTypingIndicator();
  toggleInputState(true);

  try {
    // 4. Call Google Gemini REST API directly using gemini-3.6-flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: chatHistory
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP error ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    // 5. Append Assistant Response to Chat & History
    removeTypingIndicator(typingElement);
    appendMessage("assistant", botReply);

    chatHistory.push({
      role: "model",
      parts: [{ text: botReply }]
    });

  } catch (err) {
    console.error("Gemini API Error:", err);
    removeTypingIndicator(typingElement);
    appendMessage("assistant", `❌ Error: ${err.message}`, true);
  } finally {
    toggleInputState(false);
    userInput.focus();
  }
});

// ============================================================================
// UI HELPERS
// ============================================================================
function appendMessage(sender, text, isError = false) {
  const row = document.createElement("div");
  row.className = `message-row ${sender}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = sender === "user" ? "🎓" : "🐾";

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${isError ? "error" : ""}`;
  bubble.textContent = text;

  row.appendChild(avatar);
  row.appendChild(bubble);

  chatMessages.appendChild(row);
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
