namespace ALTAS.Models.DTO
{
    public class CTCCollectionDTO
    {
        public int? CTCId { get; set; }
        public Guid? UserId { get; set; }
        public int? ORTypeId { get; set; }
        public string PayerName { get; set; }
        public DateTime? ORDate { get; set; }
        public string ORNumber { get; set; }
        public int? ResidentId { get; set; }
        public int? YearPaid { get; set; }
        public decimal? Basic { get; set; }
        public decimal? TaxAmount1 { get; set; }
        public decimal? TaxAmount2 { get; set; }
        public decimal? TaxAmount3 { get; set; }
        public decimal? TaxDue1 { get; set; }
        public decimal? TaxDue2 { get; set; }
        public decimal? TaxDue3 { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal? Interest { get; set; }
        public decimal? GrandTotal { get; set; }
        public bool? Cancelled { get; set; }
        public DateTime? CancelledDate { get; set; }
        public bool? Remitted { get; set; }
        public DateTime? DateRemitted { get; set; }
    }
    public class CTCRemitDTO
    {
        public DateTime DateRemitted { get; set; }
    }
}
