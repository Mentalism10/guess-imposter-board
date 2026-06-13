const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;

canvas.addEventListener("mousedown", () => {
    drawing = true;
});

canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.beginPath();
});

canvas.addEventListener("mousemove", draw);

function draw(e) {
    if (!drawing) return;

    const x = e.clientX;
    const y = e.clientY;

    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    ctx.lineTo(x, y);
    ctx.stroke();

    pushPoint(x, y);
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fetch(
        "https://guess-the-imposter-8bac0-default-rtdb.asia-southeast1.firebasedatabase.app/board.json",
        {
            method: "DELETE"
        }
    );
}

async function pushPoint(x, y) {
    await fetch(
        "https://guess-the-imposter-8bac0-default-rtdb.asia-southeast1.firebasedatabase.app/board.json",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                x: x,
                y: y
            })
        }
    );
}

let loaded = {};

async function syncBoard() {
    const res = await fetch(
        "https://guess-the-imposter-8bac0-default-rtdb.asia-southeast1.firebasedatabase.app/board.json"
    );

    const data = await res.json();

    if (!data) return;

    Object.keys(data).forEach(key => {

        if (loaded[key]) return;

        loaded[key] = true;

        const point = data[key];

        ctx.fillRect(
            point.x,
            point.y,
            4,
            4
        );
    });
}

setInterval(syncBoard, 500);

document
.getElementById("clear")
.addEventListener("click", clearBoard);
