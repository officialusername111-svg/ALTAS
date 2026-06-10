using ALTAS.Models.DTO;

namespace ALTAS.Models.Interface
{
    public interface ICTCCollectionRepository
    {
        Task<ApiResponseDTO> GetCTCCollectionAsync();
        Task<ApiResponseDTO> GetCTCCollectionByIdAsync(int ctcId);
        Task<ApiResponseDTO> SaveCTCCollectionAsync(CTCCollectionDTO model);
        Task<ApiResponseDTO> CancelCTCCollectionAsync(int ctcId, Guid cancelledByUserId);
        Task<ApiResponseDTO> RemitCTCCollectionAsync(int ctcId, Guid remittedByUserId);
    }
}