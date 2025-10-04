using Checkers_flag.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Collections.Generic;

namespace Checkers_flag.Controllers
{
    public class GameWithAIController : Controller
    {
        //Khởi tạo ma trận 10 * 10 cho trò chơi
        private static int[,] board = new int[10, 10];

        //Tạo đối tượng minimaxAI
        private Minimax_Algorithm minimaxAI = new Minimax_Algorithm();

        //Lượt chơi mặt định (Người đi trước)
        private static int currentPlayer = 1; // 1: người, 2: AI


        //Thiết lập lại trò chơi
        [HttpGet]
        public IActionResult ResetGame(int firstPlayer = 1)
        {
            int N = 10; // kích thước bàn cờ
            board = new int[N, N];
            currentPlayer = firstPlayer;
            object lastMove = null;

            // Nếu AI đi trước → random nước đầu
            if (firstPlayer == 2)
            {
                var rnd = new Random();
                int aiRow, aiCol;
                do
                {
                    aiRow = rnd.Next(0, N);
                    aiCol = rnd.Next(0, N);
                } while (board[aiRow, aiCol] != 0);

                board[aiRow, aiCol] = 2; // AI đánh
                lastMove = new { row = aiRow, col = aiCol };

                // Sau khi AI đi thì đến lượt người chơi
                currentPlayer = 1;
            }

            /*
             
            Trả dữ liệu về View ()

            success thông báo cho phía ajax biết gọi API thành công

            ToJagged chuyển đổi mảng 2 chiều sang jagged array (int[][]) trước khi đưa vào JSON

            currentPlayer lượt đi tiếp theo

            lastMove nước đi cuối cùng người chơi vùa thực hiện



             */
            return Json(new { success = true, board = ToJagged(board), currentPlayer, lastMove });
        }

        //Thực hiện nước đi của AI
        // [FromForm] Nhận dữ liệu từ form HTML hoặc từ form-data trong body của request
        [HttpPost]
        public IActionResult Move([FromForm] int row, [FromForm] int col)
        {
            int N = board.GetLength(0);

            // ================== 1. KIỂM TRA NƯỚC ĐI CỦA NGƯỜI ==================
            if (row < 0 || row >= N || col < 0 || col >= N || board[row, col] != 0)
                return Json(new { success = false, message = "Ô không hợp lệ!" });

            if (currentPlayer != 1)
                return Json(new { success = false, message = "Không phải lượt người chơi!" });

            board[row, col] = 1; // Cập nhật bàn cờ
            var check = new Checkgame(board);

            // Kiểm tra người chơi thắng
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

            // Kiểm tra hòa
            if (board.Cast<int>().All(x => x != 0))
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
            minimaxAI.a = board;
            int aiRow = -1, aiCol = -1;
            object lastMoveAI = null;

            var attackMoves = new List<(int i, int j, int score)>();
            var defenseMoves = new List<(int i, int j, int score)>();

            for (int i = 0; i < N; i++)
            {
                for (int j = 0; j < N; j++)
                {
                    if (board[i, j] != 0) continue;

                    int attackScore = minimaxAI.EvaluateCell(i, j, 2);
                    if (attackScore > 0) attackMoves.Add((i, j, attackScore));

                    int defenseScore = minimaxAI.EvaluateCell(i, j, 1);
                    if (defenseScore > 0) defenseMoves.Add((i, j, defenseScore));
                }
            }

            // ================== 3. QUYẾT ĐỊNH NƯỚC ĐI ==================
            if (attackMoves.Count > 0)
            {
                var bestAttack = attackMoves.OrderByDescending(x => x.score).First();
                aiRow = bestAttack.i; aiCol = bestAttack.j;
            }

            if (defenseMoves.Count > 0)
            {
                var bestDefense = defenseMoves.OrderByDescending(x => x.score).First();
                int maxAttack = attackMoves.Count > 0 ? attackMoves.Max(x => x.score) : 0;

                if (bestDefense.score >= maxAttack)
                {
                    aiRow = bestDefense.i; aiCol = bestDefense.j;
                }
            }

            if (aiRow == -1 || aiCol == -1)
            {
                minimaxAI.minimax(6, true, int.MinValue, int.MaxValue, out aiRow, out aiCol);
            }

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
                    jagged[i][j] = twoDim[i, j];
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

