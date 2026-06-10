$(function () {
    set_active_sidebar('.resident-nav');


    const CONFIG = {
        endpoints: {
            getHousehold: '/Resident/getHousehold',

            getResident: '/Resident/getResident',
            saveResident: '/Resident/saveResident',

            saveHousehold: '/Resident/saveHousehold'
        },
        selectors: {
            tblHouseHold: '#tblHouseHold',
            searchHouseholdInput: '#searchHouseholdInput',
            mdlHouseHold: '#mdlHouseHold',
            inpResidentHousehold: '#inpResidentHousehold',
            hidHouseholdId: '#_hidHouseholdId',

            tblResident: '#tblResident',
            searchResidentInput: '#searchResidentInput',
            divResidentInformation: '#divResidentInformation',
            mdlResident: '#mdlResident',
            inpResidentBirthdate: '#inpResidentBirthdate',
            inpResidentAge: '#inpResidentAge',

            btnClearResident: '#btnClearResident',
            btnSaveResident: '#btnSaveResident',


            
            btnAddNewHousehold: '#btnAddNewHousehold',
            mdlNewHousehold: '#mdlNewHousehold',
            btnSaveHousehold: '#btnSaveHousehold',
            divNewHousehold: '#divNewHousehold'


        }
    };

    fnLoadHousehold();
    fnLoadResident();

    attachEventHandlers();
    function attachEventHandlers() {
        $(document)
            .on('input', CONFIG.selectors.searchHouseholdInput, debounce(fnLoadHousehold, 250))
            .on('click', `${CONFIG.selectors.tblHouseHold} .btn-select`, handleHouseholdSelect)

            .on('input', CONFIG.selectors.searchResidentInput, debounce(fnLoadResident, 250))
            .on('click', `${CONFIG.selectors.tblResident} .btn-select`, handleResidentSelect)

            .on('click', CONFIG.selectors.btnSaveResident, handleSaveResident)
            .on('click', CONFIG.selectors.btnClearResident, handleClearResident)
            .on('change', CONFIG.selectors.inpResidentBirthdate, handleComputeBD)

            .on('click', CONFIG.selectors.btnAddNewHousehold, handleAddNewHousehold)
            .on('click', CONFIG.selectors.btnSaveHousehold, handleSaveNewHousehold)


            .on('hidden.bs.modal', CONFIG.selectors.mdlNewHousehold, handleCloseNewHousehold);
    }

    function fnLoadHousehold() {
        const search = $(CONFIG.selectors.searchHouseholdInput).val();
        doAjax(CONFIG.endpoints.getHousehold, 'GET', { searchKeyword: search }).then(res => {
            resetDataTable(CONFIG.selectors.tblHouseHold);

            $(CONFIG.selectors.tblHouseHold).DataTable({
                retrieve: true, searching: false, lengthMenu: [15, 20, 50], order: [], "dom": 'rtip', data: res,
                pagingType: "full_numbers", language: returnPagination(),
                columns: [
                    { title: "Household No", data: 'HouseHoldNo', visible: true, className: 'dt-center', orderable: false },
                    { title: "Street", data: 'StreetName', className: 'dt-start', orderable: false },
                    { title: "PurokName", data: 'PurokName', className: 'dt-start', orderable: false },
                    {
                        title: "Resident(s)", data: null, className: 'dt-start', orderable: false, width: '200px',
                        render: function (data, type, row) {
                            function generateBadge(name, isHead = false) {
                                if (!name) return ''; 
                                const baseClass = isHead ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-muted';
                                return `<span class="badge p-2 fw-medium ${baseClass} me-1"> <i class="icon-person me-1"></i>${name} </span>`;
                            }
                            return `<div> ${generateBadge(row.Resident1, row.HasFamilyHead)} ${generateBadge(row.Resident2)} ${generateBadge(row.Resident3)} </div>`;
                        }
                    },
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

    function handleHouseholdSelect(e) {
        const data = getSelectedRowData(this, CONFIG.selectors.tblHouseHold);
        $(CONFIG.selectors.hidHouseholdId).val(data.HouseholdId);
        $(CONFIG.selectors.inpResidentHousehold).val(data.StreetName +','+ data.PurokName);
        $(CONFIG.selectors.mdlHouseHold).modal('hide');
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
                        title: "Action", data: null, className: 'dt-center', width: '80px', orderable: false,
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
        setValues(CONFIG.selectors.divResidentInformation, data);
        $(CONFIG.selectors.mdlResident).modal('hide');
    }

    function handleClearResident() {
        clearContent(CONFIG.selectors.divResidentInformation);
    }

    function handleComputeBD() {
        const birthdate = $(CONFIG.selectors.inpResidentBirthdate).val();
        if (!birthdate)
            $(CONFIG.selectors.inpResidentAge).val(0);

        const today = new Date();
        const bdate = new Date(birthdate);

        let age = today.getFullYear() - bdate.getFullYear();
        const monthDiff = today.getMonth() - bdate.getMonth();

        // If birthday hasn't happened yet this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bdate.getDate())) {
            age--;
        }
        $(CONFIG.selectors.inpResidentAge).val(age);
    }

    function handleAddNewHousehold() {
        $(CONFIG.selectors.mdlHouseHold).modal('hide');
        $(CONFIG.selectors.mdlNewHousehold).modal('show');
    }   

    function handleCloseNewHousehold() {
        $(CONFIG.selectors.mdlNewHousehold).modal('hide');
        $(CONFIG.selectors.mdlHouseHold).modal('show');
    }

    function handleSaveNewHousehold() {
        const data = getValues(CONFIG.selectors.divNewHousehold);
        doAjax(CONFIG.endpoints.saveHousehold, 'POST', data)
            .then(res => {
                if (res && res.rtn.success === true) {
                    showToast('Successfully saved household information.', 'success');
                    fnLoadHousehold();
                    clearContent(CONFIG.selectors.divNewHousehold);
                    handleCloseNewHousehold();
                } else {
                    showToast(res.remarks, 'danger');
                }
            })
            .catch(error => {
                console.error('Error saving household information:', error);
                showToast('Failed to saved household information', 'danger');
            });
    }

    function handleSaveResident() {
        const data = getValues(CONFIG.selectors.divResidentInformation);
        doAjax(CONFIG.endpoints.saveResident, 'POST', data)
            .then(res => {
                if (res && res.rtn.success === true) {
                    showToast('Successfully saved resident information.', 'success');
                    fnLoadHousehold();
                    fnLoadResident();
                    clearContent(CONFIG.selectors.divResidentInformation);
                } else {
                    showToast(res.remarks, 'danger');
                }
            })
            .catch(error => {
                console.error('Error saving resident information:', error);
                showToast('Failed to saved resident information', 'danger');
            });
        
    }
});