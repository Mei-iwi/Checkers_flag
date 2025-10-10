
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
        public int[,] a; //tạo mảng 2 chiều lưu trạng thái bàn cờ

        //Phương thức khởi tạo ma trận  10x10 hoặc từ bàn cờ có sẵn
        public Checkgame()

        {
            a = new int[15, 15]; //khởi tạo thành ma trận 2 chiều có kích thước 10x10
        }

        //Phương thức khởi tạo có tham số nhận vào một ma trận bất kì (sẽ nâng cấp sau)
        public Checkgame(int[,] board)
        {
            int n = board.GetLength(0); //Trả về đầu vào là số hàng của mảng
            int m = board.GetLength(1); //Trả về đầu vào là số cột của mảng
            a = new int[n, m]; //Khởi tạo mảng động n dòng,m cột


            //Khởi tạo vòng lặp để gán giá trị từ bàn cờ vào mảng a
            for (int i = 0; i < n; i++)//duyệt từng hàng
                for (int j = 0; j < m; j++)//duyệt từng cột trong hàng đó
                    a[i, j] = board[i, j];//gán giá trị phần tử tương ứng từ board sang a
        }

        // Kiểm tra thắng (5 quân liên tiếp)
        public bool ktr(int i, int j, int nuocdi)
        {
            //Nhận vào kích thước ma trận
            int n = a.GetLength(0);//lấy số hàng n của bàn cờ a
            int m = a.GetLength(1);//lấy số cột n của bàn cờ a

            //Kiểm tra vị trí i,j có hợp lệ không (nếu không hợp lệ không làm gì cả)
            if (i < 0 || i >= n || j < 0 || j >= m)//kiểm tra nếu vị trí (i,j) không nằm trong bàn cờ =>> không hợp lệ
                return false; //=>> trả về false 


            //Kiểm tra vị trí i,j có đúng là nước đi vừa rồi không (nếu không đúng thì không làm gì cả)
            if (a[i, j] != nuocdi) return false;//kiểm tra nếu i,j không chứa nước đi(x hay o)thì không cần kiểm tra

            int winLength = 5; // số quân cần để thắng
            //demchuoi(dòng i,cột j,dx,dy,X hoặc O//
            // kiểm tra chéo phải xuống trái 
            int dem = demchuoi(i, j, 1, -1, nuocdi) + demchuoi(i, j, -1, 1, nuocdi) - 1;//Đếm các nước đi hướng chéo xuống trái(1,-1),Đếm các nước đi chéo lên phải(-1,1),-1 vì cộng hai hướng đối lập nên trừ 1 nước đi (i,j) bị tính trùng
            if (dem >= winLength) return true;//neu dem = winlength thì trả về giá trị là true thắng

            // kiểm tra chéo trái xuống phải 
            dem = demchuoi(i, j, 1, 1, nuocdi) + demchuoi(i, j, -1, -1, nuocdi) - 1;//Đếm các nước đi hướng chéo xuống phải(1,1) ,đếm các nước đi chéo lên trái(-1,-1),-1 vì cộng hai hướng đối lập nên trừ 1 nước đi(i,j) bị trùng lập
            if (dem >= winLength) return true;//sau khi tổng nếu dem = winlenght thì trả về giá trị là true thắng

            // kiểm tra hàng ngang
            dem = demchuoi(i, j, 0, 1, nuocdi) + demchuoi(i, j, 0, -1, nuocdi) - 1;//Đếm các nước đi sang bên phải(0,1),đếm các nước đi sang trái(0,-1),-1 vì cộng hai hướng đối lập nên trừ 1 nước đi bị trùng lập
            if (dem >= winLength) return true;//sau khi tổng nếu dem = winlenght thì trả về giá trị là true thắng

            // kiểm tra hàng dọc
            dem = demchuoi(i, j, 1, 0, nuocdi) + demchuoi(i, j, -1, 0, nuocdi) - 1;//đếm các nước đi xuống dưới(1,0),đếm các nước đi lên trên (0,1),-1 vì cộng hai hướng đối lập nên trù 1 nước đi (i,j) bị trùng lập
            if (dem >= winLength) return true;//sau khi tổng nếu dem = winlengt thì trả về giá trị true là thắng


            // Không có chuỗi 5 quân liên tiếp (chưa kết thúc)
            return false;
        }

        // Đếm số quân theo 1 hướng
        public int demchuoi(int i, int j, int x, int y, int nuocdi)
        {
            int dem = 0;//khởi tạo bộ đếm,đếm số quân bắt đầu từ ô(i,j) theo hướng (x,y)
            int n = a.GetLength(0);//số phần tử của số hàng vd:a[6,8] thì n = 6
            int m = a.GetLength(1);//số phần tử của cột vd:a[6,8] thì m=8
            // x, y là hướng di chuyển (vd: x=1,y=0 là dọc xuống, x=0,y=1 là ngang phải, x=1,y=1 là chéo phải xuống,...)

            while (i >= 0 && i < n && j >= 0 && j < m && a[i, j] == nuocdi)//điều kiện là nước đi(x,o) phải nằm trong bàn cờ thì thực hiện tiếp câu lệnh bên dưới
            {
                
                dem++;//tăng biến đếm lên 1(đếm số quân)
                //dịch sang ô kế tiếp theo hướng x,y
                i += x;
                j += y;
            }

            // Trả về số quân liên tiếp đếm được
            return dem;
        }

        // Điểm đánh giá một nước đi (dùng cho minimax)
        //Hàm dùng để tính xem khi người chơi đặt quân vào một vị (i,j) thì sẽ có bao nhiêu quân liên tiếp
        public int diemtungnuoc(int i, int j, int nuocdi)
        {
            // Tính điểm đánh giá cho nước đi tại vị trí (i, j) của người chơi nuocdi
            int max = 0;
            //Biến đếm
            int dem;

            // chéo phải(1,-1) ,xuống trái(-1,1),trừ 1 nước đi i,j bị trùng ở hai lượt demchuoi
            dem = demchuoi(i, j, 1, -1, nuocdi) + demchuoi(i, j, -1, 1, nuocdi) - 1;
            if (dem > max) max = dem;//cập nhật lại max

            // chéo trái(1,1),xuống phải(-1,-1),trừ 1 nước đi i,j bị trùng ở hai lượt demchuoi
            dem = demchuoi(i, j, 1, 1, nuocdi) + demchuoi(i, j, -1, -1, nuocdi) - 1;
            if (dem > max) max = dem;//cập nhật lại max

            // sang phải(0,1),sang trái(0,-1),trừ 1 nước đi i,j bị trùng ở hai lượt demchuoi
            dem = demchuoi(i, j, 0, 1, nuocdi) + demchuoi(i, j, 0, -1, nuocdi) - 1;
            if (dem > max) max = dem;//cập nhật lại max

            // đi xuống(1,0),đi lên(-1,0),trừ 1 nước đi i,j bị trùng ở hai lượt demchuoi
            dem = demchuoi(i, j, 1, 0, nuocdi) + demchuoi(i, j, -1, 0, nuocdi) - 1;
            if (dem > max) max = dem;//cập nhật lại max

            return max;
        }

        //  Kiểm tra hòa (không còn ô trống nào)
        public bool IsDraw()
        {
            int n = a.GetLength(0);//số phần tử của số hàng vd:a[6,8] thì n = 6
            int m = a.GetLength(1);//số phần tử của số hàng vd:a[6,8] thì n = 6
            // Duyệt tất cả các ô trên bàn cờ để kiểm tra có ô trống (0) không
            for (int i = 0; i < n; i++)//duyệt vị trí của hàng(hàng i)
            {
                for (int j = 0; j < m; j++)//duyệt vị trí côt(cột j)
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