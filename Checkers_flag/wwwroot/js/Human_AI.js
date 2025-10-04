// ================== CONFIG ==================
// Kích thước bàn cờ
const N = 10;
// Ma trận lưu trạng thái bàn cờ (0 = trống, 1 = người, 2 = AI)
const cells = Array.from({ length: N }, () => Array(N).fill(0));
// Lượt chơi hiện tại (1 = người, 2 = AI)
let currentPlayer = 1;
// Biến trạng thái trò chơi
let gameStarted = false;
// Biến timer
let timerId = null;
// Thời gian còn lại mỗi lượt (giây)
let timeLeft = 30;

// Lấy div hiển thị bàn cờ
const boardDiv = document.getElementById("board");

// ================== TẠO BÀN ==================
// Tạo bàn cờ 10x10 trong DOM
function createBoard() {
    boardDiv.innerHTML = ""; // Xóa hết nội dung cũ
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.row = i;
            cell.dataset.col = j;

            // ================== STYLE Ô ==================
            Object.assign(cell.style, {
                width: "50px",
                height: "50px",
                border: "1px solid #333",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                userSelect: "none",
                fontSize: "20px",
                background: "#fff"
            });

            // ================== BẮT SỰ KIỆN CLICK ==================
            cell.addEventListener("click", () => handleClick(i, j));

            boardDiv.appendChild(cell);
        }
    }
}

// ================== RENDER BÀN ==================
// Render trạng thái board hiện tại, highlight nước đi cuối (lastMove)
function renderBoard(board, lastMove = null) {
    const cellDivs = boardDiv.querySelectorAll(".cell");

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const index = i * N + j;
            const cellEl = cellDivs[index];
            if (!cellEl) continue;

            // ================== RESET Ô ==================
            cellEl.textContent = "";
            cellEl.style.background = "#fff";

            // Render quân cờ (1 hoặc 2)
            renderCell(cellEl, board[i][j]);

            // Highlight nước đi cuối cùng
            if (lastMove && lastMove.row === i && lastMove.col === j) {
                cellEl.style.background = "#ffff99";
            }
        }
    }
}

// Render 1 ô dựa trên giá trị (1 = người, 2 = AI)
function renderCell(el, val) {
    if (val === 1) {
        // ================== NGƯỜI ==================
        el.textContent = "❌";
        el.style.background = "#ffe6e6";
        el.style.color = "red";
        el.style.fontSize = "30px";
        el.style.fontWeight = "bold";
    } else if (val === 2) {
        // ================== AI ==================
        el.textContent = "O";
        el.style.background = "#e6f0ff";
        el.style.color = "blue";
        el.style.fontSize = "30px";
        el.style.fontWeight = "bold";
    }
}

// ================== CLICK NGƯỜI ==================
// Xử lý khi người chơi click vào 1 ô
function handleClick(i, j) {
    if (!gameStarted || cells[i][j] !== 0 || currentPlayer !== 1 || isAITurn) return;

    // Gán quân người
    cells[i][j] = 1;
    renderBoard(cells, { row: i, col: j });

    // Khóa lượt người
    isAITurn = true;

    // Cập nhật text ngay khi AI chuẩn bị đi
    $("#who").html("Lượt đi của: <span style='font-weight:bold; color:blue'>O</span> (AI đang tính...)");

    // Gửi nước đi lên server
    $.post("/GameWithAI/Move", { row: i, col: j }, function (res) {
        if (!res.success) {
            alert(res.message);
            isAITurn = false; // mở lại nếu lỗi
            $("#who").text("Lượt đi của: ❌ (Người)"); // reset text
            return;
        }

        // Cập nhật nước đi từ server (AI vừa đi)
        updateBoardFromServer(res);

        if (res.isWin || res.isDraw) {
            endGame(res);
        } else {
            // Trả lượt cho AI (hoặc AI đã đi xong)
            switchTurn(res.currentPlayer);
        }
    });
}

