const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const MAX_PLAYERS = 2;

let players = [];
let choices = {};
let score = { p1: 0, p2: 0 };

io.on("connection", (socket) => {

    if (players.length >= MAX_PLAYERS) {
        socket.emit("roomFull", "Salle pleine");
        socket.disconnect();
        return;
    }

    players.push(socket.id);

    socket.emit("playerAssigned", {
        number: players.length
    });

    socket.emit("scoreUpdate", score);

    // CHAT
    socket.on("chatMessage", (msg) => {
        io.emit("chatMessage", msg);
    });

    // CHOIX
    socket.on("choice", (choice) => {

        choices[socket.id] = choice;

        if (Object.keys(choices).length === 2) {

            const p1 = players[0];
            const p2 = players[1];

            const c1 = choices[p1];
            const c2 = choices[p2];

            const result = getResult(c1, c2);

            let msg = "";

            if (result === "draw") {
                msg = "Égalité !";
            }

            if (result === "p1") {
                score.p1++;
                msg = "Joueur 1 gagne !";
            }

            if (result === "p2") {
                score.p2++;
                msg = "Joueur 2 gagne !";
            }

            io.emit("result", {
                msg,
                c1,
                c2,
                score
            });

            choices = {};
        }
    });

    socket.on("disconnect", () => {
        players = players.filter(id => id !== socket.id);
        delete choices[socket.id];
    });

});

function getResult(a, b) {

    if (a === b) return "draw";

    if (
        (a === "pierre" && b === "ciseaux") ||
        (a === "feuille" && b === "pierre") ||
        (a === "ciseaux" && b === "feuille")
    ) {
        return "p1";
    }

    return "p2";
}

server.listen(3000, () => {
    console.log("🚀 Serveur lancé http://localhost:3000");
});