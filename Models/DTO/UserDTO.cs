namespace ALTAS.Models.DTO
{


    public class UserDTO
    {
        public Guid UserId { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string MiddleName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string UserName { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public DateTime RecentLoginDate { get; set; }

        public byte UserGroupId { get; set; }

        public DateTime DateCreated { get; set; }

        public Guid CreatedByUserId { get; set; }

        public bool RememberMe { get; set; }
        public string? EntityCode { get; set; } = string.Empty;
        public string? Position { get; set; } = string.Empty;

        public string? AppName { get; set; } = string.Empty;
        public string? AppLocation { get; set; } = string.Empty;
        public string? BarangayAddress { get; set; } = string.Empty;
        public string? CityMunAddress { get; set; } = string.Empty;

    }

    public class AuthResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public UserDTO? User { get; set; }
    }



    public class UserProfileDTO
    {
        public Guid UserId { get; set; }
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string? UserName { get; set; }
        public string? Position { get; set; }
        public bool IsActive { get; set; }
        public DateTime? RecentLoginDate { get; set; }
        public DateTime? DateCreated { get; set; }
    }

    // Used by UPDATE_USER_PROFILE — respects varchar(20) lengths
    public class UpdateProfileDTO
    {
        public Guid UserId { get; set; }

        // varchar(20) — trim before saving
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }

        // varchar(125)
        public string? Position { get; set; }
    }

    public class ChangePasswordDTO
    {
        public Guid UserId { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
        public string? ConfirmPassword { get; set; }
    }

    public class UserPreferenceDTO
    {
        public string FontSize { get; set; } = "medium";  
        public bool SidebarCollapsed { get; set; } = false;
    }
}
