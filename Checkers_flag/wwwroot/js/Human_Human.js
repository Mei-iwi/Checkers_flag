const N_PvP = 15;
const cellsPvP = Array.from({ length: N_PvP }, () => Array(N_PvP).fill(0));
let gameStartedPvP = false;

const boardDivPvP = document.getElementById("board");


// ================= TẠO BÀN CỜ =================
function createBoardPvP() {
    boardDivPvP.innerHTML = "";
    for (let i = 0; i < N_PvP; i++) {
        for (let j = 0; j < N_PvP; j++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.style.width = "40px";
            cell.style.height = "40px";
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

    $.ajax({
        url: "/GameWithHuman/MoveHuman",
        type: "POST",
        data: { row: i, col: j, player: currentPlayerPvP },
        dataType: "json",
        success: function (res) {
            if (res.success) {

                // Cập nhật lại bàn cờ từ server
                for (let r = 0; r < N_PvP; r++) {
                    for (let c = 0; c < N_PvP; c++) {
                        cellsPvP[r][c] = res.board[r][c];
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
            }

        },
        error: function () {
            alert("❌ Lỗi Server");
        }
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
let timerIdPvP = null;
let timeLeftPlayer1 = 300; // 5 phút cho người chơi 1
let timeLeftPlayer2 = 300; // 5 phút cho người chơi 2
let currentPlayerPvP = 1; // bắt đầu từ người chơi 1

function startTimerPvP() {
    clearInterval(timerIdPvP);

    timerIdPvP = setInterval(() => {
        if (currentPlayerPvP === 1 && timeLeftPlayer1 > 0) {
            timeLeftPlayer1--;
        } else if (currentPlayerPvP === 2 && timeLeftPlayer2 > 0) {
            timeLeftPlayer2--;
        }

        // hiển thị thời gian của hai người chơi
        $("#timePlayerA").text("❌: " + formatTime(timeLeftPlayer1));
        $("#timePlayerB").html("<span style='color:blue;font-weight:bold;'>O</span>: " + formatTime(timeLeftPlayer2));

        // kiểm tra hết giờ
        if (timeLeftPlayer1 <= 0 || timeLeftPlayer2 <= 0) {
            clearInterval(timerIdPvP);

            if (currentPlayerPvP === 1) {
                $("#who").text("❌ Hết giờ! Người chơi ❌ thua!");
                $("#winnerText").html("Hết giờ! ⏱️,  Người chơi <span style='color:blue;font-weight:bold;'>O</span>  đã thắng!");
                $("#overlay").fadeIn();
            } else {
                $("#who").html("<span style='color:blue;font-weight:bold;'>O</span> Hết giờ! Người chơi O thua!");
                $("#winnerText").html("Hết giờ! ⏱️,  Người chơi ❌  đã thắng!");
                $("#overlay").fadeIn();

            }

            // có thể thêm reset sau vài giây
            setTimeout(() => {
                resetTimerPvP();
            }, 3000);
        }


        // tô màu cảnh báo
        highlightTime();
    }, 1000);
}

function changeTurn() {
    currentPlayerPvP = currentPlayerPvP === 1 ? 2 : 1;
    document.getElementById("who").innerHTML =
        "Lượt đi của: " +
        (currentPlayerPvP === 1
            ? "❌"
            : "<span style='color:blue;font-weight:bold;'>O</span>");
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function highlightTime() {
    const currentTime = currentPlayerPvP === 1 ? timeLeftPlayer1 : timeLeftPlayer2;

    if (currentPlayerPvP === 1) {
        // tô màu người chơi A
        if (currentTime < 10) {
            $("#timePlayerA").removeClass("alert-primary alert-warning").addClass("alert-danger");
        } else if (currentTime < 30) {
            $("#timePlayerA").removeClass("alert-primary alert-danger").addClass("alert-warning");
        } else {
            $("#timePlayerA").removeClass("alert-warning alert-danger").addClass("alert-primary");
        }
        // giữ nguyên màu cho người B
        $("#timePlayerB").removeClass("alert-warning alert-danger").addClass("alert-primary");

    } else {
        // tô màu người chơi B
        if (currentTime < 10) {
            $("#timePlayerB").removeClass("alert-primary alert-warning").addClass("alert-danger");
        } else if (currentTime < 30) {
            $("#timePlayerB").removeClass("alert-primary alert-danger").addClass("alert-warning");
        } else {
            $("#timePlayerB").removeClass("alert-warning alert-danger").addClass("alert-primary");
        }
        // giữ nguyên màu cho người A
        $("#timePlayerA").removeClass("alert-warning alert-danger").addClass("alert-primary");
    }
}

function resetTimerPvP() {
    clearInterval(timerIdPvP);
    timeLeftPlayer1 = 300;
    timeLeftPlayer2 = 300;
    currentPlayerPvP = 1;

    $("#timePlayerA").text("❌: " + formatTime(timeLeftPlayer1))
        .removeClass("alert-danger alert-warning").addClass("alert-primary");
    $("#timePlayerB").html("<span style='color:blue;font-weight:bold;'>O</span>: " + formatTime(timeLeftPlayer2))
        .removeClass("alert-danger alert-warning").addClass("alert-primary");

    $("#who").text("Nhấn Bắt đầu để chơi lại");
}


// ================= NÚT BẮT ĐẦU =================
$("#btn-humman").click(function (e) {
    e.stopPropagation();

    $("#fight").fadeIn();


    const selected = $('input[name="firstPlayer"]:checked').val();
    currentPlayerPvP = parseInt(selected);

   
    gameStartedPvP = true;

    $.get("/GameWithHuman/ResetGame", function (res) {
        // Reset client theo server
        for (let r = 0; r < N_PvP; r++) {
            for (let c = 0; c < N_PvP; c++) {
                cellsPvP[r][c] = res.board[r][c];
            }
        }

        createBoardPvP();
        document.getElementById("who").innerHTML =
            "Lượt đi của: " +
            (currentPlayerPvP === 1
                ? "❌"
                : "<span style='color:blue;font-weight: bold;'>O</span>");

        $("#start").hide();
        $("#who").addClass("show");
        $("#end").show().css("display", "flex");
        $("#board").addClass("show");

        // chỉ bắt đầu timer sau khi hiệu ứng "Fight ⚔" kết thúc
        setTimeout(function () {
            $("#fight").fadeOut();
            startTimerPvP(); // bắt đầu đếm giờ ở đây
        }, 2000);
    });
});

// ================= NÚT ĐẦU HÀNG =================
$("#endgame").click(function (e) {
    e.stopPropagation();
    gameStartedPvP = false;

    $("#CancelGame").text("Bạn có chắc muốn kết thúc trò chơi");
    $("#overlayCancel").fadeIn();

    $("#btnReplayCancel").click(function (event) {
        event.stopPropagation();

        (currentPlayerPvP === 1) ? $("#CancelGame").html("<span style='color:blue;font-weight:bold;'>Người chơi O thắng</span>") : $("#CancelGame").html("Người chơi ❌ thắng");


        $("#btnReplayCancel").hide();
        $("#btnEndGame").hide();

        setTimeout(function () {
            $("#overlayCancel").fadeOut();
            $("#board").removeClass("show").empty();
            $("#end").hide();
            $("#start").show();
            $("#btnReplayCancel").show();
            $("#btnEndGame").show();
            resetTimerPvP();
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
    location.href = "/";
});
