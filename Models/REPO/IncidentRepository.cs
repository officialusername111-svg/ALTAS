using System.Data;
using Dapper;
using ALTAS.Models.DTO;
using ALTAS.Models.Interface;

namespace ALTAS.Models.REPO
{
    public class IncidentRepository : IIncidentRepository
    {
        private readonly IDbConnectionFactory _factory;

        public IncidentRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        // Incident Save
        public async Task<successDTO> SAVE_INCIDENT(IncidentDTO dto)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open) connection.Open();
                using var tran = connection.BeginTransaction();

                var param = new DynamicParameters();
                param.Add("@CaseTypeID", dto.CaseTypeID);
                param.Add("@ComplaintTypeID", dto.ComplaintTypeID);
                param.Add("@KPCaseNo", dto.KPCaseNo);
                param.Add("@ComplaintDescription", dto.ComplaintDescription);
                param.Add("@ComplaintAdditionalDescription", dto.ComplaintAdditionalDescription);
                param.Add("@ComplaintRemarks", dto.ComplaintRemarks);
                param.Add("@IncidentDate", dto.IncidentDate);
                param.Add("@ResidentId_Complainant", dto.ResidentId_Complainant);
                param.Add("@ComplainantFullName", dto.ComplainantFullName);
                param.Add("@ComplainantGender", dto.ComplainantGender);
                param.Add("@ComplainantAddress", dto.ComplainantAddress);
                param.Add("@ComplainantContactNo", dto.ComplainantContactNo);
                param.Add("@ComplainantCivilStatus", dto.ComplainantCivilStatus);
                param.Add("@ResidentId_Respondent", dto.ResidentId_Respondent);
                param.Add("@RespondentFullName", dto.RespondentFullName);
                param.Add("@RespondentGender", dto.RespondentGender);
                param.Add("@RespondentAddress", dto.RespondentAddress);
                param.Add("@RespondentContactNo", dto.RespondentContactNo);
                param.Add("@RespondentCivilStatus", dto.RespondentCivilStatus);
                param.Add("@Status", dto.Status);
                param.Add("@IncidentForTransfer", dto.IncidentForTransfer);
                param.Add("@SettledDate", dto.SettledDate);

                var result = await connection.QuerySingleAsync<int>("SAVE_INCIDENT", param,
                    commandType: CommandType.StoredProcedure, transaction: tran);

