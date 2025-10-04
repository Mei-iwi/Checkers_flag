
/*
 Lớp chính Minimax_Algorithm kế thừa lớp Checkgame và triển khai thuật toán Minimax với các kỹ thuật tối ưu.
    - Hàm đánh giá điểm cuối (Evaluate)
    - Đếm số quân liên tiếp (CountLine)
    - Đánh giá 1 ô (EvaluateCell)
    - Nước đi khả thi (GetCandidateMoves)
    - Minimax + Alpha-Beta (minimax)
    - Minimax không cắt tỉa (minimax_no_prune)

--> Tối ưu thời gian thực thi và hiệu quả của thuật toán Minimax trong trò chơi cờ caro.
 
 */
namespace Checkers_flag.Models
{
    public class Minimax_Algorithm : Checkgame
    {
        // ==================== 1. Hàm đánh giá điểm cuối ====================


        // Điểm tấn công/phòng thủ cơ bản cho mỗi chuỗi liên tiếp dài
        public int Evaluate(int i, int j, int player)
        {
            
            if (ktr(i, j, 1)) return 1000;
            if (ktr(i, j, 2)) return -1000;
            return diemtungnuoc(i, j, player);
        }

        // ==================== 2. Đếm số quân liên tiếp ====================
        // Đếm số chuỗi liên tiếp của 'player' có độ dài 'length' đi qua ô (row, col) 
        int CountLine(int row, int col, int player, int length)
        {
            int score = 0;
            int N = a.GetLength(0);
            // Các hướng: ngang, dọc, chéo chính, chéo phụ
            int[][] directions = new int[][]
            {
                
                new int[]{0,1}, new int[]{1,0}, new int[]{1,1}, new int[]{1,-1}
            };
            // Duyệt qua từng hướng và đếm số quân liên tiếp
            foreach (var dir in directions)
            {
                int count = 1;
                int r = row + dir[0], c = col + dir[1];
                // Đếm về phía trước của hướng
                while (r >= 0 && r < N && c >= 0 && c < N && a[r, c] == player)
                {
                    count++; r += dir[0]; c += dir[1];
                }

                r = row - dir[0]; c = col - dir[1];
                // Đếm về phía sau của hướng
                while (r >= 0 && r < N && c >= 0 && c < N && a[r, c] == player)
                {
                    count++; r -= dir[0]; c -= dir[1];
                }
                // Nếu số quân liên tiếp đạt độ dài yêu cầu, tăng điểm
                if (count >= length) score++;
            }
            //Trả về số điểm
            return score;
        }

        // ==================== 3. Đánh giá 1 ô ====================
            
        // Đánh giá điểm của ô (row, col) nếu đặt quân của 'player' vào đó 
        int EvaluateCell(int row, int col, int player)
        {
            int score = 0;
            int opponent = player == 1 ? 2 : 1;

            // Tấn công (Tối đa chiến thắng) 
            score += CountLine(row, col, player, 2) * 10;
            score += CountLine(row, col, player, 3) * 50;
            score += CountLine(row, col, player, 4) * 200;
            score += CountLine(row, col, player, 5) * 1000;

            // Phòng thủ (Ngăn đối thủ thắng)
            score -= CountLine(row, col, opponent, 2) * 50;
            score -= CountLine(row, col, opponent, 3) * 300;
            score -= CountLine(row, col, opponent, 4) * 1500;
            score -= CountLine(row, col, opponent, 5) * 5000;

            return score;
        }

        // Kiểm tra nếu đặt quân tại (row, col) sẽ khiến 'player' thắng với chuỗi dài 'length'
        public bool IsPlayerAboutToWin(int row, int col, int player, int length)
        {
            // Tạm thời đặt quân vào ô
            a[row, col] = player;
           
            bool result = CountLine(row, col, player, length) > 0;

            // Quay lại trạng thái ban đầu
            a[row, col] = 0;
            

            //Trả về kết quả
            return result;
        }

