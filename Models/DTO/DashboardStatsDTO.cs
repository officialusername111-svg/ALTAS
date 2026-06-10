namespace ALTAS.Models.DTO
{
    public class DashboardStatsDTO
    {
        public string TotalResidents { get; set; }
        public string PercentFamilyHead { get; set; }

        public string TotalActiveVoters { get; set; }
        public string PercentActiveVoters { get; set; }

        public string TotalHouseholds { get; set; }
        public string PercentSmallHouseholds { get; set; }

        public string TotalWithComorbidities { get; set; }
        public string PercentWithComorbidities { get; set; }
    }

    public class DistributionDTO
    {
        public string Label { get; set; }
        public int Total { get; set; }
    }

    public class GenderDistributionDTO
    {
        public string Male { get; set; }
        public string Female { get; set; }
    }


    public class VotersDistributionDTO
    {
        public string Active { get; set; }
        public string Inactive { get; set; }
        public string Pending_Or_Under_Verification { get; set; }
        public string Others { get; set; }
    }

    public class CollectionSummary
    {
        public string Period { get; set; }
        public string PeriodLabel { get; set; }
        public int TotalIssued { get; set; }
        public decimal TotalCollection { get; set; }
    }
}
