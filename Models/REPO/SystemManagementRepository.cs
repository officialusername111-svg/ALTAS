using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Dapper;
using System.Data;

namespace ALTAS.Models.REPO
{
    public class SystemManagementRepository: ISystemManagementRepository
    {
        private readonly IDbConnectionFactory _factory;
        private readonly ICryptoService _crypto;

        public SystemManagementRepository(IDbConnectionFactory factory, ICryptoService crypto)
        {
            _factory = factory;
            _crypto = crypto;
        }


        public async Task<AuthResult> VALIDATE_USER(UserDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.UserName) || string.IsNullOrWhiteSpace(dto.Password))
                return new AuthResult { Success = false, Message = "Username and password are required." };

            using var connection = _factory.CreateConnection("SysConnection");
            var data = await connection.QueryFirstOrDefaultAsync<UserDTO>( "GET_USERBYUSERNAME", new { dto.UserName }, commandType: CommandType.StoredProcedure );

            if (data == null)
                return new AuthResult { Success = false, Message = "Invalid credentials." };  // ← don't say "not found", vague is safer

            if (!data.IsActive)
                return new AuthResult { Success = false, Message = "Account is disabled." };

            // Stacked verify: Decrypt → BCrypt.Verify
            bool isValid = _crypto.VerifyPassword(dto.Password, data.Password);

            if (!isValid)
                return new AuthResult { Success = false, Message = "Invalid credentials." };

            data.Password = ""; // strip before returning
            return new AuthResult { Success = true, Message = "Login successful.", User = data };
        }

        public async Task RegisterUserAsync(UserDTO dto)
        {
            // Step 1 — Hash
            var hash = _crypto.HashPassword(dto.Password);

            // Step 2 — Encrypt the hash
            var encryptedHash = _crypto.Encrypt(hash);

            // Step 3 — Store the encrypted hash
            dto.Password = encryptedHash;

            using var connection = _factory.CreateConnection("SysConnection");
            await connection.ExecuteAsync("CREATE_USER", dto, commandType: CommandType.StoredProcedure);
        }
    }
}