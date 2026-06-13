const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const DB_URL = "https://guess-the-imposter-8bac0-default-rtdb.asia-southeast1.firebasedatabase.app";

const params = new URLSearchParams(window.location.search);

const ROOM_ID =
    params.get("room") || "TEST123";

const PLAYER_NAME =
    params.get("player") || "Guest";

document.getElementById("roomInfo").innerText =
    "Room: " + ROOM_ID;

document.getElementById("playerInfo").innerText =
    "Player: " + PLAYER_NAME;

registerPlayer();

async function registerPlayer(){

    await fetch(
        `${DB_URL}/rooms/${ROOM_ID}/players/${PLAYER_NAME}.json`,
        {
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(true)
        }
    );

}

let drawing = false;
let currentColor = "black";

canvas.addEventListener("mousedown", () => {
    drawing = true;
});

canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.beginPath();
});

canvas.addEventListener("mousemove", draw);

function draw(e){

    if(!drawing) return;

    const x = e.clientX;
    const y = e.clientY;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 5;

    ctx.lineTo(x,y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x,y);
}

document.querySelectorAll(".color")
.forEach(btn=>{

    btn.addEventListener("click",()=>{

        currentColor =
            btn.dataset.color;

    });

});

document
.getElementById("eraser")
.addEventListener("click",()=>{

    currentColor="#f0f0f0";

});

document
.getElementById("clear")
.addEventListener("click",()=>{

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

});
