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
            //duyệt qua từng ô trong chuỗi thắng
            winningLine.forEach(p => {
                //lấy phần tử trong chuỗi thắng
                const el = cells[p.row * N_PvP + p.col];
                if (cellsPvP[p.row][p.col] === 1) { // ❌
                    el.style.background = blink ? "#e60000" : "#ff4d4d";//đỏ đậm,đỏ nhạt
                } else if (cellsPvP[p.row][p.col] === 2) { // O
                    el.style.background = blink ? "#0040ff" : "#66b3ff";//xanh đậm,xanh nhạt
                }
                el.style.color = "#ffffff";//màu chữ
                el.style.fontWeight = "bold";//màu nền
            });
            blink = !blink;//đảo trạng thái
        }, 400);//chạy lại mỗi 400s

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
    clearInterval(timerIdPvP);//xóa interval cũ để tránh chạy song song

    timerIdPvP = setInterval(() => {
        //xác định người chơi 1 và thời gian chơi của người chơi 1lớn hơn 0 
        if (currentPlayerPvP === 1 && timeLeftPlayer1 > 0) {
            timeLeftPlayer1--;//trừ điểm ng chơi 1
        } else if (currentPlayerPvP === 2 && timeLeftPlayer2 > 0) {
            timeLeftPlayer2--;//trừ điểm người chơi 2
        }

        // hiển thị thời gian của hai người chơi
        $("#timePlayerA").text("❌: " + formatTime(timeLeftPlayer1));//cập nhật tg chơi của player 1
        //
        $("#timePlayerB").html("<span style='color:blue;font-weight:bold;'>O</span>: " + formatTime(timeLeftPlayer2));//cập nhật lại tg player 2

        // kiểm tra hết giờ theo từng player
        if (timeLeftPlayer1 <= 0 || timeLeftPlayer2 <= 0) {
            clearInterval(timerIdPvP);//xóa interval cũ để tránh chạy song song

            if (currentPlayerPvP === 1) {//nếu đúng là player 1
                $("#who").text("❌ Hết giờ! Người chơi ❌ thua!");
                $("#winnerText").html("Hết giờ! ⏱️,  Người chơi <span style='color:blue;font-weight:bold;'>O</span>  đã thắng!");
                $("#overlay").fadeIn();
            } else {
                $("#who").html("<span style='color:blue;font-weight:bold;'>O</span> Hết giờ! Người chơi O thua!");
                $("#winnerText").html("Hết giờ! ⏱️,  Người chơi ❌  đã thắng!");
                $("#overlay").fadeIn();

            }

            // có thể thêm reset sau vài giây
            setTimeout(() => {//hết giờ
                resetTimerPvP();//reset game
            }, 3000);//đợi 3 s trước khi reset game
        }


        // tô màu cảnh báo
        highlightTime();
    }, 1000);//lặp lại sau 1s để làm hiệu ứng cảnh báo cho đồng hồ
}

function changeTurn() {
    currentPlayerPvP = currentPlayerPvP === 1 ? 2 : 1;//đảo lượt từ player 1 sang 2
    //hiện thông báo đến lượt
    document.getElementById("who").innerHTML =
        "Lượt đi của: " +
        (currentPlayerPvP === 1
            ? "❌"
            : "<span style='color:blue;font-weight:bold;'>O</span>");
}

function formatTime(seconds) {//tính số phút
    const m = Math.floor(seconds / 60);//tính số phút
    const s = seconds % 60;//tính số giây còn dư
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;//hiển thị ít nhất hai số
}

function highlightTime() {
    const currentTime = currentPlayerPvP === 1 ? timeLeftPlayer1 : timeLeftPlayer2;//lấy tg còn lại của người chơi 

    if (currentPlayerPvP === 1) {
        // tô màu người chơi A
        if (currentTime < 10) {
            $("#timePlayerA").removeClass("alert-primary alert-warning").addClass("alert-danger");//cảnh báo đỏ sắp hết giờ
        } else if (currentTime < 30) {
            $("#timePlayerA").removeClass("alert-primary alert-danger").addClass("alert-warning");//cảnh báo vàng
        } else {
            $("#timePlayerA").removeClass("alert-warning alert-danger").addClass("alert-primary");//còn h thì không cảnh báo
        }
        // giữ nguyên màu cho người B
        $("#timePlayerB").removeClass("alert-warning alert-danger").addClass("alert-primary");

    } else {
        // tô màu người chơi B tương tự A phía trên
        if (currentTime < 10) {
            $("#timePlayerB").removeClass("alert-primary alert-warning").addClass("alert-danger");//cảnh báo đỏ
        } else if (currentTime < 30) {
            $("#timePlayerB").removeClass("alert-primary alert-danger").addClass("alert-warning");//cảnh báo vàng
        } else {
            $("#timePlayerB").removeClass("alert-warning alert-danger").addClass("alert-primary");//giữ nguyen màu
        }
        // giữ nguyên màu cho người A
        $("#timePlayerA").removeClass("alert-warning alert-danger").addClass("alert-primary");
    }
}
//hàm đặt lại tg 
function resetTimerPvP() {
    clearInterval(timerIdPvP);//dừng bộ đếm
    timeLeftPlayer1 = 300;//tg ng chơi là 5 phút
    timeLeftPlayer2 = 300;//tg người chơi là 5 phút
    currentPlayerPvP = 1;//player hiện tại là 1 

    $("#timePlayerA").text("❌: " + formatTime(timeLeftPlayer1))//lấy tg của ng chơi x 
        .removeClass("alert-danger alert-warning").addClass("alert-primary");//giữ nguyên màu cho ô thời gian này
    $("#timePlayerB").html("<span style='color:blue;font-weight:bold;'>O</span>: " + formatTime(timeLeftPlayer2))//lấy tg của ng chơi o 
        .removeClass("alert-danger alert-warning").addClass("alert-primary");//giữ nguyên màu cho ô thời gian

    $("#who").text("Nhấn Bắt đầu để chơi lại");
}


