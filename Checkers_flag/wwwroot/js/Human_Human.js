const N_PvP = 15;//ma trân có kích thước 15
const cellsPvP = Array.from({ length: N_PvP }, () => Array(N_PvP).fill(0));//tạo ma trận ban đầu với các ô có giá trị 0(bằng 0 là ô trống)
let gameStartedPvP = false;//cờ hiệu để xác nhận game bắt đầu chưa

const boardDivPvP = document.getElementById("board");//thẻ board để hiện bàn cờ
// ================= TẠO BÀN CỜ =================
function createBoardPvP() {
    boardDivPvP.innerHTML = "";//xóa nội dung cũ 
    for (let i = 0; i < N_PvP; i++) {//duyệt mảng vị trí dòng i sau cho bé hơn kích thước mảng
        for (let j = 0; j < N_PvP; j++) {//duyệt mảng vị trí dòng j sau cho bé hơn kích thước mảng
            const cell = document.createElement("div");//tạo o 
            cell.className = "cell";//tạo cột
            cell.dataset.row = i;//gán giá trị dòng là i
            cell.dataset.col = j;//gán giá trị cột là j
            cell.style.width = "40px";//kích thước ô rộng
            cell.style.height = "40px";//kích thước cao
            cell.style.border = "1px solid #333";//border có kích thước 1px, màu solid #333
            cell.style.display = "flex";//căn giữa
            cell.style.alignItems = "center";//căn giữa
            cell.style.justifyContent = "center";//căn giữa
            cell.style.cursor = "pointer";//trỏ chuột thành bàn tay
            cell.style.userSelect = "none";//không cho bôi đen chữ X hay O trong O
            cell.style.fontSize = "20px";//kichs thước font
            cell.style.background = "#fff";//màu background

            cell.addEventListener("click", () => handleClickPvP(cell, i, j));//gắn sự kiện click cho từng ô
            boardDivPvP.appendChild(cell);//thêm vào board
        }
    }
}

// ================= XỬ LÝ CLICK =================
function handleClickPvP(cell, i, j) {
    if (!gameStartedPvP) return;//nếu game chưa bắt đầu thì return 
    if (cellsPvP[i][j] !== 0) return;//ô có quân cờ rồi thì không được đặt quân nào vào đó nữa

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

                // Cập nhật lượt đi của người chơi tiếp theo 
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

                    // Tìm chuỗi 5 ô thắng để tô đỏ
                    const win = findWinningLinePvP(res.board);//tìm ra dòng theo điều kiện thắng trái phải xéo ngang
                    if (win) {
                        renderBoardPvP(res.board, win.line)//tô đỏ dòng thắng 
                    } else {
                        renderBoardPvP(res.board);//hiện bàn cờ bình thường không tô đỏ ô nào
                    }


                    clearInterval(timerIdPvP);//dừng thời gian
                    gameStartedPvP = false;//trò chơi dừng lại 

                    let winnerSymbol =
                        res.winner === 1
                            ? "❌"
                            : "<span style='color:blue;font-weight:bold;'>O</span>";

                    $("#winnerText").html("🎉 Người chơi " + winnerSymbol + " đã thắng!");
                    $("#overlay").fadeIn();//hiển thị kí hiệu x hoặc o (người thắng) và in ra thông báo
                }
                // Xử lý hòa
                else if (res.isDraw) {//bàn cờ hết cờ
                    clearInterval(timerIdPvP);//dừng thời gian lại 
                    gameStartedPvP = false;//kết thúc game 

                    $("#winnerText").text("🤝 Trận đấu hòa!");
                    $("#overlay").fadeIn();//in ra thông báo
                }
            }

        },
        error: function () {
            alert("❌ Lỗi Server");//sever không phản hồi
        }
    });
}

// ================= VẼ QUÂN CỜ (hàm con được dùng trong renderBoardPvP) =================
function renderCellPvP(el, val) {
    if (val === 1) {
        el.textContent = "❌";//quân cờ
        el.style.background = "#ffe6e6"; // đỏ nhạt
        el.style.color = "red";//màu của quân cờ
        el.style.fontSize = "30px";//kích thước quân cờ
        el.style.fontWeight = "bold";//in đậm
    } else if (val === 2) {//trả về giá trị 2
        el.textContent = "O";//quân cờ
        el.style.background = "#cce0ff"; // 💙 xanh nhạt hơn
        el.style.color = "#0040ff";      // xanh đậm
        el.style.fontSize = "30px";//kích thước quân cờ
        el.style.fontWeight = "bold";
    } else {
        el.textContent = "";//nếu ko có giá trị thì ô đó trống
        el.style.background = "#ffffff"; // trắng
    }
}


