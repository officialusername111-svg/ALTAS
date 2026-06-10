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
}
