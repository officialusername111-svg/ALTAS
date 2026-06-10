namespace ALTAS.Models.DTO
{
    public class BarangayOfficialsDTO
    {
        public int OfficialId { get; set; }
        public int? ResidentId { get; set; }
        public int? PositionId { get; set; }
        public string? PositionDescription { get; set; }
        public DateTime? TermStart { get; set; }
        public DateTime? TermEnd { get; set; }
        public string? Status { get; set; }
        public string? Resident { get; set; }
    }
}
