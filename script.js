const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const DB_URL = "https://guess-the-imposter-8bac0-default-rtdb.asia-southeast1.firebasedatabase.app";

let drawing = false;
let currentColor = "black";
let currentSize = 5;

let loaded = {};

canvas.addEventListener("mousedown", () => {
    drawing = true;
});

canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.beginPath();
});

canvas.addEventListener("mouseleave", () => {
    drawing = false;
    ctx.beginPath();
});

canvas.addEventListener("mousemove", draw);

function draw(e) {
    if (!drawing) return;

    const x = e.clientX;
    const y = e.clientY;

    ctx.lineWidth = currentSize;
    ctx.strokeStyle = currentColor;
    ctx.lineCap = "round";

    ctx.lineTo(x, y);
    ctx.stroke();

    pushPoint(x, y, currentColor, currentSize);

    ctx.beginPath();
    ctx.moveTo(x, y);
}

async function pushPoint(x, y, color, size) {
    try {
        await fetch(`${DB_URL}/board.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                x: x,
                y: y,
                color: color,
                size: size
            })
        });
    } catch (err) {
        console.log(err);
    }
}

async function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    loaded = {};

    try {
        await fetch(`${DB_URL}/board.json`, {
            method: "DELETE"
        });
    } catch (err) {
        console.log(err);
    }
}

async function syncBoard() {
    try {
        const res = await fetch(`${DB_URL}/board.json`);
        const data = await res.json();

        if (!data) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            loaded = {};
            return;
        }

        Object.keys(data).forEach(key => {

            if (loaded[key]) return;

            loaded[key] = true;

            const point = data[key];

            ctx.fillStyle = point.color || "black";

            ctx.fillRect(
                point.x,
                point.y,
                point.size || 4,
                point.size || 4
            );
        });

    } catch (err) {
        console.log(err);
    }
}

setInterval(syncBoard, 300);

document.getElementById("clear").addEventListener("click", clearBoard);

document.querySelectorAll(".color").forEach(btn => {
    btn.addEventListener("click", () => {
        currentColor = btn.dataset.color;
    });
});

document.getElementById("size").addEventListener("change", e => {
    currentSize = Number(e.target.value);
});

document.getElementById("eraser").addEventListener("click", () => {
    currentColor = "#f0f0f0";
});
