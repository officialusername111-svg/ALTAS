using ALTAS.Models.DTO;

namespace ALTAS.Models.Interface
{
    public interface IQueueRepository
    {
        Task<ApiResponseDTO> IssueTicketAsync(int serviceId);
        Task<ApiResponseDTO> CallNextAsync(int serviceId);
        Task<QueueStateDTO>  GetStateAsync();
        Task<ApiResponseDTO> ResetAllAsync();
    }
}
