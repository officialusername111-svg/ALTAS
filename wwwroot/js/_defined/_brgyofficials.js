$(function () {
    set_active_sidebar('.officials-nav');

    const CONFIG = {
        endpoints: {
            getResident: '/Resident/getResident',

            getBarangayOfficials: '/BarangayOfficials/getBarangayOfficials',
            saveBarangayOfficial: '/BarangayOfficials/saveBarangayOfficial'
        },
        selectors: {
            tblResident: '#tblResident',
            searchResidentInput: '#searchResidentInput',
            mdlResident: '#mdlResident',


            divBarangayDetail: '#divBarangayDetail',
            tblBarangayOfficials: '#tblBarangayOfficials',
            searchBarangayOfficialInput: '#searchBarangayOfficialInput',
            btnSaveBarangayOfficial: '#btnSaveBarangayOfficial',
            btnClearOfficial: '#btnClearOfficial'

        }
    };

    fnLoadResident();
    fnLoadBarangayOfficials();

    attachEventHandlers();
    function attachEventHandlers() {
        $(document)
            .on('input', CONFIG.selectors.searchResidentInput, debounce(fnLoadResident, 250))
            .on('click', `${CONFIG.selectors.tblResident} .btn-select`, handleResidentSelect)

            .on('input', CONFIG.selectors.searchBarangayOfficialInput, debounce(fnLoadBarangayOfficials, 250))
            .on('click', CONFIG.selectors.btnClearOfficial, handleClearBarangayOfficials)
            .on('click', CONFIG.selectors.btnSaveBarangayOfficial, handleSaveBarangayOfficial)
            .on('click', `${CONFIG.selectors.tblBarangayOfficials} .btn-edit`, handleSelectBarangayOfficials)
    }

    function fnLoadResident() {
        const search = $(CONFIG.selectors.searchResidentInput).val();
        doAjax(CONFIG.endpoints.getResident, 'GET', { searchKeyword: search }).then(res => {
            resetDataTable(CONFIG.selectors.tblResident);

            $(CONFIG.selectors.tblResident).DataTable({
                retrieve: true, searching: false, lengthMenu: [15, 20, 50], order: [], "dom": 'rtip', data: res,
                pagingType: "full_numbers", language: returnPagination(),
                columns: [
                    { title: "Resident", data: 'Resident', visible: true, className: 'dt-start', orderable: false },
                    { title: "Household", data: 'Household', className: 'dt-start', orderable: false },
                    { title: "Sex", data: 'Sex', className: 'dt-center', orderable: false },
                    {
                        title: "Birthdate", data: 'Birthdate', className: 'dt-center', orderable: false,
                        render: d => parseMSDate4DTable(d)
                    },
                    { title: "Age", data: 'Age', className: 'dt-center', orderable: false },
                    { title: "BirthPlace", data: 'BirthPlace', className: 'dt-start', orderable: false },
                    {
                        title: "Action", data: null, className: 'dt-center', width: '60px', orderable: false,
                        render: function (data, type, row) {
                            return `<button class="btn btn-main-outline btn-outline-secondary ms-1 btn-sm py-1 btn-select"> Select <span class="icon-load me-1"></span></button>`;
                        }
                    }
                ]
            });
        });
    }

    function handleResidentSelect(e) {
        const data = getSelectedRowData(this, CONFIG.selectors.tblResident);
        setValues(CONFIG.selectors.divBarangayDetail, data);
        $(CONFIG.selectors.mdlResident).modal('hide');
    }


    function fnLoadBarangayOfficials() {
        const search = $(CONFIG.selectors.searchBarangayOfficialInput).val();
        doAjax(CONFIG.endpoints.getBarangayOfficials, 'GET', { searchKeyword: search }).then(res => {
            resetDataTable(CONFIG.selectors.tblBarangayOfficials);

            $(CONFIG.selectors.tblBarangayOfficials).DataTable({
                retrieve: true, searching: false, lengthMenu: [15, 20, 50], order: [], "dom": 'rtip', data: res,
                pagingType: "full_numbers", language: returnPagination(),
                columns: [
                    { title: "Resident", data: 'Resident', visible: true, className: 'dt-start', orderable: false },
                    { title: "Position", data: 'PositionDescription', visible: true, className: 'dt-start', orderable: false },
                    {
                        title: "TermStart", data: 'TermStart', className: 'dt-start', orderable: false, width: '100px',
                        render: d => parseMSDate4DTable(d)
                    },
                    {
                        title: "TermEnd", data: 'TermEnd', className: 'dt-center', orderable: false, width: '100px',
                        render: d => parseMSDate4DTable(d)
                    },
                    { title: "Status", data: 'Status', className: 'dt-center', orderable: false },
                    {
                        title: "Action", data: null, className: 'dt-center', width: '80px', orderable: false,
                        render: function (data, type, row) {
                            return `<button class="btn btn-main-outline btn-outline-secondary ms-1 btn-sm py-1 btn-edit"> Edit <span class="icon-edit icon-md ms-1"></span></button>`;
                        }
                    }
                ]
            });
        });
    }

    function handleClearBarangayOfficials() {
        clearContent(CONFIG.selectors.divBarangayDetail);
    }

    function handleSelectBarangayOfficials() {
        const data = getSelectedRowData(this, CONFIG.selectors.tblBarangayOfficials);
        setValues(CONFIG.selectors.divBarangayDetail, data);
    }


    function handleSaveBarangayOfficial() {
        const data = getValues(CONFIG.selectors.divBarangayDetail);
        $(CONFIG.selectors.btnSaveBarangayOfficial).prop('disabled', true);

        doAjax(CONFIG.endpoints.saveBarangayOfficial, 'POST', data)
            .then(res => {
                if (res && res.rtn.success === true) {
                    showToast('Successfully saved barangay official.', 'success');
                    fnLoadBarangayOfficials();
                    handleClearBarangayOfficials();
                } else {
                    showToast(res.remarks, 'danger');
                }
            })
            .catch(error => {
                console.error('Error saving barangay official:', error);
                showToast('Failed to save barangay official', 'danger');
            })
            .finally(() => {
                $(CONFIG.selectors.btnSaveBarangayOfficial).prop('disabled', false);
            });
    }
});