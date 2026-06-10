using ALTAS.Models.DTO;

namespace ALTAS.Models.Interface
{
    public interface ISystemManagementRepository
    {
         Task<AuthResult> VALIDATE_USER(UserDTO dto);
    }
}
