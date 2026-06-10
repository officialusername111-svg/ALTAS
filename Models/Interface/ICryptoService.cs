namespace ALTAS.Models.Interface
{
    public interface ICryptoService
    {
        string Encrypt(string plainText);
        string Decrypt(string cipherText);

        string HashPassword(string plainPassword);

        bool VerifyPassword(string plainPassword, string encryptedHash);
    }
}
