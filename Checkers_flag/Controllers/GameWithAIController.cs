using Microsoft.AspNetCore.Mvc;
using System.Numerics;

namespace Checkers_flag.Controllers
{
    public class GameWithAIController : Controller
    {

        //private static CaroGame game = new CaroGame(10);

        //[HttpPost]
        //public JsonResult Move(int row, int col, int player)
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
        //public JsonResult GetBoard()
        //{
        //    return Json(new
        //    {
        //        board = game.Board,
        //        currentPlayer = game.CurrentPlayer
        //    });
        //}
    }
}

