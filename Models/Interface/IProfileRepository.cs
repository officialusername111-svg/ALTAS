using ALTAS.Models.DTO;

namespace ALTAS.Models.Interface
{
    public interface IProfileRepository
    {
        Task<UserProfileDTO> GET_USER_PROFILE(Guid userId);
        Task<successDTO> UPDATE_USER_PROFILE(UpdateProfileDTO dto);
        Task<bool> VERIFY_CURRENT_PASSWORD(Guid userId, string plainPassword, ICryptoService crypto);
        Task<successDTO> UPDATE_USER_PASSWORD(Guid userId, string encryptedHash);
        Task<UserPreferenceDTO> GET_USER_PREFERENCE(Guid userId);
        Task<successDTO> SAVE_USER_PREFERENCE(Guid userId, UserPreferenceDTO dto);
    }
}