        // Kiểm tra tất cả ô trống, nếu đặt quân người chơi sẽ tạo thành 3 liên tiếp thì thêm vào danh sách chặn
        public List<(int, int)> FindAllBlockingMoves(int player)
        {
            // Danh sách các ô cần chặn để ngăn đối thủ thắng
            var blocks = new List<(int, int)>();
            int N = a.GetLength(0);

            // Duyệt qua tất cả các ô trên bàn cờ để tìm các nước đi chặn cần thiết
            for (int i = 0; i < N; i++)
            {
                for (int j = 0; j < N; j++)
                {
                    // Chỉ xét các ô trống (0)
                    if (a[i, j] == 0)
                    {
                        a[i, j] = player;
                        // Nếu đặt quân tại (i, j) sẽ tạo thành chuỗi 3 liên tiếp, thêm vào danh sách chặn
                        if (CountLine(i, j, player, 3) > 0)
                            
                            blocks.Add((i, j));


                        // Quay lại trạng thái ban đầu
                        a[i, j] = 0;
                    }
                }
            }

            // Trả về danh sách các ô cần chặn
            return blocks;
        }


        // ==================== 4. Nước đi khả thi ====================

        // Lấy danh sách các ô trống có quân cờ lân cận trong khoảng cách 2 để giới hạn phạm vi tìm kiếm nước đi
        public List<(int, int)> GetCandidateMoves()
        {

            // Danh sách các nước đi khả thi (ô trống có quân cờ lân cận)
            var moves = new List<(int, int)>();
            int N = a.GetLength(0);

            // Duyệt qua tất cả các ô trên bàn cờ để tìm các nước đi khả thi
            for (int i = 0; i < N; i++)
                for (int j = 0; j < N; j++)
                    // Chỉ xét các ô trống (0) có quân cờ lân cận trong khoảng cách 2 
                    if (a[i, j] == 0 && HasNeighbor(i, j, 2))
                        
                        moves.Add((i, j));

            // Trả về danh sách các nước đi khả thi
            return moves;
        }

        // Kiểm tra nếu ô (row, col) có quân cờ lân cận trong khoảng cách 'distance' không
        bool HasNeighbor(int row, int col, int distance)
        {
            int N = a.GetLength(0);

            // Duyệt qua các ô trong khoảng cách 'distance' từ (row, col) để kiểm tra có quân cờ (1 hoặc 2) không
            for (int i = Math.Max(0, row - distance); i <= Math.Min(N - 1, row + distance); i++)
                for (int j = Math.Max(0, col - distance); j <= Math.Min(N - 1, col + distance); j++)
                    if (a[i, j] != 0) return true;
            return false;
        }

        // ==================== 5a. Minimax + Alpha-Beta ====================

        // Thuật toán Minimax với cắt tỉa Alpha-Beta để tìm nước đi tối ưu cho AI
        public int minimax(int depth, bool isAI, int alpha, int beta, out int bestI, out int bestJ)
        {

            // Trả về vị trí nước đi tốt nhất
            bestI = -1; bestJ = -1;
            // Nếu đạt độ sâu tối đa, trả về 0 (không đánh giá thêm)
            if (depth == 0) return 0;

            // Khai báo biến để lưu giá trị đánh giá tối đa và tối thiểu
            int maxEval = int.MinValue;
            int minEval = int.MaxValue;

            // Lấy danh sách các nước đi khả thi
            var moves = GetCandidateMoves();

            // Nếu không còn nước đi nào, trả về 0
            if (moves.Count == 0) return 0;

            // Duyệt qua từng nước đi khả thi


            foreach (var (i, j) in moves)
            {
                // Tạm thời đặt quân của AI hoặc người chơi vào ô (i, j)
                a[i, j] = isAI ? 2 : 1;

                // Đánh giá điểm của ô vừa đặt (i, j)
                int eval = EvaluateCell(i, j, isAI ? 2 : 1);

                // Nếu điểm đánh giá không quá cao (chưa thắng/thua ngay) và còn độ sâu, tiếp tục đệ quy
                if (Math.Abs(eval) < 1000 && depth > 1)
                    eval = minimax(depth - 1, !isAI, alpha, beta, out _, out _);


                // Quay lại trạng thái ban đầu
                a[i, j] = 0;


                // Cập nhật giá trị đánh giá tối đa/tối thiểu và vị trí nước đi tốt nhất dựa trên vai trò AI hay người chơi
                if (isAI)
                {
                    if (eval > maxEval) { maxEval = eval; bestI = i; bestJ = j; }
                    alpha = Math.Max(alpha, maxEval);
                }
                // Nếu là người chơi, cập nhật giá trị đánh giá tối thiểu và vị trí nước đi tốt nhất
                else
                {
                    
                    if (eval < minEval) { minEval = eval; bestI = i; bestJ = j; }
                    beta = Math.Min(beta, minEval);
                }
                // Cắt tỉa nếu không còn cần thiết phải duyệt tiếp (nhánh không tốt hơn)
                if (beta <= alpha) break;
            }
            // Trả về giá trị đánh giá tối đa nếu là AI, ngược lại trả về tối thiểu
            return isAI ? maxEval : minEval;
        }

