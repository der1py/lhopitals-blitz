document.getElementById("testLevelBtn").addEventListener("click", () => {
  window.open("playTest.html", "_blank");
});

const canvas = document.getElementById("editorCanvas");
const ctx = canvas.getContext("2d");

const CELL_SIZE = 30;
const GRID_WIDTH = 40;
const GRID_HEIGHT = 12;

// fixed canvas size
canvas.width = GRID_WIDTH * CELL_SIZE;
canvas.height = GRID_HEIGHT * CELL_SIZE;

// create empty grid
function createEmptyStructure(width, height) {
  return Array.from({ length: width }, () =>
    Array(height).fill(0)
  );
}

let structure = 
localStorage.getItem("playtestStructure")
  ? normalizeStructure(localStorage.getItem("playtestStructure"))
  : createEmptyStructure(GRID_WIDTH, GRID_HEIGHT);

let selectedType = 1;
let selectedTile = null;
let isMouseDown = false;

// palette
document.querySelectorAll("#palette button").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedType = Number(btn.dataset.type);
  });
});

// paint
function paintTile(e) {
  const rect = canvas.getBoundingClientRect();

  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

  if (
    x < 0 || y < 0 ||
    x >= GRID_WIDTH || y >= GRID_HEIGHT
  ) return;

  if (structure[x][y] === selectedType) return;

  structure[x][y] = selectedType;
  selectedTile = { x, y };

  saveStructure();
}

// mouse
canvas.addEventListener("mousedown", (e) => {
  e.preventDefault();
  isMouseDown = true;
  paintTile(e);
});

canvas.addEventListener("mouseup", () => isMouseDown = false);
canvas.addEventListener("mouseleave", () => isMouseDown = false);

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();

  const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

  selectedTile = { x, y };

  if (isMouseDown) paintTile(e);
});

// editor loop, including draawing + other continuous updates
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {

      const type = structure[x][y];

      switch (type) {
        case 1: ctx.fillStyle = "black"; break;
        case 2: ctx.fillStyle = "red"; break;
        case 3: ctx.fillStyle = "green"; break;
        case 4: ctx.fillStyle = "gold"; break;
        default: ctx.fillStyle = "#c6f6ff";
      }

      ctx.fillRect(
        x * CELL_SIZE,
        y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );

      ctx.lineWidth = 1;
      ctx.strokeStyle = "#333";
      ctx.strokeRect(
        x * CELL_SIZE,
        y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  if (selectedTile) {
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      selectedTile.x * CELL_SIZE,
      selectedTile.y * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
    );
  }

  saveStructure();

  requestAnimationFrame(loop);
}

loop();

// update local storage
function saveStructure() {
    // save to local storage for playtesting
    const trimmed = trimStructure(structure);

    const formatted = "[\n" +
        trimmed.map(col => "  " + JSON.stringify(col)).join(",\n") +
        "\n]";
    localStorage.setItem("playtestStructure", formatted);
    console.log(localStorage); // weird ass bug, breaks without the console.log
}

// clear
document.getElementById("clearBtn").addEventListener("click", () => {
    const confirmed = confirm("Are you sure you want to clear the entire level?");
    if (!confirmed) return;
    structure = createEmptyStructure(GRID_WIDTH, GRID_HEIGHT);
});

// export (trim empty space)
function trimStructure(grid) {
  let minX = GRID_WIDTH, maxX = -1;
  let maxY = -1; // only track bottom

  // find bounds
  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (grid[x][y] !== 0) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  // all empty
  if (maxX === -1) return [[0]];

  const trimmed = [];

  for (let x = minX; x <= maxX; x++) {
    const col = [];
    for (let y = 0; y <= maxY; y++) { // 👈 keep top air
      col.push(grid[x][y]);
    }
    trimmed.push(col);
  }

  return trimmed;
}

document.getElementById("exportBtn").addEventListener("click", () => {
  const trimmed = trimStructure(structure);

  const formatted = "[\n" +
    trimmed.map(col => "  " + JSON.stringify(col)).join(",\n") +
    "\n]";

  navigator.clipboard.writeText(formatted)
    .then(() => alert("Copied to clipboard!"))
    .catch(() => alert("Failed to copy"));
});

// import (normalize to grid size)
function normalizeStructure(parsed) {
  const newGrid = createEmptyStructure(GRID_WIDTH, GRID_HEIGHT);

  for (let x = 0; x < Math.min(parsed.length, GRID_WIDTH); x++) {
    for (let y = 0; y < Math.min(parsed[x].length, GRID_HEIGHT); y++) {

      let val = parsed[x][y];

      // sanitize invalid values
      if (typeof val !== "number" || val < 0 || val > 4) {
        val = 0;
      }

      newGrid[x][y] = val;
    }
  }

  return newGrid;
}

document.getElementById("importBtn").addEventListener("click", () => {
  const input = prompt("Paste your structure JSON here:");

  if (!input) return;

  try {
    const parsed = JSON.parse(input);

    if (!Array.isArray(parsed) || !Array.isArray(parsed[0])) {
      alert("Invalid structure format!");
      return;
    }

    structure = normalizeStructure(parsed);
    selectedTile = null;

  } catch {
    alert("Invalid JSON!");
  }
});


const paletteButtons = document.querySelectorAll("#palette button");

// update buttons on click
paletteButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedType = Number(btn.dataset.type);

    // remove highlight from all
    paletteButtons.forEach(b => b.classList.remove("selected"));

    // add highlight to clicked one
    btn.classList.add("selected");
  });
});


// update button on load
paletteButtons.forEach(btn => {
  if (Number(btn.dataset.type) === selectedType) {
    btn.classList.add("selected");
  }
});