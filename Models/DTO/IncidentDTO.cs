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


    public class IncidentDashboardKpiDTO
    {
        public int TotalIncidents { get; set; }
        public int TotalOpen { get; set; }
        public int TotalOngoing { get; set; }
        public int TotalSettled { get; set; }
        public int TotalTransferred { get; set; }
        public int TotalDismissed { get; set; }
        public int TotalForTransfer { get; set; }
        public decimal TotalAmount { get; set; }
        public double AvgAmount { get; set; }
        public double SettlementRate { get; set; }
        public double AvgDaysToSettle { get; set; }
        public string? PeriodFrom { get; set; }
        public string? PeriodTo { get; set; }
    }

    public class IncidentTrendDTO
    {
        public DateTime TrendDate { get; set; }
        public int TrendCount { get; set; }
    }

    public class IncidentCaseTypeBreakdownDTO
    {
        public string? Label { get; set; }
        public int Value { get; set; }
    }

    public class IncidentTopResidentDTO
    {
        public string? ResidentName { get; set; }
        public string? PartyType { get; set; }
        public int CaseCount { get; set; }
        public int OpenCount { get; set; }
        public int OngoingCount { get; set; }
        public int SettledCount { get; set; }
        public int? ResidentId { get; set; }
    }

    public class IncidentPeriodTrendDTO
    {
        public int PeriodNo { get; set; }
        public string? PeriodLabel { get; set; }
        public int TotalCount { get; set; }
        public int OpenCount { get; set; }
        public int OngoingCount { get; set; }
        public int SettledCount { get; set; }
        public int TransferredCount { get; set; }
        public int DismissedCount { get; set; }
    }

    // Wrapper returned by the dashboard endpoint (all result sets combined)
    public class IncidentDashboardResultDTO
    {
        public IncidentDashboardKpiDTO? Kpi { get; set; }
        public IEnumerable<IncidentTrendDTO>? Trend { get; set; }
        public IEnumerable<IncidentCaseTypeBreakdownDTO>? CaseTypes { get; set; }
        public IEnumerable<IncidentTopResidentDTO>? TopResidents { get; set; }
    }

    public class UpcomingSettlementDTO
    {
        public int IncidentSettlementId { get; set; }
        public string? KPCaseNo { get; set; }
        public DateTime? SettlementDate { get; set; }
        public string? SettlementTime { get; set; }
        public string? Result { get; set; }
        public string? Remarks { get; set; }
        public string? RespondentName { get; set; }
        public string? CaseTypeName { get; set; }
        public string? IncidentStatus { get; set; }
        public int IncidentID { get; set; }
    }
}