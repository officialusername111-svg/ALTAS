using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace ALTAS.Controllers
{
    [Authorize]
    public class CommunityTaxController : BaseController
    {
        private readonly IORRepository _repoor;
        private readonly ICTCCollectionRepository _repoctc;

        public CommunityTaxController(IORRepository orrepo, ICTCCollectionRepository ctcrepo)
        {
            _repoor = orrepo;
            _repoctc = ctcrepo;
        }

        public async Task<IActionResult> CTC()
        {
            var orType = await _repoor.GetORTypeAsync();
            ViewBag.drpORType = new SelectList(
                orType.Data as IEnumerable<ORTypeDTO>,
                "ORTypeID",
                "ORTypeDescription"
            );
            return View();
        }

        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getORList()
        {
            var data = await _repoor.GetORListAsync(CurrentUserId);
            return Json(data);
        }

        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getCurrentCTC()
        {
            var data = await _repoor.GetORAsync(CurrentUserId);
            return Json(data);
        }

        [HttpPost]
        public async Task<IActionResult> saveORHistory(ORHistoryDTO dto)
        {
            dto.UserID = CurrentUserId;
            var rtn = await _repoor.SaveORAsync(dto);
            return Json(rtn);
        }


        // ─────────────────────────────────────────────────────────────
        // GET: /CommunityTax/getCTCCollection
        // Retrieves all CTC collection records.
        // ─────────────────────────────────────────────────────────────
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getCTCCollection()
        {
            var data = await _repoctc.GetCTCCollectionAsync();
            return Json(data);
        }


        // ─────────────────────────────────────────────────────────────
        // GET: /CommunityTax/getCTCCollectionById?ctcId=1
        // Retrieves a single CTC collection record by CTCId.
        // ─────────────────────────────────────────────────────────────
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getCTCCollectionById(int ctcId)
        {
            var data = await _repoctc.GetCTCCollectionByIdAsync(ctcId);
            return Json(data);
        }


        // ─────────────────────────────────────────────────────────────
        // POST: /CommunityTax/saveCTCCollection
        // Inserts or updates a CTC collection record.
        // ─────────────────────────────────────────────────────────────
        [HttpPost]
        public async Task<IActionResult> saveCTCCollection(CTCCollectionDTO dto)
        {
            dto.UserId = CurrentUserId;
            var rtn = await _repoctc.SaveCTCCollectionAsync(dto);
            return Json(rtn);
        }


        // ─────────────────────────────────────────────────────────────
        // PATCH: /CommunityTax/cancelCTCCollection?ctcId=1
        // Marks a CTC collection record as cancelled.
        // ─────────────────────────────────────────────────────────────
        [HttpPatch]
        public async Task<IActionResult> cancelCTCCollection(int ctcId)
        {
            var rtn = await _repoctc.CancelCTCCollectionAsync(ctcId, CurrentUserId);
            return Json(rtn);
        }


        // ─────────────────────────────────────────────────────────────
        // PATCH: /CommunityTax/remitCTCCollection?ctcId=1
        // Marks a CTC collection record as remitted.
        // ─────────────────────────────────────────────────────────────
        [HttpPatch]
        public async Task<IActionResult> remitCTCCollection(int ctcId)
        {
            var rtn = await _repoctc.RemitCTCCollectionAsync(ctcId, CurrentUserId);
            return Json(rtn);
        }
    }
}