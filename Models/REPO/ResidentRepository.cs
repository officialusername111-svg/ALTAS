using ALTAS.Models.DTO;
using ALTAS.Models.Interface;
using Dapper;
using System.Data;
using System.Transactions;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace ALTAS.Models.REPO
{
    public class ResidentRepository : IResidentRepository
    {
        private readonly IDbConnectionFactory _factory;

        public ResidentRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public async Task<successDTO> SAVE_RESIDENT(ResidentDTO dto)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");

                if (connection.State != ConnectionState.Open)
                    connection.Open();

                using var tran = connection.BeginTransaction();

                var param = new DynamicParameters();
                param.Add("@ResidentId", dto.ResidentId);
                param.Add("@HouseholdId", dto.HouseholdId);

                param.Add("@CourtesyName", dto.CourtesyName);
                param.Add("@FirstName", dto.FirstName);
                param.Add("@MiddleName", dto.MiddleName);
                param.Add("@LastName", dto.LastName);
                param.Add("@ExtensionName", dto.ExtensionName);

                param.Add("@IsFamilyHead", dto.IsFamilyHead);
                param.Add("@Sex", dto.Sex);

                param.Add("@Birthdate", dto.Birthdate);

                param.Add("@BirthPlace", dto.BirthPlace);
                param.Add("@CivilStatus", dto.CivilStatus);
                param.Add("@BloodType", dto.BloodType);

                param.Add("@ContactNumber", dto.ContactNumber);
                param.Add("@EducationalAttainment", dto.EducationalAttainment);
                param.Add("@EmailAddress", dto.EmailAddress);

                param.Add("@ReligionSect", dto.ReligionSect);
                param.Add("@Religion", dto.Religion);
                param.Add("@Tribe", dto.Tribe);

                param.Add("@Occupation", dto.Occupation);
                param.Add("@VoterStatus", dto.VoterStatus);
                param.Add("@TINnumber", dto.TINnumber);

                param.Add("@Height", dto.Height);
                param.Add("@Weight", dto.Weight);
                param.Add("@Citizenship", dto.Citizenship);

                param.Add("@HasComorbidities", dto.HasComorbidities);
                param.Add("@IsDeceased", dto.IsDeceased);
                param.Add("@RelationshipToFamilyHead", dto.RelationshipToFamilyHead);

                // Execute the stored procedure
                var result = await connection.QuerySingleAsync<int>( "SAVE_RESIDENT", param, commandType: CommandType.StoredProcedure, transaction: tran );

                tran.Commit();

                return new successDTO { success = true, value = result };
            }
            catch (Exception ex)
            {
                return new successDTO { success = false, remarks = ex.Message };
            }
        }








        public async Task<IEnumerable<ResidentDTO>> GET_RESIDENT(string searchKeyword)
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<ResidentDTO>("GET_RESIDENT",new { keyword = searchKeyword },commandType: CommandType.StoredProcedure);
        }

        public async Task<ResidentDTO> GET_RESIDENT_BYID(int Id)
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryFirstOrDefaultAsync<ResidentDTO>("GET_RESIDENT_BYID", new { ResidentId = Id }, commandType: CommandType.StoredProcedure) ?? new ResidentDTO();
        }
    }
}
    