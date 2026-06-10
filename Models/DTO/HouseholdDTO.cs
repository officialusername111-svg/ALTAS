namespace ALTAS.Models.DTO
{
    public class HouseholdDTO
    {
        public int HouseholdId { get; set; }
        public int? StreetId { get; set; }
        public int? PurokId { get; set; }

        public string? HouseHoldNo { get; set; }
        public string? Remarks { get; set; }

        // Extra for convenience
        public string? StreetName { get; set; }
        public string? PurokName { get; set; }

        public string? Resident1 { get; set; }
        public string? Resident2 { get; set; }
        public string? Resident3 { get; set; }
        public bool? HasFamilyHead { get; set; }
    }
}
