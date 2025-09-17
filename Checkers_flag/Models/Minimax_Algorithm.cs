namespace Checkers_flag.Models
{
    public class Minimax_Algorithm:checkgame
    {
        //Code for Minimax Algorithm will go here
        public static int max(int a, int b)
        {
            if (a > b) return a;
            return b;
        }
        public static int min(int a, int b)
        {
            if (a > b) return b;
            return a;
        }
        public int dk_dung( int I, int J)
        {
            if(ktr(I, J, 1)) return 1; // AI thắng
            if(ktr(I, J, 2)) return -1; // Người chơi thắng
            return 0; // Hòa
        }
        public int minimax(List<int> game_tree,int tang,Boolean AIchoi,int x, int y)
        {
            // kiều kiện dừng

            int kq= dk_dung(x, y);
            if(kq != 0 || tang==3)
                return 0;
            //lượt của ai đánh
            if (AIchoi)
            {
                int ndtn= int.MinValue;
                for (int i = 0; i < game_tree.Count; i++)
                {
                    int ndht = game_tree[i];
                 x = i / 10;
                 y = i % 10;
                    int value = minimax(game_tree, tang + 1, false,x,y);
                    ndtn = max(ndtn, value);

                }
                return ndtn;
            }
            else
            {
                int ndtn = int.MaxValue;
                for(int i= 0; i<game_tree.Count; i++)
                {
                    int ndht= game_tree[i];
                    x = i / 10;
                    y = i % 10;
                    int value= minimax(game_tree,tang + 1, true,x,y);
                    ndtn= min(ndtn, value);
                }
                 return ndtn;
            }
        }
    }


}


