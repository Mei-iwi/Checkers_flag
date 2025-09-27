namespace Checkers_flag.Models
{
    public class Checkgame
    {
        public int[,] a = new int[10, 10];
        public Checkgame()
        {
            a = new int[10, 10];
        }
        public Checkgame(int[,] board)
        {
            int n = board.GetLength(0);
            int m = board.GetLength(1);
            a = new int[n, m];

            for (int i = 0; i < n; i++)
                for (int j = 0; j < m; j++)
                    a[i, j] = board[i, j];
        }
        public bool ktr(int i, int j, int nuocdi)
        {
            if (a[i, j] != nuocdi) return false;
            // kiểm tra hàng chéo phải xuống trái 
            int dem = demchuoi(i, j, 1, -1, nuocdi) + demchuoi(i, j, -1, 1, nuocdi) - 1;
            if (dem >= 5) return true;
            // kiểm tra hàng chéo trái xuống phải 
            dem = demchuoi(i, j, 1, 1, nuocdi) + demchuoi(i, j, -1, -1, nuocdi) - 1;
            if (dem >= 5) return true;
            // kiểm tra hàng ngang
            dem = demchuoi(i, j, 0, 1, nuocdi) + demchuoi(i, j, 0, -1, nuocdi) - 1;
            if (dem >= 5) return true;
            // kiểm tra hàng dọc
            dem = demchuoi(i, j, 1, 0, nuocdi) + demchuoi(i, j, -1, 0, nuocdi) - 1;
            if (dem >= 5) return true;
            return false;
        }
        public int demchuoi(int i, int j, int x, int y, int nuocdi)
        // x, y là hướng di chuyển trong ma trận
        {
            int dem = 0;
            while (i >= 0 && i < 10 && j >= 0 && j < 10 && a[i, j] == nuocdi)
            {
                dem++;
                i += x;
                j += y;
            }
            return dem;
        }
       
        public int diemtungnuoc(int i, int j, int nuocdi)
        {
            int max = 0;
            int dem;
            // kiểm tra hàng chéo phải xuống trái 
            dem = demchuoi(i, j, 1, -1, nuocdi) + demchuoi(i, j, -1, 1, nuocdi) - 1;
            if (dem > max) max = dem;
            // kiểm tra hàng chéo trái xuống phải 
            dem = demchuoi(i, j, 1, 1, nuocdi) + demchuoi(i, j, -1, -1, nuocdi) - 1;
            if (dem > max) max = dem;
            // kiểm tra hàng ngang
            dem = demchuoi(i, j, 0, 1, nuocdi) + demchuoi(i, j, 0, -1, nuocdi) - 1;
            if (dem > max) max = dem;
            // kiểm tra hàng dọc
            dem = demchuoi(i, j, 1, 0, nuocdi) + demchuoi(i, j, -1, 0, nuocdi) - 1;
            if (dem > max) max = dem;
            return max;
        }
    }
}
