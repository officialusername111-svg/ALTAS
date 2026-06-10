using System.Data;
using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Dapper;

namespace ALTAS.Models.REPO
{
    public class ORRepository : IORRepository
    {
        private readonly IDbConnectionFactory _factory;

        public ORRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }




        public async Task<ApiResponseDTO> GetORTypeAsync()
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                var result = await connection.QueryAsync<ORTypeDTO>( "GET_ORTYPE", commandType: CommandType.StoredProcedure );
                return new ApiResponseDTO { Success = true, Data = result };
            }
            catch (Exception ex)
            {
                return new ApiResponseDTO { Success = false, Message = ex.Message };
            }
        }



        // ─────────────────────────────────────────────────────────────
        // GET_OR
        // Retrieves the active, unconsumed OR stub for a given UserID.
        // Returns TOP 1 ordered by ORID DESC.
        // ─────────────────────────────────────────────────────────────
        public async Task<ApiResponseDTO> GetORAsync(Guid userId)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");

                var param = new DynamicParameters();
                param.Add("@UserID", userId);
                var result = await connection.QuerySingleOrDefaultAsync<ORHistoryDTO>( "GET_OR", param, commandType: CommandType.StoredProcedure );
                return new ApiResponseDTO { Success = true, Data = result };
            }
            catch (Exception ex)
            {
                return new ApiResponseDTO { Success = false, Message = ex.Message };
            }
        }


        public async Task<ApiResponseDTO> GetORListAsync(Guid userId)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");

                var param = new DynamicParameters();
                param.Add("@UserID", userId);
                var result = await connection.QueryAsync<ORHistoryDTO>("GET_ORLIST", param, commandType: CommandType.StoredProcedure);
                return new ApiResponseDTO { Success = true, Data = result };
            }
            catch (Exception ex)
            {
                return new ApiResponseDTO { Success = false, Message = ex.Message };
            }
        }

        // ─────────────────────────────────────────────────────────────
        // SAVE_OR
        // Inserts a new OR stub or updates an existing one.
        // Returns the ORID of the inserted/updated record.
        // ─────────────────────────────────────────────────────────────
        public async Task<ApiResponseDTO> SaveORAsync(ORHistoryDTO model)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open)
                    connection.Open();

                var param = new DynamicParameters();
                param.Add("@ORID", model.ORID);
                param.Add("@UserID", model.UserID);
                param.Add("@StubNumber", model.StubNumber);
                param.Add("@StartingOR", model.StartingOR);
                param.Add("@EndingOR", model.EndingOR);
                param.Add("@ORTypeID", model.ORTypeID);
                param.Add("@Consumed", model.Consumed);
                param.Add("@Active", model.Active);
                param.Add("@Remarks", model.Remarks);
                param.Add("@CurrentOR", model.CurrentOR);
                param.Add("@Qty", model.Qty);
                var orid = await connection.QuerySingleAsync<int>( "SAVE_OR", param, commandType: CommandType.StoredProcedure );

                return new ApiResponseDTO
                {
                    Success = true,
                    Message = model.ORID == null ? "OR stub created successfully." : "OR stub updated successfully.",
                    Data = orid
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDTO { Success = false, Message = ex.Message };
            }
        }
    }
}