// ================== CẬP NHẬT BÀN TỪ SERVER ==================
// Chỉ render nước đi mới (AI hoặc nước cuối người)
function updateBoardFromServer(res) {
    if (res.lastMove) {
        const { row, col } = res.lastMove;

        // Gán nước đi dựa trên lượt đi thực tế của lastMove
        // Nếu lượt trước là AI, gán 2; nếu người, gán 1
        const value = (res.currentPlayer === 1) ? 2 : 1; // currentPlayer từ server là lượt tiếp theo
        cells[row][col] = value;

        // Render lại bàn với highlight nước đi cuối
        renderBoard(cells, res.lastMove);
    }
}

// ================== TIMER ==================
// Bắt đầu countdown mỗi lượt 30s
function startTimer() {
    clearInterval(timerId); // Reset timer
    timeLeft = 30;

    timerId = setInterval(() => {
        timeLeft--;
        $("#time").text("Time: " + timeLeft + " s");

        if (timeLeft <= 0) {
            clearInterval(timerId);

            if (currentPlayer === 1) {
                // Người hết giờ -> AI random nước đi
                const move = getRandomAIMove(cells);
                if (move) {
                    cells[move.row][move.col] = 2;
                    renderBoard(cells, move);
                    switchTurn(1); // Trả lượt về người
                }
            } else {
                // AI hết giờ (trường hợp đặc biệt) -> trả lượt về người
                switchTurn(1);
            }
        }
    }, 1000);
}

let isAITurn = false; // true nếu AI đang đi

// ================== SWITCH TURN ==================
function switchTurn(nextPlayer) {
    clearInterval(timerId);
    currentPlayer = nextPlayer;

    if (currentPlayer === 1) {
        // Lượt người
        $("#who").text("Lượt đi hiện tại: ❌ (Người)");
        isAITurn = false;
        startTimer();
    } else {
        // Lượt AI
        isAITurn = true;

        setTimeout(() => {
            const move = getRandomAIMove(cells); // hoặc từ server
            if (move) {
                cells[move.row][move.col] = 2;
                renderBoard(cells, move);
            }

            // Sau khi AI đi xong, trả lượt người
            switchTurn(1);
        }, 1000); // delay AI
    }
}
// ================== START GAME ==================
$("#btnStart").click(function (e) {
    e.stopPropagation();
    const selected = $('input[name="firstPlayer"]:checked').val();
    currentPlayer = parseInt(selected);

    $.get("/GameWithAI/ResetGame?firstPlayer=" + currentPlayer, function (res) {
        if (!res.success) return;

        createBoard();

        if (res.lastMove && currentPlayer === 2) {
            // AI đi trước
            const { row, col } = res.lastMove;
            cells[row][col] = 2; // chỉ lưu, chưa render

            $("#who").html("Lượt đi hiện tại: <span style='font-weight:bold; color:blue'>O</span> (AI đang tính...)");
            isAITurn = true;

            // Delay 2 giây mới render O
            setTimeout(() => {
                renderBoard(cells, res.lastMove); // bây giờ mới hiển thị O
                switchTurn(1); // trả lượt cho người
                isAITurn = false;
            }, 2000);
        } else {
            updateBoardFromServer(res); // nếu người đi trước, render ngay
            switchTurn(currentPlayer);
        }

        gameStarted = true;
        $("#start").hide();
        $("#who").addClass("show");
        $("#end").show();
        $("#board").addClass("show");
    });
});
// ================== END GAME ==================
function endGame(res) {
    clearInterval(timerId);
    gameStarted = false;

    const msg = res.isWin
        ? `🎉 Người chơi ${res.winner === 1 ? "❌" : "O"} thắng!`
        : "🤝 Hòa!";
    $("#winnerText").text(msg);
    $("#overlay").fadeIn();
}

// ================== REPLAY / CANCEL ==================
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
        }, 1000);
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

// ================== RANDOM AI MOVE ==================
// Lấy nước đi ngẫu nhiên cho AI (trường hợp hết giờ người)
function getRandomAIMove(board) {
    const available = [];
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (board[i][j] === 0) available.push({ row: i, col: j });
        }
    }
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}
