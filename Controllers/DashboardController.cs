using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace ALTAS.Controllers
{
    [Authorize]
    public class DashboardController : BaseController
    {
        private readonly IDashboardRepository _repo;

        public DashboardController(IDashboardRepository repo)
        {
            _repo = repo;
        }
        public IActionResult Dashboard()
        {
            return View();
        }

        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getDashboardStatistics()
        {
            var data = await  _repo.GET_DASHBOARD_STATS();
            return Json(data);
        }

        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getEducationalAttainment()
        {
            var data = await _repo.GET_EDUCATIONAL_ATTAINMENT_STATS();
            return Json(data);
        }

        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getCivilStatus()
        {
            var data = await _repo.GET_CIVIL_STATUS_STATS();
            return Json(data);
        }

        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getGender()
        {
            var data = await _repo.GET_GENDER_STATS();
            return Json(data);
        }
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getGenderDistribution()
        {
            var data = await _repo.GET_GENDER_DISTRIBUTION_PERCENT();
            return Json(data);
        }

        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getAgeStructure()
        {
            var data = await _repo.GET_AGESTRUCTURE();
            return Json(data);
        }

        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getAgeStructuredPer5Years()
        {
            var data = await _repo.GET_AGESTRUCTUREPER5YEARS();
            return Json(data);
        }

        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getCollectionSummary()
        {
            var data = await _repo.GET_COLLECTIONSUMMARY();
            return Json(data);
        }

        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getCollectionLast30Days()
        {
            var data = await _repo.GET_COLLECTIONLAST30DAYS();
            return Json(data);
        }

        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getVotersDistribution()
        {
            var data = await _repo.GET_VOTER_STATUS_PERCENT();
            return Json(data);
        }
    }
}
