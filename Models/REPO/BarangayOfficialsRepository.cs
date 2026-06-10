using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Dapper;
using System.Data;

namespace ALTAS.Models.REPO
{
    public class BarangayOfficialsRepository: IBarangayOfficialsRepository
    {
        private readonly IDbConnectionFactory _factory;

        public BarangayOfficialsRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }



        public async Task<successDTO> SAVE_BRGYOFFICIALS(BarangayOfficialsDTO dto)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");

                if (connection.State != ConnectionState.Open)
                    connection.Open();

                using var tran = connection.BeginTransaction();

                var param = new DynamicParameters();
                param.Add("@OfficialId", dto.OfficialId);
                param.Add("@ResidentId", dto.ResidentId);
                param.Add("@PositionId", dto.PositionId);
                param.Add("@TermStart", dto.TermStart);
                param.Add("@TermEnd", dto.TermEnd);
                param.Add("@Status", dto.Status);
                var result = await connection.QuerySingleAsync<int>("SAVE_BRGYOFFICIALS", param, commandType: CommandType.StoredProcedure, transaction: tran);
                tran.Commit();

                return new successDTO { success = true, value = result };
            }
            catch (Exception ex)
            {
                return new successDTO { success = false, remarks = ex.Message };
            }

        }

        public async Task<IEnumerable<BarangayOfficialsDTO>> GET_BRGYOFFICIALS(string keyword)
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<BarangayOfficialsDTO>("GET_BRGYOFFICIALS", new { keyword }, commandType: CommandType.StoredProcedure);
        }

        public async Task<string> GET_PUNONGBARANGAY()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QuerySingleAsync<string>("GET_PUNONGBARANGAY",null, commandType: CommandType.StoredProcedure);
        }
    }
}
