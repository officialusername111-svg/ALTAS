namespace ALTAS.Models.DTO
{
    // Maps 1-to-1 with QServices.ServiceId in the database
    public enum ServiceType
    {
        BaragayClearance       = 1,  // ServiceId = 1, ServiceCode = "C"
        BaragayCertification   = 2,  // ServiceId = 2, ServiceCode = "B"
        CommunityTaxCertificate = 3  // ServiceId = 3, ServiceCode = "T"
    }

    /// <summary>
    /// Represents a single queue ticket as returned by the database.
    /// Column names match the SELECT aliases in the stored procedures.
    /// </summary>
    public class QueueTicketDTO
    {
        public int      TicketId     { get; set; }
        public string   TicketNumber { get; set; } = string.Empty;
        public int      ServiceId    { get; set; }
        public string   ServiceName  { get; set; } = string.Empty;
        public string   Prefix       { get; set; } = string.Empty;   // ServiceCode alias
        public string   Status       { get; set; } = string.Empty;   // Waiting / Serving / Done / Skipped
        public DateTime IssuedAt     { get; set; }
        public DateTime? CalledAt    { get; set; }
        public DateTime? CompletedAt { get; set; }

        // Computed helpers consumed by the views (not from DB)
        public bool IsNowServing => Status == "Serving";
        public bool IsServed     => Status == "Done" || Status == "Skipped";
        public string ServiceLabel => ServiceName;
    }

    /// <summary>
    /// Aggregated queue state returned by GET_QUEUE_STATE (3 result sets).
    /// </summary>
    public class QueueStateDTO
    {
        public QueueTicketDTO?      NowServing   { get; set; }
        public List<QueueTicketDTO> Pending      { get; set; } = new();
        public Dictionary<string, int> ServedCount { get; set; } = new();
    }

    /// <summary>
    /// Rows from result-set 3 of GET_QUEUE_STATE — mapped by Dapper.
    /// </summary>
    public class ServiceServedCountDTO
    {
        public string Prefix      { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public int    ServedCount { get; set; }
    }

    public class ApiResponseDTO
    {
        public bool    Success { get; set; }
        public string? Message { get; set; }
        public object? Data    { get; set; }
    }

    public class SuccessDTO
    {
        public bool   Success { get; set; }
        public int    Value   { get; set; }
        public string Remarks { get; set; } = string.Empty;
    }
}
