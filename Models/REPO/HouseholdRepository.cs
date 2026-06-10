using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Dapper;
using System.Data;

namespace ALTAS.Models.REPO
{
    public class HouseholdRepository : IHouseholdRepository
    {
        private readonly IDbConnectionFactory _factory;

        public HouseholdRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }


        public async Task<successDTO> SAVE_HOUSEHOLD(HouseholdDTO dto)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");

                if (connection.State != ConnectionState.Open)
                    connection.Open();

                using var tran = connection.BeginTransaction();

                var param = new DynamicParameters();
                param.Add("@HouseholdId", dto.HouseholdId);
                param.Add("@StreetId", dto.StreetId);
                param.Add("@PurokId", dto.PurokId);
                param.Add("@HouseHoldNo", dto.HouseHoldNo);
                param.Add("@Remarks", dto.Remarks);
                param.Add("@HasToiletFacility", dto.HasToiletFacility);

                // Execute the stored procedure
                var result = await connection.QuerySingleAsync<int>("SAVE_HOUSEHOLD", param, commandType: CommandType.StoredProcedure, transaction: tran);
                tran.Commit();

                return new successDTO { success = true, value = result };
            }
            catch (Exception ex)
            {
                return new successDTO { success = false, remarks = ex.Message };
            }
        }

        public async Task<IEnumerable<HouseholdDTO>> GET_HOUSEHOLD(string keyword)
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<HouseholdDTO>( "GET_HOUSEHOLD", new { keyword }, commandType: CommandType.StoredProcedure );
        }


        public async Task<IEnumerable<HouseholdDTO>> GET_HOUSEHOLD_TOILET(bool withToilet)
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<HouseholdDTO>(
                "GET_HOUSEHOLD_TOILET",
                new { WithToilet = withToilet },
                commandType: CommandType.StoredProcedure);
        }


        public async Task<IEnumerable<HouseholdMemberDTO>> GET_HOUSEHOLD_MEMBERS(string keyword)
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<HouseholdMemberDTO>(
                "GET_HOUSEHOLD_MEMBERS",
                new { keyword },
                commandType: CommandType.StoredProcedure);
        }
    }
}
