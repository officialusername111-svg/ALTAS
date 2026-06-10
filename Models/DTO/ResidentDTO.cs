namespace ALTAS.Models.DTO
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public class ResidentDTO
    {
        public int ResidentId { get; set; }
        public int? HouseholdId { get; set; }
        public string? CourtesyName { get; set; }
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string? ExtensionName { get; set; }
        public bool? IsFamilyHead { get; set; }
        public string? Sex { get; set; }
        public DateTime? Birthdate { get; set; }
        public int? Age { get; set; }
        public string? BirthPlace { get; set; }
        public string? CivilStatus { get; set; }
        public string? BloodType { get; set; }
        public string? ContactNumber { get; set; }
        public string? EducationalAttainment { get; set; }
        public string? EmailAddress { get; set; }
        public string? ReligionSect { get; set; }
        public string? Religion { get; set; }
        public string? Tribe { get; set; }
        public string? Occupation { get; set; }
        public string? VoterStatus { get; set; }
        public string? TINnumber { get; set; }
        public string? Height { get; set; }
        public string? Weight { get; set; }
        public string? Citizenship { get; set; }
        public DateTime? DateRegistered { get; set; }
        public bool? HasComorbidities { get; set; }
        public bool? IsDeceased { get; set; }
        public string? Resident { get; set; }
        public string? Household { get; set; }
        public string? RelationshipToFamilyHead { get; set; }
    }
}
