const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const DB_URL =
"https://guess-the-imposter-8bac0-default-rtdb.asia-southeast1.firebasedatabase.app";

const params = new URLSearchParams(window.location.search);

const ROOM_ID = params.get("room") || "TEST123";
const PLAYER_NAME = params.get("player") || "Guest";

document.getElementById("roomInfo").innerText =
"Room: " + ROOM_ID;

document.getElementById("playerInfo").innerText =
"Player: " + PLAYER_NAME;

let drawing = false;
let currentColor = "black";

let lastX = 0;
let lastY = 0;

let loadedLines = {};

registerPlayer();

async function registerPlayer() {

    await fetch(
        `${DB_URL}/rooms/${ROOM_ID}/players/${PLAYER_NAME}.json`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(true)
        }
    );

}

canvas.addEventListener("mousedown", (e) => {

    drawing = true;

    const rect = canvas.getBoundingClientRect();

    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;

});

canvas.addEventListener("mouseup", () => {

    drawing = false;

});

canvas.addEventListener("mouseleave", () => {

    drawing = false;

});

canvas.addEventListener("mousemove", draw);

async function draw(e) {

    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawLine(
        lastX,
        lastY,
        x,
        y,
        currentColor
    );

    await pushLine(
        lastX,
        lastY,
        x,
        y,
        currentColor
    );

    lastX = x;
    lastY = y;

}

function drawLine(x1, y1, x2, y2, color) {

    ctx.beginPath();

    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.stroke();

}

async function pushLine(
    x1,
    y1,
    x2,
    y2,
    color
) {

    await fetch(
        `${DB_URL}/rooms/${ROOM_ID}/drawings.json`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                x1,
                y1,
                x2,
                y2,
                color
            })
        }
    );

}

async function syncBoard() {

    try {

        const response = await fetch(
            `${DB_URL}/rooms/${ROOM_ID}/drawings.json`
        );

        const data = await response.json();

        if (!data) return;

        Object.keys(data).forEach(key => {

            if (loadedLines[key]) return;

            loadedLines[key] = true;

            const line = data[key];

            drawLine(
                line.x1,
                line.y1,
                line.x2,
                line.y2,
                line.color
            );

        });

    } catch (err) {

        console.log(err);

    }

}

setInterval(syncBoard, 200);

document
.querySelectorAll(".color")
.forEach(btn => {

    btn.addEventListener("click", () => {

        currentColor =
        btn.dataset.color;

    });

});

document
.getElementById("eraser")
.addEventListener("click", () => {

    currentColor = "#f0f0f0";

});

document
.getElementById("clear")
.addEventListener("click", async () => {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    loadedLines = {};

    await fetch(
        `${DB_URL}/rooms/${ROOM_ID}/drawings.json`,
        {
            method: "DELETE"
        }
    );

});
