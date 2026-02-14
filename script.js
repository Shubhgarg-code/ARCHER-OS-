/* ================ A.R.C.H.E.R OS PHASE 6 — STABLE FINAL ================= */

/* ELEMENTS */
const activateScreen = document.getElementById("activateScreen");
const bootScreen = document.getElementById("bootScreen");
const bootText = document.getElementById("bootText");
const progressBar = document.getElementById("progressBar");
const hud = document.getElementById("hud");
const alertOverlay = document.getElementById("alertOverlay");

const weaponName = document.getElementById("weaponName");
const energyVal = document.getElementById("energyVal");
const heatVal = document.getElementById("heatVal");

const consoleLog = document.getElementById("consoleLog");
const commandInput = document.getElementById("commandInput");
const radar = document.querySelector(".radar");

/* ----------------- SYSTEM STATE ----------------- */
let energy = parseInt(localStorage.getItem("archer_energy")) || 100;
let heat = parseInt(localStorage.getItem("archer_heat")) || 0;
let weaponIndex = parseInt(localStorage.getItem("archer_weapon")) || 0;
const weapons = ["Repulsor Beam", "Plasma Blade", "Micro Missiles"];
weaponName.textContent = weapons[weaponIndex];
energyVal.textContent = energy + "%";
heatVal.textContent = heat + "%";

const missions = [
  { name: "Secure perimeter", completed: false },
  { name: "Neutralize hostiles", completed: false },
  { name: "Protect core systems", completed: false }
];
let currentMission = parseInt(localStorage.getItem("archer_mission")) || 0;

/* ----------------- LOG ----------------- */
function log(text) {
  const p = document.createElement("p");
  p.textContent = "> " + text;
  consoleLog.appendChild(p);
  consoleLog.scrollTop = consoleLog.scrollHeight;
}

/* ----------------- VOICE ----------------- */
function speak(text) {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  if (!voices.length) {
    // Wait until voices are loaded
    setTimeout(() => speak(text), 100);
    return;
  }
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.9;
  msg.pitch = 0.9;
  speechSynthesis.cancel();
  synth.speak(msg);
}

/* ----------------- WEAPONS ----------------- */
function fireWeapon() {
  if (energy <= 0) {
    speak("Energy depleted, cannot fire");
    log("Weapon disabled. Energy low.");
    return;
  }
  energy -= 5;
  heat += 10;
  energyVal.textContent = energy + "%";
  heatVal.textContent = heat + "%";
  document.body.classList.add("shake");
  speak("Firing " + weapons[weaponIndex]);
  log("Fired " + weapons[weaponIndex]);
  setTimeout(() => document.body.classList.remove("shake"), 300);
  localStorage.setItem("archer_energy", energy);
  localStorage.setItem("archer_heat", heat);
}

function switchWeapon() {
  weaponIndex = (weaponIndex + 1) % weapons.length;
  weaponName.textContent = weapons[weaponIndex];
  speak(weapons[weaponIndex] + " selected");
  log("Weapon switched to " + weapons[weaponIndex]);
  localStorage.setItem("archer_weapon", weaponIndex);
}

/* ----------------- RADAR ----------------- */
function spawnThreat() {
  const dot = document.createElement("div");
  dot.style.position = "absolute";
  dot.style.width = "6px";
  dot.style.height = "6px";
  dot.style.borderRadius = "50%";
  dot.style.background = "red";
  dot.style.top = Math.random() * 120 + "px";
  dot.style.left = Math.random() * 120 + "px";
  radar.appendChild(dot);
  speak("Threat detected");
  log("Threat detected on radar");
  setTimeout(() => dot.remove(), 5000);
}

function spawnThreatLoop() {
  setInterval(() => {
    if (Math.random() > 0.4) spawnThreat();
  }, 6000);
}

/* ----------------- MISSION SYSTEM ----------------- */
function startMission() {
  if (currentMission < missions.length) {
    speak("New mission assigned: " + missions[currentMission].name);
    log("Mission: " + missions[currentMission].name);
  } else {
    speak("All missions completed");
    log("All missions completed");
  }
}

function completeMission() {
  if (currentMission < missions.length) {
    missions[currentMission].completed = true;
    speak("Mission completed: " + missions[currentMission].name);
    log("Mission completed: " + missions[currentMission].name);
    currentMission++;
    localStorage.setItem("archer_mission", currentMission);
    startMission();
    energy = Math.min(100, energy + 10);
    heat = Math.max(0, heat - 10);
    energyVal.textContent = energy + "%";
    heatVal.textContent = heat + "%";
    localStorage.setItem("archer_energy", energy);
    localStorage.setItem("archer_heat", heat);
  }
}

/* ----------------- BOOT SEQUENCE ----------------- */
activateScreen.onclick = () => {
  activateScreen.style.display = "none";
  bootScreen.style.display = "flex";

  // Speak boot only after user click and voices ready
  setTimeout(() => speak("Initializing Archer OS"), 200);

  const bootSteps = [
    "Initializing core modules",
    "Calibrating neural HUD",
    "Syncing power systems",
    "Running diagnostics",
    "Finalizing interface"
  ];

  let step = 0;
  const bootInterval = setInterval(() => {
    if (step < bootSteps.length) {
      bootText.textContent = bootSteps[step];
      progressBar.style.width = ((step + 1) / bootSteps.length) * 100 + "%";
      step++;
    } else {
      clearInterval(bootInterval);
      bootScreen.style.display = "none";
      hud.style.display = "block";
      speak("All systems online");

      startMission();
      spawnThreatLoop();

      // Start voice recognition AFTER boot completes
      initVoiceRecognition();
    }
  }, 800);
};

/* ----------------- KEYBOARD & MOBILE ----------------- */
document.addEventListener("keydown", e => {
  if (e.key === " ") fireWeapon();
  if (e.key.toLowerCase() === "w") switchWeapon();
});
document.body.addEventListener("click", fireWeapon);

/* ----------------- CONSOLE COMMANDS ----------------- */
commandInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const cmd = commandInput.value.toLowerCase();
    log(cmd);
    commandInput.value = "";
    handleCommand(cmd);
  }
});

function handleCommand(cmd) {
  if (cmd.includes("scan")) speak("Scanning area...");
  else if (cmd.includes("alert")) alertOverlay.style.display = "block";
  else if (cmd.includes("normal")) alertOverlay.style.display = "none";
  else if (cmd.includes("fire")) fireWeapon();
  else if (cmd.includes("switch")) switchWeapon();
  else if (cmd.includes("mission")) startMission();
  else if (cmd.includes("complete")) completeMission();
  else if (cmd.includes("shutdown")) shutdownSequence();
  else speak("Command not recognized");
}

/* ----------------- VOICE RECOGNITION ----------------- */
function initVoiceRecognition() {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = function(event) {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      log("[Voice] " + transcript);
      handleCommand(transcript);
    };
    recognition.start();
  }
}

/* ----------------- CINEMATIC SHUTDOWN ----------------- */
function shutdownSequence() {
  speak("Shutting down systems");
  hud.style.display = "none";
  alertOverlay.style.display = "none";
  document.body.style.filter = "brightness(0)";
  setTimeout(() => location.reload(), 4000);
}

/* ----------------- HEAT & ENERGY ----------------- */
setInterval(() => {
  heat = Math.max(0, heat - 3);
  heatVal.textContent = heat + "%";

  if (heat >= 80) speak("Warning. System overheating");
  if (energy <= 20) speak("Warning. Energy critically low");

  localStorage.setItem("archer_heat", heat);
  localStorage.setItem("archer_energy", energy);
}, 2000);
