using Checkers_flag.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace Checkers_flag.Controllers
{
    // Controller chính điều hướng các trang giao diện của trò chơi
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        // Hàm khởi tạo - nhận đối tượng logger để ghi log hệ thống
        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }
        // Trang chủ hiển thị giao diện menu hoặc lựa chọn chế độ chơi
        public IActionResult Home()
        {
            return View();
        }
        // Trang chơi với máy (AI)
        public IActionResult withAI()
        {
            return View();
        }
        // Trang chơi giữa hai người
        public IActionResult withHuman()
        {
            return View();
        }
        public IActionResult Privacy()
        {
            return View();
        }


    }
}
