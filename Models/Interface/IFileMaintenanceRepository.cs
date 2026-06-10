using ALTAS.Models.DTO;

namespace ALTAS.Models.Interface
{
    public interface IFileMaintenanceRepository
    {
        List<StreetDTO> GET_STREET();
        List<PurokDTO> GET_PUROK();
        List<PositionDTO> GET_POSITION();
        List<ArchiveCategoryDTO> GET_ARCHIVECATEGORY();
    }
}
