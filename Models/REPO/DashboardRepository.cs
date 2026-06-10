using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Dapper;
using System.Data;

namespace ALTAS.Models.REPO
{
    public class DashboardRepository: IDashboardRepository
    {
        private readonly IDbConnectionFactory _factory;

        public DashboardRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public async Task<DashboardStatsDTO> GET_DASHBOARD_STATS()
        {
            using var connection = _factory.CreateConnection("DBConnection");

            var result = await connection.QueryAsync<DashboardStatsDTO>( "dbo.GET_DASHBOARD_STATS", commandType: CommandType.StoredProcedure );

            return result.FirstOrDefault() ?? new DashboardStatsDTO();
        }

        public async Task<IEnumerable<DistributionDTO>> GET_EDUCATIONAL_ATTAINMENT_STATS()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<DistributionDTO>("GET_EDUCATIONAL_ATTAINMENT_STATS", commandType: CommandType.StoredProcedure);
        }


        public async Task<IEnumerable<DistributionDTO>> GET_CIVIL_STATUS_STATS()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<DistributionDTO>("GET_CIVIL_STATUS_STATS", commandType: CommandType.StoredProcedure);
        }


        public async Task<IEnumerable<DistributionDTO>> GET_GENDER_STATS()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<DistributionDTO>("GET_GENDER_STATS", commandType: CommandType.StoredProcedure);
        }

        public async Task<GenderDistributionDTO> GET_GENDER_DISTRIBUTION_PERCENT()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryFirstOrDefaultAsync<GenderDistributionDTO>("GET_GENDER_DISTRIBUTION_PERCENT", commandType: CommandType.StoredProcedure) ?? new GenderDistributionDTO();
        }


        public async Task<VotersDistributionDTO> GET_VOTER_STATUS_PERCENT()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryFirstOrDefaultAsync<VotersDistributionDTO>("GET_VOTER_STATUS_PERCENT", commandType: CommandType.StoredProcedure) ?? new VotersDistributionDTO();
        }

        public async Task<IEnumerable<DistributionDTO>> GET_AGESTRUCTURE()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<DistributionDTO>("GET_AGESTRUCTURE", commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<DistributionDTO>> GET_AGESTRUCTUREPER5YEARS()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<DistributionDTO>("GET_AGESTRUCTUREPER5YEARS", commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<DistributionDTO>> GET_COLLECTIONLAST30DAYS()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<DistributionDTO>("GET_COLLECTIONLAST30DAYS", commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<CollectionSummary>> GET_COLLECTIONSUMMARY()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<CollectionSummary>("GET_COLLECTIONSUMMARY", commandType: CommandType.StoredProcedure);
        }

    }
}
