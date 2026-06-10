namespace ALTAS.Models.DTO
{
    public class StreetDTO
    {
        public int StreetId { get; set; }
        public string StreetName { get; set; } = string.Empty;
    }

    public class PurokDTO
    {
        public int PurokId { get; set; }
        public string PurokName { get; set; } = string.Empty;
    }

    public class PositionDTO
    {
        public int PositionId { get; set; }
        public string PositionDescription { get; set; } = string.Empty;
    }

    public class ArchiveCategoryDTO
    {
        public int ArchiveCategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryDetails { get; set; } = string.Empty;
    }
}
