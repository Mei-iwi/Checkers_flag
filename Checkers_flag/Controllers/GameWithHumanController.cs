using Checkers_flag.Models;
using Microsoft.AspNetCore.Mvc;
using System.Numerics;

namespace Checkers_flag.Controllers
{
    public class GameWithHumanController : Controller
    {

        private int[,] ToArray(List<List<int>> board)
        {
            int n = board.Count;
            int m = board[0].Count;
            var arr = new int[n, m];
            for (int i = 0; i < n; i++)
                for (int j = 0; j < m; j++)
                    arr[i, j] = board[i][j];
            return arr;
        }

        private static List<List<int>> Board = Enumerable.Range(0, 10)
                          .Select(r => Enumerable.Repeat(0, 10).ToList())
                          .ToList();

        static int CurrentPlayer = 1;

        [HttpPost]
        public JsonResult MoveHuman(int row, int col, int player)
        {
            // Nếu ô đã có giá trị thì từ chối
            if (Board[row][col] != 0)
            {
                return Json(new { success = false, message = "Ô đã được đánh!" });
            }

            // Đặt quân cờ vào bàn
            Board[row][col] = player;

            // Kiểm tra thắng thua
            var array = ToArray(Board);
            var Win = new Checkgame(array);
            bool isWin = Win.ktr(row, col, player);
            bool isDraw = !isWin && Board.All(r => r.All(c => c != 0));

            int winner = isWin ? player : 0;

            // Đổi lượt (chỉ khi chưa kết thúc game)
            if (!isWin && !isDraw)
            {
                CurrentPlayer = (player == 1) ? 2 : 1;
            }

            return Json(new
            {
                success = true,
                board = Board,
                currentPlayer = CurrentPlayer,
                isWin,
                isDraw,
                winner,
                message = isWin ? $"Người chơi {player} thắng!" : isDraw ? "Hòa!" : $"Lượt tiếp theo: {(CurrentPlayer == 1 ? "X" : "O")}"
            });
        }

        [HttpGet]
        public JsonResult ResetGame()
        {
            Board.Clear();
            Board = Enumerable.Range(0, 10)
                              .Select(r => Enumerable.Repeat(0, 10).ToList())
                              .ToList();
            CurrentPlayer = 1;



            return Json(new
            {
                message = "Trận mới đã bắt đầu!",
                board = Board,
                currentPlayer = CurrentPlayer
            });
        }

    }
}
