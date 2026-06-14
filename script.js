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

let loadedPoints = {};

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

canvas.addEventListener("mousedown", () => {

    drawing = true;

});

canvas.addEventListener("mouseup", () => {

    drawing = false;
    ctx.beginPath();

});

canvas.addEventListener("mousemove", draw);

async function draw(e) {

    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    ctx.lineTo(x, y);
    ctx.stroke();

    await pushPoint(
        x,
        y,
        currentColor
    );

    ctx.beginPath();
    ctx.moveTo(x, y);

}

async function pushPoint(x, y, color) {

    await fetch(
        `${DB_URL}/rooms/${ROOM_ID}/drawings.json`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                x,
                y,
                color
            })
        }
    );

}

async function syncBoard() {

    const response = await fetch(
        `${DB_URL}/rooms/${ROOM_ID}/drawings.json`
    );

    const data = await response.json();

    if (!data) return;

    Object.keys(data).forEach(key => {

        if (loadedPoints[key]) return;

        loadedPoints[key] = true;

        const point = data[key];

        ctx.fillStyle = point.color;

        ctx.fillRect(
            point.x,
            point.y,
            4,
            4
        );

    });

}

setInterval(syncBoard, 500);

document.querySelectorAll(".color")
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

    loadedPoints = {};

    await fetch(
        `${DB_URL}/rooms/${ROOM_ID}/drawings.json`,
        {
            method: "DELETE"
        }
    );

});