// ================= VẼ QUÂN CỜ =================
function renderBoardPvP(board, winningLine = null) {
    const cells = boardDivPvP.children;//danh sách ô trên bàn cờ
    const winSet = new Set();//tập các ô thuộc các chuỗi thắng

    if (winningLine) {
        winningLine.forEach(p => winSet.add(p.row + ',' + p.col));//neus thuộc chuỗi thắng thì thêm vào winset
    }

    for (let i = 0; i < N_PvP; i++) { //duyệt theo dòng
        for (let j = 0; j < N_PvP; j++) {//duyệt theo cột
            const idx = i * N_PvP + j;//tính chỉ số của ô
            const el = cells[idx];//trà về chỉ số có vị trí cân tô

            // 🔹 Reset trước khi vẽ
            el.style.background = "#fff";//nền trắng
            el.style.color = "black";//chữ đen
            el.style.fontWeight = "normal";//phông thường

            // 🔹 Vẽ quân cờ
            renderCellPvP(el, board[i][j]);

            // 🔹 Nếu ô nằm trong chuỗi thắng → tô đỏ nổi bật
            if (winSet.has(i + ',' + j)) {
                if (board[i][j] === 1) { // ❌ 
                    el.style.background = "#e60000"; // màu nền đỏ tươi
                    el.style.color = "#ffffff";//màu chữ
                } else if (board[i][j] === 2) { // O 
                    el.style.background = "#0040ff"; // xanh đậm
                    el.style.color = "#ffffff";//màu chữ
                }
                el.style.fontWeight = "bold";//chữ in đậm
                el.style.transition = "background 0.3s ease";//hiệu ứng chuyển màu 
            }
        }
    }

    // 🔹 Thêm hiệu ứng nhấp nháy đỏ nếu có chuỗi thắng
    if (winningLine) {//nếu là chuôi thắng
        let blink = true;
        const blinkInterval = setInterval(() => {
            winningLine.forEach(p => {
                const el = cells[p.row * N_PvP + p.col];
                if (cellsPvP[p.row][p.col] === 1) { // ❌
                    el.style.background = blink ? "#e60000" : "#ff4d4d";
                } else if (cellsPvP[p.row][p.col] === 2) { // O
                    el.style.background = blink ? "#0040ff" : "#66b3ff";
                }
                el.style.color = "#ffffff";
                el.style.fontWeight = "bold";
            });
            blink = !blink;
        }, 400);

        // Dừng nhấp nháy sau 4 giây
        setTimeout(() => clearInterval(blinkInterval), 4000);
    }
}

//function renderBoardPvP(board) {
//    const cells = boardDivPvP.children;
//    for (let i = 0; i < N_PvP; i++) {
//        for (let j = 0; j < N_PvP; j++) {
//            const idx = i * N_PvP + j;
//            renderCellPvP(cells[idx], board[i][j]);
//        }
//    }
//}

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


// ================= TÌM CHUỖI 5 QUÂN LIÊN TIẾP =================
function findWinningLinePvP(board) {
    const directions = [
        { dr: 1, dc: 0 },   // dọc
        { dr: 0, dc: 1 },   // ngang
        { dr: 1, dc: 1 },   // chéo xuống phải
        { dr: 1, dc: -1 }   // chéo xuống trái
    ];

    for (let i = 0; i < N_PvP; i++) {
        for (let j = 0; j < N_PvP; j++) {
            const player = board[i][j];
            if (player === 0) continue;

            for (let dir of directions) {
                let line = [{ row: i, col: j }];
                for (let k = 1; k < 5; k++) {
                    const r = i + dir.dr * k;
                    const c = j + dir.dc * k;
                    if (
                        r < 0 || r >= N_PvP || c < 0 || c >= N_PvP ||
                        board[r][c] !== player
                    ) {
                        break;
                    }
                    line.push({ row: r, col: c });
                }
                if (line.length === 5) {
                    return { player, line };
                }
            }
        }
    }
    return null;
}
