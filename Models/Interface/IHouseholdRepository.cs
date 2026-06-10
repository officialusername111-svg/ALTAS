using ALTAS.Models.DTO;

namespace ALTAS.Models.Interface
{
    public interface IHouseholdRepository
    {
        Task<successDTO> SAVE_HOUSEHOLD(HouseholdDTO dto);
        Task<IEnumerable<HouseholdDTO>> GET_HOUSEHOLD(string keyword);

        Task<IEnumerable<HouseholdDTO>> GET_HOUSEHOLD_TOILET(bool withToilet);

        Task<IEnumerable<HouseholdMemberDTO>> GET_HOUSEHOLD_MEMBERS(string keyword);
    }
}
