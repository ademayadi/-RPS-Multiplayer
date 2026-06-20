const socket = io();

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("msgInput");
const status = document.getElementById("status");
const result = document.getElementById("gameResult");

// connexion
socket.on("connect", () => {
    status.innerText = "Connecté";
});

// chat
socket.on("chatMessage", (msg) => {
    const div = document.createElement("div");
    div.innerText = msg;
    chatBox.appendChild(div);
});

// envoyer chat
function sendMessage() {
    const msg = input.value;
    if (!msg) return;

    socket.emit("chatMessage", msg);
    input.value = "";
}

// jouer
function play(choice) {
    socket.emit("choice", choice);
}

// résultat + score
socket.on("result", (data) => {

    result.innerText =
        data.msg +
        " | Score : " +
        data.score.p1 +
        " - " +
        data.score.p2;
});

// joueur assigné
socket.on("playerAssigned", (data) => {
    status.innerText = "Vous êtes Joueur " + data.number;
});

// salle pleine
socket.on("roomFull", () => {
    status.innerText = "Salle pleine";
});