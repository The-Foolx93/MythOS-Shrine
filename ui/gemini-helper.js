// gemini-helper.js - Helper for calling Gemini from the frontend
// The backend will expose Gemini generation as an API endpoint

export async function generateWithGemini(prompt) {
  try {
    const response = await fetch("http://localhost:3000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const { text } = await response.json();
    return text;
  } catch (err) {
    console.error("Gemini generation failed:", err);
    throw err;
  }
}
