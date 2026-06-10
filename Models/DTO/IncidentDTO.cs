namespace ALTAS.Models.DTO
{
    public class IncidentDTO
    {
        public int IncidentID { get; set; }
        public int? CaseTypeID { get; set; }
        public int? ComplaintTypeID { get; set; }
        public string? KPCaseNo { get; set; }
        public string? ComplaintDescription { get; set; }
        public string? ComplaintAdditionalDescription { get; set; }
        public string? ComplaintRemarks { get; set; }
        public DateTime? IncidentDate { get; set; }
        public int? ResidentId_Complainant { get; set; }
        public string? ComplainantFullName { get; set; }
        public string? ComplainantGender { get; set; }
        public string? ComplainantAddress { get; set; }
        public string? ComplainantContactNo { get; set; }
        public string? ComplainantCivilStatus { get; set; }
        public int? ResidentId_Respondent { get; set; }
        public string? RespondentFullName { get; set; }
        public string? RespondentGender { get; set; }
        public string? RespondentAddress { get; set; }
        public string? RespondentContactNo { get; set; }
        public string? RespondentCivilStatus { get; set; }
        public string? Status { get; set; }
        public bool IncidentForTransfer { get; set; }
        public DateTime? SettledDate { get; set; }
        // Joined display fields
        public string? CaseTypeName { get; set; }
        public string? ComplaintTypeName { get; set; }
        // Aggregated party names from IncidentParty
        public string? ComplainantNames { get; set; }
        public string? RespondentNames { get; set; }
        public int ComplainantCount { get; set; }
        public int RespondentCount { get; set; }

        public string? TimeFiled { get; set; }
        public string? ORNo { get; set; }
        public DateTime? DateIssued { get; set; }
        public decimal? Amount { get; set; }
    }

    public class CaseTypeDTO
    {
        public int CaseTypeID { get; set; }
        public string? CaseTypeName { get; set; }
        public string? CaseTypeDescription { get; set; }
    }

    public class ComplaintTypeDTO
    {
        public int ComplaintTypeID { get; set; }
        public string? ComplaintTypeName { get; set; }
        public string? ComplaintTypeDescription { get; set; }
        public int? CaseTypeID { get; set; }
    }

    public class IncidentAttachmentDTO
    {
        public int IncidentAttachementId { get; set; }
        public string? KPCaseNo { get; set; }
        public string? Description { get; set; }
        public string? FileLocation { get; set; }
        public DateTime DateUploaded { get; set; }
        public Guid? UploadedByUserId { get; set; }


    }

    public class IncidentPartyDTO
    {
        public int IncidentPartyId { get; set; }
        public int IncidentID { get; set; }
        public string? PartyType { get; set; }  // "Complainant" | "Respondent"
        public int? ResidentId { get; set; }
        public string? FullName { get; set; }
        public string? Gender { get; set; }
        public string? CivilStatus { get; set; }
        public string? Address { get; set; }
        public string? ContactNo { get; set; }
    }

    public class IncidentSettlementDTO
    {
        public int IncidentSettlementId { get; set; }
        public string? KPCaseNo { get; set; }
        public DateTime? SettlementDate { get; set; }
        public string? SettlementTime { get; set; }   // NEW — "HH:mm" (24h)
        public string? Result { get; set; }
        public string? Remarks { get; set; }
    }
}