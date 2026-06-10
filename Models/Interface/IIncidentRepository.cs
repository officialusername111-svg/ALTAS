using ALTAS.Models.DTO;

namespace ALTAS.Models.Interface
{
    public interface IIncidentRepository
    {
        // Incident
        Task<successDTO> SAVE_INCIDENT(IncidentDTO dto);
        Task<successDTO> UPDATE_INCIDENT(IncidentDTO dto);
        Task<IEnumerable<IncidentDTO>> GET_INCIDENT(string searchKeyword);
        Task<IncidentDTO> GET_INCIDENT_BYID(int id);

        // Dropdowns
        Task<IEnumerable<CaseTypeDTO>> GET_CASETYPE_DROPDOWN();
        Task<IEnumerable<ComplaintTypeDTO>> GET_COMPLAINTTYPE_BY_CASETYPE(int caseTypeId);

        // Attachments
        Task<successDTO> SAVE_INCIDENT_ATTACHMENT(IncidentAttachmentDTO dto);
        Task<successDTO> DELETE_INCIDENT_ATTACHMENT(int incidentAttachementId);
        Task<IEnumerable<IncidentAttachmentDTO>> GET_INCIDENT_ATTACHMENTS(string kpCaseNo);

        // Parties
        Task<successDTO> SAVE_INCIDENT_PARTY(IncidentPartyDTO dto);
        Task<successDTO> UPDATE_INCIDENT_PARTY(IncidentPartyDTO dto);
        Task<successDTO> DELETE_INCIDENT_PARTY(int incidentPartyId);
        Task<IEnumerable<IncidentPartyDTO>> GET_INCIDENT_PARTIES(int incidentId);

        // Settlements
        Task<successDTO> SAVE_INCIDENT_SETTLEMENT(IncidentSettlementDTO dto);
        Task<successDTO> UPDATE_INCIDENT_SETTLEMENT(IncidentSettlementDTO dto);
        Task<successDTO> DELETE_INCIDENT_SETTLEMENT(int incidentSettlementId);
        Task<IEnumerable<IncidentSettlementDTO>> GET_INCIDENT_SETTLEMENTS(string kpCaseNo);
    }
}