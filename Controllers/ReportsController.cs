using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using ALTAS.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;

namespace ALTAS.Controllers
{
    [Authorize]
    public class ReportsController : BaseController
    {
        private readonly IConfiguration _configuration;
        private readonly IResidentRepository _repo;
        private readonly IBarangayOfficialsRepository _repooff;
        private readonly IWebHostEnvironment _env;

        public ReportsController(IConfiguration configuration, IResidentRepository repo, IBarangayOfficialsRepository repooff, IWebHostEnvironment env)
        {
            _env = env;
            _configuration = configuration;
            _repo = repo;
            _repooff = repooff;
        }

        public IActionResult Reports()
        {
            return View();
        }


        [HttpGet]
        public async Task<IActionResult> GENERATE_BarangayClearance(int ResidentId, string CTCNo, string Purpose)
        {
            try
            {
                // 1. Fetch data
                var resident = await _repo.GET_RESIDENT_BYID(ResidentId);
                var punongBarangay = await _repooff.GET_PUNONGBARANGAY();

                if (resident == null)
                {
                    return NotFound("Resident not found.");
                }

                string logoPath = Path.Combine(_env.WebRootPath, "img", "report_logo.jpg");

                // 2. Map to DTO
                var data = new ClearanceDTO
                {
                    LastName = resident.LastName ?? "",
                    FirstName = resident.FirstName ?? "",
                    MiddleName = resident.MiddleName ?? "",
                    PunongBarangay = punongBarangay,
                    PlaceOfBirth = resident.BirthPlace ?? "",
                    DateOfBirth = resident.Birthdate ?? DateTime.MinValue,
                    Age = resident.Age.ToString() ?? "",
                    Sex = resident.Sex ?? "",
                    CivilStatus = resident.CivilStatus ?? "",
                    Nationality = resident.Citizenship ?? "",
                    Address = resident.Household +", Poblacion, Tupi, South Cotabato", 
                    CTCNo = CTCNo,
                    Purpose = Purpose,
                    ClearanceNumber = $"CLR-{ResidentId:0000}-{DateTime.Now:yyyyMMdd}"
                };

                // 3. Generate PDF
                var document = new BarangayClearanceDocument(data, logoPath);
                byte[] pdfBytes = document.GeneratePdf();

                // 4. Set Content-Disposition to "inline"
                // This is crucial for your JS/Iframe to work correctly!
                var contentDisposition = new System.Net.Mime.ContentDisposition
                {
                    FileName = $"Clearance_{ResidentId}.pdf",
                    Inline = true
                };
                Response.Headers.Add("Content-Disposition", contentDisposition.ToString());

                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                // Log the error (crucial for troubleshooting PDF generation)
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GENERATE_BarangayIndigent(int ResidentId, string Purpose)
        {
            try
            {
                // 1. Fetch data
                var resident = await _repo.GET_RESIDENT_BYID(ResidentId);
                var punongBarangay = await _repooff.GET_PUNONGBARANGAY();

                if (resident == null)
                {
                    return NotFound("Resident not found.");
                }

                string logoPath = Path.Combine(_env.WebRootPath, "img", "report_logo.jpg");

                // 2. Map to DTO
                var data = new CertificateOfIndigencyDTO
                {
                    FullName =  resident.Resident ?? "",
                    Age = resident.Age.ToString() ?? "",
                    Sex = resident.Sex ?? "",
                    CivilStatus =  resident.CivilStatus ?? "",
                    Citizenship = resident.Citizenship ?? "",
                    PurokName = resident.Household ?? "",
                    Purpose = Purpose,
                    DateIssued = DateTime.Now.ToString("MMMM dd, yyyy"),
                    PunongBarangay = punongBarangay,
                };

                // 3. Generate PDF
                var document = new CertificateOfIndigency(data, logoPath);
                byte[] pdfBytes = document.GeneratePdf();

                // 4. Set Content-Disposition to "inline"
                // This is crucial for your JS/Iframe to work correctly!
                var contentDisposition = new System.Net.Mime.ContentDisposition
                {
                    FileName = $"Clearance_{ResidentId}.pdf",
                    Inline = true
                };
                Response.Headers.Add("Content-Disposition", contentDisposition.ToString());

                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                // Log the error (crucial for troubleshooting PDF generation)
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
