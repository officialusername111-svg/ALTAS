using ALTAS.Models.DTO;

namespace ALTAS.Models.Interface
{
    public interface IArchiveDocumentRepository
    {
        Task<IEnumerable<ArchiveDocumentDTO>> GET_ARCHIVEDOCS(string keyword);
        Task<successDTO> SAVE_ARCHIVEDOCS(ArchiveDocumentDTO dto);
    }
}
