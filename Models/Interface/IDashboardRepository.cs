using ALTAS.Models.DTO;

namespace ALTAS.Models.Interface
{
    public interface IDashboardRepository
    {
        Task<DashboardStatsDTO> GET_DASHBOARD_STATS();
        Task<IEnumerable<DistributionDTO>> GET_EDUCATIONAL_ATTAINMENT_STATS();
        Task<IEnumerable<DistributionDTO>> GET_CIVIL_STATUS_STATS();
        Task<IEnumerable<DistributionDTO>> GET_GENDER_STATS();
        Task<GenderDistributionDTO> GET_GENDER_DISTRIBUTION_PERCENT();
        Task<VotersDistributionDTO> GET_VOTER_STATUS_PERCENT();
        Task<IEnumerable<DistributionDTO>> GET_AGESTRUCTURE();
        Task<IEnumerable<DistributionDTO>> GET_AGESTRUCTUREPER5YEARS();
        Task<IEnumerable<CollectionSummary>> GET_COLLECTIONSUMMARY();
        Task<IEnumerable<DistributionDTO>> GET_COLLECTIONLAST30DAYS();
    }
}
