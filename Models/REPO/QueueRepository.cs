using System.Data;
using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Dapper;

namespace ALTAS.Models.REPO
{
    public class QueueRepository : IQueueRepository
    {
        private readonly IDbConnectionFactory _factory;

        public QueueRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        // ─────────────────────────────────────────────────────────────
        // ISSUE_TICKET
        // Calls the ISSUE_TICKET stored procedure and returns the
        // newly created ticket wrapped in an ApiResponseDTO.
        // ─────────────────────────────────────────────────────────────
        public async Task<ApiResponseDTO> IssueTicketAsync(int serviceId)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open)
                    connection.Open();

                var param = new DynamicParameters();
                param.Add("@ServiceId", serviceId);

                var ticket = await connection.QuerySingleOrDefaultAsync<QueueTicketDTO>(
                    "ISSUE_TICKET",
                    param,
                    commandType: CommandType.StoredProcedure
                );

                if (ticket == null)
                    return new ApiResponseDTO { Success = false, Message = "Failed to issue ticket. Service may be inactive." };

                return new ApiResponseDTO { Success = true, Data = ticket };
            }
            catch (Exception ex)
            {
                return new ApiResponseDTO { Success = false, Message = ex.Message };
            }
        }

        // ─────────────────────────────────────────────────────────────
        // CALL_NEXT_TICKET
        // Marks the current 'Serving' ticket as Done, then calls the
        // next 'Waiting' ticket for the given service.
        // ─────────────────────────────────────────────────────────────
        public async Task<ApiResponseDTO> CallNextAsync(int serviceId)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open)
                    connection.Open();

                var param = new DynamicParameters();
                param.Add("@ServiceId", serviceId);

                var ticket = await connection.QuerySingleOrDefaultAsync<QueueTicketDTO>( "CALL_NEXT_TICKET", param, commandType: CommandType.StoredProcedure );

                if (ticket == null)
                    return new ApiResponseDTO { Success = false, Message = "No more tickets in queue.", Data = null };

                return new ApiResponseDTO { Success = true, Data = ticket };
            }
            catch (Exception ex)
            {
                return new ApiResponseDTO { Success = false, Message = ex.Message };
            }
        }

        // ─────────────────────────────────────────────────────────────
        // GET_QUEUE_STATE
        // Calls GET_QUEUE_STATE which returns 3 result sets:
        //   1. Now Serving ticket (0 or 1 row)
        //   2. Pending / Waiting tickets (up to 15 rows)
        //   3. Served count per service
        // ─────────────────────────────────────────────────────────────
        public async Task<QueueStateDTO> GetStateAsync()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            if (connection.State != ConnectionState.Open)
                connection.Open();

            using var multi = await connection.QueryMultipleAsync( "GET_QUEUE_STATE", commandType: CommandType.StoredProcedure );

            var nowServing  = await multi.ReadFirstOrDefaultAsync<QueueTicketDTO>();
            var pending     = (await multi.ReadAsync<QueueTicketDTO>()).ToList();
            var servedRows  = (await multi.ReadAsync<ServiceServedCountDTO>()).ToList();

            var servedCount = servedRows.ToDictionary(
                r => r.Prefix,
                r => r.ServedCount
            );

            return new QueueStateDTO
            {
                NowServing  = nowServing,
                Pending     = pending,
                ServedCount = servedCount
            };
        }

        // ─────────────────────────────────────────────────────────────
        // RESET_QUEUE
        // Deletes all of today's tickets via RESET_QUEUE stored proc.
        // ─────────────────────────────────────────────────────────────
        public async Task<ApiResponseDTO> ResetAllAsync()
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open)
                    connection.Open();

                using var tran = connection.BeginTransaction();

                var result = await connection.QuerySingleAsync<int>( "RESET_QUEUE", commandType: CommandType.StoredProcedure, transaction: tran );

                tran.Commit();

                return new ApiResponseDTO
                {
                    Success = true,
                    Message = $"Queue reset. {result} ticket(s) removed.",
                    Data    = result
                };
            }
            catch (Exception ex)
            {
                return new ApiResponseDTO { Success = false, Message = ex.Message };
            }
        }
    }
}
