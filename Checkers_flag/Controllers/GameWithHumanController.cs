using Microsoft.AspNetCore.Mvc;
using System.Numerics;

namespace Checkers_flag.Controllers
{
    public class GameWithHumanController : Controller
    {
        /*
           Size = size;
        Board = Enumerable.Range(0, Size)
                          .Select(r => Enumerable.Repeat(0, Size).ToList())
                          .ToList();
        
         
         Board = new List<List<int>>();
            for (int i = 0; i < Size; i++)
            {
                var row = new List<int>();
                for (int j = 0; j < Size; j++)
                {
                    row.Add(0); // mặc định tất cả ô = 0
                }
                Board.Add(row);
            }
         */
        //private static CaroGame game = new CaroGame(10);

        //[HttpPost]
        //public JsonResult MoveHuman(int row, int col, int player)
        //{

        //    var result = game.Minimax(row, col, player);

        //    return Json(new
        //    {
        //        success = result.success,
        //        board = game.Board,
        //        currentPlayer = game.CurrentPlayer,
        //        isWin = result.isWin,
        //        isDraw = result.isDraw,
        //        winner = result.winner
        //    });
        //}
        //[HttpGet]
        //public JsonResult ResetGame()
        //{
        //    game = new CaroGame(10);
        //    return Json(new { message = "Trận mới đã bắt đầu!", board = game.Board, currentPlayer = game.CurrentPlayer });
        //}
    }
}
