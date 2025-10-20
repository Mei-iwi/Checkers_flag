using Checkers_flag.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Collections.Generic;

namespace Checkers_flag.Controllers
{
    // Controller điều khiển chế độ chơi Người vs AI
    // Xử lý lượt đánh của người, phản hồi nước đi của AI bằng chiến lược Minimax hoặc heuristic.
    public class GameWithAIController : Controller
    {
        //Khởi tạo ma trận 10 * 10 cho trò chơi
        private static int[,] board = new int[15, 15];

        //Tạo đối tượng minimaxAI
        private Minimax_Algorithm minimaxAI = new Minimax_Algorithm();

        // Khởi tạo lượt chơi mặt định (Người đi trước)
        private static int currentPlayer = 1; // 1: người, 2: AI


        //Thiết lập lại trò chơi
        [HttpGet]
        public IActionResult ResetGame(int firstPlayer = 1)
        {
            int N = 15; // kích thước bàn cờ
            board = new int[N, N]; // làm mới bàn cờ
            currentPlayer = firstPlayer; // thiết lập người chơi đầu tiên la người chơi 1(Người)
            object lastMove = null; //lưu lại nước đi cuối cùng

            // Nếu AI đi trước → random một ô ngẫu nhiên
            if (firstPlayer == 2)
            {
                var rnd = new Random();
                int aiRow, aiCol;

                // Chỉ chọn trong ô 3x3 giữa bàn cờ 15x15
                int start = N / 2 - 1; // = 15/2 - 1 = 6
                int end = N / 2 + 1;   // = 7 + 1 = 8

                do
                {
                    aiRow = rnd.Next(start, end + 1); // [6, 8]
                    aiCol = rnd.Next(start, end + 1); // [6, 8]
                } while (board[aiRow, aiCol] != 0); // Tìm ô trống

                board[aiRow, aiCol] = 2; // AI đánh quân cờ
                lastMove = new { row = aiRow, col = aiCol };

                currentPlayer = 1;
            }



            // Trả kết quả khởi tạo về client (AJAX)
            return Json(new
            {
                success = true,               // API gọi thành công
                board = ToJagged(board),      // chuyển ma trận [,] → [][] để JSON hóa
                currentPlayer,                // lượt đi tiếp theo
                lastMove                      // nước đi cuối cùng (nếu có)
            });
        }

