using Checkers_flag.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Collections.Generic;

namespace Checkers_flag.Controllers
{
    public class GameWithAIController : Controller
    {
        private static int[,] board = new int[10, 10];
        private Minimax_Algorithm minimaxAI = new Minimax_Algorithm();
        private static int currentPlayer = 1; // 1: người, 2: AI

        [HttpGet]
        public IActionResult ResetGame(int firstPlayer = 1)
        {
            board = new int[10, 10];
            currentPlayer = firstPlayer;

            object lastMove = null;

            if (currentPlayer == 2)
            {
                minimaxAI.a = board;
                int aiRow, aiCol;
                minimaxAI.minimax(2, true, int.MinValue, int.MaxValue, out aiRow, out aiCol);
                if (aiRow >= 0 && aiCol >= 0)
                {
                    board[aiRow, aiCol] = 2;   // AI đánh theo thuật toán
                    lastMove = new { row = aiRow, col = aiCol };
                }
                currentPlayer = 1;  // Chuyển lượt về người chơi
            }


            return Json(new { success = true, board = ToJagged(board), currentPlayer, lastMove });
        }

        [HttpPost]
        public IActionResult Move([FromForm] int row, [FromForm] int col)
        {
            if (row < 0 || row >= 10 || col < 0 || col >= 10 || board[row, col] != 0)
                return Json(new { success = false, message = "Ô không hợp lệ!" });

            if (currentPlayer != 1)
                return Json(new { success = false, message = "Không phải lượt người chơi!" });

            board[row, col] = 1;
            var check = new Checkgame(board);

            if (check.ktr(row, col, 1))
                return Json(new { success = true, board = ToJagged(board), currentPlayer = 0, isWin = true, winner = 1, message = "Người chơi thắng!" });

            if (board.Cast<int>().All(x => x != 0))
                return Json(new { success = true, board = ToJagged(board), currentPlayer = 0, isDraw = true, winner = 0, message = "Hòa!" });

            // --- AI đánh ---
            minimaxAI.a = board;
            int aiRow = -1, aiCol = -1;
            object lastMove = null;

            // Tìm nước đi phòng thủ
            var dangerousMoves = new List<(int i, int j, int threatLength)>();
            int N = board.GetLength(0);

            for (int i = 0; i < N; i++)
            {
                for (int j = 0; j < N; j++)
                {
                    if (board[i, j] == 0)
                    {
                        for (int len = 5; len >= 3; len--)
                        {
                            if (minimaxAI.IsPlayerAboutToWin(i, j, 1, len))
                            {
                                dangerousMoves.Add((i, j, len));
                                break;
                            }
                        }
                    }
                }
            }

            if (dangerousMoves.Count > 0)
            {
                int maxLen = dangerousMoves.Max(x => x.threatLength);
                var bestMoves = dangerousMoves.Where(x => x.threatLength == maxLen).ToList();
                (aiRow, aiCol) = (bestMoves[0].i, bestMoves[0].j);
                board[aiRow, aiCol] = 2;
                lastMove = new { row = aiRow, col = aiCol };
            }
            else
            {
                minimaxAI.minimax(2, true, int.MinValue, int.MaxValue, out aiRow, out aiCol);
                if (aiRow >= 0 && aiCol >= 0)
                {
                    board[aiRow, aiCol] = 2;
                    lastMove = new { row = aiRow, col = aiCol };
                }
            }

            check = new Checkgame(board);
            if (check.ktr(aiRow, aiCol, 2))
                return Json(new { success = true, board = ToJagged(board), currentPlayer = 0, isWin = true, winner = 2, lastMove, message = "AI thắng!" });

            if (board.Cast<int>().All(x => x != 0))
                return Json(new { success = true, board = ToJagged(board), currentPlayer = 0, isDraw = true, winner = 0, lastMove, message = "Hòa!" });

            currentPlayer = 1;
            return Json(new { success = true, board = ToJagged(board), currentPlayer, lastMove, isWin = false, isDraw = false, winner = 0 });
        }

        private int[][] ToJagged(int[,] twoDim)
        {
            int n = twoDim.GetLength(0);
            int m = twoDim.GetLength(1);
            int[][] jagged = new int[n][];
            for (int i = 0; i < n; i++)
            {
                jagged[i] = new int[m];
                for (int j = 0; j < m; j++)
                    jagged[i][j] = twoDim[i, j];
            }
            return jagged;
        }
    }
}
