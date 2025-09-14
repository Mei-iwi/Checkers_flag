using Checkers_flag.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace Checkers_flag.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Home()
        {
            return View();
        }
        public IActionResult withAI()
        {
            return View();
        }
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
