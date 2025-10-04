
/*
 Lớp kiểm tra trạng thái bàn cờ và các phương thức liên quan gồm (Lớp đánh giá)
    - Kiểm tra thắng (5 quân liên tiếp)
    - Đếm số quân theo 1 hướng
    - Điểm đánh giá một nước đi (dùng cho minimax)
    - Kiểm tra hòa (không còn ô trống nào)
 */

namespace Checkers_flag.Models
{
    public class Checkgame
    {
        public int[,] a; // mảng 2 chiều lưu trạng thái bàn cờ

        //Phương thức khởi tạo ma trận  10x10 hoặc từ bàn cờ có sẵn
        public Checkgame()
        {
            a = new int[10, 10]; //Khỏi tạo mảng động
        }

        //Phương thức khởi tạo có tham số nhận vào một ma trận bất kì (sẽ nâng cấp sau)
        public Checkgame(int[,] board)
        {
            int n = board.GetLength(0); //Đầu vào n là số hàng
            int m = board.GetLength(1); //Đầu vào m là số cột
            a = new int[n, m]; //Khởi tạo mảng động


            //Khởi tạo vòng lặp để gán giá trị từ bàn cờ vào mảng a
            for (int i = 0; i < n; i++)
                for (int j = 0; j < m; j++)
                    a[i, j] = board[i, j];
        }

        // Kiểm tra thắng (5 quân liên tiếp)
        public bool ktr(int i, int j, int nuocdi)
        {
            //Nhận vào kích thước ma trận
            int n = a.GetLength(0);
            int m = a.GetLength(1);

            //Kiểm tra vị trí i,j có hợp lệ không (nếu không hợp lệ không làm gì cả)
            if (i < 0 || i >= n || j < 0 || j >= m)
                return false;


            //Kiểm tra vị trí i,j có đúng là nước đi vừa rồi không (nếu không đúng thì không làm gì cả)
            if (a[i, j] != nuocdi) return false;

            int winLength = 5; // số quân cần để thắng

            // kiểm tra chéo phải xuống trái 
            int dem = demchuoi(i, j, 1, -1, nuocdi) + demchuoi(i, j, -1, 1, nuocdi) - 1;
            if (dem >= winLength) return true;

            // kiểm tra chéo trái xuống phải 
            dem = demchuoi(i, j, 1, 1, nuocdi) + demchuoi(i, j, -1, -1, nuocdi) - 1;
            if (dem >= winLength) return true;

            // kiểm tra hàng ngang
            dem = demchuoi(i, j, 0, 1, nuocdi) + demchuoi(i, j, 0, -1, nuocdi) - 1;
            if (dem >= winLength) return true;

            // kiểm tra hàng dọc
            dem = demchuoi(i, j, 1, 0, nuocdi) + demchuoi(i, j, -1, 0, nuocdi) - 1;
            if (dem >= winLength) return true;


            // Không có chuỗi 5 quân liên tiếp (chưa kết thúc)
            return false;
        }

        // Đếm số quân theo 1 hướng
        public int demchuoi(int i, int j, int x, int y, int nuocdi)
        {

            // x, y là hướng di chuyển (vd: x=1,y=0 là dọc xuống, x=0,y=1 là ngang phải, x=1,y=1 là chéo phải xuống,...)
            int dem = 0;
            int n = a.GetLength(0);
            int m = a.GetLength(1);
            // Duyệt theo hướng x,y từ vị trí i,j đến khi gặp ô khác hoặc ra ngoài bàn cờ hoặc hết bàn cờ
            while (i >= 0 && i < n && j >= 0 && j < m && a[i, j] == nuocdi)
            {
                
                dem++;
                i += x;
                j += y;
            }

            // Trả về số quân liên tiếp đếm được
            return dem;
        }

        // Điểm đánh giá một nước đi (dùng cho minimax)
        public int diemtungnuoc(int i, int j, int nuocdi)
        {
            // Tính điểm đánh giá cho nước đi tại vị trí (i, j) của người chơi nuocdi
            int max = 0;
            //Biến đếm
            int dem;

            // chéo phải xuống trái
            dem = demchuoi(i, j, 1, -1, nuocdi) + demchuoi(i, j, -1, 1, nuocdi) - 1;
            if (dem > max) max = dem;

            // chéo trái xuống phải
            dem = demchuoi(i, j, 1, 1, nuocdi) + demchuoi(i, j, -1, -1, nuocdi) - 1;
            if (dem > max) max = dem;

            // ngang
            dem = demchuoi(i, j, 0, 1, nuocdi) + demchuoi(i, j, 0, -1, nuocdi) - 1;
            if (dem > max) max = dem;

            // dọc
            dem = demchuoi(i, j, 1, 0, nuocdi) + demchuoi(i, j, -1, 0, nuocdi) - 1;
            if (dem > max) max = dem;

            return max;
        }

        //  Kiểm tra hòa (không còn ô trống nào)
        public bool IsDraw()
        {
            int n = a.GetLength(0);
            int m = a.GetLength(1);
            // Duyệt tất cả các ô trên bàn cờ để kiểm tra có ô trống (0) không
            for (int i = 0; i < n; i++)
            {
                for (int j = 0; j < m; j++)
                {
                    //Nếu có 1 ô trống thì chưa hòa (chưa kết thúc bàn cờ)
                    if (a[i, j] == 0) return false;
                }
            }
            return true; // full bàn mà chưa ai thắng -> hòa
        }
    }
}

//**************************************************************************************   TỔNG KẾT    ******************************************************************************

/*
 Quản lý trạng thái bàn cờ

    Trường a (kiểu int[,]): ma trận lưu trạng thái bàn cờ.

    Có 2 constructor:

    Checkgame() → khởi tạo bàn cờ mặc định 10×10.

    Checkgame(int[,] board) → nhận bàn cờ sẵn có từ bên ngoài.

Phương thức kiểm tra thắng

    ktr(int i, int j, int nuocdi)

    Kiểm tra xem từ ô (i, j) có tạo thành chuỗi 5 quân liên tiếp hay không (ngang, dọc, chéo).

    Sử dụng demchuoi để đếm quân theo các hướng.

Phương thức đếm quân theo hướng

    demchuoi(int i, int j, int x, int y, int nuocdi)

    Đếm số quân liên tiếp theo một hướng xác định (x, y là vector hướng).

    Ví dụ: (1,0) là dọc xuống, (0,1) là ngang phải, (1,1) là chéo xuống phải,…

Phương thức đánh giá nước đi

    diemtungnuoc(int i, int j, int nuocdi)

    Tính điểm cho một nước đi dựa trên số quân liên tiếp dài nhất có thể hình thành từ vị trí (i, j).

    Hữu ích cho thuật toán minimax khi AI chọn nước đi.

    Phương thức kiểm tra hòa

IsDraw()

    Kiểm tra nếu toàn bộ bàn cờ đã đầy (không còn ô 0) mà chưa có người thắng → trả về hòa.
 
 */