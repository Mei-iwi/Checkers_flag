const N = 10;
const cells = Array.from({ length: N }, () => Array(N).fill(0));
let currentPlayer = 1; 
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

// ================= XỬ LÝ CLICK =================
function handleClick(cell, i, j) {
    if (!gameStarted) return;
    if (cells[i][j] !== 0) return;

    // ===== AJAX gọi về server =====
    $.ajax({
        url: "/Game/Move",
        type: "POST",
        data: { row: i, col: j },
        success: function (res) {
            if (res.success) {
                for (let r = 0; r < N; r++) {
                    for (let c = 0; c < N; c++) {
                        cells[r][c] = res.board[r][c];
                    }
                }

                renderBoard(res.board);

                currentPlayer = res.currentPlayer;

                startTimer();
                if (res.isWin) {
                    clearInterval(timerId);
                    gameStarted = false;

                    let winnerSymbol = res.winner === 1 ? "❌" : "O";

                    // Hiện overlay
                    $("#winnerText").text("🎉 Người chơi " + winnerSymbol + " đã thắng!");
                    $("#overlay").fadeIn();

                    //// Tắt khu vực board
                    //$("#end").hide();
                    //$("#board").removeClass("show");
                    //$("#board").empty();
                    //$("#start").show();
                }
            }
        },
        error: function () {
            alert("❌ Lỗi Server");
        },
    });
}
// ================= VẼ QUÂN CỜ =================
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
    timeLeft = 11;
    //$("#time").text("Time: " + timeLeft + " s");

    timerId = setInterval(() => {
        timeLeft--;
        if (timeLeft < 4) {
            $("#time")
                .removeClass("alert-primary alert-warning")
                .addClass("alert-danger");
        } else if (timeLeft < 6) {
            $("#time")
                .removeClass("alert-primary alert-danger")
                .addClass("alert-warning");
        } else if (timeLeft <= 10) {
            $("#time")
                .removeClass("alert-warning alert-danger")
                .addClass("alert-primary");
        }
        if (timeLeft == 0) {
            setTimeout(() => {
                $("#time").text("Đổi lượt");
            }, 200);
        }
        $("#time").text("Time: " + timeLeft + " s");

        if (timeLeft <= 0) {
            clearInterval(timerId);

            currentPlayer = currentPlayer === 1 ? 2 : 1;
            document.getElementById("who").innerHTML =
                "Lượt đi của: " +
                (currentPlayer === 1
                    ? "❌"
                    : "<span style='color:blue;font-weight: bold;'>O</span>");
            startTimer();
        }
    }, 1000);
}

// ================= NÚT BẮT ĐẦU =================
$("#btnStart").click(function (e) {
    e.stopPropagation();
    const selected = $('input[name="firstPlayer"]:checked').val();
    currentPlayer = parseInt(selected);
    gameStarted = true;

    createBoard();
    document.getElementById("who").innerHTML =
        "Lượt đi của: " +
        (currentPlayer === 1
            ? "❌"
            : "<span style='color:blue;font-weight: bold;'>O</span>");
    startTimer();

    $("#start").hide();
    $("#who").addClass("show");

    $("#end").show();
    $("#end").css("display", "flex");
    $("#board").addClass("show");
});

// ================= NÚT ĐẦU HÀNG =================
$("#endgame").click(function (e) {
    e.stopPropagation();
    //clearInterval(timerId);
    gameStarted = false;

    // Hiện overlay
    $("#CancelGame").text("Bạn có chắc muốn kết thúc trò chơi");
    $("#overlayCancel").fadeIn();

    $("#btnReplayCancel").click(function (event)
    {
        event.stopPropagation();
        $("#CancelGame").text("AI Thắng");

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
        gameStarted = true;
    });

    // Tắt khu vực board
    //$("#end").hide();
    //$("#board").removeClass("show");
    //$("#board").empty();
    //$("#start").show();
});

$("#btnReplay").click(function () {
    $("#overlay").fadeOut();
    $("#btnStart").click(); 
});
$("#btnEnd").click(function () {
    $("#overlay").fadeOut();
});