// ================= NÚT BẮT ĐẦU =================
$("#btn-humman").click(function (e) {
    e.stopPropagation();

    $("#fight").fadeIn();


    const selected = $('input[name="firstPlayer"]:checked').val();
    currentPlayerPvP = parseInt(selected);


    gameStartedPvP = true;//cập nhật lại game start

    $.get("/GameWithHuman/ResetGame", function (res) {
        // Reset client theo server
        for (let r = 0; r < N_PvP; r++) {//lặp lại từng hàng
            for (let c = 0; c < N_PvP; c++) {//lặp lại từng cột của bàn cờ
                cellsPvP[r][c] = res.board[r][c];//gán giá trị từ server (res.board) cho mảng client cellsPvP.
            }
        }

        createBoardPvP();//tạo bảng
        //cập nhật thông báo lượt đi
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
    gameStartedPvP = false;//cập nhật lại trạng thái 

    $("#CancelGame").text("Bạn có chắc muốn kết thúc trò chơi");
    $("#overlayCancel").fadeIn();

    $("#btnReplayCancel").click(function (event) {//sự kiện click 
        event.stopPropagation();
        //kiểm tra xem là player 1 hay 2
        (currentPlayerPvP === 1) ? $("#CancelGame").html("<span style='color:blue;font-weight:bold;'>Người chơi O thắng</span>") : $("#CancelGame").html("Người chơi ❌ thắng");


        $("#btnReplayCancel").hide();//nút chơi lại
        $("#btnEndGame").hide();//nút kết thúc
        ///resett lại giao diện game
        setTimeout(function () {
            $("#overlayCancel").fadeOut();//Ẩn overlay thông báo kết thúc game với hiệu ứng mờ dần.
            $("#board").removeClass("show").empty();//không hiển thị bàn cờ ,reset màn chơi 
            $("#end").hide();//ẩn nút end
            $("#start").show();//hiện nút start
            $("#btnReplayCancel").show();//Hiển thị lại các nút Chơi lại và Kết thúc game cho người chơi.
            $("#btnEndGame").show();//hiện thị lại các nút chơi lại 
            resetTimerPvP();//cập nhật lại thời gian
        }, 2000);/// giữ thông báo khoảng hai giấy
    });

    $("#btnEndGame").click(function () {
        $("#overlayCancel").fadeOut();//Ẩn overlay thông báo kết thúc game với hiệu ứng mờ dần.
        gameStartedPvP = true;
    });
});

$("#btnReplay").click(function () {
    $("#overlay").fadeOut();//ẩn overplay thông báo replay ở hiệu ứng mở dần
    $("#btn-humman").click();
});
$("#btnEnd").click(function () {
    $("#overlay").fadeOut();//Ẩn overlay (có thể là thông báo game kết thúc hoặc popup) bằng hiệu ứng mờ dần (fadeOut).
    location.href = "/";
});


// ================= TÌM CHUỖI 5 QUÂN LIÊN TIẾP =================
function findWinningLinePvP(board) {
    const directions = [
        { dr: 1, dc: 0 },   // dọc(1,0)
        { dr: 0, dc: 1 },   // ngang(0,1)
        { dr: 1, dc: 1 },   // chéo xuống phải(1,1)
        { dr: 1, dc: -1 }   // chéo xuống trái(1,-1)
    ];

    for (let i = 0; i < N_PvP; i++) {//duyệt theo dòng 
        for (let j = 0; j < N_PvP; j++) {//duyệt theo cột
            const player = board[i][j];//lấy giá trị ô 
            if (player === 0) continue; // ô trống thì bỏ qua 

            for (let dir of directions) {//
                let line = [{ row: i, col: j }];//lưu vị trí liên tiếp của người chơi
                for (let k = 1; k < 5; k++) {//kiểm tra bốn ô theo hướng dir
                    const r = i + dir.dr * k;// tính vị trí dòng theo hướng dir
                    const c = j + dir.dc * k;// tính vị trí cột theo hướng dir
                    if (
                        r < 0 || r >= N_PvP || c < 0 || c >= N_PvP ||//kiểm tra vị trí mới có nằm ngoài bàn cờ không
                        board[r][c] !== player//ô tiếp theo k liên tiếp ngưng kiểm tra theo hướng đó
                    ) {
                        break;
                    }
                    line.push({ row: r, col: c });//thêm ô vào line
                }
                if (line.length === 5) {//nếu vị trí liên tiếp là 5
                    return { player, line };
                }
            }
        }
    }
    return null;
}
