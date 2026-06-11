using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ALTAS.Models.DTO;
using ALTAS.Models.Interface;

namespace ALTAS.Controllers
{
    [Authorize]
    public class ProfileController : BaseController
    {
        private readonly IProfileRepository _repo;
        private readonly ICryptoService _crypto;

        public ProfileController(IProfileRepository repo, ICryptoService crypto)
        {
            _repo = repo;
            _crypto = crypto;
        }

        // GET: Profile data for the current user
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getProfile()
        {
            var data = await _repo.GET_USER_PROFILE(CurrentUserId);
            return Json(data);
        }

        // POST: Update profile (name + position)
        [HttpPost]
        public async Task<IActionResult> updateProfile(UpdateProfileDTO dto)
        {
            // Enforce varchar(20) limits — trim silently
            dto.UserId = CurrentUserId;
            dto.FirstName = (dto.FirstName ?? "").Trim().Length > 20 ? dto.FirstName!.Trim()[..20] : dto.FirstName?.Trim();
            dto.MiddleName = (dto.MiddleName ?? "").Trim().Length > 20 ? dto.MiddleName!.Trim()[..20] : dto.MiddleName?.Trim();
            dto.LastName = (dto.LastName ?? "").Trim().Length > 20 ? dto.LastName!.Trim()[..20] : dto.LastName?.Trim();
            dto.Position = (dto.Position ?? "").Trim().Length > 125 ? dto.Position!.Trim()[..125] : dto.Position?.Trim();

            var rtn = await _repo.UPDATE_USER_PROFILE(dto);
            return Json(new { rtn });
        }

        // POST: Change password
        [HttpPost]
        public async Task<IActionResult> changePassword(ChangePasswordDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NewPassword) ||
                dto.NewPassword != dto.ConfirmPassword)
                return Json(new { rtn = new successDTO { success = false, remarks = "New passwords do not match." } });

            if (dto.NewPassword.Length < 8)
                return Json(new { rtn = new successDTO { success = false, remarks = "Password must be at least 8 characters." } });

            // Verify current password against stored encrypted hash
            var isValid = await _repo.VERIFY_CURRENT_PASSWORD(
                CurrentUserId, dto.CurrentPassword!, _crypto);

            if (!isValid)
                return Json(new { rtn = new successDTO { success = false, remarks = "Current password is incorrect." } });

            // Hash → encrypt → store
            var hash = _crypto.HashPassword(dto.NewPassword);
            var encryptedHash = _crypto.Encrypt(hash);

            var rtn = await _repo.UPDATE_USER_PASSWORD(CurrentUserId, encryptedHash);
            return Json(new { rtn });
        }

        // GET: Preferences for the current user
        [HttpGet]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> getPreferences()
        {
            var data = await _repo.GET_USER_PREFERENCE(CurrentUserId);
            return Json(data);
        }

        // POST: Save preferences
        [HttpPost]
        public async Task<IActionResult> savePreferences(UserPreferenceDTO dto)
        {
            var rtn = await _repo.SAVE_USER_PREFERENCE(CurrentUserId, dto);
            return Json(new { rtn });
        }
    }
}