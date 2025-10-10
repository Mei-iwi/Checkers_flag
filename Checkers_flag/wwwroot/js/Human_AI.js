// ================== CONFIG ==================
// Kích thước bàn cờ
const N = 10;
// Tạo ma trận lưu trạng thái bàn cờ (0 = trống, 1 = người, 2 = AI)
const cells = Array.from({ length: N }, () => Array(N).fill(0));
// Lượt chơi hiện tại (1 = người, 2 = AI)
let currentPlayer = 1;
// Biến trạng thái trò chơi(true: đang chơi; false: chưa bắt đầu hoặc kết thúc)
let gameStarted = false;
// Biến timer
let timerId = null;
// Thời gian còn lại mỗi lượt (giây)
let timeLeft = 30;

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
            // khi người chơi click vào ô cờ sẽ gọi hàm handleClick với tọa độ ô
            cell.addEventListener("click", () => handleClick(i, j));
            //thêm ô này vào bàn cờ hiểtn thị
            boardDiv.appendChild(cell);
        }
    }
}

// ================== RENDER BÀN ==================
// Cập nhật lại bàn cờ dựa trên trạng thái cells[], highlight nước đi cuối (lastMove)
function renderBoard(board, lastMove = null) {
    const cellDivs = boardDiv.querySelectorAll(".cell");

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const index = i * N + j; // xác định chỉ số ô trong NodeList
            const cellEl = cellDivs[index];
            if (!cellEl) continue; // nếu không có lỗi (DOM) thì bỏ qua

            // ================== RESET Ô ==================
            //Xoá nội dung và màu nền ô
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

    // Cập nhật text ngay khi AI chuẩn bị đi
    $("#who").html("Lượt đi của: <span style='font-weight:bold; color:blue'>O</span> (AI đang tính...)");

    // Gửi nước đi của người chơi lên server
    $.post("/GameWithAI/Move", { row: i, col: j }, function (res) {
        // nếu server trả về lỗi
        if (!res.success) {
            alert(res.message);
            isAITurn = false; // mở lại lượt cho người nếu lỗi
            $("#who").text("Lượt đi của: ❌ (Người)"); // reset text
            return;
        }

        // Cập nhật nước đi từ server (AI vừa đi)
        updateBoardFromServer(res);
        //nếu ván đấu kết thúc
        if (res.isWin || res.isDraw) {
            endGame(res);
        } else {
            // Trả lượt cho AI nếu chưa kết thúc(hoặc AI đã đi xong)
            switchTurn(res.currentPlayer);
        }
    });
}

// ================== CẬP NHẬT BÀN TỪ SERVER ==================
// Nhận kết quả từ server và cập nhật bàn cờ
function updateBoardFromServer(res) {
    if (res.lastMove) {
        const { row, col } = res.lastMove;

        // Xác định nước đi cuối là của ai
        let value = 0;
        if (res.isWin || res.isDraw) {
            // Nếu AI thắng hoặc người thắng, lấy winner
            value = res.winner;
        } else {
            // Nếu chưa thắng, nước đi cuối luôn là AI vì người đi trước đã render
            value = 2;
        }
            //Gán giá trị và vẽ lại bàn
        cells[row][col] = value;

        // Render lại bàn với highlight nước đi cuối
        renderBoard(cells, res.lastMove);
    }
}


// ================== TIMER ==================
// Bắt đầu countdown mỗi lượt 30s
function startTimer() {
    clearInterval(timerId); // Reset lại timer cũ nếu đang chạy
    timeLeft = 30; // đặt lại thời gian bộ đém là 30s

    timerId = setInterval(() => {
        timeLeft--;
        $("#time").text("Time: " + timeLeft + " s");//hiển thị thời gian còn lại(đếm ngược 30s)

        if (timeLeft <= 0) {
            clearInterval(timerId);//nếu bộ đếm về 0 thì dừng đếm

            if (currentPlayer === 1) {
                // Người chơi hết giờ ->Chuyển lượt qua AI ->  AI random nước đi
                const move = getRandomAIMove(cells);
                if (move) {
                    cells[move.row][move.col] = 2;//néu AI có nước đi thì gán vào mảng
                    renderBoard(cells, move);//vẽ lại nước đi của AI ở vị trí đó
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
    clearInterval(timerId);//   dừng timer cũ
    currentPlayer = nextPlayer;// chuyển lượt chơi sang người chơi tiếp theo

    if (currentPlayer === 1) {
        // Lượt người
        $("#who").text("Lượt đi hiện tại: ❌ (Người)");// cập nhật text thuộc về người
        isAITurn = false;// mở khóa lượt người
        startTimer();// bắt đầu đếm ngược 30s cho người
    } else {
        // Lượt AI
        isAITurn = true;// khóa lượt người

        setTimeout(() => {  // Delay AI
            const move = getRandomAIMove(cells); // Chon nước đi ngẫu nhiên(hoặc từ server)
            if (move) {// nếu có nước đi
                cells[move.row][move.col] = 2;// gán vào mảng
                renderBoard(cells, move);// vẽ lại bàn với nước đi của AI
            }

            // Sau khi AI đi xong, trả lượt người
            switchTurn(1);
        }, 1000); // delay AI
    }
}
// ================== START GAME ==================
$("#btnStart").click(function (e) {//bắt sự kiện click vào nút start
    e.stopPropagation();//ngăn sự kiện lkan truyền ra ngoài phần tử hiện tại
    const selected = $('input[name="firstPlayer"]:checked').val();//lấy người đi trước từ radbtn
    currentPlayer = parseInt(selected);
    // Gọi API khởi tạo game mới trên server
    $.get("/GameWithAI/ResetGame?firstPlayer=" + currentPlayer, function (res) {
        if (!res.success) return;
        resetBoard() //làm mới bàn cờ
        createBoard();//tạo bàn cờ mới

        if (res.lastMove && currentPlayer === 2) {
            // AI đi trước -> server trả về nước đi của AI
            const { row, col } = res.lastMove;
            cells[row][col] = 2; // chỉ lưu, chưa render

            $("#who").html("Lượt đi hiện tại: <span style='font-weight:bold; color:blue'>O</span> (AI đang tính...)");
            isAITurn = true;// khóa lượt người

            // Delay 2 giây mới hiển thị nước đi của AI(render 0)
            setTimeout(() => {
                renderBoard(cells, res.lastMove); // bây giờ mới hiển thị O
                switchTurn(1); // trả lượt cho người
                isAITurn = false;
            }, 2000);
        } else {
            updateBoardFromServer(res); // nếu người đi trước, render ngay
            switchTurn(currentPlayer);//đổi lượt chơi
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
    $("#overlay").fadeIn();//hiện popup kết thúc
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
    currentPlayer = 1;   // mặc định người đi trước
    gameStarted = false;   // trò chơi chưa bắt đầu
    isAITurn = false;// mở khóa lượt người
    clearInterval(timerId);// dừng timer nếu đang chạy
    timeLeft = 30;// đặt lại thời gian bộ đếm là 30s cho lượt mới

    // 4. Reset hiển thị timer và lượt chơi
    $("#time").text("Time: 30 s");// hiển thị thời gian mặc định
    $("#who").text("Lượt đi hiện tại: ❌ (Người)");// hiển thị lượt đi là người
}
