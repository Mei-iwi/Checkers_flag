
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

            if (ktr(i, j, 1)) return 10000;//Nếu player 1 thắng trả về giá trị 1000
            if (ktr(i, j, 2)) return -10000;//nếu player 2 thắng trả về giá trị -1000
            return diemtungnuoc(i, j, player); // trả về điểm herustic
        }

        // ==================== 2. Đếm số quân liên tiếp ====================
        // Đếm số chuỗi liên tiếp của 'player' có độ dài 'length' đi qua ô (row, col) 
        int CountLine(int row, int col, int player, int length)
        {
            int score = 0;//tạo biến lưu kết quả
            int N = a.GetLength(0);//Kích thước của bàn cờ có giá trị N
            // Các hướng: ngang, dọc(1,0), chéo chính(1,1), chéo phụ(1,-1)
            int[][] directions = new int[][]
            {

                new int[]{0,1}, new int[]{1,0}, new int[]{1,1}, new int[]{1,-1}
                        //ngang          //dọc          //chéo chính    //chéo phụ
            };
            // Duyệt qua từng hướng và đếm số quân liên tiếp
            foreach (var dir in directions)
            {
                int count = 1;//tạo biến đếm bằng 1 
                int r = row + dir[0], c = col + dir[1];//bắt đầu đi thêm 1 ô theo hướng của dir 
                // Đếm về phía trước của hướng
                while (r >= 0 && r < N && c >= 0 && c < N && a[r, c] == player)//kiểm tra để đảm bảo nước của người chơi không vượt ra khỏi phạm vi bàn cờ 
                {
                    count++; r += dir[0]; c += dir[1];//tăng lượng quân lên 1,di chuyển hàng và cột theo hướng đang xét rồi lặp lại dòng lặp while
                }

                r = row - dir[0]; c = col - dir[1];// đặt lại r và c về vị trí cũ để đếm ngược lại
                // Đếm về phía sau của hướng
                while (r >= 0 && r < N && c >= 0 && c < N && a[r, c] == player)//kiểm tra đảm bảo nước đi không vượt quá khỏi ranh giới bàn cờ
                {
                    count++; r -= dir[0]; c -= dir[1];//đếm lượng quân, di chuyển hàng và cột theo hướng đang xét(trừ là do ngược lại với hướng đi lên)
                }
                // Nếu số quân liên tiếp đạt độ dài yêu cầu, tăng điểm
                if (count >= length) score++;//tổng số quân đếm được dài hơn độ dài chuỗi tối thiểu mà bạn cần kiểm tra
            }
            //Trả về số điểm
            return score;
        }



        #region Tạm bỏ qua
        // ==================== 3. Đánh giá 1 ô ====================

        // Đánh giá điểm của ô (row, col) nếu đặt quân của 'player' vào đó 
        // Trước: int EvaluateCell(int row, int col, int player)
        //public int EvaluateCell(int row, int col, int player)
        //{
        //    int score = 0;
        //    int opponent = player == 1 ? 2 : 1;

        //    // Tấn công: giữ nguyên hoặc tăng nhẹ nếu muốn AI ưu tiên tấn công
        //    score += CountLine(row, col, player, 2) * 10;
        //    score += CountLine(row, col, player, 3) * 50;
        //    score += CountLine(row, col, player, 4) * 200;
        //    score += CountLine(row, col, player, 5) * 1000;

        //    // Phòng thủ: giảm mức trừ xuống trung bình để Minimax quyết định tốt hơn
        //    score -= CountLine(row, col, opponent, 2) * 20;
        //    score -= CountLine(row, col, opponent, 3) * 100;
        //    score -= CountLine(row, col, opponent, 4) * 500;
        //    score -= CountLine(row, col, opponent, 5) * 2000;

        //    return score;
        //}

        #endregion


        // ==================== 3. Đánh giá 1 ô (nâng cao) ====================
        public int EvaluateCell(int row, int col, int player)
        {
            int score = 0;//khởi tạo giá trị điểm số
            int opponent = player == 1 ? 2 : 1;//tổng quân đối thủ

            // Tính điểm cho 4 hướng: ngang, dọc, chéo chính, chéo phụ
            var directions = new (int dx, int dy)[] { (0, 1), (1, 0), (1, 1), (1, -1) };
            //đánh giá nước đi của đối thủ
            foreach (var (dx, dy) in directions)
            {
                var attackInfo = CountLineAdvanced(row, col, player, dx, dy);
                score += attackInfo;//cộng điểm nếu là nước đi tấn công 

                var defenseInfo = CountLineAdvanced(row, col, opponent, dx, dy);
                score -= defenseInfo;//trừ điểm nếu là nước đi có hại 
            }

            // DOUBLE-THREAT
            int attackThreats = CountThreats(row, col, player);
            if (attackThreats >= 2) score += 1000;//nếu có hơn hơn 2 nước nguy hiểm thì cộng nhiều điểm cho Al(ưu tiên tấn công để thắng chắc)

            int defenseThreats = CountThreats(row, col, opponent);// nếu đối thủ có hơn 2 nước nguy hiểm thì ưu tiên cho al phòng thủ 
            if (defenseThreats >= 2) score += 500;

            return score;
        }

        // Hàm đếm chuỗi nâng cao theo hướng dx, dy
        private int CountLineAdvanced(int row, int col, int player, int dx, int dy)
        {
            int count = 1; // tính cả ô hiện tại
            int openEnds = 0;//khoảng trống giữa hai số đầu mở
            int N = a.GetLength(0);//giá trị của bàn cờ vd bàn cờ có độ rộng là 15x15 

            // Kiểm tra 1 hướng 
            int r = row + dx, c = col + dy;//
            while (IsValid(r, c) && a[r, c] == player) { count++; r += dx; c += dy; }//kiểm tra vị trí player đánh nếu đúng thì duyệt theo hướng dx dy
            if (IsValid(r, c) && a[r, c] == 0) openEnds++; // kiểm xem ô ở vị r c có trống hay không và kiểm tra có nằm ngoài bàn cờ hay không sau đó cập nhật lại openEnds
            // Kiểm tra hướng ngược lại
            r = row - dx; c = col - dy;
            while (IsValid(r, c) && a[r, c] == player) { count++; r -= dx; c -= dy; }// kiểm tra vị trí player đánh nếu đúng thì duyệt theo hướng dx dy(chiều ngược lại với ở trên)
            if (IsValid(r, c) && a[r, c] == 0) openEnds++;//// kiểm xem ô ở vị r c có trống hay không và kiểm tra có nằm ngoài bàn cờ hay không sau đó cập nhật lại openEnds

            int score = 0;//tạo biến lưu điểm
                          //    switch (count)
                          //    {   //cập nhật lại giá trị điểm
                          //        case 2: score = openEnds == 2 ? 20 : 10; break;//2 đầu mở thì lưu 20 điểm một đầu thì 10 điểm
                          //        case 3: score = openEnds == 2 ? 100 : 50; break;//3 quân thì lưu 100 với hai đầu mở ,một đầu thì 50
                          //        case 4: score = openEnds == 2 ? 500 : 200; break;//4 quân thì lưu 500 điểm với hai đầu mở, một đầu thì 200
                          //        case 5: score = 10000; break; //5 quân thắng ngay để al ưu tiên nước đi đó
                          //        default: score = count > 5 ? 10000 : 0; break;//dài hơn 5 quân thì vẫn coi như vẫn thắng ngược lại thì không đáng kể
                          //    }
                          //    return score;
                          //}
            switch (count)
            {
                case 2:
                    // Hai quân liền nhau
                    if (openEnds == 2) score = 20;       // hai đầu mở -> có tiềm năng
                    else if (openEnds == 1) score = 10;  // một đầu mở -> ít tiềm năng
                    else score = 0;                      // chặn hai đầu -> bỏ
                    break;

                case 3:
                    if (IsBlockedBothEnds_NoCountLine(r, c, player, 3))
                        score = 0; // chặn cả hai đầu -> vô dụng
                    else if (openEnds == 2)
                        score = 100; // 3 mở 2 đầu -> nguy hiểm
                    else if (openEnds == 1)
                        score = 20;  // 3 mở 1 đầu -> có thể phát triển
                    else
                        score = 0;
                    break;

                case 4:
                    if (IsBlockedBothEnds_NoCountLine(r, c, player, 4))
                        score = 0; // chặn hai đầu -> không thắng được
                    else if (openEnds == 2)
                        score = 500; // 4 mở 2 đầu -> nước gần thắng, ưu tiên cực cao
                    else if (openEnds == 1)
                        score = 100; // 4 bị chặn 1 đầu -> vẫn có thể thắng
                    else
                        score = 0;
                    break;

                case 5:
                    score = 1000; // thắng tuyệt đối
                    break;

                default:
                    // Chỉ cho điểm nếu có khả năng tạo đường thắng dài hơn
                    score = (count > 5) ? 1000 : 0;
                    break;
            }

            return score;
        }

        // Kiểm tra nước đi có hợp lệ
        private bool IsValid(int r, int c) => r >= 0 && r < a.GetLength(0) && c >= 0 && c < a.GetLength(1);//đảm bảo nước đi không vượt quá bàn cờ

        // Đếm số chuỗi gần thắng (threats) cho double-threat
        private int CountThreats(int row, int col, int player)
        {
            int threats = 0;//khởi tạp biến mối đe dọa
            var directions = new (int dx, int dy)[] { (0, 1), (1, 0), (1, 1), (1, -1) };//các hướng kiểm tra
            foreach (var (dx, dy) in directions)
            {
                int val = CountLineAdvanced(row, col, player, dx, dy);//CountLineAdvanced trả giá trị đánh giá cho chuỗi liên tiếp theo hướng (dx, dy)
                if (val >= 500) threats++; // chuỗi mở 2 đầu hoặc gần thắng thì tăng biến mối đe dọa lên
            }
            return threats;
        }
        // Kiểm tra nếu đặt quân tại (row, col) sẽ khiến 'player' thắng với chuỗi dài 'length'
        public bool IsPlayerAboutToWin(int row, int col, int player, int length)
        {
            // Tạm thời đặt quân vào ô
            a[row, col] = player;

            bool result = CountLine(row, col, player, length) > 0;//kiểm tra vị trí đặt quân có tạo được lenght > 0 hay không

            // Quay lại trạng thái ban đầu
            a[row, col] = 0;
            //Trả về kết quả
            return result;
        }

        // Kiểm tra tất cả ô trống, nếu đặt quân người chơi sẽ tạo thành 3 liên tiếp thì thêm vào danh sách chặn
        //public List<(int, int)> FindAllBlockingMoves(int player)
        //{
        //    // Danh sách các ô cần chặn để ngăn đối thủ thắng
        //    var blocks = new List<(int, int)>();
        //    int N = a.GetLength(0);

        //    // Duyệt qua tất cả các ô trên bàn cờ để tìm các nước đi chặn cần thiết
        //    for (int i = 0; i < N; i++) //duyệt dòng i 
        //    {
        //        for (int j = 0; j < N; j++)//duyệt cột 
        //        {
        //            // Chỉ xét các ô trống (0)
        //            if (a[i, j] == 0)
        //            {
        //                a[i, j] = player;
        //                // Nếu đặt quân tại (i, j) sẽ tạo thành chuỗi 3 liên tiếp, thêm vào danh sách chặn
        //                if (CountLine(i, j, player, 3) > 0)

        //                    blocks.Add((i, j));//nếu kết quả lớn hơn 0 có chuỗi 3 liên tiếp thêm vào block 

        //                // Quay lại trạng thái ban đầu tránh ảnh hưởng bàn cờ
        //                a[i, j] = 0;
        //            }
        //        }
        //    }

        //    // Trả về danh sách các ô cần chặn
        //    return blocks;
        //}
        private bool IsBlockedBothEnds_NoCountLine(int x, int y, int player, int chuoi)
        {
            // 4 hướng kiểm tra: dọc, ngang, chéo chính (\), chéo phụ (/)
            int[,] directions = { { 1, 0 }, { 0, 1 }, { 1, 1 }, { 1, -1 } };
            int size = a.GetLength(0);

            for (int k = 0; k < 4; k++)
            {
                int dx = directions[k, 0];
                int dy = directions[k, 1];

                int count = 1;        // Đếm số quân liên tiếp
                int blockedEnds = 0;  // Đếm số đầu bị chặn

                // --- Đếm xuôi ---
                int x1 = x + dx, y1 = y + dy;
                while (x1 >= 0 && y1 >= 0 && x1 < size && y1 < size && a[x1, y1] == player)
                {
                    count++;
                    x1 += dx;
                    y1 += dy;
                }
                // Kiểm tra đầu thứ nhất có bị chặn không
                if (x1 < 0 || y1 < 0 || x1 >= size || y1 >= size || (a[x1, y1] != 0 && a[x1, y1] != player))
                    blockedEnds++;

                // --- Đếm ngược ---
                int x2 = x - dx, y2 = y - dy;
                while (x2 >= 0 && y2 >= 0 && x2 < size && y2 < size && a[x2, y2] == player)
                {
                    count++;
                    x2 -= dx;
                    y2 -= dy;
                }
                // Kiểm tra đầu còn lại
                if (x2 < 0 || y2 < 0 || x2 >= size || y2 >= size || (a[x2, y2] != 0 && a[x2, y2] != player))
                    blockedEnds++;

                // Nếu có chuỗi quân mà bị chặn ở 2 trong hai đầu → true
                if (count == chuoi && blockedEnds == 2)
                    return true;
            }

            // Không có chuỗi 3 nào bị chặn hai đầu
            return false;
        }

        // ==================== 4. Nước đi khả thi ====================

        // Lấy danh sách các ô trống có quân cờ lân cận trong khoảng cách 2 để giới hạn phạm vi tìm kiếm nước đi
        public List<(int, int)> GetCandidateMoves()
        {

            // Danh sách các nước đi khả thi (ô trống có quân cờ lân cận)
            var moves = new List<(int, int)>();
            int N = a.GetLength(0);//lấy kích thước bàn cờ

            // Duyệt qua tất cả các ô trên bàn cờ để tìm các nước đi khả thi
            for (int i = 0; i < N; i++)//duyệt theo hàng
                for (int j = 0; j < N; j++)//duyệt theo cột
                    // Chỉ xét các ô trống (0) có quân cờ lân cận trong khoảng cách 2 
                    if (a[i, j] == 0 && HasNeighbor(i, j, 5))//kiểm tra ô trống dòng i,cột j và ô này phải có ít nhất một quân cờ (của bạn hoặc đối thủ) nằm trong phạm vi 2 ô xung quanh

                        moves.Add((i, j));//thêm a[i][j] vào move

            // Trả về danh sách các nước đi khả thi
            return moves;
        }

        // Kiểm tra nếu ô (row, col) có quân cờ lân cận trong khoảng cách 'distance' không
        bool HasNeighbor(int row, int col, int distance)
        {
            int N = a.GetLength(0);//lấy kích thước bàn cờ N

            // Duyệt qua các ô trong khoảng cách 'distance' từ (row, col) để kiểm tra có quân cờ (1 hoặc 2) không
            for (int i = Math.Max(0, row - distance); i <= Math.Min(N - 1, row + distance); i++)
                for (int j = Math.Max(0, col - distance); j <= Math.Min(N - 1, col + distance); j++)
                    if (a[i, j] != 0) return true;//nếu có quân cờ trong phạm vi xung quanh thì trả về true
            return false;//ngược lại return false
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


            #region temp
            //foreach (var (i, j) in moves)
            //{
            //    // Tạm thời đặt quân của AI hoặc người chơi vào ô (i, j)
            //    a[i, j] = isAI ? 2 : 1;

            //    // Đánh giá điểm của ô vừa đặt (i, j)
            //    int eval = EvaluateCell(i, j, isAI ? 2 : 1);

            //    // Nếu điểm đánh giá không quá cao (chưa thắng/thua ngay) và còn độ sâu, tiếp tục đệ quy
            //    if (Math.Abs(eval) < 1000 && depth > 1)
            //        eval = minimax(depth - 1, !isAI, alpha, beta, out _, out _);


            //    // Quay lại trạng thái ban đầu
            //    a[i, j] = 0;


            //    // Cập nhật giá trị đánh giá tối đa/tối thiểu và vị trí nước đi tốt nhất dựa trên vai trò AI hay người chơi
            //    if (isAI)
            //    {
            //        if (eval > maxEval) { maxEval = eval; bestI = i; bestJ = j; }
            //        alpha = Math.Max(alpha, maxEval);
            //    }
            //    // Nếu là người chơi, cập nhật giá trị đánh giá tối thiểu và vị trí nước đi tốt nhất
            //    else
            //    {

            //        if (eval < minEval) { minEval = eval; bestI = i; bestJ = j; }
            //        beta = Math.Min(beta, minEval);
            //    }
            //    // Cắt tỉa nếu không còn cần thiết phải duyệt tiếp (nhánh không tốt hơn)
            //    if (beta <= alpha) break;
            //}
            #endregion
           
            //Duyệt qua từng nước đi khả thi
            foreach (var (i, j) in moves)
            {
                // Tạm thời đặt quân của AI hoặc người chơi vào ô (i, j)
                a[i, j] = isAI ? 2 : 1;

                //ƯU TIÊN: nếu nước này giúp AI thắng ngay thì chọn luôn
                if (isAI && ktr(i, j, 2))
                {
                    bestI = i;
                    bestJ = j;
                    a[i, j] = 0; // khôi phục bàn cờ
                    return 10000; // thắng tuyệt đối
                }

                //Nếu người chơi thắng ngay, chặn khẩn cấp
                if (!isAI && ktr(i, j, 1))
                {
                    bestI = i;
                    bestJ = j;
                    a[i, j] = 0;
                    return -10000;
                }

                // Đánh giá điểm heuristic
                int eval = EvaluateCell(i, j, isAI ? 2 : 1);

                // Nếu điểm bằng nhau, ưu tiên AI
                if (isAI && eval == minEval)
                    eval += 10;

                // Nếu chưa thắng/thua ngay và còn độ sâu, tiếp tục đệ quy
                if (Math.Abs(eval) < 10000 && depth >= 1)
                    eval = minimax(depth - 1, !isAI, alpha, beta, out _, out _);

                // Quay lại trạng thái ban đầu
                a[i, j] = 0;

                // Cập nhật giá trị tốt nhất
                if (isAI)
                {
                    if (eval > maxEval)
                    {
                        maxEval = eval;
                        bestI = i; bestJ = j;
                    }
                    alpha = Math.Max(alpha, maxEval);
                }
                else
                {
                    if (eval < minEval)
                    {
                        minEval = eval;
                        bestI = i; bestJ = j;
                    }
                    beta = Math.Min(beta, minEval);
                }

                if (beta <= alpha) break; // cắt tỉa
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