const N = 10;
const cells = Array.from({ length: N }, () => Array(N).fill(0));
let currentPlayer = 1; // 1: người, 2: AI
let gameStarted = false;

const boardDiv = document.getElementById("board");
let timeLeft = 10;
let timerId = null;

// ================= TẠO BÀN CỜ =================
function createBoard() {
    boardDiv.innerHTML = "";
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.style.width = "50px";
            cell.style.height = "50px";
            cell.style.border = "1px solid #333";
            cell.style.display = "flex";
            cell.style.alignItems = "center";
            cell.style.justifyContent = "center";
            cell.style.cursor = "pointer";
            cell.style.userSelect = "none";
            cell.style.fontSize = "20px";
            cell.style.background = "#fff";

            cell.addEventListener("click", () => handleClick(cell, i, j));
            boardDiv.appendChild(cell);
        }
    }
}

// ================= RENDER BÀN =================
function renderBoard(board, lastMove = null) {
    const cellDivs = boardDiv.querySelectorAll(".cell");
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const index = i * N + j;
            const cellEl = cellDivs[index];
            if (!cellEl) continue;

            cellEl.textContent = "";
            cellEl.style.background = "#fff";
            renderCell(cellEl, board[i][j]);

            if (lastMove && lastMove.row === i && lastMove.col === j)
                cellEl.style.background = "#ffff99";
        }
    }
}

// ================= CLICK =================
function handleClick(cell, i, j) {
    if (!gameStarted || cells[i][j] !== 0 || currentPlayer !== 1) return;

    console.log(`Người chơi click: (${i}, ${j})`);

    $.post("/GameWithAI/Move", { row: i, col: j }, function (res) {
        if (!res.success) { alert(res.message); return; }

        // Cập nhật toàn bộ cells từ server
        // Chỉ cập nhật các ô mà server khác 0, tránh ghi đè nước đi AI client
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                if (res.board[r][c] !== 0) cells[r][c] = res.board[r][c];
            }
        }

        // Render nước đi của người chơi
        renderBoard(cells, { row: i, col: j });
        currentPlayer = res.currentPlayer;

        if (res.isWin || res.isDraw) {
            clearInterval(timerId);
            gameStarted = false;
            const msg = res.isWin
                ? `🎉 Người chơi ${res.winner === 1 ? "❌" : "O"} thắng!`
                : "🤝 Hòa!";
            console.log(msg);
            $("#winnerText").text(msg);
            $("#overlay").fadeIn();
        } else if (res.lastMove) {
            // AI đi nước tiếp theo
            AIPlay(res.lastMove);
        } else {
            document.getElementById("who").innerHTML = "Lượt đi của: ❌";
            startTimer();
        }
    });
}

// ================= AI ĐÁNH =================
function AIPlay(lastMove) {
    if (!lastMove) return;

    // Cập nhật cells cho nước đi AI
    cells[lastMove.row][lastMove.col] = 2;

    // Render toàn bộ bàn và đánh dấu nước đi AI
    renderBoard(cells, lastMove);

    // Chuyển lượt sang người chơi
    currentPlayer = 1;
    document.getElementById("who").innerHTML = "Lượt đi của: ❌";
    startTimer();
}

// ================= VẼ QUÂN =================
function renderCell(el, val) {
    if (val === 1) {
        el.textContent = "❌";
        el.style.background = "#ffe6e6";
        el.style.color = "red";
        el.style.fontSize = "30px";
        el.style.fontWeight = "bold";
    } else if (val === 2) {
        el.textContent = "O";
        el.style.background = "#e6f0ff";
        el.style.color = "blue";
        el.style.fontSize = "30px";
        el.style.fontWeight = "bold";
    }
}

// ================= TIMER =================
function startTimer() {
    clearInterval(timerId);
    timeLeft = 10;
    timerId = setInterval(() => {
        timeLeft--;
        $("#time").text("Time: " + timeLeft + " s");

        if (timeLeft <= 0) {
            clearInterval(timerId);

            if (currentPlayer === 1) {
                // Hết giờ người chơi → AI đi
                const move = getRandomAIMove(cells);
                if (move) AIPlay(move);
            } else {
                // Hết giờ AI → chuyển lượt sang người chơi
                currentPlayer = 1;
                document.getElementById("who").innerHTML = "Lượt đi của: ❌";
                startTimer();
            }
        }
    }, 1000);
}
// ================= BẮT ĐẦU GAME =================
$("#btnStart").click(function (e) {
    e.stopPropagation();
    const selected = $('input[name="firstPlayer"]:checked').val();
    currentPlayer = parseInt(selected);
    console.log("Game bắt đầu, người đi trước: " + currentPlayer);

    $.get("/GameWithAI/ResetGame?firstPlayer=" + currentPlayer, function (res) {
        if (res.success) {
            // Cập nhật cells từ server
            for (let r = 0; r < N; r++)
                for (let c = 0; c < N; c++)
                    cells[r][c] = res.board[r][c];

            createBoard();

            // Nếu AI đi trước, chọn nước đi ngẫu nhiên tại client
            if (currentPlayer === 2) {
                const move = getRandomAIMove(cells);
                if (move) {
                    cells[move.row][move.col] = 2;
                    renderBoard(cells, move);
                }
                currentPlayer = 1;
                document.getElementById("who").innerHTML = "Lượt đi của: ❌";
                startTimer();
            }


            gameStarted = true;
            $("#start").hide();
            $("#who").addClass("show");
            $("#end").show();
            $("#board").addClass("show");
        }
    });
});

// ================= RANDOM AI =================
function getRandomAIMove(board) {
    const emptyCells = [];
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (board[i][j] === 0) emptyCells.push({ row: i, col: j });
        }
    }
    if (emptyCells.length === 0) return null;
    const index = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[index];

}// ================= KẾT THÚC / CHƠI LẠI =================
$("#endgame").click(function (e) {
    e.stopPropagation();
    gameStarted = false;
    $("#CancelGame").text("Bạn có chắc muốn kết thúc trò chơi?");
    $("#overlayCancel").fadeIn();

    $("#btnReplayCancel").click(function (event) {
        event.stopPropagation();
        $("#CancelGame").text("AI Thắng");
        setTimeout(function () {

        $("#overlayCancel").fadeOut();
        $("#btnStart").click();
            window.location.reload();
        },1000);
    });
    $("#btnEndGame").click(function () {
        $("#overlayCancel").fadeOut();
        gameStarted = true;
    });
});

$("#btnReplay").click(function () {
    $("#overlay").fadeOut();
    $("#btnStart").click();
});
$("#btnEnd").click(function () {
    $("#overlay").fadeOut();
    location.href = "/";
});
