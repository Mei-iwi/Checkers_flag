namespace Checkers_flag.Models
{
    public class checkgame
    {
        public int[,] a = new int[10, 10];

        public bool ktr(int i, int j, int giatri)
        {
            if (a[i, j] != giatri) return false;
            // kiểm tra hàng chéo phải xuống trái 
            int dem = demchuoi(i, j, 1, -1, giatri) + demchuoi(i, j, -1, 1, giatri) - 1;
            if (dem >= 5) return true;
            // kiểm tra hàng chéo trái xuống phải 
            dem = demchuoi(i, j, 1, 1, giatri) + demchuoi(i, j, -1, -1, giatri) - 1;
            if (dem >= 5) return true;
            // kiểm tra hàng ngang
            dem = demchuoi(i, j, 0, 1, giatri) + demchuoi(i, j, 0, -1, giatri) - 1;
            if (dem >= 5) return true;
            // kiểm tra hàng dọc
            dem = demchuoi(i, j, 1, 0, giatri) + demchuoi(i, j, -1, 0, giatri) - 1;
            if (dem >= 5) return true;
            return false;
        }
        public int demchuoi(int i , int j, int x, int y,int giatri)
        // x, y là hướng di chuyển trong ma trận
        {
            int dem = 0;
            while (i >= 0 && i < 10 && j >= 0 && j < 10 && a[i, j] == giatri)
            {
                dem++;
                i += x;
                j += y;
            }
            return dem;
        }
    }
}
