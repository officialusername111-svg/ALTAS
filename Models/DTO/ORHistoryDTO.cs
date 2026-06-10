namespace ALTAS.Models.DTO
{
    public class ORHistoryDTO
    {
        public int ORID { get; set; }
        public Guid UserID { get; set; }
        public string StubNumber { get; set; }
        public string StartingOR { get; set; }
        public string EndingOR { get; set; }
        public DateTime DateAcquired { get; set; }
        public int ORTypeID { get; set; }
        public bool Consumed { get; set; }
        public bool Active { get; set; }
        public string Remarks { get; set; }
        public string CurrentOR { get; set; }

        public int Qty { get; set; }
        public int RemainingQty { get; set; }

        public string ORTypeDescription { get; set; }
    }


    public class ORTypeDTO
    {
        public int ORTypeID { get; set; }
        public string ORTypeName { get; set; }
        public string ORTypeDescription { get; set; }
    }
}