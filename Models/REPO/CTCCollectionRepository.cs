using System.Data;
using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Dapper;

namespace ALTAS.Models.REPO
{
    public class CTCCollectionRepository : ICTCCollectionRepository
    {
        private readonly IDbConnectionFactory _factory;

        public CTCCollectionRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }


        // ─────────────────────────────────────────────────────────────
        // GET_CTCCOLLECTION
        // Retrieves all CTC collection records ordered by CTCId DESC.
        // ─────────────────────────────────────────────────────────────
        public async Task<ApiResponseDTO> GetCTCCollectionAsync()
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                var result = await connection.QueryAsync<CTCCollectionDTO>( "GET_CTCCOLLECTION", commandType: CommandType.StoredProcedure );
                return new ApiResponseDTO { Success = true, Data = result };
            }
            catch (Exception ex)
            {
                return new ApiResponseDTO { Success = false, Message = ex.Message };
            }
        }


        // ─────────────────────────────────────────────────────────────
        // GET_CTCCOLLECTIONBYID
        // Retrieves a single CTC collection record by CTCId.
        // ─────────────────────────────────────────────────────────────
        public async Task<ApiResponseDTO> GetCTCCollectionByIdAsync(int ctcId)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                var param = new DynamicParameters(); param.Add("@CTCId", ctcId);
                var result = await connection.QuerySingleOrDefaultAsync<CTCCollectionDTO>( "GET_CTCCOLLECTIONBYID", param, commandType: CommandType.StoredProcedure );
                return new ApiResponseDTO { Success = true, Data = result };
            }
            catch (Exception ex)
            {
                return new ApiResponseDTO { Success = false, Message = ex.Message };
            }
        }


        // ─────────────────────────────────────────────────────────────
        // SAVE_CTCCOLLECTION
        // Inserts a new CTC record if CTCId is null, otherwise updates.
        // Returns the CTCId of the inserted/updated record.
        // ─────────────────────────────────────────────────────────────
        public async Task<ApiResponseDTO> SaveCTCCollectionAsync(CTCCollectionDTO model)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open)
                    connection.Open();

                var param = new DynamicParameters();
                param.Add("@CTCId", model.CTCId);
                param.Add("@UserId", model.UserId);
                param.Add("@ORTypeId", model.ORTypeId);
                param.Add("@PayerName", model.PayerName);
                param.Add("@ORDate", model.ORDate);
                param.Add("@ORNumber", model.ORNumber);
                param.Add("@ResidentId", model.ResidentId);
                param.Add("@YearPaid", model.YearPaid);
                param.Add("@Basic", model.Basic);
                param.Add("@TaxAmount1", model.TaxAmount1);
                param.Add("@TaxAmount2", model.TaxAmount2);
                param.Add("@TaxAmount3", model.TaxAmount3);
                param.Add("@TaxDue1", model.TaxDue1);
                param.Add("@TaxDue2", model.TaxDue2);
                param.Add("@TaxDue3", model.TaxDue3);
                param.Add("@TotalAmount", model.TotalAmount);
                param.Add("@Interest", model.Interest);
                param.Add("@GrandTotal", model.GrandTotal);

                var ctcId = await connection.QuerySingleAsync<int>( "SAVE_CTCCOLLECTION", param, commandType: CommandType.StoredProcedure );

                return new ApiResponseDTO
                {
                    Success = true,
                    Message = model.CTCId == null
                        ? "CTC collection created successfully."
                        : "CTC collection updated successfully.",
                    Data = ctcId
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDTO { Success = false, Message = ex.Message };
            }
        }


        // ─────────────────────────────────────────────────────────────
        // CANCEL_CTCCOLLECTION
        // Sets Cancelled = 1, CancelledDate = GETDATE() for the record.
        // ─────────────────────────────────────────────────────────────
        public async Task<ApiResponseDTO> CancelCTCCollectionAsync(int ctcId, Guid cancelledByUserId)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");

                var param = new DynamicParameters();
                param.Add("@CTCId", ctcId);
                param.Add("@CancelledByUserId", cancelledByUserId);
                await connection.ExecuteAsync( "CANCEL_CTCCOLLECTION", param, commandType: CommandType.StoredProcedure );
                return new ApiResponseDTO { Success = true, Message = "CTC collection cancelled successfully." };
            }
            catch (Exception ex)
            {
                return new ApiResponseDTO { Success = false, Message = ex.Message };
            }
        }


        // ─────────────────────────────────────────────────────────────
        // REMIT_CTCCOLLECTION
        // Sets Remitted = 1, DateRemitted, RemittedByUserId.
        // ─────────────────────────────────────────────────────────────
        public async Task<ApiResponseDTO> RemitCTCCollectionAsync(int ctcId, Guid remittedByUserId)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");

                var param = new DynamicParameters();
                param.Add("@CTCId", ctcId);
                param.Add("@RemittedByUserId", remittedByUserId);
                await connection.ExecuteAsync( "REMIT_CTCCOLLECTION", param, commandType: CommandType.StoredProcedure );
                return new ApiResponseDTO { Success = true, Message = "CTC collection remitted successfully." };
            }
            catch (Exception ex)
            {
                return new ApiResponseDTO { Success = false, Message = ex.Message };
            }
        }
    }
}