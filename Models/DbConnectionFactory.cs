namespace ALTAS.Models
{
    using Microsoft.Data.SqlClient;
    using System.Data;

    public interface IDbConnectionFactory
    {
        IDbConnection CreateConnection(string connectionName);
    }

    public class DbConnectionFactory : IDbConnectionFactory
    {
        private readonly IConfiguration _configuration;

        public DbConnectionFactory(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IDbConnection CreateConnection(string connectionName)
        {
            var connectionString = _configuration.GetConnectionString(connectionName);

            if (string.IsNullOrEmpty(connectionString))
                throw new ArgumentException($"Connection string '{connectionName}' not found.");

            return new SqlConnection(connectionString);
        }
    }
}