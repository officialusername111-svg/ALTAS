using ALTAS.Models.DTO;

namespace ALTAS.Models.Interface
{
    public interface IORRepository
    {
        Task<ApiResponseDTO> GetORTypeAsync();
        Task<ApiResponseDTO> GetORAsync(Guid userId);
        Task<ApiResponseDTO> GetORListAsync(Guid userId);
        Task<ApiResponseDTO> SaveORAsync(ORHistoryDTO model);
    }
}