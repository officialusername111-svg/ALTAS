$(function () {
    set_active_sidebar('.incident-nav');

    const CONFIG = {
        endpoints: {
            getData: '/Incident/getData',
            getDataById: '/Incident/getDataById',
            saveData: '/Incident/saveData',
            updateData: '/Incident/updateData',
            getCaseTypes: '/Incident/getCaseTypes',
            getComplaintTypes: '/Incident/getComplaintTypes',
            getResidents: '/Resident/getResident',
            getParties: '/Incident/getParties',
            saveParty: '/Incident/saveParty',
            updateParty: '/Incident/updateParty',
            deleteParty: '/Incident/deleteParty',
            getAttachments: '/Incident/getAttachments',
            uploadAttachment: '/Incident/uploadAttachment',
            deleteAttachment: '/Incident/deleteAttachment',
            getSettlements: '/Incident/getSettlements',
            saveSettlement: '/Incident/saveSettlement',
            updateSettlement: '/Incident/updateSettlement',
            deleteSettlement: '/Incident/deleteSettlement',
        },
        selectors: {
            // panels
            divSummaryCards: '#divSummaryCards',
            divList: '#divIncidentList',
            tblList: '#tblIncidentList',
            searchList: '#searchIncidentList',
            divForm: '#divIncidentForm',
            divFormInner: '#divIncidentInformation',
            lblFormTitle: '#lblFormTitle',
            btnNewIncident: '#btnNewIncident',
            btnBackToList: '#btnBackToList',
            btnSave: '#btnSave',
            btnClear: '#btnClear',
            // KPI
            statTotal: '#statTotal',
            statOpen: '#statOpen',
            statOngoing: '#statOngoing',
            statSettled: '#statSettled',
            // hidden fields
            hidIncidentID: '#_hidIncidentID',
            hidRespondentId: '#_hidResidentId_Respondent',
            // case / complaint type
            inpCaseTypeID: '#inpCaseTypeID',
            inpComplaintTypeID: '#inpComplaintTypeID',
            // status / settled date
            inpStatus: '#inpStatus',
            divSettledDate: '#divSettledDate',
            inpSettledDate: '#inpSettledDate',
            // parties
            divComplainantCards: '#divComplainantCards',
            divRespondentCards: '#divRespondentCards',
            // complainant modal
            mdlAddComplainant: '#mdlAddComplainant',
            btnSaveComplainant: '#btnSaveComplainant',
            hidComplainantPartyId: '#_hidComplainantPartyId',
            hidComplainantResidentId: '#_hidComplainantResidentId',
            inpCFullName: '#inpCFullName',
            inpCGender: '#inpCGender',
            inpCCivilStatus: '#inpCCivilStatus',
            inpCAddress: '#inpCAddress',
            inpCContactNo: '#inpCContactNo',
            // complainant resident lookup
            mdlFindComplainant: '#mdlFindComplainant',
            searchComplainantInput: '#searchComplainantInput',
            tblComplainantResident: '#tblComplainantResident',
            // respondent resident lookup
            mdlFindResident: '#mdlFindResident',
            searchResidentInput: '#searchResidentInput',
            tblResident: '#tblResident',
            // settlement
            tblSettlement: '#tblSettlement',
            divSettlementCards: '#divSettlementCards',
            mdlSettlement: '#mdlSettlement',
            divSettlementForm: '#divSettlementForm',
            btnSaveSettlement: '#btnSaveSettlement',
            hidSettlementId: '#_hidSettlementId',
            hidSettlementKPCaseNo: '#_hidSettlementKPCaseNo',
            inpSettlementDate: '#inpSettlementDate',
            inpSettlementResult: '#inpSettlementResult',
            inpSettlementRemarks: '#inpSettlementRemarks',
            // attachment
            mdlPreviewAttachment: '#mdlPreviewAttachment',
            divAttachmentList: '#divAttachmentList',
            mdlAttachment: '#mdlAttachment',
            btnSaveAttachment: '#btnSaveAttachment',
            inpAttachmentDescription: '#inpAttachmentDescription',
            inpAttachmentFile: '#inpAttachmentFile',
            // shared PDF preview modal (existing)
            mdlPreviewReport: '#mdlPreviewReport',
            pdfFrame: '#pdfFrame',
        }
    };

    // Init
    fnLoadCaseTypes();
    fnLoadIncidentList();
    attachEventHandlers();

    // Cache of the currently loaded settlement records, keyed for quick lookup
    // by the card buttons (cards aren't a DataTable, so we resolve by id).
    let _settlementCache = [];

    function attachEventHandlers() {
        $(document)
            // list
            .on('input', CONFIG.selectors.searchList, debounce(fnLoadIncidentList, 250))
            .on('click', `${CONFIG.selectors.tblList} .btn-edit`, handleEditRow)
            .on('click', `${CONFIG.selectors.tblList} .btn-print-form7`, handlePrintForm7FromList)
            // form nav
            .on('click', CONFIG.selectors.btnNewIncident, handleNewIncident)
            .on('click', CONFIG.selectors.btnBackToList, handleBackToList)
            // form actions
            .on('click', CONFIG.selectors.btnSave, handleSave)
            .on('click', CONFIG.selectors.btnClear, handleClear)
            .on('change', CONFIG.selectors.inpStatus, handleStatusChange)
            // case type → complaint type cascade
            .on('change', CONFIG.selectors.inpCaseTypeID, handleCaseTypeChange)
            // complainant party
            .on('click', CONFIG.selectors.btnSaveComplainant, handleSaveComplainant)
            .on('click', `${CONFIG.selectors.divComplainantCards} .btn-edit-party`, handleEditComplainant)
            .on('click', `${CONFIG.selectors.divComplainantCards} .btn-del-party`, handleDeleteComplainant)
            .on('hidden.bs.modal', CONFIG.selectors.mdlAddComplainant, handleComplainantModalClose)
            // complainant resident lookup
            .on('shown.bs.modal', CONFIG.selectors.mdlFindComplainant, fnLoadComplainantResidents)
            .on('input', CONFIG.selectors.searchComplainantInput, debounce(fnLoadComplainantResidents, 250))
            .on('click', `${CONFIG.selectors.tblComplainantResident} .btn-select`, handleComplainantResidentSelect)
            // respondent resident lookup
            .on('shown.bs.modal', CONFIG.selectors.mdlFindResident, fnLoadResidents)
            .on('input', CONFIG.selectors.searchResidentInput, debounce(fnLoadResidents, 250))
            .on('click', `${CONFIG.selectors.tblResident} .btn-select`, handleResidentSelect)
            .on('hidden.bs.modal', CONFIG.selectors.mdlFindResident, handleResidentModalClose)
            .on('click', `${CONFIG.selectors.divRespondentCards} .btn-del-party`, handleDeleteRespondent)
            // settlement
            .on('click', CONFIG.selectors.btnSaveSettlement, handleSaveSettlement)
            .on('click', `${CONFIG.selectors.divSettlementCards} .btn-edit-sett`, handleEditSettlement)
            .on('click', `${CONFIG.selectors.divSettlementCards} .btn-del-sett`, handleDeleteSettlement)
            .on('hidden.bs.modal', CONFIG.selectors.mdlSettlement, handleSettlementModalClose)
            // settlement KP form print
            .on('click', `${CONFIG.selectors.divSettlementCards} .btn-print-notice`, handlePrintNotice)
            .on('click', `${CONFIG.selectors.divSettlementCards} .btn-print-summons`, handlePrintSummons)
            // attachment
            .on('click', CONFIG.selectors.btnSaveAttachment, handleUploadAttachment)
            .on('click', '#divAttachmentList .btn-del-attach', handleDeleteAttachment)
            .on('click', '#divAttachmentList .btn-preview-attach', handlePreviewAttachment)
            .on('shown.bs.modal', CONFIG.selectors.mdlAttachment, handleAttachmentModalOpen)
            // form panel print (Form 7)
            .on('click', '#btnPrintIncident', handlePrintIncident);
    }

    // ── Load functions ───────────────────────────────────────

    function fnLoadCaseTypes() {
        doAjax(CONFIG.endpoints.getCaseTypes, 'GET', {}).then(res => {
            const $sel = $(CONFIG.selectors.inpCaseTypeID);
            $sel.find('option:not(:first)').remove();
            res.forEach(ct => {
                $sel.append(`<option value="${ct.CaseTypeID}">${escapeHtml(ct.CaseTypeName)}</option>`);
            });
        });
    }

    function fnLoadComplaintTypes(caseTypeId, selectedId) {
        const $sel = $(CONFIG.selectors.inpComplaintTypeID);
        $sel.prop('disabled', true).find('option:not(:first)').remove();
        $sel.find('option:first').text('Loading...');

        doAjax(CONFIG.endpoints.getComplaintTypes, 'GET', { caseTypeId }).then(res => {
            $sel.find('option:first').text('Select Complaint Type');
            res.forEach(ct => {
                $sel.append(`<option value="${ct.ComplaintTypeID}">${escapeHtml(ct.ComplaintTypeName)}</option>`);
            });
            if (selectedId) $sel.val(selectedId);
            $sel.prop('disabled', false);
        });
    }

    function fnLoadIncidentList() {
        const search = $(CONFIG.selectors.searchList).val();

        doAjax(CONFIG.endpoints.getData, 'GET', { searchKeyword: search }).then(res => {
            updateSummaryCards(res);
            initDataTable(CONFIG.selectors.tblList, res, [
                {
                    title: 'KP Case No.', data: 'KPCaseNo',
                    className: 'dt-start fw-semibold', orderable: false
                },
                {
                    title: 'Incident Date', data: 'IncidentDate',
                    className: 'dt-center', orderable: false,
                    render: d => parseMSDate4DTable(d)
                },
                {
                    title: 'Complainant', data: 'ComplainantNames',
                    className: 'dt-start', orderable: false,
                    render: function (data, type, row) {
                        return formatPartyNames(data, row.ComplainantCount);
                    }
                },
                {
                    title: 'Respondent', data: 'RespondentNames',
                    className: 'dt-start', orderable: false,
                    render: function (data, type, row) {
                        return formatPartyNames(data, row.RespondentCount);
                    }
                },
                {
                    title: 'Status', data: 'Status',
                    className: 'dt-center', orderable: false,
                    render: function (data) {
                        const map = {
                            'Open': 'primary', 'On-going': 'warning',
                            'Settled': 'success', 'Transferred': 'info', 'Dismissed': 'secondary'
                        };
                        return createBadge(`bg-${map[data] || 'secondary'}`, '', escapeHtml(data ?? ''));
                    }
                },
                {
                    title: 'For Transfer', data: 'IncidentForTransfer',
                    className: 'dt-center', orderable: false,
                    render: d => d
                        ? createBadge('bg-danger', '', 'Yes')
                        : createBadge('bg-light text-dark border', '', 'No')
                },
                {
                    title: 'Actions', data: null,
                    className: 'dt-center', width: '160px', orderable: false,
                    render: function (data, type, row) {
                        return `<div class="d-flex gap-1 justify-content-center">
                                    <button class="btn btn-main-outline btn-sm py-1 btn-edit"
                                            title="Edit Incident">
                                        <i class="bi bi-pencil-square me-1"></i>Edit
                                    </button>
                                    <button class="btn btn-main-outline btn-sm py-1 btn-print-form7"
                                            data-id="${row.IncidentID}"
                                            title="Print KP Form 7 — Complaint">
                                        <i class="bi bi-printer me-1"></i>Form 7
                                    </button>
                                </div>`;
                    }
                }
            ]);
        });
    }

    function fnLoadSettlements() {
        const kpCaseNo = $(CONFIG.selectors.hidSettlementKPCaseNo).val()
            || $(CONFIG.selectors.divFormInner).find('[name="KPCaseNo"]').val();
        if (!kpCaseNo) return;

        doAjax(CONFIG.endpoints.getSettlements, 'GET', { kpCaseNo }).then(res => {
            _settlementCache = res || [];
            const $container = $(CONFIG.selectors.divSettlementCards);

            if (!res || res.length === 0) {
                $container.html(`<div class="text-center py-4">
                                    <i class="bi bi-calendar-x fs-24 text-muted"></i>
                                    <p class="text-muted fs-11 mt-1 mb-0">No settlement schedules yet.</p>
                                 </div>`);
                return;
            }

            const resultColor = { 'Settle': 'success', 'Unsettle': 'danger', 'Referred': 'warning', 'Pending': 'secondary' };

            const cards = res.map(s => {
                const sid = s.IncidentSettlementId;
                const color = resultColor[s.Result] || 'secondary';
                const date = parseMSDate4DTable(s.SettlementDate);
                const time = formatTime12(s.SettlementTime);
                const result = escapeHtml(s.Result || 'Pending');
                const remarks = s.Remarks
                    ? escapeHtml(s.Remarks)
                    : '<span class="fst-italic text-muted">No remarks</span>';

                return `<div class="settlement-card border rounded-3 p-3 position-relative"
                             data-sid="${sid}"
                             style="border-left:4px solid var(--bs-${color}) !important;">

                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="bi bi-calendar-event text-muted"></i>
                                    <div>
                                        <div class="fw-semibold fs-12">${date}</div>
                                        <div class="text-muted fs-10"><i class="bi bi-clock me-1"></i>${time}</div>
                                    </div>
                                </div>
                                <span class="badge bg-${color}-subtle text-${color} fs-10 fw-semibold px-2 py-1">
                                    ${result}
                                </span>
                            </div>

                            <div class="fs-11 text-muted mb-3">
                                <i class="bi bi-chat-left-text me-1"></i>${remarks}
                            </div>

                            <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                                <div class="d-flex gap-1">
                                    <button class="btn btn-main-outline btn-sm py-1 px-2 btn-print-notice"
                                            data-sid="${sid}"
                                            title="KP Form 8 — Notice of Hearing (Complainant)">
                                        <i class="bi bi-printer me-1"></i>Form 8
                                    </button>
                                    <button class="btn btn-main-outline btn-sm py-1 px-2 btn-print-summons"
                                            data-sid="${sid}"
                                            title="KP Form 9 — Summons (Respondent)">
                                        <i class="bi bi-printer me-1"></i>Form 9
                                    </button>
                                </div>
                                <div class="d-flex gap-1">
                                    <button class="btn btn-main-outline btn-outline-secondary btn-sm py-1 px-2 btn-edit-sett"
                                            data-sid="${sid}" title="Edit Schedule">
                                        <i class="bi bi-pencil-square"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm py-1 px-2 btn-del-sett"
                                            data-sid="${sid}" title="Delete Schedule">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>`;
            }).join('');

            $container.html(cards);
        });
    }

    function fnLoadAttachments() {
        const kpCaseNo = $(CONFIG.selectors.divFormInner).find('[name="KPCaseNo"]').val();
        if (!kpCaseNo) {
            $(CONFIG.selectors.divAttachmentList).html('<span class="text-muted fs-11 fst-italic">Save the incident first to add attachments.</span>');
            return;
        }

        doAjax(CONFIG.endpoints.getAttachments, 'GET', { kpCaseNo }).then(res => {
            if (!res || res.length === 0) {
                $(CONFIG.selectors.divAttachmentList).html('<span class="text-muted fs-11 fst-italic">No attachments yet.</span>');
                return;
            }

            const items = res.map(a => {
                const filePath = a.FileLocation || '';
                const fileName = filePath.split('/').pop();
                const ext = fileName.split('.').pop().toLowerCase();
                const icon = getFileIcon(fileName);
                const label = escapeHtml(a.Description || fileName || 'Document');
                const date = parseMSDate4DTable(a.DateUploaded);
                return `<div class="d-flex align-items-center justify-content-between py-2 border-bottom">
                            <div class="d-flex align-items-center gap-2">
                                <i class="${icon} fs-18 text-muted"></i>
                                <div>
                                    <div class="fw-semibold fs-12">${label}</div>
                                    <div class="text-muted fs-10">${date}</div>
                                </div>
                            </div>
                            <div class="d-flex gap-1">
                                <button class="btn btn-sm btn-main-outline py-1 px-2 btn-preview-attach"
                                        data-path="${filePath}"
                                        data-name="${escapeHtml(fileName)}"
                                        data-desc="${escapeHtml(a.Description || '')}"
                                        data-ext="${ext}">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-danger py-1 px-2 btn-del-attach"
                                        data-id="${a.IncidentAttachementId}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>`;
            }).join('');

            $(CONFIG.selectors.divAttachmentList).html(items);
        });
    }

    function fnLoadResidents() {
        const search = $(CONFIG.selectors.searchResidentInput).val();

        doAjax(CONFIG.endpoints.getResidents, 'GET', { searchKeyword: search }).then(res => {
            initDataTable(CONFIG.selectors.tblResident, res, [
                { title: 'Resident', data: 'Resident', className: 'dt-start fw-semibold', orderable: false },
                { title: 'Household', data: 'Household', className: 'dt-start', orderable: false },
                { title: 'Sex', data: 'Sex', className: 'dt-center', orderable: false },
                { title: 'Birthdate', data: 'Birthdate', className: 'dt-center', orderable: false, render: d => parseMSDate4DTable(d) },
                { title: 'Age', data: 'Age', className: 'dt-center', orderable: false },
                { title: 'Birth Place', data: 'BirthPlace', className: 'dt-start', orderable: false },
                {
                    title: 'Action', data: null, className: 'dt-center', width: '80px', orderable: false,
                    render: () => `<button class="btn btn-main-outline btn-outline-secondary btn-sm py-1 btn-select">
                                       Select <span class="icon-load me-1"></span>
                                   </button>`
                }
            ]);
        });
    }

    function fnLoadComplainantResidents() {
        const search = $(CONFIG.selectors.searchComplainantInput).val();

        doAjax(CONFIG.endpoints.getResidents, 'GET', { searchKeyword: search }).then(res => {
            initDataTable(CONFIG.selectors.tblComplainantResident, res, [
                { title: 'Resident', data: 'Resident', className: 'dt-start fw-semibold', orderable: false },
                { title: 'Household', data: 'Household', className: 'dt-start', orderable: false },
                { title: 'Sex', data: 'Sex', className: 'dt-center', orderable: false },
                { title: 'Birthdate', data: 'Birthdate', className: 'dt-center', orderable: false, render: d => parseMSDate4DTable(d) },
                { title: 'Age', data: 'Age', className: 'dt-center', orderable: false },
                { title: 'Birth Place', data: 'BirthPlace', className: 'dt-start', orderable: false },
                {
                    title: 'Action', data: null, className: 'dt-center', width: '80px', orderable: false,
                    render: () => `<button class="btn btn-main-outline btn-outline-secondary btn-sm py-1 btn-select">
                                       Select <span class="icon-load me-1"></span>
                                   </button>`
                }
            ]);
        });
    }

    function fnLoadParties(incidentId) {
        if (!incidentId) return;
        doAjax(CONFIG.endpoints.getParties, 'GET', { incidentId }).then(res => {
            renderPartyCards(res.filter(p => p.PartyType === 'Complainant'), 'Complainant');
            renderPartyCards(res.filter(p => p.PartyType === 'Respondent'), 'Respondent');
        });
    }

    // ── Handlers ─────────────────────────────────────────────

    function handleNewIncident() {
        clearContent(CONFIG.selectors.divFormInner);
        $(CONFIG.selectors.inpComplaintTypeID).prop('disabled', true)
            .find('option:first').text('Select Case Type first');
        toggleSettledDate();
        renderPartyCards([], 'Complainant');
        renderPartyCards([], 'Respondent');
        _settlementCache = [];
        $(CONFIG.selectors.divSettlementCards).html(`<div class="text-center py-4">
                                    <i class="bi bi-calendar-x fs-24 text-muted"></i>
                                    <p class="text-muted fs-11 mt-1 mb-0">No settlement schedules yet.</p>
                                 </div>`);
        $(CONFIG.selectors.divAttachmentList).html('<span class="text-muted fs-11 fst-italic">No attachments yet.</span>');
        showFormPanel();
    }

    function handleBackToList() {
        showListPanel();
        fnLoadIncidentList();
    }

    function handleEditRow() {
        const data = getSelectedRowData(this, CONFIG.selectors.tblList);
        setValues(CONFIG.selectors.divFormInner, data);
        toggleSettledDate();
        fnLoadParties(data.IncidentID);
        if (data.CaseTypeID) fnLoadComplaintTypes(data.CaseTypeID, data.ComplaintTypeID);
        $(CONFIG.selectors.hidSettlementKPCaseNo).val(data.KPCaseNo);
        fnLoadSettlements();
        fnLoadAttachments();
        showFormPanel();
    }

    function handleCaseTypeChange() {
        const caseTypeId = $(this).val();
        if (!caseTypeId) return;
        fnLoadComplaintTypes(caseTypeId, null);
    }

    function handleSave() {
        if (!validateRequiredFields(CONFIG.selectors.divFormInner)) return;

        const data = getValues(CONFIG.selectors.divFormInner);
        const isUpdate = $(CONFIG.selectors.hidIncidentID).val() !== '';
        const endpoint = isUpdate ? CONFIG.endpoints.updateData : CONFIG.endpoints.saveData;
        const label = isUpdate ? 'updated' : 'saved';

        doAjax(endpoint, 'POST', data)
            .then(res => {
                if (res && res.rtn.success === true) {
                    showToast(`Incident successfully ${label}.`, 'success');
                    if (!isUpdate) $(CONFIG.selectors.hidIncidentID).val(res.rtn.value);
                    $(CONFIG.selectors.hidSettlementKPCaseNo).val(data.KPCaseNo);
                    fnLoadParties($(CONFIG.selectors.hidIncidentID).val());
                    fnLoadSettlements();
                    fnLoadAttachments();
                } else {
                    showToast(res.rtn.remarks, 'danger');
                }
            })
            .catch(error => {
                console.error('Error saving incident:', error);
                showToast('Failed to save incident.', 'danger');
            });
    }

    function handleClear() {
        clearContent(CONFIG.selectors.divFormInner);
        $(CONFIG.selectors.inpComplaintTypeID).prop('disabled', true)
            .find('option:first').text('Select Case Type first');
        toggleSettledDate();
        renderPartyCards([], 'Complainant');
        renderPartyCards([], 'Respondent');
    }

    function handleStatusChange() {
        toggleSettledDate();
    }

    function handleResidentSelect() {
        const row = getSelectedRowData(this, CONFIG.selectors.tblResident);

        fnEnsureIncidentSaved(incidentId => {
            const dto = {
                IncidentID: incidentId,
                PartyType: 'Respondent',
                ResidentId: row.ResidentId ?? row.Id ?? null,
                FullName: row.Resident ?? '',
                Gender: row.Sex ?? '',
                CivilStatus: row.CivilStatus ?? '',
                Address: row.Household ?? '',
                ContactNo: row.ContactNo ?? ''
            };
            doAjax(CONFIG.endpoints.saveParty, 'POST', dto).then(res => {
                if (res && res.rtn.success === true) {
                    showToast('Respondent added.', 'success');
                    $(CONFIG.selectors.mdlFindResident).modal('hide');
                    fnLoadParties(incidentId);
                } else {
                    showToast(res.rtn.remarks, 'danger');
                }
            }).catch(() => showToast('Failed to add respondent.', 'danger'));
        });
    }

    function handleResidentModalClose() {
        $(CONFIG.selectors.searchResidentInput).val('');
        resetDataTable(CONFIG.selectors.tblResident);
    }

    function handleComplainantResidentSelect() {
        const row = getSelectedRowData(this, CONFIG.selectors.tblComplainantResident);

        fnEnsureIncidentSaved(incidentId => {
            const dto = {
                IncidentID: incidentId,
                PartyType: 'Complainant',
                ResidentId: row.ResidentId ?? row.Id ?? null,
                FullName: row.Resident ?? '',
                Gender: row.Sex ?? '',
                CivilStatus: row.CivilStatus ?? '',
                Address: row.Household ?? '',
                ContactNo: row.ContactNo ?? ''
            };
            doAjax(CONFIG.endpoints.saveParty, 'POST', dto).then(res => {
                if (res && res.rtn.success === true) {
                    showToast('Resident added as complainant.', 'success');
                    $(CONFIG.selectors.mdlFindComplainant).modal('hide');
                    fnLoadParties(incidentId);
                } else {
                    showToast(res.rtn.remarks, 'danger');
                }
            });
        });
    }

    function handleSaveComplainant() {
        const fullName = $(CONFIG.selectors.inpCFullName).val();
        if (!fullName) { showToast('Full Name is required.', 'warning'); return; }

        const partyId = $(CONFIG.selectors.hidComplainantPartyId).val();
        const isUpdate = partyId !== '';

        if (isUpdate) {
            const dto = {
                IncidentPartyId: partyId,
                FullName: $(CONFIG.selectors.inpCFullName).val(),
                Gender: $(CONFIG.selectors.inpCGender).val(),
                CivilStatus: $(CONFIG.selectors.inpCCivilStatus).val(),
                Address: $(CONFIG.selectors.inpCAddress).val(),
                ContactNo: $(CONFIG.selectors.inpCContactNo).val()
            };
            doAjax(CONFIG.endpoints.updateParty, 'POST', dto).then(res => {
                if (res && res.rtn.success === true) {
                    showToast('Complainant updated.', 'success');
                    $(CONFIG.selectors.mdlAddComplainant).modal('hide');
                    fnLoadParties($(CONFIG.selectors.hidIncidentID).val());
                } else {
                    showToast(res.rtn.remarks, 'danger');
                }
            });
            return;
        }

        fnEnsureIncidentSaved(incidentId => {
            const dto = {
                IncidentID: incidentId,
                PartyType: 'Complainant',
                ResidentId: $(CONFIG.selectors.hidComplainantResidentId).val() || null,
                FullName: $(CONFIG.selectors.inpCFullName).val(),
                Gender: $(CONFIG.selectors.inpCGender).val(),
                CivilStatus: $(CONFIG.selectors.inpCCivilStatus).val(),
                Address: $(CONFIG.selectors.inpCAddress).val(),
                ContactNo: $(CONFIG.selectors.inpCContactNo).val()
            };
            doAjax(CONFIG.endpoints.saveParty, 'POST', dto).then(res => {
                if (res && res.rtn.success === true) {
                    showToast('Complainant saved.', 'success');
                    $(CONFIG.selectors.mdlAddComplainant).modal('hide');
                    fnLoadParties(incidentId);
                } else {
                    showToast(res.rtn.remarks, 'danger');
                }
            });
        });
    }

    function handleEditComplainant() {
        const id = $(this).data('id');
        const incidentId = $(CONFIG.selectors.hidIncidentID).val();

        doAjax(CONFIG.endpoints.getParties, 'GET', { incidentId }).then(res => {
            const p = res.find(x => x.IncidentPartyId == id);
            if (!p) return;
            $(CONFIG.selectors.hidComplainantPartyId).val(p.IncidentPartyId);
            $(CONFIG.selectors.hidComplainantResidentId).val(p.ResidentId || '');
            $(CONFIG.selectors.inpCFullName).val(p.FullName);
            $(CONFIG.selectors.inpCGender).val(p.Gender);
            $(CONFIG.selectors.inpCCivilStatus).val(p.CivilStatus);
            $(CONFIG.selectors.inpCAddress).val(p.Address);
            $(CONFIG.selectors.inpCContactNo).val(p.ContactNo);
            $(CONFIG.selectors.mdlAddComplainant).modal('show');
        });
    }

    function handleDeleteComplainant() {
        const id = $(this).data('id');
        if (!confirm('Remove this complainant?')) return;

        doAjax(CONFIG.endpoints.deleteParty, 'POST', { id }).then(res => {
            if (res && res.rtn.success === true) {
                showToast('Complainant removed.', 'success');
                fnLoadParties($(CONFIG.selectors.hidIncidentID).val());
            } else {
                showToast(res.rtn.remarks, 'danger');
            }
        });
    }

    function handleDeleteRespondent() {
        const id = $(this).data('id');
        if (!confirm('Remove this respondent?')) return;

        doAjax(CONFIG.endpoints.deleteParty, 'POST', { id }).then(res => {
            if (res && res.rtn.success === true) {
                showToast('Respondent removed.', 'success');
                fnLoadParties($(CONFIG.selectors.hidIncidentID).val());
            } else {
                showToast(res.rtn.remarks, 'danger');
            }
        });
    }

    function handleComplainantModalClose() {
        $(CONFIG.selectors.hidComplainantPartyId).val('');
        $(CONFIG.selectors.hidComplainantResidentId).val('');
        $(CONFIG.selectors.inpCFullName).val('');
        $(CONFIG.selectors.inpCGender).val('');
        $(CONFIG.selectors.inpCCivilStatus).val('');
        $(CONFIG.selectors.inpCAddress).val('');
        $(CONFIG.selectors.inpCContactNo).val('');
        $(CONFIG.selectors.searchComplainantInput).val('');
        resetDataTable(CONFIG.selectors.tblComplainantResident);
    }

    function handleSaveSettlement() {
        if (!validateRequiredFields(CONFIG.selectors.divSettlementForm)) return;

        const data = getValues(CONFIG.selectors.divSettlementForm);
        const isUpdate = $(CONFIG.selectors.hidSettlementId).val() !== '';
        const endpoint = isUpdate ? CONFIG.endpoints.updateSettlement : CONFIG.endpoints.saveSettlement;

        if (!data.KPCaseNo) {
            data.KPCaseNo = $(CONFIG.selectors.divFormInner).find('[name="KPCaseNo"]').val();
        }

        doAjax(endpoint, 'POST', data)
            .then(res => {
                if (res && res.rtn.success === true) {
                    showToast('Settlement schedule saved.', 'success');
                    $(CONFIG.selectors.mdlSettlement).modal('hide');
                    fnLoadSettlements();
                } else {
                    showToast(res.rtn.remarks, 'danger');
                }
            })
            .catch(error => {
                console.error('Error saving settlement:', error);
                showToast('Failed to save settlement.', 'danger');
            });
    }

    function handleEditSettlement() {
        const sid = $(this).data('sid');
        const data = _settlementCache.find(s => s.IncidentSettlementId == sid);
        if (!data) return;
        setValues(CONFIG.selectors.divSettlementForm, data);
        $(CONFIG.selectors.mdlSettlement).modal('show');
    }

    function handleDeleteSettlement() {
        const sid = $(this).data('sid');
        if (!sid) return;
        if (!confirm('Delete this settlement schedule?')) return;

        doAjax(CONFIG.endpoints.deleteSettlement, 'POST', { id: sid })
            .then(res => {
                if (res && res.rtn.success === true) {
                    showToast('Settlement deleted.', 'success');
                    fnLoadSettlements();
                } else {
                    showToast(res.rtn.remarks, 'danger');
                }
            });
    }

    function handleSettlementModalClose() {
        clearContent(CONFIG.selectors.divSettlementForm);
    }

    function handleUploadAttachment() {
        const kpCaseNo = $(CONFIG.selectors.divFormInner).find('[name="KPCaseNo"]').val();
        const description = $(CONFIG.selectors.inpAttachmentDescription).val();
        const fileInput = $(CONFIG.selectors.inpAttachmentFile)[0];

        if (!kpCaseNo) {
            showToast('Save the incident first before uploading attachments.', 'warning');
            return;
        }
        if (!fileInput.files.length) {
            showToast('Please select a file.', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('kpCaseNo', kpCaseNo);
        formData.append('description', description);

        $.ajax({
            url: CONFIG.endpoints.uploadAttachment,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: { 'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val() }
        })
            .then(res => {
                if (res && res.rtn.success === true) {
                    showToast('Attachment uploaded.', 'success');
                    $(CONFIG.selectors.mdlAttachment).modal('hide');
                    fnLoadAttachments();
                } else {
                    showToast(res.rtn.remarks, 'danger');
                }
            })
            .catch(() => showToast('Failed to upload attachment.', 'danger'));
    }

    function handleDeleteAttachment() {
        const id = $(this).data('id');
        if (!confirm('Delete this attachment?')) return;

        doAjax(CONFIG.endpoints.deleteAttachment, 'POST', { id })
            .then(res => {
                if (res && res.rtn.success === true) {
                    showToast('Attachment deleted.', 'success');
                    fnLoadAttachments();
                } else {
                    showToast(res.rtn.remarks, 'danger');
                }
            });
    }

    function handleAttachmentModalOpen() {
        $(CONFIG.selectors.inpAttachmentDescription).val('');
        $(CONFIG.selectors.inpAttachmentFile).val('');
    }

    function handlePreviewAttachment() {
        const $btn = $(this);
        const filePath = $btn.data('path');
        const fileName = $btn.data('name');
        const desc = $btn.data('desc');
        const ext = ($btn.data('ext') || '').toLowerCase();

        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
        const isPdf = ext === 'pdf';

        $('#lblPreviewFileName').text(fileName || 'Document Preview');
        $('#lblPreviewDescription').text(desc || '');
        $('#lnkDownloadAttachment').attr('href', filePath);

        let bodyHtml = '';

        if (isImage) {
            bodyHtml = `<div class="text-center">
                            <img src="${filePath}" alt="${escapeHtml(fileName)}"
                                 class="img-fluid rounded shadow-sm"
                                 style="max-height:620px; object-fit:contain;"
                                 onerror="this.closest('.text-center').innerHTML=noPreviewHtml('${escapeHtml(fileName)}','The image could not be loaded.')">
                        </div>`;
        } else if (isPdf) {
            bodyHtml = `<iframe src="${filePath}" width="100%" height="620px"
                                style="border:none; border-radius:6px;"></iframe>`;
        } else {
            bodyHtml = noPreviewHtml(fileName, `<strong>${ext.toUpperCase()}</strong> files cannot be previewed in the browser. Use the Download button to open the file.`);
        }

        $('#divPreviewBody').html(bodyHtml);
        $(CONFIG.selectors.mdlPreviewAttachment).modal('show');
    }

    // Print Form 7 from the form panel (btnPrintIncident)
    function handlePrintIncident() {
        const incidentId = $(CONFIG.selectors.hidIncidentID).val();
        if (!incidentId) {
            showToast('Save the incident first before printing.', 'warning');
            return;
        }
        const url = `/Reports/GENERATE_KPForm7Complaint?IncidentId=${encodeURIComponent(incidentId)}`;
        openReportPreview(url);
    }

    // Print Form 7 from the incident list row
    function handlePrintForm7FromList() {
        const incidentId = $(this).data('id');
        if (!incidentId) {
            showToast('Could not retrieve incident. Please try again.', 'warning');
            return;
        }
        const url = `/Reports/GENERATE_KPForm7Complaint?IncidentId=${encodeURIComponent(incidentId)}`;
        openReportPreview(url);
    }

    // Form 8 — Notice of Hearing (Complainant): preview directly; date/time resolved server-side
    function handlePrintNotice() {
        const sid = $(this).data('sid');
        const incidentId = $(CONFIG.selectors.hidIncidentID).val();
        if (!incidentId || !sid) {
            showToast('Incident data is missing. Please try again.', 'warning');
            return;
        }
        const url = `/Reports/GENERATE_KPForm8NoticeOfHearing`
            + `?IncidentId=${encodeURIComponent(incidentId)}`
            + `&SettlementId=${encodeURIComponent(sid)}`;
        openReportPreview(url);
    }

    // Form 9 — Summons (Respondent): preview directly; date/time resolved server-side
    function handlePrintSummons() {
        const sid = $(this).data('sid');
        const incidentId = $(CONFIG.selectors.hidIncidentID).val();
        if (!incidentId || !sid) {
            showToast('Incident data is missing. Please try again.', 'warning');
            return;
        }
        const url = `/Reports/GENERATE_KPForm9Summons`
            + `?IncidentId=${encodeURIComponent(incidentId)}`
            + `&SettlementId=${encodeURIComponent(sid)}`;
        openReportPreview(url);
    }

    // ── Helpers ──────────────────────────────────────────────

    function fnEnsureIncidentSaved(callback) {
        const existingId = $(CONFIG.selectors.hidIncidentID).val();
        if (existingId) { callback(existingId); return; }

        const kpCaseNo = $(CONFIG.selectors.divFormInner).find('[name="KPCaseNo"]').val();
        if (!kpCaseNo) {
            showToast('Please fill in the KP Case No. before adding parties.', 'warning');
            return;
        }

        const data = getValues(CONFIG.selectors.divFormInner);
        doAjax(CONFIG.endpoints.saveData, 'POST', data).then(res => {
            if (res && res.rtn.success === true) {
                const newId = res.rtn.value;
                $(CONFIG.selectors.hidIncidentID).val(newId);
                $(CONFIG.selectors.hidSettlementKPCaseNo).val(data.KPCaseNo);
                showToast('Incident saved. You can now add parties.', 'success');
                callback(newId);
            } else {
                showToast(res.rtn.remarks || 'Failed to save incident.', 'danger');
            }
        }).catch(() => showToast('Failed to save incident.', 'danger'));
    }

    // Loads a PDF url into the shared mdlPreviewReport iframe using the
    // blank → show → src+cache-buster pattern, matching handleViewIndigency.
    function openReportPreview(url) {
        const frame = document.querySelector(CONFIG.selectors.pdfFrame);
        frame.src = 'about:blank';
        $(CONFIG.selectors.mdlPreviewReport).modal('show');
        frame.src = url + '&t=' + new Date().getTime();
    }

    function showListPanel() {
        $(CONFIG.selectors.divForm).hide();
        $(CONFIG.selectors.divList).show();
        $(CONFIG.selectors.divSummaryCards).show();
    }

    function showFormPanel() {
        $(CONFIG.selectors.divSummaryCards).hide();
        $(CONFIG.selectors.divList).hide();
        $(CONFIG.selectors.divForm).show();
        const complainantTab = new bootstrap.Tab(document.querySelector('#tab-complainant'));
        complainantTab.show();
    }

    function toggleSettledDate() {
        const status = $(CONFIG.selectors.inpStatus).val();
        if (status === 'Settled') {
            $(CONFIG.selectors.divSettledDate).show();
        } else {
            $(CONFIG.selectors.divSettledDate).hide();
            $(CONFIG.selectors.inpSettledDate).val('');
        }
    }

    function updateSummaryCards(data) {
        $(CONFIG.selectors.statTotal).text(data.length);
        $(CONFIG.selectors.statOpen).text(data.filter(d => d.Status === 'Open').length);
        $(CONFIG.selectors.statOngoing).text(data.filter(d => d.Status === 'On-going').length);
        $(CONFIG.selectors.statSettled).text(data.filter(d => d.Status === 'Settled').length);
    }

    function renderPartyCards(parties, type) {
        const $container = type === 'Complainant'
            ? $(CONFIG.selectors.divComplainantCards)
            : $(CONFIG.selectors.divRespondentCards);

        const tabSelector = type === 'Complainant' ? '#tab-complainant' : '#tab-respondent';
        const baseIcon = type === 'Complainant'
            ? '<i class="bi bi-person-fill me-1"></i>'
            : '<i class="bi bi-person-fill-exclamation me-1"></i>';
        const countBadge = parties && parties.length > 0
            ? ` <span class="badge bg-secondary ms-1">${parties.length}</span>`
            : '';
        $(tabSelector).html(`${baseIcon} ${type}${countBadge}`);

        if (!parties || parties.length === 0) {
            const label = type === 'Complainant' ? 'complainants' : 'respondents';
            $container.html(`<div class="text-center py-3">
                                <i class="bi bi-person-dash fs-24 text-muted"></i>
                                <p class="text-muted fs-11 mt-1 mb-0">No ${label} added yet.</p>
                             </div>`);
            return;
        }

        const cards = parties.map(p => {
            const isResident = p.ResidentId
                ? `<span class="badge bg-success-subtle text-success fs-10 ms-1"><i class="bi bi-check-circle me-1"></i>Resident</span>`
                : '';
            const editBtn = type === 'Complainant'
                ? `<button class="btn btn-main-outline btn-sm py-1 px-2 btn-edit-party"
                           data-id="${p.IncidentPartyId}"><i class="bi bi-pencil-square"></i></button>`
                : '';
            return `<div class="party-card border rounded-2 px-3 py-2 bg-light d-flex justify-content-between align-items-start"
                         data-id="${p.IncidentPartyId}">
                        <div>
                            <div class="fw-semibold fs-13">${escapeHtml(p.FullName || '—')} ${isResident}</div>
                            <div class="text-muted fs-11 mt-1">
                                <span class="me-3"><i class="bi bi-gender-ambiguous me-1"></i>${escapeHtml(p.Gender || '—')}</span>
                                <span class="me-3"><i class="bi bi-heart me-1"></i>${escapeHtml(p.CivilStatus || '—')}</span>
                            </div>
                            <div class="text-muted fs-11 mt-1">
                                <span class="me-3"><i class="bi bi-geo-alt me-1"></i>${escapeHtml(p.Address || '—')}</span>
                                <span><i class="bi bi-telephone me-1"></i>${escapeHtml(p.ContactNo || '—')}</span>
                            </div>
                        </div>
                        <div class="d-flex gap-1 ms-2">
                            ${editBtn}
                            <button class="btn btn-danger btn-sm py-1 px-2 btn-del-party"
                                    data-id="${p.IncidentPartyId}"><i class="bi bi-trash"></i></button>
                        </div>
                    </div>`;
        }).join('');

        $container.html(cards);
    }

    function formatPartyNames(names, count) {
        if (!names) return '<span class="text-muted fst-italic fs-11">—</span>';
        if (count <= 1) return escapeHtml(names);
        const first = names.split(',')[0].trim();
        return `${escapeHtml(first)} <span class="badge bg-secondary-subtle text-secondary fs-10">+${count - 1} more</span>`;
    }

    function getFileIcon(fileName) {
        if (!fileName) return 'bi bi-file-earmark';
        const ext = fileName.split('.').pop().toLowerCase();
        const map = {
            pdf: 'bi bi-file-earmark-pdf text-danger',
            jpg: 'bi bi-file-earmark-image text-primary',
            jpeg: 'bi bi-file-earmark-image text-primary',
            png: 'bi bi-file-earmark-image text-primary',
            doc: 'bi bi-file-earmark-word text-primary',
            docx: 'bi bi-file-earmark-word text-primary',
            xls: 'bi bi-file-earmark-excel text-success',
            xlsx: 'bi bi-file-earmark-excel text-success',
        };
        return map[ext] || 'bi bi-file-earmark text-muted';
    }

    function noPreviewHtml(fileName, message) {
        return `<div class="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-center">
                    <i class="bi bi-file-earmark-slash" style="font-size:4rem; color:#c0c0c0;"></i>
                    <p class="fw-semibold fs-14 mt-3 mb-1 text-muted">Preview Not Available</p>
                    <p class="fs-12 text-muted" style="max-width:380px;">${message}</p>
                    <p class="fs-11 text-muted fst-italic mt-1">${escapeHtml(fileName || '')}</p>
                </div>`;
    }

    // Converts a 24h "HH:mm" string to a 12h display like "10:30 AM".
    function formatTime12(time24) {
        if (!time24) return '<span class="text-muted fst-italic fs-11">—</span>';
        const parts = String(time24).split(':');
        if (parts.length < 2) return escapeHtml(time24);
        let h = parseInt(parts[0], 10);
        const m = parts[1].padStart(2, '0');
        const period = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        if (h === 0) h = 12;
        return `${h}:${m} ${period}`;
    }
});