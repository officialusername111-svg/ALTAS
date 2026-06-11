$(function () {

    const CONFIG = {
        endpoints: {
            getProfile: '/Profile/getProfile',
            updateProfile: '/Profile/updateProfile',
            changePassword: '/Profile/changePassword',
            getPreferences: '/Profile/getPreferences',
            savePreferences: '/Profile/savePreferences',
        }
    };

    // ── Active font size state ────────────────────────────────
    let _currentFontSize = 'medium';
    let _currentSidebarState = false;

    // ── Event Binding ────────────────────────────────────────

    $(document)
        // Dropdown nav clicks — open the right modal
        .on('click', '.profile-nav a', handleOpenProfileModal)
        .on('click', '.preference-nav a', handleOpenPreferenceModal)
        // Profile modal events
        .on('shown.bs.modal', '#mdlProfileInformation', fnLoadProfile)
        .on('click', '#btnSaveProfile', handleSaveProfile)
        .on('click', '#btnChangePassword', handleChangePassword)
        .on('click', '.btn-toggle-pw', handleTogglePassword)
        .on('input', '#inpNewPassword', handlePasswordStrength)
        .on('input', '#inpConfirmPassword', handlePasswordMatch)
        // Preferences modal events
        .on('shown.bs.modal', '#mdlPreferences', fnLoadPreferences)
        .on('click', '.btn-font-size', handleFontSizeSelect)
        .on('change', '#chkSidebarCollapsed', handlePreviewUpdate)
        .on('click', '#btnSavePreferences', handleSavePreferences);

    // ── Handlers ─────────────────────────────────────────────

    function handleOpenProfileModal(e) {
        e.preventDefault();
        $('#mdlProfileInformation').modal('show');
    }

    function handleOpenPreferenceModal(e) {
        e.preventDefault();
        $('#mdlPreferences').modal('show');
    }

    // ── Profile ───────────────────────────────────────────────

    function fnLoadProfile() {
        doAjax(CONFIG.endpoints.getProfile, 'GET', {}).then(function (res) {
            if (!res) return;

            $('#_hidProfileUserId').val(res.UserId);
            $('#inpFirstName').val(res.FirstName || '');
            $('#inpMiddleName').val(res.MiddleName || '');
            $('#inpLastName').val(res.LastName || '');
            $('#inpUserName').val(res.UserName || '');
            $('#inpPosition').val(res.Position || '');

            // Full name for display
            var fullName = [res.FirstName, res.MiddleName, res.LastName]
                .filter(Boolean).join(' ');
            var displayName = fullName || res.UserName || '—';

            $('#profileDisplayName').text(displayName);
            $('#profileDisplayPosition').text(res.Position || '—');
            $('#profileDateCreated').text(res.DateCreated
                ? parseMSDate4DTable(res.DateCreated)
                : '—');
            $('#profileLastLogin').text(res.RecentLoginDate
                ? parseMSDate4DTable(res.RecentLoginDate)
                : '—');

            // Update initials on the modal avatar SVG
            var initials = computeInitials(displayName);
            $('#profileAvatarText').text(initials);

            // Also sync the navbar avatar in case name was changed
            $('.user-avatar-initials text').text(initials);

        }).catch(function () {
            showToast('Failed to load profile.', 'danger');
        });
    }

    function handleSaveProfile() {
        if (!$('#inpFirstName').val() || !$('#inpLastName').val()) {
            showToast('First Name and Last Name are required.', 'warning');
            return;
        }

        const data = {
            UserId: $('#_hidProfileUserId').val(),
            FirstName: $('#inpFirstName').val(),
            MiddleName: $('#inpMiddleName').val(),
            LastName: $('#inpLastName').val(),
            Position: $('#inpPosition').val(),
        };

        doAjax(CONFIG.endpoints.updateProfile, 'POST', data)
            .then(function (res) {
                if (res && res.rtn.success === true) {
                    showToast('Profile updated successfully.', 'success');
                    var fullName = [data.FirstName, data.MiddleName, data.LastName]
                        .filter(Boolean).join(' ');
                    var initials = computeInitials(fullName);

                    // Update navbar display
                    $('.lbl_userfullname').text(fullName);
                    $('.lbl_userOffice').text(data.Position);

                    // Update all initials avatars on the page
                    $('.user-avatar-initials text').text(initials);
                    $('#profileAvatarText').text(initials);
                    $('#profileDisplayName').text(fullName);
                    $('#profileDisplayPosition').text(data.Position);
                } else {
                    showToast(res.rtn.remarks || 'Failed to update profile.', 'danger');
                }
            })
            .catch(function () { showToast('Failed to update profile.', 'danger'); });
    }

    function handleChangePassword() {
        var current = $('#inpCurrentPassword').val();
        var newPass = $('#inpNewPassword').val();
        var confirm = $('#inpConfirmPassword').val();

        if (!current || !newPass || !confirm) {
            showToast('All password fields are required.', 'warning');
            return;
        }
        if (newPass !== confirm) {
            showToast('New passwords do not match.', 'warning');
            return;
        }
        if (newPass.length < 8) {
            showToast('New password must be at least 8 characters.', 'warning');
            return;
        }

        const data = {
            CurrentPassword: current,
            NewPassword: newPass,
            ConfirmPassword: confirm,
        };

        doAjax(CONFIG.endpoints.changePassword, 'POST', data)
            .then(function (res) {
                if (res && res.rtn.success === true) {
                    showToast('Password changed successfully.', 'success');
                    $('#inpCurrentPassword, #inpNewPassword, #inpConfirmPassword').val('');
                    $('#divPasswordStrength, #divPasswordMatch').html('');
                } else {
                    showToast(res.rtn.remarks || 'Failed to change password.', 'danger');
                }
            })
            .catch(function () { showToast('Failed to change password.', 'danger'); });
    }

    function handleTogglePassword() {
        var target = $(this).data('target');
        var $inp = $(target);
        var $icon = $(this).find('i');
        if ($inp.attr('type') === 'password') {
            $inp.attr('type', 'text');
            $icon.removeClass('bi-eye').addClass('bi-eye-slash');
        } else {
            $inp.attr('type', 'password');
            $icon.removeClass('bi-eye-slash').addClass('bi-eye');
        }
    }

    function handlePasswordStrength() {
        var val = $(this).val();
        var score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        var labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
        var colors = ['', '#dc3545', '#fd7e14', '#ffc107', '#198754'];
        var widths = ['', '25%', '50%', '75%', '100%'];

        if (!val) {
            $('#divPasswordStrength').html('');
            return;
        }

        $('#divPasswordStrength').html(
            '<div class="d-flex align-items-center gap-2">' +
            '<div class="flex-grow-1 bg-light rounded" style="height:5px;">' +
            '<div style="height:5px;border-radius:3px;width:' + widths[score] +
            ';background:' + colors[score] + ';transition:width .3s;"></div>' +
            '</div>' +
            '<span class="fs-10 fw-semibold" style="color:' + colors[score] + ';width:44px;">' +
            labels[score] + '</span>' +
            '</div>'
        );
    }

    function handlePasswordMatch() {
        var newVal = $('#inpNewPassword').val();
        var confVal = $(this).val();
        if (!confVal) { $('#divPasswordMatch').html(''); return; }
        if (newVal === confVal) {
            $('#divPasswordMatch').html(
                '<span class="text-success"><i class="bi bi-check-circle me-1"></i>Passwords match</span>'
            );
        } else {
            $('#divPasswordMatch').html(
                '<span class="text-danger"><i class="bi bi-x-circle me-1"></i>Passwords do not match</span>'
            );
        }
    }

    // ── Preferences ───────────────────────────────────────────

    function fnLoadPreferences() {
        doAjax(CONFIG.endpoints.getPreferences, 'GET', {}).then(function (res) {
            if (!res) return;

            _currentFontSize = res.FontSize || 'medium';
            _currentSidebarState = res.SidebarCollapsed || false;

            applyFontSizeButtons(_currentFontSize);
            $('#chkSidebarCollapsed').prop('checked', _currentSidebarState);
            updatePreviewLabel();
        }).catch(function () {
            showToast('Failed to load preferences.', 'danger');
        });
    }

    function handleFontSizeSelect() {
        _currentFontSize = $(this).data('value');
        applyFontSizeButtons(_currentFontSize);
        updatePreviewLabel();
    }

    function handlePreviewUpdate() {
        _currentSidebarState = $('#chkSidebarCollapsed').prop('checked');
        updatePreviewLabel();
    }

    function handleSavePreferences() {
        const data = {
            FontSize: _currentFontSize,
            SidebarCollapsed: $('#chkSidebarCollapsed').prop('checked'),
        };

        doAjax(CONFIG.endpoints.savePreferences, 'POST', data)
            .then(function (res) {
                if (res && res.rtn.success === true) {
                    showToast('Preferences saved.', 'success');
                    applyFontSizeToPage(_currentFontSize);
                    $('#mdlPreferences').modal('hide');
                } else {
                    showToast(res.rtn.remarks || 'Failed to save preferences.', 'danger');
                }
            })
            .catch(function () { showToast('Failed to save preferences.', 'danger'); });
    }

    // ── Preference helpers ────────────────────────────────────

    function applyFontSizeButtons(size) {
        $('.btn-font-size').removeClass('btn-main').addClass('btn-main-outline');
        $('.btn-font-size[data-value="' + size + '"]').removeClass('btn-main-outline').addClass('btn-main');
    }

    function applyFontSizeToPage(size) {
        var root = document.documentElement;
        if (size === 'small') root.style.fontSize = '13px';
        if (size === 'medium') root.style.fontSize = '15px';
        if (size === 'large') root.style.fontSize = '17px';
    }

    function updatePreviewLabel() {
        var sizeLabel = { small: 'Small', medium: 'Medium', large: 'Large' }[_currentFontSize] || 'Medium';
        var sideLabel = $('#chkSidebarCollapsed').prop('checked') ? 'collapsed' : 'expanded';
        $('#lblPrefPreviewText').text(sizeLabel + ' text size, sidebar ' + sideLabel + ' on load.');
    }

    // ── Helpers ───────────────────────────────────────────────

    // Returns up to 2 uppercase initials from a full name string
    function computeInitials(fullName) {
        if (!fullName || !fullName.trim()) return '?';
        var parts = fullName.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
});