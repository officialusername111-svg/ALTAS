using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Dapper;
using System.Data;

namespace ALTAS.Models.REPO
{
    public class FileMaintenanceRepository: IFileMaintenanceRepository
    {
        private readonly IDbConnectionFactory _factory;

        public FileMaintenanceRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public List<StreetDTO> GET_STREET()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            var result = connection.Query<StreetDTO>( "GET_STREET", commandType: CommandType.StoredProcedure );
            return result.AsList();
        }

        public List<PurokDTO> GET_PUROK()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            var result =  connection.Query<PurokDTO>( "GET_PUROK", commandType: CommandType.StoredProcedure );
            return result.AsList();
        }

        public List<PositionDTO> GET_POSITION()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            var result = connection.Query<PositionDTO>("GET_POSITION", commandType: CommandType.StoredProcedure);
            return result.AsList();
        }

        public List<ArchiveCategoryDTO> GET_ARCHIVECATEGORY()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            var result = connection.Query<ArchiveCategoryDTO>("GET_ARCHIVECATEGORY", commandType: CommandType.StoredProcedure);
            return result.AsList();
        }
    }
}
