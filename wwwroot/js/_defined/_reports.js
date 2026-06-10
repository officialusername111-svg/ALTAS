$(function () {
    set_active_sidebar('.reports-nav');

    const CONFIG = {
        endpoints: {
            getResident: '/Resident/getResident',

            previewClearance: '/Reports/GENERATE_BarangayClearance',
            previewIndigency: '/Reports/GENERATE_BarangayIndigent',

        },
        selectors: {
            
            mdlPreviewReport: '#mdlPreviewReport',
            divBarangayClearance: '#divBarangayClearance',
            divIndigentCertificate: '#divIndigentCertificate',
            hddnResidentId: '#hddnResidentId',
            inpResident: '#inpResident',

            btnPreviewClearance: '#btnPreviewClearance',

            mdlResident: '#mdlResident',
            searchResidentInput: '#searchResidentInput',
            tblResident: '#tblResident',

            pdfFrame: '#pdfFrame',
            mdlPreviewReport: '#mdlPreviewReport',
            slctReportType: '#slctReportType',
            btnPreviewIndigency: '#btnPreviewIndigency',
        }
    };

    fnLoadResident();

    attachEventHandlers();
    function attachEventHandlers() {
        $(document)
            .on('input', CONFIG.selectors.searchResidentInput, debounce(fnLoadResident, 250))
            .on('click', `${CONFIG.selectors.tblResident} .btn-select`, handleResidentSelect)

            .on('click', CONFIG.selectors.btnPreviewClearance, handleViewClearance)
            .on('click', CONFIG.selectors.btnPreviewIndigency, handleViewIndigency) 
            .on('change', CONFIG.selectors.slctReportType, handleReportChange)
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
                        title: "Action", data: null, className: 'dt-center', width: '50px', orderable: false,
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
        $(CONFIG.selectors.hddnResidentId).val(data.ResidentId);
        $(CONFIG.selectors.inpResident).val(data.Resident);
        $(CONFIG.selectors.inpResident).val(data.Resident);
        $(CONFIG.selectors.mdlResident).modal('hide');
    }


    function handleViewClearance() {
        const residentId = parseInt($(CONFIG.selectors.hddnResidentId).val());
        const data = getValues(CONFIG.selectors.divBarangayClearance);

        const params = new URLSearchParams({ ResidentId: residentId, CTCNo: data.CTCNo || '', Purpose: data.Purpose || '' });
        const url = `${CONFIG.endpoints.previewClearance}?${params.toString()}`;
        const frame = document.querySelector(CONFIG.selectors.pdfFrame);
        frame.src = "about:blank";
        $(CONFIG.selectors.mdlPreviewReport).modal('show');
        frame.src = url + "&t=" + new Date().getTime();
    }


    function handleViewIndigency() {
        const residentId = parseInt($(CONFIG.selectors.hddnResidentId).val());
        const data = getValues(CONFIG.selectors.divIndigentCertificate);

        const params = new URLSearchParams({ ResidentId: residentId, Purpose: data.Purpose || '' });
        const url = `${CONFIG.endpoints.previewIndigency}?${params.toString()}`;
        const frame = document.querySelector(CONFIG.selectors.pdfFrame);
        frame.src = "about:blank";
        $(CONFIG.selectors.mdlPreviewReport).modal('show');
        frame.src = url + "&t=" + new Date().getTime();
    }


    function handleReportChange() {
        const selectedReport = $(CONFIG.selectors.slctReportType).val();

        // Hide all first (clean slate)
        $(CONFIG.selectors.divBarangayClearance).addClass('d-none');
        $(CONFIG.selectors.divIndigentCertificate).addClass('d-none');

        // Then show only what you need
        if (selectedReport === 'Clearance' && $(CONFIG.selectors.divBarangayClearance).hasClass('d-none')) {
            $(CONFIG.selectors.divBarangayClearance).removeClass('d-none');
        }
        else if (selectedReport === 'Indigency' && $(CONFIG.selectors.divIndigentCertificate).hasClass('d-none')) {
            $(CONFIG.selectors.divIndigentCertificate).removeClass('d-none');
        }
    }

});

