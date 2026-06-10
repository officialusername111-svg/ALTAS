using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using ALTAS.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;

namespace ALTAS.Controllers
{
    [Authorize]
    public class ReportsController : BaseController
    {
        private readonly IConfiguration _configuration;
        private readonly IResidentRepository _repo;
        private readonly IBarangayOfficialsRepository _repooff;
        private readonly IIncidentRepository _repoinci;

        private readonly IWebHostEnvironment _env;

        public ReportsController(IConfiguration configuration, IResidentRepository repo, IBarangayOfficialsRepository repooff, IIncidentRepository repoinci, IWebHostEnvironment env)
        {
            _env = env;
            _configuration = configuration;
            _repo = repo;
            _repooff = repooff;
            _repoinci = repoinci;
        }

        public IActionResult Reports()
        {
            return View();
        }


        [HttpGet]
        public async Task<IActionResult> GENERATE_BarangayClearance(int ResidentId, string CTCNo, string Purpose)
        {
            try
            {
                // 1. Fetch data
                var resident = await _repo.GET_RESIDENT_BYID(ResidentId);
                var punongBarangay = await _repooff.GET_PUNONGBARANGAY();

                if (resident == null)
                {
                    return NotFound("Resident not found.");
                }

                string logoPath = Path.Combine(_env.WebRootPath, "img", "report_logo.jpg");

                // 2. Map to DTO
                var data = new ClearanceDTO
                {
                    LastName = resident.LastName ?? "",
                    FirstName = resident.FirstName ?? "",
                    MiddleName = resident.MiddleName ?? "",
                    PunongBarangay = punongBarangay,
                    PlaceOfBirth = resident.BirthPlace ?? "",
                    DateOfBirth = resident.Birthdate ?? DateTime.MinValue,
                    Age = resident.Age.ToString() ?? "",
                    Sex = resident.Sex ?? "",
                    CivilStatus = resident.CivilStatus ?? "",
                    Nationality = resident.Citizenship ?? "",
                    Address = resident.Household +", Poblacion, Tupi, South Cotabato", 
                    CTCNo = CTCNo,
                    Purpose = Purpose,
                    ClearanceNumber = $"CLR-{ResidentId:0000}-{DateTime.Now:yyyyMMdd}"
                };

                // 3. Generate PDF
                var document = new BarangayClearanceDocument(data, logoPath);
                byte[] pdfBytes = document.GeneratePdf();

                // 4. Set Content-Disposition to "inline"
                // This is crucial for your JS/Iframe to work correctly!
                var contentDisposition = new System.Net.Mime.ContentDisposition
                {
                    FileName = $"Clearance_{ResidentId}.pdf",
                    Inline = true
                };
                Response.Headers.Add("Content-Disposition", contentDisposition.ToString());

                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                // Log the error (crucial for troubleshooting PDF generation)
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GENERATE_BarangayIndigent(int ResidentId, string Purpose)
        {
            try
            {
                // 1. Fetch data
                var resident = await _repo.GET_RESIDENT_BYID(ResidentId);
                var punongBarangay = await _repooff.GET_PUNONGBARANGAY();

                if (resident == null)
                {
                    return NotFound("Resident not found.");
                }

                string logoPath = Path.Combine(_env.WebRootPath, "img", "report_logo.jpg");

                // 2. Map to DTO
                var data = new CertificateOfIndigencyDTO
                {
                    FullName =  resident.Resident ?? "",
                    Age = resident.Age.ToString() ?? "",
                    Sex = resident.Sex ?? "",
                    CivilStatus =  resident.CivilStatus ?? "",
                    Citizenship = resident.Citizenship ?? "",
                    PurokName = resident.Household ?? "",
                    Purpose = Purpose,
                    DateIssued = DateTime.Now.ToString("MMMM dd, yyyy"),
                    PunongBarangay = punongBarangay,
                };

                // 3. Generate PDF
                var document = new CertificateOfIndigency(data, logoPath);
                byte[] pdfBytes = document.GeneratePdf();

                // 4. Set Content-Disposition to "inline"
                // This is crucial for your JS/Iframe to work correctly!
                var contentDisposition = new System.Net.Mime.ContentDisposition
                {
                    FileName = $"Clearance_{ResidentId}.pdf",
                    Inline = true
                };
                Response.Headers.Add("Content-Disposition", contentDisposition.ToString());

                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                // Log the error (crucial for troubleshooting PDF generation)
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GENERATE_KPForm7Complaint(int IncidentId)
        {
            try
            {
                var incident = await _repoinci.GET_INCIDENT_BYID(IncidentId);
                if (incident == null || incident.IncidentID == 0)
                    return NotFound("Incident not found.");

                var parties = (await _repoinci.GET_INCIDENT_PARTIES(IncidentId)).ToList();
                var punongBarangay = await _repooff.GET_PUNONGBARANGAY();

                string logoPath = Path.Combine(_env.WebRootPath, "img", "report_logo.jpg");
                string logoRightPath = Path.Combine(_env.WebRootPath, "img", "kp_logo-nbg.png");

                var complainants = parties.Where(p => p.PartyType == "Complainant").ToList();
                var respondents = parties.Where(p => p.PartyType == "Respondent").ToList();

                var reliefs = (incident.ComplaintAdditionalDescription ?? string.Empty)
                    .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                    .Select(r => r.Trim())
                    .Where(r => !string.IsNullOrEmpty(r))
                    .ToList();

                var caseTypeLabel = string.IsNullOrEmpty(incident.ComplaintTypeName)
                    ? incident.CaseTypeName ?? string.Empty
                    : $"{incident.CaseTypeName}: {incident.ComplaintTypeName}";

                var complainantList = complainants.Count > 0
                    ? complainants.Select(p => new KPPartyDTO { FullName = p.FullName, Address = p.Address }).ToList()
                    : new List<KPPartyDTO> { new() { FullName = incident.ComplainantFullName, Address = incident.ComplainantAddress } };

                var respondentList = respondents.Count > 0
                    ? respondents.Select(p => new KPPartyDTO { FullName = p.FullName, Address = p.Address }).ToList()
                    : new List<KPPartyDTO> { new() { FullName = incident.RespondentFullName, Address = incident.RespondentAddress } };

                var data = new KPForm7ComplaintDTO
                {
                    Complainants = complainantList,
                    Respondents = respondentList,
                    KPCaseNo = incident.KPCaseNo ?? string.Empty,
                    CaseType = caseTypeLabel,
                    ComplaintNarrative = incident.ComplaintDescription ?? string.Empty,
                    Reliefs = reliefs,
                    DateMade = incident.IncidentDate.HasValue
                                       ? $"{GetOrdinalDay(incident.IncidentDate.Value)} day {incident.IncidentDate.Value:MMMM yyyy}"
                                       : string.Empty,
                    // Task 2 — payment info now sourced from the Incident record
                    TimeFiled = incident.TimeFiled ?? string.Empty,
                    ORNo = incident.ORNo ?? string.Empty,
                    DateIssued = incident.DateIssued.HasValue ? incident.DateIssued.Value.ToString("MM/dd/yy") : string.Empty,
                    Amount = incident.Amount.HasValue ? incident.Amount.Value.ToString("N2") : string.Empty,
                    PunongBarangay = punongBarangay
                };

                var document = new KPForm7Complaint(data, logoPath, logoRightPath);
                byte[] pdfBytes = document.GeneratePdf();

                Response.Headers.Add("Content-Disposition",
                    new System.Net.Mime.ContentDisposition
                    {
                        FileName = $"KPForm7_Complaint_{incident.KPCaseNo}.pdf",
                        Inline = true
                    }.ToString());

                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        // ----- KP FORM NO. 8 — NOTICE OF HEARING -----
        // URL: /Reports/GENERATE_KPForm8NoticeOfHearing?IncidentId=1&SettlementId=3

        [HttpGet]
        public async Task<IActionResult> GENERATE_KPForm8NoticeOfHearing(int IncidentId, int SettlementId)
        {
            try
            {
                var incident = await _repoinci.GET_INCIDENT_BYID(IncidentId);
                if (incident == null || incident.IncidentID == 0)
                    return NotFound("Incident not found.");

                var settlements = (await _repoinci.GET_INCIDENT_SETTLEMENTS(incident.KPCaseNo)).ToList();
                var settlement = settlements.FirstOrDefault(s => s.IncidentSettlementId == SettlementId);
                if (settlement == null)
                    return NotFound("Settlement schedule not found.");

                var parties = (await _repoinci.GET_INCIDENT_PARTIES(IncidentId)).ToList();
                var punongBarangay = await _repooff.GET_PUNONGBARANGAY();

                string logoPath = Path.Combine(_env.WebRootPath, "img", "report_logo.jpg");
                string logoRightPath = Path.Combine(_env.WebRootPath, "img", "kp_logo-nbg.png");

                var primaryComplainant = parties.FirstOrDefault(p => p.PartyType == "Complainant");
                var complainantName = primaryComplainant?.FullName ?? incident.ComplainantFullName ?? string.Empty;
                var complainantAddress = primaryComplainant?.Address ?? incident.ComplainantAddress ?? string.Empty;

                var hearingDate = settlement.SettlementDate ?? DateTime.Now;

                // Task 1 — derive time + period from the settlement record
                var (hearingTime12, hearingPeriod) = ResolveHearing(settlement.SettlementTime);

                var data = new KPForm8NoticeOfHearingDTO
                {
                    ToName = complainantName,
                    ToAddress = complainantAddress,
                    ToRole = "Complainant/s",
                    HearingDay = $"{hearingDate.Day}{GetOrdinalSuffix(hearingDate.Day)}",
                    HearingMonthYear = hearingDate.ToString("MMMM yyyy"),
                    HearingTime = hearingTime12,
                    HearingPeriod = hearingPeriod,
                    DateIssued = $"{GetOrdinalDay(DateTime.Now)} day of {DateTime.Now:MMMM yyyy}",
                    NotifiedDate = $"{GetOrdinalDay(DateTime.Now)} day of {DateTime.Now:MMMM yyyy}",
                    AcknowledgedBy = complainantName,
                    PunongBarangay = punongBarangay,
                    TimeNotified = DateTime.Now.ToString("hh:mm tt"),
                    DateNotified = DateTime.Now.ToString("MM/dd/yy")
                };

                var document = new KPForm8NoticeOfHearing(data, logoPath, logoRightPath);
                byte[] pdfBytes = document.GeneratePdf();

                Response.Headers.Add("Content-Disposition",
                    new System.Net.Mime.ContentDisposition
                    {
                        FileName = $"KPForm8_Notice_{incident.KPCaseNo}.pdf",
                        Inline = true
                    }.ToString());

                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        // ----- KP FORM NO. 9 — SUMMONS -----
        // URL: /Reports/GENERATE_KPForm9Summons?IncidentId=1&SettlementId=3

        [HttpGet]
        public async Task<IActionResult> GENERATE_KPForm9Summons(int IncidentId, int SettlementId)
        {
            try
            {
                var incident = await _repoinci.GET_INCIDENT_BYID(IncidentId);
                if (incident == null || incident.IncidentID == 0)
                    return NotFound("Incident not found.");

                var settlements = (await _repoinci.GET_INCIDENT_SETTLEMENTS(incident.KPCaseNo)).ToList();
                var settlement = settlements.FirstOrDefault(s => s.IncidentSettlementId == SettlementId);
                if (settlement == null)
                    return NotFound("Settlement schedule not found.");

                var parties = (await _repoinci.GET_INCIDENT_PARTIES(IncidentId)).ToList();
                var punongBarangay = await _repooff.GET_PUNONGBARANGAY();

                string logoPath = Path.Combine(_env.WebRootPath, "img", "report_logo.jpg");
                string logoRightPath = Path.Combine(_env.WebRootPath, "img", "kp_logo-nbg.png");

                var primaryComplainant = parties.FirstOrDefault(p => p.PartyType == "Complainant");
                var primaryRespondent = parties.FirstOrDefault(p => p.PartyType == "Respondent");

                var caseTypeLabel = string.IsNullOrEmpty(incident.ComplaintTypeName)
                    ? incident.CaseTypeName ?? string.Empty
                    : $"{incident.CaseTypeName}: {incident.ComplaintTypeName}";

                var hearingDate = settlement.SettlementDate ?? DateTime.Now;

                // Task 1 — derive time + period from the settlement record
                var (hearingTime12, hearingPeriod) = ResolveHearing(settlement.SettlementTime);

                var data = new KPForm9SummonsDTO
                {
                    ComplainantName = primaryComplainant?.FullName ?? incident.ComplainantFullName ?? string.Empty,
                    ComplainantAddress = primaryComplainant?.Address ?? incident.ComplainantAddress ?? string.Empty,
                    RespondentName = primaryRespondent?.FullName ?? incident.RespondentFullName ?? string.Empty,
                    RespondentAddress = primaryRespondent?.Address ?? incident.RespondentAddress ?? string.Empty,
                    KPCaseNo = incident.KPCaseNo ?? string.Empty,
                    CaseType = caseTypeLabel,
                    HearingDay = $"{hearingDate.Day}{GetOrdinalSuffix(hearingDate.Day)}",
                    HearingMonthYear = hearingDate.ToString("MMMM yyyy"),
                    HearingTime = hearingTime12,
                    HearingPeriod = hearingPeriod,
                    DateIssued = $"{GetOrdinalDay(DateTime.Now)} day of {DateTime.Now:MMMM yyyy}",
                    PunongBarangay = punongBarangay,
                    TimeServed = DateTime.Now.ToString("hh:mm tt"),
                    DateServed = DateTime.Now.ToString("MM/dd/yy")
                };

                var document = new KPForm9Summons(data, logoPath, logoRightPath);
                byte[] pdfBytes = document.GeneratePdf();

                Response.Headers.Add("Content-Disposition",
                    new System.Net.Mime.ContentDisposition
                    {
                        FileName = $"KPForm9_Summons_{incident.KPCaseNo}.pdf",
                        Inline = true
                    }.ToString());

                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        // ----- PRIVATE HELPERS — add inside ReportsController class -----

        private static string GetOrdinalSuffix(int day)
        {
            if (day >= 11 && day <= 13) return "th";
            return (day % 10) switch
            {
                1 => "st",
                2 => "nd",
                3 => "rd",
                _ => "th"
            };
        }

        private static string GetOrdinalDay(DateTime date)
            => $"{date.Day}{GetOrdinalSuffix(date.Day)}";

        // Task 1 — converts a stored "HH:mm" settlement time into a 12-hour
        // display string and the morning/afternoon period.
        // Falls back to "10:00" / "morning" when no time is stored.
        private static (string time12, string period) ResolveHearing(string? settlementTime24)
        {
            if (string.IsNullOrWhiteSpace(settlementTime24)
                || !TimeSpan.TryParse(settlementTime24, out var ts))
            {
                return ("10:00", "morning");
            }

            var period = ts.Hours < 12 ? "morning" : "afternoon";

            var hour12 = ts.Hours % 12;
            if (hour12 == 0) hour12 = 12;
            var time12 = $"{hour12}:{ts.Minutes:D2}";

            return (time12, period);
        }
    }
}
