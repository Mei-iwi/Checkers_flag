const N_PvP = 10;
const cellsPvP = Array.from({ length: N_PvP }, () => Array(N_PvP).fill(0));
let currentPlayerPvP = 1;
let gameStartedPvP = false;

const boardDivPvP = document.getElementById("board");

let timeLeftPvP = 10;
let timerIdPvP = null;

// ================= TẠO BÀN CỜ =================
function createBoardPvP() {
    boardDivPvP.innerHTML = "";
    for (let i = 0; i < N_PvP; i++) {
        for (let j = 0; j < N_PvP; j++) {
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

            cell.addEventListener("click", () => handleClickPvP(cell, i, j));
            boardDivPvP.appendChild(cell);
        }
    }
}

// ================= XỬ LÝ CLICK =================
function handleClickPvP(cell, i, j) {
    if (!gameStartedPvP) return;
    if (cellsPvP[i][j] !== 0) return;

    // === Người chơi đánh ngay trên client ===
    cellsPvP[i][j] = currentPlayerPvP;
    renderBoardPvP(cellsPvP);

    $.ajax({
        url: "/GameWithHuman/MoveHuman",  // Controller = GameWithHuman, Action = MoveHuman
        type: "POST",
        data: { row: i, col: j, player: currentPlayerPvP },
        success: function (res) {
<<<<<<< HEAD
            if (res.success) {   
                for (let r = 0; r < N_PvP; r++) {
                    for (let c = 0; c < N_PvP; c++) {
                        cellsPvP[r][c] = res.board[r][c];
                    }
=======
            if (!res.success) return;

            // Cập nhật lại bàn cờ từ server
            for (let r = 0; r < N_PvP; r++) {
                for (let c = 0; c < N_PvP; c++) {
                    cellsPvP[r][c] = res.board[r][c];
>>>>>>> c7e97427211bf33a105b4acb3af176fb44664858
                }
            }

            renderBoardPvP(res.board);

            // Cập nhật lượt đi
            currentPlayerPvP = res.currentPlayer;
            document.getElementById("who").innerHTML =
                "Lượt đi của: " +
                (currentPlayerPvP === 1
                    ? "❌"
                    : "<span style='color:blue;font-weight: bold;'>O</span>");

            // Reset & bắt đầu lại timer cho người chơi mới
            startTimerPvP();

            // Xử lý thắng
            if (res.isWin) {
                clearInterval(timerIdPvP);
                gameStartedPvP = false;

                let winnerSymbol =
                    res.winner === 1
                        ? "❌"
                        : "<span style='color:blue;font-weight:bold;'>O</span>";

                $("#winnerText").html("🎉 Người chơi " + winnerSymbol + " đã thắng!");
                $("#overlay").fadeIn();
            }
            // Xử lý hòa
            else if (res.isDraw) {
                clearInterval(timerIdPvP);
                gameStartedPvP = false;

                $("#winnerText").text("🤝 Trận đấu hòa!");
                $("#overlay").fadeIn();
            }
        },
        error: function () {
            alert("❌ Lỗi Server");
        },
    });
}
// ================= VẼ QUÂN CỜ =================
function renderCellPvP(el, val) {
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
    } else {
        el.textContent = "";
        el.style.background = "#fff";
    }
}

function renderBoardPvP(board) {
    const cells = boardDivPvP.children;
    for (let i = 0; i < N_PvP; i++) {
        for (let j = 0; j < N_PvP; j++) {
            const idx = i * N_PvP + j;
            renderCellPvP(cells[idx], board[i][j]);
        }
    }
}

// ================= TIMER =================
function startTimerPvP() {
    clearInterval(timerIdPvP);
    timeLeftPvP = 11;

    timerIdPvP = setInterval(() => {
        timeLeftPvP--;

        if (timeLeftPvP < 4) {
            $("#time").removeClass("alert-primary alert-warning").addClass("alert-danger");
        } else if (timeLeftPvP < 6) {
            $("#time").removeClass("alert-primary alert-danger").addClass("alert-warning");
        } else {
            $("#time").removeClass("alert-warning alert-danger").addClass("alert-primary");
        }

        if (timeLeftPvP == 0) {
            setTimeout(() => {
                $("#time").text("Đổi lượt");
            }, 200);
        }

        $("#time").text("Time: " + timeLeftPvP + " s");

        if (timeLeftPvP <= 0) {
            clearInterval(timerIdPvP);
            currentPlayerPvP = currentPlayerPvP === 1 ? 2 : 1;
            document.getElementById("who").innerHTML =
                "Lượt đi của: " +
                (currentPlayerPvP === 1
                    ? "❌"
                    : "<span style='color:blue;font-weight: bold;'>O</span>");
            startTimerPvP();
        }
    }, 1000);
}

// ================= NÚT BẮT ĐẦU =================
$("#btn-humman").click(function (e) {
    e.stopPropagation();
    const selected = $('input[name="firstPlayer"]:checked').val();
    currentPlayerPvP = parseInt(selected);
    gameStartedPvP = true;

    createBoardPvP();
    document.getElementById("who").innerHTML =
        "Lượt đi của: " +
        (currentPlayerPvP === 1
            ? "❌"
            : "<span style='color:blue;font-weight: bold;'>O</span>");
    startTimerPvP();

    $("#start").hide();
    $("#who").addClass("show");
    $("#end").show().css("display", "flex");
    $("#board").addClass("show");
});

// ================= NÚT ĐẦU HÀNG =================
$("#endgame").click(function (e) {
    e.stopPropagation();
    gameStartedPvP = false;

    $("#CancelGame").text("Bạn có chắc muốn kết thúc trò chơi");
    $("#overlayCancel").fadeIn();

    $("#btnReplayCancel").click(function (event) {
        event.stopPropagation();
        $("#CancelGame").text("Người kia Thắng");

        $("#btnReplayCancel").hide();
        $("#btnEndGame").hide();

        setTimeout(function () {
            $("#overlayCancel").fadeOut();
            $("#board").removeClass("show").empty();
            $("#end").hide();
            $("#start").show();
            $("#btnReplayCancel").show();
            $("#btnEndGame").show();
        }, 2000);
    });

    $("#btnEndGame").click(function () {
        $("#overlayCancel").fadeOut();
        gameStartedPvP = true;
    });
});

$("#btnReplay").click(function () {
    $("#overlay").fadeOut();
    $("#btn-humman").click();
});
$("#btnEnd").click(function () {
    $("#overlay").fadeOut();
});
