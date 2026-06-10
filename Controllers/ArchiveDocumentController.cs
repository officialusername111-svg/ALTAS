using ALTAS.Models;
using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Threading.Tasks;

namespace ALTAS.Controllers
{
    [Authorize]
    public class ArchiveDocumentController : BaseController
    {
        private readonly IArchiveDocumentRepository _repo;
        private readonly IFileMaintenanceRepository _repofm;
        public ArchiveDocumentController(IArchiveDocumentRepository repo, IFileMaintenanceRepository repofm)
        {
            _repo = repo;
            _repofm = repofm;
        }
        public IActionResult Archive()
        {
            ViewBag.drpArchiveCategory = new SelectList(_repofm.GET_ARCHIVECATEGORY(), "ArchiveCategoryId", "CategoryName");
            return View();
        }

        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getArchiveDocuments(string searchKeyword)
        {
            var data = await _repo.GET_ARCHIVEDOCS(searchKeyword ?? string.Empty);
            return Json(data);
        }


        [HttpPost]
        public async Task<IActionResult> saveArchiveDocuments(IFormFile file, ArchiveDocumentDTO dto)
        {
            if (file == null || file.Length == 0)
                return Json(new { rtn = new { success = false, remarks = "No file uploaded." } });

            dto.FileLocation = await DocumentHelper.SaveUploadedFileAsync(file, dto.CategoryName,  dto.FileLocation);

            var rtn = await _repo.SAVE_ARCHIVEDOCS(dto);

            return Json(new
            {
                rtn = new
                {
                    success = rtn.success,
                    remarks = rtn.remarks ?? "Saved successfully"
                }
            });
        }
    }
}
