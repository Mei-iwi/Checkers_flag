using Checkers_flag.Models;
using Microsoft.AspNetCore.Mvc;
using System.Numerics;

namespace Checkers_flag.Controllers
{
    // Controller điều khiển chế độ chơi Người vs Người
    // Nhận nước đi từ client, xử lý logic đánh cờ, kiểm tra thắng/hòa và trả kết quả JSON.
    public class GameWithHumanController : Controller
    {


        //Khởi tạo mảng 2 chiều chuyển đổi từ List sang mảng [,]
        private int[,] ToArray(List<List<int>> board)
        {

            //Lấy số hàng
            int n = board.Count;

            //Lấy số cột trong 1 hàng
            int m = board[0].Count;

            //Khởi tạo ma trận n hàng, m cột
            var arr = new int[n, m];

           // Duyệt từng phần tử để sao chép từ danh sách gốc sang mảng
            for (int i = 0; i < n; i++)         // i = chỉ số hàng (row); bắt đầu 0, lặp tới n-1
                for (int j = 0; j < m; j++)     // j = chỉ số cột (column) trong hàng i; bắt đầu 0, lặp tới m-1
                    arr[i, j] = board[i][j];    // sao chép giá trị tại hàng i, cột j từ board (List<List<int>>) sang arr (int[,])


            //Trả về mảng kết quả
            return arr;
        }

        //Khởi tạo List hai chiều có phạm vi 10 * 10
        // Bàn cờ 10x10, 0 = trống, 1 = người chơi 1, 2 = người chơi 2
        private static List<List<int>> Board = Enumerable.Range(0, 15) //-> Taọ 10 hàng
                          .Select(r => Enumerable.Repeat(0, 15).ToList()) //-> Mỗi hàng lặp lại 10 cột -> Đưa về danh sách
                          .ToList(); //Gộp lại thành danh sách 2 chiều

        //Khởi tạo người chơi mặc định là người chơi 1
        static int CurrentPlayer = 1;


        //Nhận tín hiệu từ phía View (View -> js -> cs -> model)
        [HttpPost]
        public JsonResult MoveHuman(int row, int col, int player)
        {
            // Nếu ô đã có giá trị thì từ chối và xuất thông báo lỗi
            if (Board[row][col] != 0)
            {
                /*
                 success = false: Tín hiệu kết nối API không hoàn hành

                 message = "Ô đã được đánh!" : Lý do không hoàn thành
                 */
                return Json(new { success = false, message = "Ô đã được đánh!" });
            }


            //Trường hợp nước đi hợp lệ

            // Ô hợp lệ → Gán quân của người chơi vào vị trí [row][col]
            Board[row][col] = player;

            // Kiểm tra thắng thua hoà
            var array = ToArray(Board); //-> Chuyển tử List sang dạng mảng

            //Tạo đối tượng kiểm tra thắng thua
            var Win = new Checkgame(array);

            //Nếu có người thắng(5 quân cờ liên tiếp) gán lại kết quả -> (cột, hàng, lượt người chơi)
            bool isWin = Win.ktr(row, col, player);

            //Nếu hòa -> Không có thắng và toàn bộ bảng hết nước đi (tức không còn giá trị 0 khởi tạo)
            bool isDraw = !isWin && Board.All(r => r.All(c => c != 0));


            //Kết quả kiểm tra -> Nếu có người thắng trả về người thắng nếu không trả về 0
            int winner = isWin ? player : 0;

            // Đổi lượt cho người chơi kế tiếp nếu game chưa kết thúc
            if (!isWin && !isDraw)
            {
                // Nếu người chơi hiện tại là 1 thì đổi sang 2, và ngược lại
                CurrentPlayer = (player == 1) ? 2 : 1;
            }
            //Dữ liệu trả về

            /*
             success: Cho biết lời gọi API có thành công hay không.

            board: Trạng thái bàn cờ hiện tại (dưới dạng [][] để dễ truyền về JSON).

            currentPlayer: Lượt đi tiếp theo (1 = Người, 2 = AI).

            isWin: Cờ bool cho biết có người thắng chưa.

            isDraw: Cờ bool cho biết ván cờ có hòa không (không còn ô trống).

            winner: Người thắng (1 hoặc 2), null nếu chưa ai thắng.

            message: Chuỗi thông báo hiển thị cho người chơi:

                Nếu có người thắng → "Người chơi {player} thắng!".

                Nếu hòa → "Hòa!".

                Nếu chưa kết thúc → "Lượt tiếp theo: X" hoặc "Lượt tiếp theo: O".
             
             */
             //Trả kêt quả về client
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

        //Làm mới bàn cờ, thiết lập lại trò chơi cho ván mới hoặc bắt đầu
        [HttpGet]
        public JsonResult ResetGame()
        {
            //Xóa toàn bộ dữ liệu bàn cờ cũ
            Board.Clear();

            //Khởi tạo lại bảng mới
            Board = Enumerable.Range(0, 15)
                              .Select(r => Enumerable.Repeat(0, 15).ToList())
                              .ToList();

            //Khởi tạo lượt đánh mặc định
            CurrentPlayer = 1;


            /*
             message: Thông báo hiển thị cho người chơi, ở đây là "Trận mới đã bắt đầu!".

            board: Trạng thái bàn cờ sau khi khởi tạo lại (ma trận toàn số 0, tức là chưa có nước đi nào).

            currentPlayer: Lượt đi đầu tiên (theo giá trị CurrentPlayer, có thể là người hoặc AI).
             */

            // Trả về dữ liệu JSON thông báo làm mới thành công
            return Json(new
            {
                message = "Trận mới đã bắt đầu!",
                board = Board,
                currentPlayer = CurrentPlayer
            });
        }

    }
}
//**************************************************************************************   TỔNG KẾT    ******************************************************************************
/*
 Hàm MoveHuman

    Xử lý một nước đi của người chơi.

    Kiểm tra hợp lệ (ô chưa được đánh).

    Đặt quân cờ vào bảng.

    Kiểm tra thắng/thua/hòa:

    Thắng nếu có 5 quân liên tiếp.

    Hòa nếu không còn ô trống và chưa có người thắng.

    Cập nhật lượt đi tiếp theo (CurrentPlayer).

    Trả kết quả JSON gồm:

    board: trạng thái bàn cờ hiện tại.

    currentPlayer: lượt người chơi kế tiếp.

    isWin, isDraw, winner: thông tin thắng/thua/hòa.

    message: thông báo phù hợp ("Người chơi X thắng!", "Hòa!", hoặc "Lượt tiếp theo: …").

Hàm ResetGame

    Xóa dữ liệu bàn cờ cũ và khởi tạo lại bàn 10x10 (toàn số 0).

    Đặt CurrentPlayer = 1 để người chơi 1 đi trước.

    Trả về JSON gồm:

    message: "Trận mới đã bắt đầu!".

    board: bàn cờ mới.

    currentPlayer: lượt đầu tiên.
 
 */