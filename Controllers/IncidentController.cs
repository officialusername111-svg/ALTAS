using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ALTAS.Models.DTO;
using ALTAS.Models.Interface;

namespace ALTAS.Controllers
{
    [Authorize]
    public class IncidentController : BaseController
    {
        private readonly IIncidentRepository _repo;

        public IncidentController(IIncidentRepository repo)
        {
            _repo = repo;
        }

        // View
        public IActionResult IncidentView()
        {
            return View();
        }

        // GET: Incident list
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getData(string searchKeyword)
        {
            var data = await _repo.GET_INCIDENT(searchKeyword);
            return Json(data);
        }

        // GET: Single incident
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getDataById(int id)
        {
            var data = await _repo.GET_INCIDENT_BYID(id);
            return Json(data);
        }

        // GET: CaseType dropdown
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getCaseTypes()
        {
            var data = await _repo.GET_CASETYPE_DROPDOWN();
            return Json(data);
        }

        // GET: ComplaintType dropdown filtered by CaseTypeID
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getComplaintTypes(int caseTypeId)
        {
            var data = await _repo.GET_COMPLAINTTYPE_BY_CASETYPE(caseTypeId);
            return Json(data);
        }

        // POST: Save new incident
        [HttpPost]
        public async Task<IActionResult> saveData(IncidentDTO dto)
        {
            var rtn = await _repo.SAVE_INCIDENT(dto);
            return Json(new { rtn });
        }

        // POST: Update incident
        [HttpPost]
        public async Task<IActionResult> updateData(IncidentDTO dto)
        {
            var rtn = await _repo.UPDATE_INCIDENT(dto);
            return Json(new { rtn });
        }

        // GET: Parties for an incident
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getParties(int incidentId)
        {
            var data = await _repo.GET_INCIDENT_PARTIES(incidentId);
            return Json(data);
        }

        // POST: Save party
        [HttpPost]
        public async Task<IActionResult> saveParty(IncidentPartyDTO dto)
        {
            var rtn = await _repo.SAVE_INCIDENT_PARTY(dto);
            return Json(new { rtn });
        }

        // POST: Update party
        [HttpPost]
        public async Task<IActionResult> updateParty(IncidentPartyDTO dto)
        {
            var rtn = await _repo.UPDATE_INCIDENT_PARTY(dto);
            return Json(new { rtn });
        }

        // POST: Delete party
        [HttpPost]
        public async Task<IActionResult> deleteParty(int id)
        {
            var rtn = await _repo.DELETE_INCIDENT_PARTY(id);
            return Json(new { rtn });
        }

        // GET: Attachments by KPCaseNo
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getAttachments(string kpCaseNo)
        {
            var data = await _repo.GET_INCIDENT_ATTACHMENTS(kpCaseNo);
            return Json(data);
        }

        // POST: Upload attachment — saves file to _incidentdocx/{KPCaseNo}/ and records in DB
        [HttpPost]
        public async Task<IActionResult> uploadAttachment(IFormFile file, string kpCaseNo, string description)
        {
            if (file == null || string.IsNullOrWhiteSpace(kpCaseNo))
                return Json(new { rtn = new successDTO { success = false, remarks = "Invalid file or case number." } });

            try
            {
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "_incidentdocx", kpCaseNo);
                Directory.CreateDirectory(folderPath);

                var fileName = $"{DateTime.Now:yyyyMMddHHmmss}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                    await file.CopyToAsync(stream);

                var dto = new IncidentAttachmentDTO
                {
                    KPCaseNo = kpCaseNo,
                    Description = description,
                    FileLocation = $"/incidentdocx/{kpCaseNo}/{fileName}",
                    DateUploaded = DateTime.Now,
                    UploadedByUserId = CurrentUserId,
                };

                var rtn = await _repo.SAVE_INCIDENT_ATTACHMENT(dto);
                return Json(new { rtn });
            }
            catch (Exception ex)
            {
                return Json(new { rtn = new successDTO { success = false, remarks = ex.Message } });
            }
        }

        // POST: Delete attachment
        [HttpPost]
        public async Task<IActionResult> deleteAttachment(int id)
        {
            var rtn = await _repo.DELETE_INCIDENT_ATTACHMENT(id);
            return Json(new { rtn });
        }

        // GET: Settlements by KPCaseNo
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getSettlements(string kpCaseNo)
        {
            var data = await _repo.GET_INCIDENT_SETTLEMENTS(kpCaseNo);
            return Json(data);
        }

        // POST: Save settlement
        [HttpPost]
        public async Task<IActionResult> saveSettlement(IncidentSettlementDTO dto)
        {
            var rtn = await _repo.SAVE_INCIDENT_SETTLEMENT(dto);
            return Json(new { rtn });
        }

        // POST: Update settlement
        [HttpPost]
        public async Task<IActionResult> updateSettlement(IncidentSettlementDTO dto)
        {
            var rtn = await _repo.UPDATE_INCIDENT_SETTLEMENT(dto);
            return Json(new { rtn });
        }

        // POST: Delete settlement
        [HttpPost]
        public async Task<IActionResult> deleteSettlement(int id)
        {
            var rtn = await _repo.DELETE_INCIDENT_SETTLEMENT(id);
            return Json(new { rtn });
        }
    }
}