                tran.Commit();
                return new successDTO { success = true, value = result };
            }
            catch (Exception ex) { return new successDTO { success = false, remarks = ex.Message }; }
        }

        // Incident Update
        public async Task<successDTO> UPDATE_INCIDENT(IncidentDTO dto)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open) connection.Open();
                using var tran = connection.BeginTransaction();

                var param = new DynamicParameters();
                param.Add("@IncidentID", dto.IncidentID);
                param.Add("@CaseTypeID", dto.CaseTypeID);
                param.Add("@ComplaintTypeID", dto.ComplaintTypeID);
                param.Add("@KPCaseNo", dto.KPCaseNo);
                param.Add("@ComplaintDescription", dto.ComplaintDescription);
                param.Add("@ComplaintAdditionalDescription", dto.ComplaintAdditionalDescription);
                param.Add("@ComplaintRemarks", dto.ComplaintRemarks);
                param.Add("@IncidentDate", dto.IncidentDate);
                param.Add("@ResidentId_Complainant", dto.ResidentId_Complainant);
                param.Add("@ComplainantFullName", dto.ComplainantFullName);
                param.Add("@ComplainantGender", dto.ComplainantGender);
                param.Add("@ComplainantAddress", dto.ComplainantAddress);
                param.Add("@ComplainantContactNo", dto.ComplainantContactNo);
                param.Add("@ComplainantCivilStatus", dto.ComplainantCivilStatus);
                param.Add("@ResidentId_Respondent", dto.ResidentId_Respondent);
                param.Add("@RespondentFullName", dto.RespondentFullName);
                param.Add("@RespondentGender", dto.RespondentGender);
                param.Add("@RespondentAddress", dto.RespondentAddress);
                param.Add("@RespondentContactNo", dto.RespondentContactNo);
                param.Add("@RespondentCivilStatus", dto.RespondentCivilStatus);
                param.Add("@Status", dto.Status);
                param.Add("@IncidentForTransfer", dto.IncidentForTransfer);
                param.Add("@SettledDate", dto.SettledDate);

                var result = await connection.QuerySingleAsync<int>("UPDATE_INCIDENT", param,
                    commandType: CommandType.StoredProcedure, transaction: tran);

                tran.Commit();
                return new successDTO { success = true, value = result };
            }
            catch (Exception ex) { return new successDTO { success = false, remarks = ex.Message }; }
        }

        // Incident Get List
        public async Task<IEnumerable<IncidentDTO>> GET_INCIDENT(string searchKeyword)
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<IncidentDTO>("GET_INCIDENT",
                new { keyword = searchKeyword },
                commandType: CommandType.StoredProcedure);
        }

        // Incident Get By ID
        public async Task<IncidentDTO> GET_INCIDENT_BYID(int id)
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryFirstOrDefaultAsync<IncidentDTO>("GET_INCIDENT_BYID",
                new { IncidentID = id },
                commandType: CommandType.StoredProcedure) ?? new IncidentDTO();
        }

        // CaseType Dropdown
        public async Task<IEnumerable<CaseTypeDTO>> GET_CASETYPE_DROPDOWN()
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<CaseTypeDTO>("GET_CASETYPE_DROPDOWN",
                commandType: CommandType.StoredProcedure);
        }

        // ComplaintType Dropdown filtered by CaseType
        public async Task<IEnumerable<ComplaintTypeDTO>> GET_COMPLAINTTYPE_BY_CASETYPE(int caseTypeId)
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<ComplaintTypeDTO>("GET_COMPLAINTTYPE_BY_CASETYPE",
                new { CaseTypeID = caseTypeId },
                commandType: CommandType.StoredProcedure);
        }

        // Save Party
        public async Task<successDTO> SAVE_INCIDENT_PARTY(IncidentPartyDTO dto)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open) connection.Open();
                using var tran = connection.BeginTransaction();

                var param = new DynamicParameters();
                param.Add("@IncidentID", dto.IncidentID);
                param.Add("@PartyType", dto.PartyType);
                param.Add("@ResidentId", dto.ResidentId);
                param.Add("@FullName", dto.FullName);
                param.Add("@Gender", dto.Gender);
                param.Add("@CivilStatus", dto.CivilStatus);
                param.Add("@Address", dto.Address);
                param.Add("@ContactNo", dto.ContactNo);

                var result = await connection.QuerySingleAsync<int>("SAVE_INCIDENT_PARTY", param,
                    commandType: CommandType.StoredProcedure, transaction: tran);

                tran.Commit();
                return new successDTO { success = true, value = result };
            }
            catch (Exception ex) { return new successDTO { success = false, remarks = ex.Message }; }
        }

        // Update Party
        public async Task<successDTO> UPDATE_INCIDENT_PARTY(IncidentPartyDTO dto)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open) connection.Open();
                using var tran = connection.BeginTransaction();

                var param = new DynamicParameters();
                param.Add("@IncidentPartyId", dto.IncidentPartyId);
                param.Add("@FullName", dto.FullName);
                param.Add("@Gender", dto.Gender);
                param.Add("@CivilStatus", dto.CivilStatus);
                param.Add("@Address", dto.Address);
                param.Add("@ContactNo", dto.ContactNo);

                var result = await connection.QuerySingleAsync<int>("UPDATE_INCIDENT_PARTY", param,
                    commandType: CommandType.StoredProcedure, transaction: tran);

                tran.Commit();
                return new successDTO { success = true, value = result };
            }
            catch (Exception ex) { return new successDTO { success = false, remarks = ex.Message }; }
        }

        // Delete Party
        public async Task<successDTO> DELETE_INCIDENT_PARTY(int incidentPartyId)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open) connection.Open();
                using var tran = connection.BeginTransaction();

                var result = await connection.QuerySingleAsync<int>("DELETE_INCIDENT_PARTY",
                    new { IncidentPartyId = incidentPartyId },
                    commandType: CommandType.StoredProcedure, transaction: tran);

                tran.Commit();
                return new successDTO { success = true, value = result };
            }
            catch (Exception ex) { return new successDTO { success = false, remarks = ex.Message }; }
        }

        // Get Parties
        public async Task<IEnumerable<IncidentPartyDTO>> GET_INCIDENT_PARTIES(int incidentId)
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<IncidentPartyDTO>("GET_INCIDENT_PARTIES",
                new { IncidentID = incidentId },
                commandType: CommandType.StoredProcedure);
        }

        // Save Attachment
        public async Task<successDTO> SAVE_INCIDENT_ATTACHMENT(IncidentAttachmentDTO dto)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open) connection.Open();
                using var tran = connection.BeginTransaction();

                var param = new DynamicParameters();
                param.Add("@KPCaseNo", dto.KPCaseNo);
                param.Add("@Description", dto.Description);
                param.Add("@FileLocation", dto.FileLocation);
                param.Add("@DateUploaded", dto.DateUploaded);
                param.Add("@UploadedByUserId", dto.UploadedByUserId);

                var result = await connection.QuerySingleAsync<int>("SAVE_INCIDENT_ATTACHMENT", param,
                    commandType: CommandType.StoredProcedure, transaction: tran);

                tran.Commit();
                return new successDTO { success = true, value = result };
            }
            catch (Exception ex) { return new successDTO { success = false, remarks = ex.Message }; }
        }

        // Delete Attachment
        public async Task<successDTO> DELETE_INCIDENT_ATTACHMENT(int incidentAttachementId)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open) connection.Open();
                using var tran = connection.BeginTransaction();

                var result = await connection.QuerySingleAsync<int>("DELETE_INCIDENT_ATTACHMENT",
                    new { IncidentAttachementId = incidentAttachementId },
                    commandType: CommandType.StoredProcedure, transaction: tran);

                tran.Commit();
                return new successDTO { success = true, value = result };
            }
            catch (Exception ex) { return new successDTO { success = false, remarks = ex.Message }; }
        }

        // Get Attachments
        public async Task<IEnumerable<IncidentAttachmentDTO>> GET_INCIDENT_ATTACHMENTS(string kpCaseNo)
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<IncidentAttachmentDTO>("GET_INCIDENT_ATTACHMENTS",
                new { KPCaseNo = kpCaseNo },
                commandType: CommandType.StoredProcedure);
        }

        // Save Settlement
        public async Task<successDTO> SAVE_INCIDENT_SETTLEMENT(IncidentSettlementDTO dto)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open) connection.Open();
                using var tran = connection.BeginTransaction();

                var param = new DynamicParameters();
                param.Add("@KPCaseNo", dto.KPCaseNo);
                param.Add("@SettlementDate", dto.SettlementDate);
                param.Add("@Result", dto.Result);
                param.Add("@Remarks", dto.Remarks);

                var result = await connection.QuerySingleAsync<int>("SAVE_INCIDENT_SETTLEMENT", param,
                    commandType: CommandType.StoredProcedure, transaction: tran);

                tran.Commit();
                return new successDTO { success = true, value = result };
            }
            catch (Exception ex) { return new successDTO { success = false, remarks = ex.Message }; }
        }

        // Update Settlement
        public async Task<successDTO> UPDATE_INCIDENT_SETTLEMENT(IncidentSettlementDTO dto)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open) connection.Open();
                using var tran = connection.BeginTransaction();

                var param = new DynamicParameters();
                param.Add("@IncidentSettlementId", dto.IncidentSettlementId);
                param.Add("@KPCaseNo", dto.KPCaseNo);
                param.Add("@SettlementDate", dto.SettlementDate);
                param.Add("@Result", dto.Result);
                param.Add("@Remarks", dto.Remarks);

                var result = await connection.QuerySingleAsync<int>("UPDATE_INCIDENT_SETTLEMENT", param,
                    commandType: CommandType.StoredProcedure, transaction: tran);

                tran.Commit();
                return new successDTO { success = true, value = result };
            }
            catch (Exception ex) { return new successDTO { success = false, remarks = ex.Message }; }
        }

        // Delete Settlement
        public async Task<successDTO> DELETE_INCIDENT_SETTLEMENT(int incidentSettlementId)
        {
            try
            {
                using var connection = _factory.CreateConnection("DBConnection");
                if (connection.State != ConnectionState.Open) connection.Open();
                using var tran = connection.BeginTransaction();

                var result = await connection.QuerySingleAsync<int>("DELETE_INCIDENT_SETTLEMENT",
                    new { IncidentSettlementId = incidentSettlementId },
                    commandType: CommandType.StoredProcedure, transaction: tran);

                tran.Commit();
                return new successDTO { success = true, value = result };
            }
            catch (Exception ex) { return new successDTO { success = false, remarks = ex.Message }; }
        }

        // Get Settlements
        public async Task<IEnumerable<IncidentSettlementDTO>> GET_INCIDENT_SETTLEMENTS(string kpCaseNo)
        {
            using var connection = _factory.CreateConnection("DBConnection");
            return await connection.QueryAsync<IncidentSettlementDTO>("GET_INCIDENT_SETTLEMENTS",
                new { KPCaseNo = kpCaseNo },
                commandType: CommandType.StoredProcedure);
        }
    }
}