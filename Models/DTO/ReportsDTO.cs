namespace ALTAS.Models.DTO
{
    public class ClearanceDTO
    {
        public string ClearanceNumber { get; set; }
        public string FullName => $"{FirstName} {MiddleName} {LastName}";
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string PlaceOfBirth { get; set; }
        public string Age { get; set; }
        public string Address { get; set; }
        public string Sex { get; set; }
        public string CivilStatus { get; set; }
        public string Nationality { get; set; }
        public string CTCNo { get; set; }
        public string Purpose { get; set; }
        public string PunongBarangay { get; set; }
    }

    public class CertificateOfIndigencyDTO
    {
        public string FullName { get; set; }
        public string Age { get; set; }
        public string Sex { get; set; }
        public string CivilStatus { get; set; }
        public string Citizenship { get; set; }
        public string PurokName { get; set; }
        public string Purpose { get; set; }
        public string DateIssued { get; set; }
        public string PunongBarangay { get; set; }
    }

    public class KPPartyDTO
    {
        public string? FullName { get; set; }
        public string? Address { get; set; }
    }

    // KP Form No. 7 — Complaint
    public class KPForm7ComplaintDTO
    {
        // All complainants in order — first entry is the primary signatory
        public List<KPPartyDTO> Complainants { get; set; } = new();

        // All respondents in order
        public List<KPPartyDTO> Respondents { get; set; } = new();

        // Case info
        public string KPCaseNo { get; set; }
        public string CaseType { get; set; }

        // Complaint body — maps to IncidentDTO.ComplaintDescription
        public string ComplaintNarrative { get; set; }

        // Reliefs — split from IncidentDTO.ComplaintAdditionalDescription (one item per line)
        public List<string> Reliefs { get; set; } = new();

        // Filing details — NOT in DB; passed as query params
        public string DateMade { get; set; }
        public string TimeFiled { get; set; }
        public string ORNo { get; set; }
        public string DateIssued { get; set; }
        public string Amount { get; set; }

        // Officials
        public string PunongBarangay { get; set; }
    }

    // KP Form No. 8 — Notice of Hearing (Mediation Proceedings)
    public class KPForm8NoticeOfHearingDTO
    {
        public string ToName { get; set; }
        public string ToAddress { get; set; }
        public string ToRole { get; set; }
        public string HearingDay { get; set; }
        public string HearingMonthYear { get; set; }
        public string HearingTime { get; set; }
        public string HearingPeriod { get; set; }
        public string DateIssued { get; set; }
        public string NotifiedDate { get; set; }
        public string AcknowledgedBy { get; set; }
        public string PunongBarangay { get; set; }
        public string TimeNotified { get; set; }
        public string DateNotified { get; set; }
    }

    // KP Form No. 9 — Summons
    public class KPForm9SummonsDTO
    {
        public string ComplainantName { get; set; }
        public string ComplainantAddress { get; set; }
        public string RespondentName { get; set; }
        public string RespondentAddress { get; set; }
        public string KPCaseNo { get; set; }
        public string CaseType { get; set; }
        public string HearingDay { get; set; }
        public string HearingMonthYear { get; set; }
        public string HearingTime { get; set; }
        public string HearingPeriod { get; set; }
        public string DateIssued { get; set; }
        public string PunongBarangay { get; set; }
        public string TimeServed { get; set; }
        public string DateServed { get; set; }
    }
}
