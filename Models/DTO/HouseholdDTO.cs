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

        public bool? HasToiletFacility { get; set; }  // NEW (stored)
        public int MemberCount { get; set; }  // NEW (read-only, from toilet list)
    }

    public class HouseholdMemberDTO
    {
        public int ResidentId { get; set; }
        public int HouseholdId { get; set; }
        public string? Resident { get; set; }
        public string? Sex { get; set; }
        public DateTime? Birthdate { get; set; }
        public string? RelationshipToFamilyHead { get; set; }
        public bool? IsFamilyHead { get; set; }
    }
}