        //Thực hiện nước đi của AI
        // [FromForm] Nhận dữ liệu từ form HTML hoặc từ form-data trong body của request
        [HttpPost]
        public IActionResult Move([FromForm] int row, [FromForm] int col)
        {
            int N = board.GetLength(0);// lấy kích thước bàn cờ

            // ================== 1. KIỂM TRA NƯỚC ĐI CỦA NGƯỜI ==================
            //Nếu đánh ngoài bàn hoặc ô đã có người đánh -> báo lỗi
            if (row < 0 || row >= N || col < 0 || col >= N || board[row, col] != 0)
                return Json(new { success = false, message = "Ô không hợp lệ!" });
            //Nếu không phải lượt người chơi → báo lỗi
            if (currentPlayer != 1)
                return Json(new { success = false, message = "Không phải lượt người chơi!" });
            // Ghi lại nước đi của người chơi
            board[row, col] = 1; // Cập nhật bàn cờ
            var check = new Checkgame(board);

            // Kiểm tra người chơi thắng sau nước đi
            // Trả kết quả dạng JSON về cho giao diện: 
            // - success = true → nước đi hợp lệ
            // - board = ToJagged(board) → chuyển mảng 2D sang dạng có thể gửi về JSON
            // - currentPlayer = 0 → dừng lượt chơi (vì đã thắng)
            // - isWin = true → trạng thái thắng
            // - winner = 1 → người chơi thắng
            // - lastMove = {row, col} → vị trí nước đi cuối
            // - message = "Người chơi thắng!" → thông báo hiển thị
            if (check.ktr(row, col, 1))
                return Json(new
                {
                    success = true,
                    board = ToJagged(board),
                    currentPlayer = 0,
                    isWin = true,
                    winner = 1,
                    lastMove = new { row, col },
                    message = "Người chơi thắng!"
                });

            // Kiểm tra hòa(Khi toàn bộ bàn đã đầy)
            if (board.Cast<int>().All(x => x != 0))
                // Nếu đúng → trả kết quả JSON báo hòa:
                // - success = true → nước đi hợp lệ
                // - board = bàn cờ hiện tại
                // - currentPlayer = 0 → dừng lượt (vì đã kết thúc)
                // - isDraw = true → đánh dấu là hòa
                // - winner = 0 → không có người thắng
                // - lastMove → nước đi cuối
                // - message = "Hòa!" → hiển thị thông báo
                return Json(new
                {
                    success = true,
                    board = ToJagged(board),
                    currentPlayer = 0,
                    isDraw = true,
                    winner = 0,
                    lastMove = new { row, col },
                    message = "Hòa!"
                });

            // ================== 2. AI ĐI ==================
            minimaxAI.a = board; // Gán bạn cờ cho AI xử lý
            int aiRow = -1, aiCol = -1;
            object lastMoveAI = null;
            //Hai danh sách lưu các nước tấn công và phòng thủ
            var attackMoves = new List<(int i, int j, int score)>();// Các nước tấn công tốt
            var defenseMoves = new List<(int i, int j, int score)>(); // Các nước phòng thủ tốt
            //Duyệt toàn bộ bàn cờ để tính điểm các ô trống
            for (int i = 0; i < N; i++)
            {
                for (int j = 0; j < N; j++)
                {
                    if (board[i, j] != 0) continue; // bỏ qua các ô đã đánh
                    // Tính điểm tấn công cho AI (đánh vào ô có lợi cho mình)
                    int attackScore = minimaxAI.EvaluateCell(i, j, 2);
                    if (attackScore > 0) attackMoves.Add((i, j, attackScore));
                    // Đánh giá điểm phòng thủ (chặn người choiq)
                    int defenseScore = minimaxAI.EvaluateCell(i, j, 1);
                    if (defenseScore > 0) defenseMoves.Add((i, j, defenseScore));
                }
            }

            // ================== 3. QUYẾT ĐỊNH NƯỚC ĐI TỐT NHẤT ==================
            //Ưu tiên nước tấn công có điểm cao nhất
            //if (attackMoves.Count > 0)
            //{
            //    var bestAttack = attackMoves.OrderByDescending(x => x.score).First();
            //    aiRow = bestAttack.i; aiCol = bestAttack.j;
            //}
            if (attackMoves.Count > 0)
            {
                // Lấy 3 nước tấn công mạnh nhất
                var topMoves = attackMoves.OrderByDescending(x => x.score).Take(3);
                int bestVal = int.MinValue;
                foreach (var move in topMoves)
                {
                    board[move.i, move.j] = 2;
                    int eval = minimaxAI.minimax(3, false, int.MinValue, int.MaxValue, out _, out _);
                    board[move.i, move.j] = 0;
                    if (eval > bestVal)
                    {
                        bestVal = eval;
                        aiRow = move.i;
                        aiCol = move.j;
                    }
                }
            }

            //So sánh nước phòng thủ-> nếu cần ưu tiên chặn người chơi thắng
            if (defenseMoves.Count > 0)
            {
                var bestDefense = defenseMoves.OrderByDescending(x => x.score).First();
                int maxAttack = attackMoves.Count > 0 ? attackMoves.Max(x => x.score) : 0;
                // Nếu điểm phòng thủ >= điểm tấn công → ưu tiên chặn người
                if (bestDefense.score >= maxAttack)
                {
                    aiRow = bestDefense.i; aiCol = bestDefense.j;
                }
            }
            // Nếu không tìm được nước đi phù hợp → dùng Minimax
            if (aiRow == -1 || aiCol == -1)
            {
                minimaxAI.minimax(4, true, int.MinValue, int.MaxValue, out aiRow, out aiCol);
            }
            // Đánh nước đi của AI
            if (aiRow >= 0 && aiCol >= 0)
            {
                board[aiRow, aiCol] = 2;
                lastMoveAI = new { row = aiRow, col = aiCol };
            }

            // ================== 4. KIỂM TRA AI THẮNG/HÒA ==================
            if (lastMoveAI != null)
            {
                var move = (dynamic)lastMoveAI;
                check = new Checkgame(board);
                // Kiểm tra AI thắng trả về kết quả
                if (check.ktr(move.row, move.col, 2))
                    return Json(new
                    {
                        success = true,
                        board = ToJagged(board),
                        currentPlayer = 0,
                        isWin = true,
                        winner = 2,
                        lastMove = lastMoveAI,
                        message = "AI thắng!"
                    });
                //Kiểm tra, nếu kết quả hoà bào hoà
                if (board.Cast<int>().All(x => x != 0))
                    return Json(new
                    {
                        success = true,
                        board = ToJagged(board),
                        currentPlayer = 0,
                        isDraw = true,
                        winner = 0,
                        lastMove = lastMoveAI,
                        message = "Hòa!"
                    });
            }

            // ================== 5. TRẢ QUYỀN CHO NGƯỜI ==================
            currentPlayer = 1;
            return Json(new
            {
                success = true,
                board = ToJagged(board),
                currentPlayer,
                lastMove = lastMoveAI,
                isWin = false,
                isDraw = false,
                winner = 0
            });
        }



