using ALTAS.Models.DTO;

namespace ALTAS.Models.Interface
{
    public interface IResidentRepository
    {
        Task<successDTO> SAVE_RESIDENT(ResidentDTO dto);
        Task<IEnumerable<ResidentDTO>> GET_RESIDENT(string searchKeyword);
        Task<ResidentDTO> GET_RESIDENT_BYID(int Id);


        // NEW
        Task<IEnumerable<ResidentDTO>> GET_RESIDENT_DEMOGRAPHIC(string category);
        Task<DemographicKpiDTO> GET_DEMOGRAPHIC_KPI();
    }
}
