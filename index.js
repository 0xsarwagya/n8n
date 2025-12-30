const { spawn } = require("child_process");
const http = require("http");

// ======================
// Start n8n
// ======================
console.log("Starting n8n...");

const n8n = spawn("npm", ["run" , "n8n"], {
  stdio: "inherit",
  shell: true
});

n8n.on("exit", (code) => {
  console.error(`n8n exited with code ${code}`);
  process.exit(code);
});

// ======================
// Ping Cron (30s)
// ======================
const N8N_URL = process.env.N8N_URL || "http://localhost:5678/healthz";

function pingN8N() {
  const req = http.get(N8N_URL, (res) => {
    console.log(
      `[PING] ${new Date().toISOString()} - Status: ${res.statusCode}`
    );
  });

  req.on("error", (err) => {
    console.error(
      `[PING ERROR] ${new Date().toISOString()} - ${err.message}`
    );
  });
}

console.log("Heartbeat: every 30 seconds");
pingN8N();
setInterval(pingN8N, 30000);

// ======================
// Cleanup
// ======================
process.on("SIGINT", () => {
  console.log("Stopping...");
  n8n.kill("SIGINT");
  process.exit();
});