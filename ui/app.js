// ui/app.js

// REST endpoint on port 3000
const REST = "http://localhost:3000/pulse";

// WebSocket on the same port
const WS = new WebSocket("ws://localhost:3000/pulse");

WS.addEventListener("open",    () => console.log("🔌 WS open"));
WS.addEventListener("error",   e  => console.error("❌ WS error", e));
WS.addEventListener("message", e  => {
  console.log("📨 WS msg", e.data);
  try {
    const { payload } = JSON.parse(e.data);
    const li = document.createElement("li");
    const time = new Date(payload.timestamp)
      .toLocaleTimeString("en-US", { hour12: false });
    li.textContent = `[${time}] ${payload.text}`;
    document.getElementById("pulses").prepend(li);
  } catch (err) {
    console.error("Invalid WS data:", err, e.data);
  }
});

document.getElementById("log").addEventListener("click", async () => {
  const text = prompt("Enter your pulse:");
  if (!text) return;
  try {
    const res = await fetch(REST, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ text })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error("POST /pulse failed:", err);
    alert("Error posting pulse; check console.");
  }
});
