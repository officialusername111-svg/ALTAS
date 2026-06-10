using ALTAS.Models.Interface;
using Security.EncryptDecrypt;

namespace ALTAS.Models.Config
{
    public class CryptoService : ICryptoService
    {
        private readonly string _secretKey;

        public CryptoService(IConfiguration configuration)
        {
            _secretKey = configuration["CRYPTO_SERVICE_KEY_VALUE"];

            if (string.IsNullOrEmpty(_secretKey))
            {
                throw new Exception("Encryption key is missing from environment variables!");
            }
        }

        public string Encrypt(string plainText)
        {
            var service = new EncryptionService(_secretKey);
            var encrypted = service.Encrypt(plainText);
            return encrypted;
        }

        public string Decrypt(string cipherText)
        {
            var service = new EncryptionService(_secretKey);
            var decrypted = service.Decrypt(cipherText);
            return decrypted;
        }



        public string HashPassword(string plainPassword)
        => BCrypt.Net.BCrypt.HashPassword(plainPassword, workFactor: 12);


        public bool VerifyPassword(string plainPassword, string encryptedHash)
        {
            var hash = Decrypt(encryptedHash);
            return BCrypt.Net.BCrypt.Verify(plainPassword, hash);
        }
    }
}