        // ==================== 5b. Minimax không cắt tỉa ====================

        // Thuật toán Minimax không cắt tỉa để tìm nước đi tối ưu cho AI (dùng để so sánh) 
        public int minimax_no_prune(int depth, bool isAI, out int bestI, out int bestJ)
        {

            // Trả về vị trí nước đi tốt nhất
            bestI = -1; bestJ = -1;

            // Nếu đạt độ sâu tối đa, trả về 0 (không đánh giá thêm)
            if (depth == 0) return 0;


            // Khai báo biến để lưu giá trị đánh giá tối đa và tối thiểu
            int maxEval = int.MinValue;
            int minEval = int.MaxValue;


            // Lấy danh sách các nước đi khả thi
            var moves = GetCandidateMoves();
            if (moves.Count == 0) return 0;


            // Duyệt qua từng nước đi khả thi
            foreach (var (i, j) in moves)
            {

                // Tạm thời đặt quân của AI hoặc người chơi vào ô (i, j)
                a[i, j] = isAI ? 2 : 1;

                // Đánh giá điểm của ô vừa đặt (i, j)
                int eval = EvaluateCell(i, j, isAI ? 2 : 1);


                // Nếu điểm đánh giá không quá cao (chưa thắng/thua ngay) và còn độ sâu, tiếp tục đệ quy
                if (Math.Abs(eval) < 1000 && depth > 1)
                    eval = minimax_no_prune(depth - 1, !isAI, out _, out _);


                // Quay lại trạng thái ban đầu
                a[i, j] = 0;


                // Cập nhật giá trị đánh giá tối đa/tối thiểu và vị trí nước đi tốt nhất dựa trên vai trò AI hay người chơi
                if (isAI)
                {
                    
                    if (eval > maxEval) { maxEval = eval; bestI = i; bestJ = j; }
                }
                // Nếu là người chơi, cập nhật giá trị đánh giá tối thiểu và vị trí nước đi tốt nhất
                else
                {
                    
                    if (eval < minEval) { minEval = eval; bestI = i; bestJ = j; }
                }
            }
            // Trả về giá trị đánh giá tối đa nếu là AI, ngược lại trả về tối thiểu
            return isAI ? maxEval : minEval;
        }
    }
}
/*
 * 
 *                                                      CÁC KĨ THUẬT ĐANG SỬ DỤNG TRONG CODE THUẬT TOÁN MINIMAX TỐI ƯU HƠN
 *                                                      
***************************************************************************************************************************************************************************
 
    Đánh giá heuristic – Hàm Evaluate và EvaluateCell dùng để đánh giá giá trị nước đi hoặc ô cờ.

    Nhận dạng mẫu – Hàm CountLine đếm số quân liên tiếp để nhận dạng khả năng thắng/thua.

    Đánh giá trọng số (Tấn công / Phòng thủ) – Cộng/trừ điểm dựa trên chuỗi quân liên tiếp của mình hoặc đối thủ.

    Sắp xếp nước đi / Cắt giảm phạm vi tìm kiếm – GetCandidateMoves chỉ xét các ô gần quân cờ hiện có.

    Thuật toán Minimax – Tìm nước đi tối ưu dựa trên khả năng phản ứng của đối thủ.

    Cắt tỉa Alpha-Beta – minimax tối ưu Minimax bằng cách loại bỏ nhánh chắc chắn không tốt.

    Tìm kiếm đệ quy giới hạn độ sâu – Giới hạn depth để tránh tính toán quá lâu.

    Phát hiện nước đi thắng ngay / Chặn đối thủ – IsPlayerAboutToWin và FindAllBlockingMoves phát hiện các nước đi quan trọng.
 
 
 */