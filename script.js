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
`Room: ${ROOM_ID}`;

document.getElementById("playerInfo").innerText =
`Player: ${PLAYER_NAME}`;

const turnPlayer =
document.getElementById("turnPlayer");

const timerText =
document.getElementById("timer");

const finishTurn =
document.getElementById("finishTurn");

let drawing = false;
let currentColor = "black";
let canDraw = false;

let loadedKeys = new Set();
let isHost = PLAYER_NAME === "Ram";

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

registerPlayer();

canvas.addEventListener("mousedown", (e) => {

    if (!canDraw) return;

    drawing = true;

    const rect =
    canvas.getBoundingClientRect();

    const x =
    e.clientX - rect.left;

    const y =
    e.clientY - rect.top;

    drawDot(x, y, currentColor);

    pushPoint(x, y, currentColor);

});

canvas.addEventListener("mouseup", () => {

    drawing = false;

});

canvas.addEventListener("mouseleave", () => {

    drawing = false;

});

canvas.addEventListener("mousemove", (e) => {

    if (!drawing || !canDraw) return;

    const rect =
    canvas.getBoundingClientRect();

    const x =
    e.clientX - rect.left;

    const y =
    e.clientY - rect.top;

    drawDot(x, y, currentColor);

    pushPoint(x, y, currentColor);

});

function drawDot(x, y, color) {

    ctx.fillStyle = color;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();

}

async function pushPoint(x, y, color) {

    fetch(
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

    try {

        const response = await fetch(
            `${DB_URL}/rooms/${ROOM_ID}/drawings.json`
        );

        const data =
        await response.json();

        if (!data) {
            loadedKeys.clear();
            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );
            return;
        }

        Object.entries(data).forEach(
        ([key, point]) => {

            if (
                loadedKeys.has(key)
            ) return;

            loadedKeys.add(key);

            drawDot(
                point.x,
                point.y,
                point.color
            );

        });

    }

    catch(err) {

        console.log(err);

    }

}

async function syncGame() {

    try {

        const gameResponse =
        await fetch(
            `${DB_URL}/rooms/${ROOM_ID}/game.json`
        );

        const game =
        await gameResponse.json();

        if (!game) return;

        const playersResponse =
        await fetch(
            `${DB_URL}/rooms/${ROOM_ID}/players.json`
        );

        const playersData =
        await playersResponse.json();

        if (!playersData) return;

        const playerList =
        Object.keys(playersData);

        if (
            playerList.length === 0
        ) return;

        const currentPlayer =
        playerList[
            game.currentTurn
        ];

        turnPlayer.innerText =
        "Current Turn: " +
        currentPlayer;

        timerText.innerText =
        "Time Left: " +
        game.timeLeft +
        "s";

        canDraw =
        currentPlayer ===
        PLAYER_NAME;

        finishTurn.disabled =
        !canDraw;

    }

    catch(err) {

        console.log(err);

    }

}

finishTurn.addEventListener(
"click",
async () => {

    try {

        const playersResponse =
        await fetch(
            `${DB_URL}/rooms/${ROOM_ID}/players.json`
        );

        const playersData =
        await playersResponse.json();

        const playerList =
        Object.keys(playersData);

        const gameResponse =
        await fetch(
            `${DB_URL}/rooms/${ROOM_ID}/game.json`
        );

        const game =
        await gameResponse.json();

        let nextTurn =
        game.currentTurn + 1;

        if (
            nextTurn >= playerList.length
        ) {

            nextTurn = 0;

        }

        await fetch(
            `${DB_URL}/rooms/${ROOM_ID}/drawings.json`,
            {
                method: "DELETE"
            }
        );

        loadedKeys.clear();

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        await fetch(
            `${DB_URL}/rooms/${ROOM_ID}/game.json`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type":
                    "application/json"
                },
                body: JSON.stringify({
                    currentTurn: nextTurn,
                    timeLeft: 20
                })
            }
        );

    }

    catch(err) {

        console.log(err);

    }

});

document
.querySelectorAll(".color")
.forEach(btn => {

    btn.addEventListener(
    "click",
    () => {

        currentColor =
        btn.dataset.color;

    });

});

document
.getElementById("eraser")
.addEventListener(
"click",
() => {

    currentColor =
    "#f0f0f0";

});

setInterval(
    syncBoard,
    300
);

setInterval(
    syncGame,
    1000
);

syncBoard();
syncGame();
