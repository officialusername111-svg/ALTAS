using System.Data;
using Dapper;
using ALTAS.Models.DTO;
using ALTAS.Models.Interface;

namespace ALTAS.Models.REPO
{
    public class ProfileRepository : IProfileRepository
    {
        private readonly IDbConnectionFactory _factory;

        public ProfileRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public async Task<UserProfileDTO> GET_USER_PROFILE(Guid userId)
        {
            using var connection = _factory.CreateConnection("SysConnection");
            return await connection.QueryFirstOrDefaultAsync<UserProfileDTO>(
                "GET_USER_PROFILE",
                new { UserId = userId },
                commandType: CommandType.StoredProcedure
            ) ?? new UserProfileDTO();
        }

        public async Task<bool> VERIFY_CURRENT_PASSWORD(Guid userId, string plainPassword, ICryptoService crypto)
        {
            using var connection = _factory.CreateConnection("SysConnection");
            // Reuse GET_USERBYUSERNAME approach — fetch the stored encrypted hash by UserId
            var storedHash = await connection.QueryFirstOrDefaultAsync<string>( "SELECT Password FROM dbo.sysUser WHERE UserId = @UserId", new { UserId = userId } );
            if (string.IsNullOrEmpty(storedHash)) return false;
            return crypto.VerifyPassword(plainPassword, storedHash);
        }

        public async Task<successDTO> UPDATE_USER_PROFILE(UpdateProfileDTO dto)
        {
            try
            {
                using var connection = _factory.CreateConnection("SysConnection");
                if (connection.State != ConnectionState.Open) connection.Open();
                using var tran = connection.BeginTransaction();

                var param = new DynamicParameters();
                param.Add("@UserId", dto.UserId);
                param.Add("@FirstName", dto.FirstName);
                param.Add("@MiddleName", dto.MiddleName);
                param.Add("@LastName", dto.LastName);
                param.Add("@Position", dto.Position);

                var result = await connection.QuerySingleAsync<int>(
                    "UPDATE_USER_PROFILE",
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

        public async Task<successDTO> UPDATE_USER_PASSWORD(Guid userId, string encryptedHash)
        {
            try
            {
                using var connection = _factory.CreateConnection("SysConnection");
                if (connection.State != ConnectionState.Open) connection.Open();
                using var tran = connection.BeginTransaction();

                var result = await connection.QuerySingleAsync<int>(
                    "UPDATE_USER_PASSWORD",
                    new { UserId = userId, EncryptedHash = encryptedHash },
                    commandType: CommandType.StoredProcedure,
                    transaction: tran
                );

                tran.Commit();

                if (result == 0)
                    return new successDTO { success = false, remarks = "User not found." };

                return new successDTO { success = true };
            }
            catch (Exception ex)
            {
                return new successDTO { success = false, remarks = ex.Message };
            }
        }

        public async Task<UserPreferenceDTO> GET_USER_PREFERENCE(Guid userId)
        {
            using var connection = _factory.CreateConnection("SysConnection");
            return await connection.QueryFirstOrDefaultAsync<UserPreferenceDTO>(
                "GET_USER_PREFERENCE",
                new { UserId = userId },
                commandType: CommandType.StoredProcedure
            ) ?? new UserPreferenceDTO();
        }

        public async Task<successDTO> SAVE_USER_PREFERENCE(Guid userId, UserPreferenceDTO dto)
        {
            try
            {
                using var connection = _factory.CreateConnection("SysConnection");
                if (connection.State != ConnectionState.Open) connection.Open();
                using var tran = connection.BeginTransaction();

                var param = new DynamicParameters();
                param.Add("@UserId", userId);
                param.Add("@FontSize", dto.FontSize);
                param.Add("@SidebarCollapsed", dto.SidebarCollapsed);

                var result = await connection.QuerySingleAsync<int>(
                    "SAVE_USER_PREFERENCE",
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