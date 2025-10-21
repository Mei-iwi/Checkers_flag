// ================== CONFIG ==================
// Kích thước bàn cờ
const N = 15;
// Tạo ma trận lưu trạng thái bàn cờ (0 = trống, 1 = người, 2 = AI)
const cells = Array.from({ length: N }, () => Array(N).fill(0));
// Lượt chơi hiện tại (1 = người, 2 = AI)
let currentPlayer = 1;
// Biến trạng thái trò chơi(true: đang chơi; false: chưa bắt đầu hoặc kết thúc)
let gameStarted = false;
// Biến timer
let timerId = null;
// Lấy div hiển thị bàn cờ trong HTML (id="board")
const boardDiv = document.getElementById("board");

// ================== TẠO BÀN ==================
// Hamg khởi tạo bàn cờ 10x10 trong DOM
function createBoard() {
    boardDiv.innerHTML = ""; // Xóa hết nội dung bàn cờ cũ nếu có
    //Duyệt qua tất  cả hàng và cột để tao ô cờ
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const cell = document.createElement("div");// tạo thẻ div đại diênj cho ô cờ
            cell.className = "cell";
            cell.dataset.row = i;//ghi lại chỉ số hàng
            cell.dataset.col = j;// ghi lại chỉ số cột

            // ================== STYLE Ô ==================
            //Đặt kích thước, đường viền ,màu nền, căn giữa cho tuwfng ô cờ
            Object.assign(cell.style, {
                width: "40px",
                height: "40px",
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
            // khi người chơi click vào ô cờ sẽ gọi hàm handleClick với tọa độ ô
            cell.addEventListener("click", () => handleClick(i, j));
            //thêm ô này vào bàn cờ hiểtn thị
            boardDiv.appendChild(cell);
        }
    }
}

