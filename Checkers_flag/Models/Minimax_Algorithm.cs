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
        
        public int minimax(List<int> game_tree, int tang, Boolean AIchoi, int x, int y, out int tdi, out int tdj)
        {
            // kiều kiện dừng

            int kq = dk_dung(x, y);
            if (kq != 0 || tang == 2)
            {
                tdi = x;
                tdj = y;
                return kq;
            }

            //lượt của ai đánh
            if (AIchoi)
            {
                int ndtn = int.MinValue;
                tdi = -1;
                tdj = -1;
                for (int i = 0; i < game_tree.Count; i++)
                {
                    int ndht = game_tree[i];
                    x = i / 10;
                    y = i % 10;
                    int value = minimax(game_tree, tang + 1, false, x, y, out _, out _);
                    if (ndtn < value)
                    {
                        ndtn = value;
                        tdi = x;
                        tdj = y;
                    }
                }
                return ndtn;

            }
            else
            {
                int ndtn = int.MaxValue;
                tdi = -1;
                tdj = -1;
                for (int i = 0; i < game_tree.Count; i++)
                {
                    int ndht = game_tree[i];
                    x = i / 10;
                    y = i % 10;
                    int value = minimax(game_tree, tang + 1, true, x, y, out _, out _);
                    if (ndtn > value)
                    {
                        ndtn = value;
                        tdi = x;
                        tdj = y;
                    }
                }
                return ndtn;
            }
        }
    }
}





