using ALTAS.Models.DTO;

namespace ALTAS.Models.Interface
{
    public interface IBarangayOfficialsRepository
    {
        Task<successDTO> SAVE_BRGYOFFICIALS(BarangayOfficialsDTO dto);
        Task<IEnumerable<BarangayOfficialsDTO>> GET_BRGYOFFICIALS(string keyword);
        Task<string> GET_PUNONGBARANGAY();
    }
}