// ================== RENDER BÀN ==================
// Cập nhật lại bàn cờ dựa trên trạng thái cells[], highlight nước đi cuối (lastMove)
function renderBoard(board, lastMove = null, winningLine = null) {
    const cellDivs = boardDiv.querySelectorAll(".cell");

    // Nếu có chuỗi thắng → tạo set chứa vị trí các ô thắng
    const winSet = new Set();
    if (winningLine) {
        winningLine.forEach(p => winSet.add(p.row + ',' + p.col));
    }

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const index = i * N + j;
            const cellEl = cellDivs[index];
            if (!cellEl) continue;

            // Reset lại ô
            cellEl.textContent = "";
            cellEl.style.background = "#fff";
            cellEl.classList.remove("winner");

            // Vẽ quân cờ
            renderCell(cellEl, board[i][j]);

            // Tô vàng nước đi cuối
            if (lastMove && lastMove.row === i && lastMove.col === j) {
                cellEl.style.background = "#ffff99";
            }

            // Nếu ô nằm trong chuỗi thắng → tô đỏ
            if (winSet.has(i + ',' + j)) {
                if (board[i][j] === 1) { // ❌
                    cellEl.style.background = "#e60000"; // đỏ tươi
                    cellEl.style.color = "#ffffff";
                } else if (board[i][j] === 2) { // O
                    cellEl.style.background = "#0040ff"; // xanh đậm
                    cellEl.style.color = "#ffffff";
                }
                cellEl.style.fontWeight = "bold";
                cellEl.style.transition = "background 0.3s ease";
            }

        }
    }

    // 🔹 Chỉ tạo hiệu ứng nhấp nháy một lần (nếu có chuỗi thắng)
    if (winningLine) {
        let blink = true;
        const blinkInterval = setInterval(() => {
            winningLine.forEach(p => {
                const el = cellDivs[p.row * N + p.col];
                if (board[p.row][p.col] === 1) { // ❌
                    el.style.background = blink ? "#e60000" : "#ff4d4d";
                } else if (board[p.row][p.col] === 2) { // O
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

// Render 1 ô dựa trên giá trị (1 = người, 2 = AI)
function renderCell(el, val) {
    if (val === 1) {
        // ================== NGƯỜI ==================
        //style của quân cờ ngươi dùng
        el.textContent = "❌";
        el.style.background = "#ffe6e6";
        el.style.color = "red";
        el.style.fontSize = "30px";
        el.style.fontWeight = "bold";
    } else if (val === 2) {
        // ================== AI ==================
        //style của quân cờ AI
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
    //chặn nếu game chuea bắt đầu, ô đã có người đi, không phải lượt người chơi hoăcjc là lượt của AI
    if (!gameStarted || cells[i][j] !== 0 || currentPlayer !== 1 || isAITurn) return;

    // Gán quân X của người chơi vào ma trận
    cells[i][j] = 1;
    renderBoard(cells, { row: i, col: j });

    // Khóa lượt người(chờ AI đi)
    isAITurn = true;
    currentPlayerPvP = 2; // ⏱ gán đúng người đang bị trừ thời gian
    startTimerPvP();      // bắt đầu đếm giờ cho AI


    // Cập nhật text ngay khi AI chuẩn bị đi
    $("#who").html("Lượt đi của: <span style='font-weight:bold; color:blue'>O</span> (AI Suy nghĩ...)");

    // Gửi nước đi của người chơi lên server
    $.post("/GameWithAI/Move", { row: i, col: j }, function (res) {
        if (!res.success) {
            alert(res.message);
            isAITurn = false;
            $("#who").text("Lượt đi của: ❌ (Người)");
            return;
        }


        var info = document.getElementById("showStep");
        var span = document.createElement("span");
        span.textContent = `Nước đi người chơi: (${i}, ${j})`;
        span.classList.add("hu-move");
        info.appendChild(span);
        info.appendChild(document.createElement("br"));

        info.scrollTop = info.scrollHeight;


        // 🔹 BẮT ĐẦU LƯỢT AI — cho AI suy nghĩ và trừ thời gian
        $("#who").html("Lượt đi của: <span style='font-weight:bold; color:blue'>O</span> (AI suy nghĩ...)");

        updateBoardFromServer(res); // vẽ nước đi AI từ server

        clearInterval(timerIdPvP); // ⏹ dừng timer AI sau khi đi xong

        if (res.isWin || res.isDraw) {
            // ⏳ Sau 2 giây xử lý endGame
            setTimeout(() => {
                endGame(res);
            }, 2000);

            // ⏳ Sau 5 giây mới hiện popup
            setTimeout(() => {
                $("#overlay").fadeIn();
            }, 5000);
        } else {
            // 🔁 Trả lượt cho người chơi
            currentPlayerPvP = 1;
            switchTurn(1);
        }
    });
}
// ================== CẬP NHẬT BÀN TỪ SERVER ==================
// Nhận kết quả từ server và cập nhật bàn cờ
function updateBoardFromServer(res) {
    if (res.lastMove) {
        const { row, col } = res.lastMove;

        var info = document.getElementById("showStep");
        var span = document.createElement("span");
        span.textContent = `Nước đi AI: (${row}, ${col}) `;
        span.classList.add("ai-move");
        info.appendChild(span);
        info.appendChild(document.createElement("br"));

        info.scrollTop = info.scrollHeight;

        // Xác định nước đi cuối là của ai
        let value = 0;

        if (res.isWin || res.isDraw) {
            // Nếu AI thắng hoặc người thắng, lấy winner
            value = res.winner;
        } else {
            // Nếu chưa thắng, nước đi cuối luôn là AI vì người đi trước đã render
            value = 2;
        }

        // Gán giá trị vào bảng
        cells[row][col] = value;

        // 🔍 Kiểm tra xem có chuỗi thắng 5 quân không
        const win = findWinningLine(cells);

        if (win) {
            // Tô đỏ 5 ô thắng và hiển thị thông báo
            renderBoard(cells, res.lastMove, win.line);
            $("#winnerText").text(`🎉 Người chơi ${win.player === 1 ? "❌" : "O"} thắng!`);

            var info = document.getElementById("showStep");
            var span = document.createElement("span");
            span.textContent = `Người chơi ${win.player === 1 ? "❌" : "O"} thắng! `;
            span.classList.add("win");
            info.appendChild(span);
            info.appendChild(document.createElement("br"));

            info.scrollTop = info.scrollHeight;

            endGame({ isWin: true, winner: win.player });
        } else {
            // Nếu chưa thắng, chỉ render nước đi mới
            renderBoard(cells, res.lastMove);
        }
    }
}

// ================== TIMER ==================
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

// ================== SWITCH TURN ==================
function switchTurn(nextPlayer) {
    clearInterval(timerId);//   dừng timer cũ
    currentPlayer = nextPlayer;// chuyển lượt chơi sang người chơi tiếp theo

    if (currentPlayer === 1) {
        currentPlayerPvP = 1;
        // Lượt người
        $("#who").text("Lượt đi hiện tại: ❌ (Người)");// cập nhật text thuộc về người
        isAITurn = false;// mở khóa lượt người
        startTimerPvP();// bắt đầu đếm ngược 30s cho người
    } else {

        currentPlayerPvP = 2;

        // Lượt AI
        isAITurn = true;// khóa lượt người
        $("#who").html("Lượt đi hiện tại: <span style='font-weight:bold; color:blue'>O</span> (AI suy nghĩ...)");
        startTimerPvP();

        setTimeout(() => {  // Delay AI
            const move = getRandomAIMove(cells); // Chon nước đi ngẫu nhiên(hoặc từ server)
            if (move) {// nếu có nước đi
                cells[move.row][move.col] = 2;// gán vào mảng
                renderBoard(cells, move);// vẽ lại bàn với nước đi của AI
            }
            clearInterval(timerId);//   dừng timer cũ

            // Sau khi AI đi xong, trả lượt người
            switchTurn(1);
        }, 2000); // delay AI
    }
}
// ================== START GAME ==================
$("#btnStart").click(function (e) {//bắt sự kiện click vào nút start
    e.stopPropagation();//ngăn sự kiện lkan truyền ra ngoài phần tử hiện tại

    $("#fight").fadeIn();


    const selected = $('input[name="firstPlayer"]:checked').val();//lấy người đi trước từ radbtn
    currentPlayer = parseInt(selected);
    // Gọi API khởi tạo game mới trên server


    $.get("/GameWithAI/ResetGame?firstPlayer=" + currentPlayer, function (res) {
        if (!res.success) return;


        resetBoard() //làm mới bàn cờ

        createBoard();//tạo bàn cờ mới

        var info = document.getElementById("showStep");
        info.innerHTML = "";

        $("#info").show();

        if (res.lastMove && currentPlayer === 2) {
            // AI đi trước -> server trả về nước đi của AI
            const { row, col } = res.lastMove;
            cells[row][col] = 2; // chỉ lưu, chưa render

            $("#who").html("Lượt đi hiện tại: <span style='font-weight:bold; color:blue'>O</span> (AI suy nghĩ...)");
            isAITurn = true;// khóa lượt người

            // Sau 2 giây mới render nước đi và bắt đầu đếm giờ
            setTimeout(() => {
                $("#fight").fadeOut();

                createBoard();
                renderBoard(cells, res.lastMove);
                switchTurn(1);
                isAITurn = false;
                startTimerPvP(); // chỉ bắt đầu timer tại đây
                var info = document.getElementById("showStep");
                var span = document.createElement("span");
                span.textContent = `Nước đi AI: (${row}, ${col}) `;
                span.classList.add("ai-move");
                info.appendChild(span);
                info.appendChild(document.createElement("br"));

                info.scrollTop = info.scrollHeight;

            }, 2000);
        } else {
            // Người đi trước
            $("#fight").fadeOut();
            updateBoardFromServer(res);
            switchTurn(currentPlayer);
            startTimerPvP(); // bắt đầu ngay
        }


        //cập nhật giao diện sau khi bắt đầu
        gameStarted = true;
        $("#start").hide();
        $("#who").addClass("show");
        $("#end").show();
        $("#board").addClass("show");

    });
});
// ================== END GAME ==================
function endGame(res) {
    clearInterval(timerId);// dừng timer
    gameStarted = false;// kết thúc trò chơi
    isAITurn = false;// khóa lượt người
    // Xác định kết quả để hiển thị kết quả
    const msg = res.isWin
        ? `🎉 Người chơi ${res.winner === 1 ? "❌" : "O"} thắng!`
        : "🤝 Hòa!";
    $("#winnerText").text(msg);
    // $("#overlay").fadeIn();
}

// ================== REPLAY / CANCEL ==================
$("#endgame").click(function (e) {// bắt sự kiện click vào nút kết thúc
    e.stopPropagation();// ngăn sự kiện lan truyền
    gameStarted = false;// tạm dừng trò chơi
    $("#CancelGame").text("Bạn có chắc muốn kết thúc trò chơi?");
    $("#overlayCancel").fadeIn();// hiện popup xác nhận kết thúc
    // nếu chọn replay
    $("#btnReplayCancel").click(function (event) {
        event.stopPropagation();// ngăn sự kiện lan truyền
        $("#CancelGame").text("AI Thắng");
        setTimeout(function () {
            $("#overlayCancel").fadeOut();// ẩn popup
            $("#btnStart").click();//bắt đầu lại trò chơi
            window.location.reload();// tải lại trang
        }, 1000);

    });

    // nếu chọn kết thúc
    $("#btnEndGame").click(function () {// bắt sự kiện click vào nút kết thúc
        $("#overlayCancel").fadeOut();
        gameStarted = true;// mở lại trò chơi
    });
});
//nút chơi lại sau khi kết thúc
$("#btnReplay").click(function () {// bắt sự kiện click vào nút chơi lại
    $("#overlay").fadeOut();//
    $("#btnStart").click();// bắt đầu lại trò chơi mới
});
//nút thoát về trang chủ
$("#btnEnd").click(function () {// bắt sự kiện click vào nút thoát về trang chủ
    $("#info").hide();
    $("#overlay").fadeOut();
    location.href = "/";// chuyển về trang chủ
});

// ================== RANDOM AI MOVE ==================
// Lấy nước đi ngẫu nhiên cho AI (trường hợp hết giờ người)
function getRandomAIMove(board) {
    const available = [];// mảng lưu các ô trống
    //Duyệt qua tất cả các ô trên bàn cờ
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (board[i][j] === 0) available.push({ row: i, col: j });// nếu ô trống thì thêm vào mảng
        }
    }
    if (available.length === 0) return null;// nếu không còn ô trống thì trả về null
    return available[Math.floor(Math.random() * available.length)];// chọn ngẫu nhiên 1 ô trống trong mảng để đi
}
function resetBoard() {
    // 1. Reset lại ma trận cells về ô trống
    // duyệt qua tất cả các ô
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            cells[i][j] = 0;// đặt lại giá trị ô về 0 (trống)
        }
    }

    // 2. Xóa DOM bàn cờ
    boardDiv.innerHTML = "";

    // 3. Reset các biến trạng thái
    //currentPlayer = 1;   // mặc định người đi trước
    gameStarted = false;   // trò chơi chưa bắt đầu
    isAITurn = false;// mở khóa lượt người
    clearInterval(timerId);// dừng timer nếu đang chạy
    resetTimerPvP();
    // 4. Reset hiển thị timer và lượt chơi
    //$("#time").text("Time: 30 s");// hiển thị thời gian mặc định
    $("#who").text("Lượt đi hiện tại: ❌ (Người)");// hiển thị lượt đi là người
}

function findWinningLine(board) {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    const N = board.length;
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const player = board[i][j];
            if (player === 0) continue;
            for (const [dr, dc] of dirs) {
                const line = [{ row: i, col: j }];
                let r = i + dr, c = j + dc;
                while (r >= 0 && r < N && c >= 0 && c < N && board[r][c] === player) {
                    line.push({ row: r, col: c });
                    if (line.length === 5) return { player, line };
                    r += dr; c += dc;
                }
            }
        }
    }
    return null;
}
