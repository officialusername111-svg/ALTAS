using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Dapper;
using System.Data;

namespace ALTAS.Models.REPO
{
    public class ArchiveDocumentRepository: IArchiveDocumentRepository
    {
        private readonly IDbConnectionFactory _factory;

        public ArchiveDocumentRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public async Task<IEnumerable<ArchiveDocumentDTO>> GET_ARCHIVEDOCS(string keyword)
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<ArchiveDocumentDTO>("GET_ARCHIVEDOCS", new { keyword }, commandType: CommandType.StoredProcedure);
        }


        public async Task<successDTO> SAVE_ARCHIVEDOCS(ArchiveDocumentDTO dto)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");

                if (connection.State != ConnectionState.Open)
                    connection.Open();

                using var tran = connection.BeginTransaction();

                var param = new DynamicParameters();
                param.Add("@ArchiveDocumentId", dto.ArchiveDocumentId);
                param.Add("@ArchiveCategoryId", dto.ArchiveCategoryId);
                param.Add("@OrdResoTitle", dto.OrdResoTitle);
                param.Add("@OrdResoSubject", dto.OrdResoSubject);
                param.Add("@FileName", dto.FileName);
                param.Add("@FileDetails", dto.FileDetails);
                param.Add("@FileLocation", dto.FileLocation);
                param.Add("@DateArchive", dto.DateArchive);
                param.Add("@UserID_UploadedBy", dto.UserID_UploadedBy);
                param.Add("@UploadedDate", dto.UploadedDate);

                var result = await connection.QuerySingleAsync<int>(
                    "SAVE_ARCHIVEDOCS",
                    param,
                    commandType: CommandType.StoredProcedure,
                    transaction: tran
                );

                tran.Commit();

                return new successDTO { success = true, value = result };
            }
            catch (Exception ex)
            {
                return new successDTO { success = false, remarks = ex.Message };
            }
        }

    }
}