        //Hàm chuyển đổi từ ma trận 2 chiều ([,]) sang jagged array ([][])
        private int[][] ToJagged(int[,] twoDim)
        {
            //Lấy số hàng
            int n = twoDim.GetLength(0);

            //Lấy số cột
            int m = twoDim.GetLength(1);

            //Khởi tạo mảng 2 chiều 
            int[][] jagged = new int[n][];

            //Sao chép mảng ([,]) sang jagged array ([][])
            for (int i = 0; i < n; i++)
            {
                jagged[i] = new int[m];
                for (int j = 0; j < m; j++)
                    jagged[i][j] = twoDim[i, j];//sao chép từng phần tử
            }
            //Trả về mảng có thể truyền qua json
            return jagged;
        }
    }
}
//**************************************************************************************   TỔNG KẾT    ******************************************************************************
/*
 
 Quản lý bàn cờ:

    Sử dụng ma trận 10x10 (board) để lưu trạng thái trò chơi.

    1 đại diện cho người chơi, 2 đại diện cho AI, 0 là ô trống.

ResetGame:

    Khởi tạo lại bàn cờ.

    Nếu AI đi trước → gọi thuật toán minimax để chọn nước đi đầu tiên, đánh vào bàn và lưu lại lastMove.

    Trả về JSON chứa trạng thái bàn cờ, lượt chơi tiếp theo và nước đi cuối cùng.

    Move (người chơi đi):

    Nhận tọa độ nước đi từ form-data ([FromForm]).

    Kiểm tra hợp lệ (không đánh ngoài bàn, không đánh đè).

    Cập nhật bàn cờ và kiểm tra thắng/hòa:

    Nếu người thắng → trả JSON với thông tin chiến thắng.

    Nếu hòa (bàn đầy) → trả JSON với kết quả hòa.

AI phản ứng:

    Nếu người chưa thắng/hòa → AI sẽ đi:

    Trước hết kiểm tra các mối đe dọa nguy hiểm (3, 4, 5 liên tiếp) → chặn ngay.

    Nếu không có mối đe dọa → dùng thuật toán minimax để chọn nước tối ưu.

    Sau khi AI đánh, tiếp tục kiểm tra thắng/hòa.

    Nếu AI chưa thắng/hòa → trả quyền lại cho người.

ToJagged:

    Chuyển đổi ma trận [,] sang jagged array [][] để có thể serialize sang JSON dễ dàng.
 */

