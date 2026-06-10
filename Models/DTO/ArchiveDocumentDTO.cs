namespace ALTAS.Models.DTO
{
    public class ArchiveDocumentDTO
    {
        public int ArchiveDocumentId { get; set; }
        public int? ArchiveCategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? OrdResoTitle { get; set; }
        public string? OrdResoSubject { get; set; }
        public string? FileName { get; set; }
        public string? FileDetails { get; set; }
        public string? FileLocation { get; set; }
        public DateTime? DateArchive { get; set; }
        public int? UserID_UploadedBy { get; set; }
        public DateTime? UploadedDate { get; set; }
    }
}
