namespace Checkers_flag.Models
{
    public class Minimax_Algorithm : Checkgame
    {
        //Code for Minimax Algorithm will go here
        public int dk_dung(int I, int J)
        {
            if (ktr(I, J, 1)) return 1; // AI thắng
            if (ktr(I, J, 2)) return -1; // Người chơi thắng
            return 0; // Hòa
        }

        //cách tính điểm cho thuật toán minimax
        
        public int minimax(List<int> game_tree, int tang, Boolean AIchoi, int x, int y,int alpha,int beta, out int tdi, out int tdj) // dùng out_ để trả thêm tọa độ i,j cho nước đi
        {
            // kiểm tra điều kiện dừng
            int kq = dk_dung(x, y); 
            if (kq != 0 || tang == 2)
            {
                tdi = x;
                tdj = y;
                return kq; // trả về kết quả nếu có người thắng hoặc đạt độ sâu tối đa
            }
            //gán giá trị ban đầu cho tọa độ i,j
            tdi = -1;
            tdj = -1;
            //lượt của ai đánh
            if (AIchoi) // lượt của AI với giá trị true
            {
                int ndtn = int.MinValue;// gán giá trị nhỏ nhất

                for (int i = 0; i < game_tree.Count; i++)
                {
                    int nx = i / 10; // tính tọa độ x
                    int ny = i % 10; // tính tọa độ y
                    int ndht = diemtungnuoc(nx,ny,1); // tính điểm nước đi của AI
                    int value = minimax(game_tree, tang + 1, false, nx, ny,alpha,beta, out _, out _); // gọi đệ quy
                    int toi_uu=Math.Max(value, ndht);
                    if (ndtn < toi_uu) 
                    {
                        ndtn = toi_uu;// cập nhật giá trị lớn nhất
                        tdi = nx; // cập nhật tọa độ i
                        tdj = ny; // cập nhật tọa độ j
                    }
                    alpha = Math.Max(alpha, ndtn);
                    if (beta <= alpha) // cắt tỉa nhánh
                        break;
                }
                return ndtn;// trả về giá trị lớn nhất kèm tọa độ

            }
            else // lượt của người chơi với giá trị false
            {
                int ndtn_dt = int.MaxValue;// gán giá trị lớn nhất
                for (int i = 0; i < game_tree.Count; i++)
                {
                    int nx = i / 10; // tính tọa độ x
                    int ny = i % 10; // tính tọa độ y
                    int ndht = diemtungnuoc(nx,ny,2); // tính điểm nước đi của đối thủ
                    int value = minimax(game_tree, tang + 1, true, nx, ny, alpha, beta, out _, out _);   // gọi đệ quy
                    int toi_uu = Math.Min(value, ndht);
                    if (ndtn_dt > toi_uu)
                    {
                        ndtn_dt = toi_uu; // cập nhật giá trị nhỏ nhất
                        tdi = nx;
                        tdj = ny; // cập nhật tọa độ i,j
                    }
                    beta = Math.Min(beta, ndtn_dt);
                    if (beta <= alpha) // cắt tỉa nhánh
                        break;
                }
                return ndtn_dt; // trả về giá trị nhỏ nhất kèm tọa độ
            }
        }
    }
}





