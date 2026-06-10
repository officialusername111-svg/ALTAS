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
            btnSearchComplainantResident: '#btnSearchComplainantResident',
            btnEncodeComplainant: '#btnEncodeComplainant',
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
        }
    };

    // Init
    fnLoadCaseTypes();
    fnLoadIncidentList();
    attachEventHandlers();

    function attachEventHandlers() {
        $(document)
            // list
            .on('input', CONFIG.selectors.searchList, debounce(fnLoadIncidentList, 250))
            .on('click', `${CONFIG.selectors.tblList} .btn-edit`, handleEditRow)
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
            // complainant resident lookup (Search Resident button goes straight to resident modal)
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
            .on('click', `${CONFIG.selectors.tblSettlement} .btn-edit-sett`, handleEditSettlement)
            .on('click', `${CONFIG.selectors.tblSettlement} .btn-del-sett`, handleDeleteSettlement)
            .on('hidden.bs.modal', CONFIG.selectors.mdlSettlement, handleSettlementModalClose)
            // attachment
            .on('click', CONFIG.selectors.btnSaveAttachment, handleUploadAttachment)
            .on('click', '#divAttachmentList .btn-del-attach', handleDeleteAttachment)
            .on('click', '#divAttachmentList .btn-preview-attach', handlePreviewAttachment)
            .on('shown.bs.modal', CONFIG.selectors.mdlAttachment, handleAttachmentModalOpen)
            .on('click', '#btnPrintIncident', handlePrintIncident);
    }

    // Load CaseType dropdown on page init
    function fnLoadCaseTypes() {
        doAjax(CONFIG.endpoints.getCaseTypes, 'GET', {}).then(res => {
            const $sel = $(CONFIG.selectors.inpCaseTypeID);
            $sel.find('option:not(:first)').remove();
            res.forEach(ct => {
                $sel.append(`<option value="${ct.CaseTypeID}">${escapeHtml(ct.CaseTypeName)}</option>`);
            });
        });
    }

    // Load ComplaintType dropdown filtered by selected CaseType
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

    // Load incident list + update KPI cards
    function fnLoadIncidentList() {
        const search = $(CONFIG.selectors.searchList).val();

        doAjax(CONFIG.endpoints.getData, 'GET', { searchKeyword: search }).then(res => {
            updateSummaryCards(res);
            initDataTable(CONFIG.selectors.tblList, res, [
                { title: 'KP Case No.', data: 'KPCaseNo', className: 'dt-start fw-semibold', orderable: false },
                { title: 'Incident Date', data: 'IncidentDate', className: 'dt-center', orderable: false, render: d => parseMSDate4DTable(d) },
                {
                    title: 'Complainant', data: 'ComplainantNames', className: 'dt-start', orderable: false,
                    render: function (data, type, row) {
                        return formatPartyNames(data, row.ComplainantCount);
                    }
                },
                {
                    title: 'Respondent', data: 'RespondentNames', className: 'dt-start', orderable: false,
                    render: function (data, type, row) {
                        return formatPartyNames(data, row.RespondentCount);
                    }
                },
                {
                    title: 'Status', data: 'Status', className: 'dt-center', orderable: false,
                    render: function (data) {
                        const map = { 'Open': 'primary', 'On-going': 'warning', 'Settled': 'success', 'Transferred': 'info', 'Dismissed': 'secondary' };
                        return createBadge(`bg-${map[data] || 'secondary'}`, '', escapeHtml(data ?? ''));
                    }
                },
                {
                    title: 'For Transfer', data: 'IncidentForTransfer', className: 'dt-center', orderable: false,
                    render: d => d ? createBadge('bg-danger', '', 'Yes') : createBadge('bg-light text-dark border', '', 'No')
                },
                {
                    title: 'Actions', data: null, className: 'dt-center', width: '80px', orderable: false,
                    render: () => `<button class="btn btn-main-outline btn-outline-secondary btn-sm py-1 btn-edit">
                                       <i class="bi bi-pencil-square me-1"></i> Edit
                                   </button>`
                }
            ]);
        });
    }

    // Load settlement table for current KP Case No.
    function fnLoadSettlements() {
        const kpCaseNo = $(CONFIG.selectors.hidSettlementKPCaseNo).val()
            || $(CONFIG.selectors.divFormInner).find('[name="KPCaseNo"]').val();
        if (!kpCaseNo) return;

        doAjax(CONFIG.endpoints.getSettlements, 'GET', { kpCaseNo }).then(res => {
            initDataTable(CONFIG.selectors.tblSettlement, res, [
                { title: 'Date', data: 'SettlementDate', className: 'dt-center', orderable: false, render: d => parseMSDate4DTable(d) },
                {
                    title: 'Result', data: 'Result', className: 'dt-center', orderable: false,
                    render: function (data) {
                        const map = { 'Settle': 'success', 'Unsettle': 'danger', 'Referred': 'warning' };
                        return createBadge(`bg-${map[data] || 'secondary'}`, '', escapeHtml(data ?? ''));
                    }
                },
                { title: 'Remarks', data: 'Remarks', className: 'dt-start', orderable: false },
                {
                    title: '', data: null, className: 'dt-center', width: '70px', orderable: false,
                    render: () => `<button class="btn btn-main-outline btn-outline-secondary btn-sm py-1 me-1 btn-edit-sett"><i class="bi bi-pencil-square"></i></button>
                                   <button class="btn btn-danger btn-sm py-1 btn-del-sett"><i class="bi bi-trash"></i></button>`
                }
            ]);
        });
    }

    // Load attachment list for current KP Case No.
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
                                <button class="btn btn-sm btn-danger py-1 px-2 btn-del-attach" data-id="${a.IncidentAttachementId}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>`;
            }).join('');

            $(CONFIG.selectors.divAttachmentList).html(items);
        });
    }

    // Resident search table
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

    // Handlers
    function handleNewIncident() {
        clearContent(CONFIG.selectors.divFormInner);
        $(CONFIG.selectors.inpComplaintTypeID).prop('disabled', true)
            .find('option:first').text('Select Case Type first');
        $(CONFIG.selectors.lblFormTitle).text('New Incident');
        toggleSettledDate();
        renderPartyCards([], 'Complainant');
        renderPartyCards([], 'Respondent');
        resetDataTable(CONFIG.selectors.tblSettlement);
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
        $(CONFIG.selectors.lblFormTitle).text('Edit Incident — ' + (data.KPCaseNo || ''));
        toggleSettledDate();

        // Load parties for this incident
        fnLoadParties(data.IncidentID);

        // Load complaint types for the saved CaseTypeID, then set the saved ComplaintTypeID
        if (data.CaseTypeID) {
            fnLoadComplaintTypes(data.CaseTypeID, data.ComplaintTypeID);
        }

        // Sync settlement KPCaseNo hidden field then load
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
                    // On new save, set the IncidentID so subsequent saves go to update
                    if (!isUpdate) $(CONFIG.selectors.hidIncidentID).val(res.rtn.value);
                    // Sync settlement hidden KPCaseNo with the newly entered/updated case no
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

    // Saves the incident silently if it has no IncidentID yet, then calls back with the id.
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

    function handleResidentModalClose() {
        $(CONFIG.selectors.searchResidentInput).val('');
        resetDataTable(CONFIG.selectors.tblResident);
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

    // Saves selected resident as complainant — auto-saves incident first if needed
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
            // Update doesn't need fnEnsureIncidentSaved — incident already exists
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
        const $card = $(this).closest('.party-card');
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

    function handleClearRespondent() {
        $(CONFIG.selectors.hidRespondentId).val('');
        $('#hidRespondentFullName').val('');
        $('#hidRespondentGender').val('');
        $('#hidRespondentCivilStatus').val('');
        $('#hidRespondentAddress').val('');
        $('#hidRespondentContactNo').val('');

        $(CONFIG.selectors.lblRespondentFullName).text('—');
        $(CONFIG.selectors.lblRespondentGender).text('—');
        $(CONFIG.selectors.lblRespondentCivilStatus).text('—');
        $(CONFIG.selectors.lblRespondentAddress).text('—');
        $(CONFIG.selectors.lblRespondentContactNo).text('—');

        $(CONFIG.selectors.divRespondentDisplay).hide();
        $(CONFIG.selectors.divRespondentEmpty).show();
    }

    function fnLoadParties(incidentId) {
        if (!incidentId) return;
        doAjax(CONFIG.endpoints.getParties, 'GET', { incidentId }).then(res => {
            renderPartyCards(res.filter(p => p.PartyType === 'Complainant'), 'Complainant');
            renderPartyCards(res.filter(p => p.PartyType === 'Respondent'), 'Respondent');
        });
    }

    function renderPartyCards(parties, type) {
        const $container = type === 'Complainant'
            ? $(CONFIG.selectors.divComplainantCards)
            : $(CONFIG.selectors.divRespondentCards);

        // Update the tab button label — always show type name + count badge if any
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
            const isResident = p.ResidentId ? `<span class="badge bg-success-subtle text-success fs-10 ms-1"><i class="bi bi-check-circle me-1"></i>Resident</span>` : '';
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

    function handleSaveSettlement() {
        if (!validateRequiredFields(CONFIG.selectors.divSettlementForm)) return;

        const data = getValues(CONFIG.selectors.divSettlementForm);
        const isUpdate = $(CONFIG.selectors.hidSettlementId).val() !== '';
        const endpoint = isUpdate ? CONFIG.endpoints.updateSettlement : CONFIG.endpoints.saveSettlement;

        // Carry KPCaseNo from main form if not already set
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
        const data = getSelectedRowData(this, CONFIG.selectors.tblSettlement);
        setValues(CONFIG.selectors.divSettlementForm, data);
        $(CONFIG.selectors.mdlSettlement).modal('show');
    }

    function handleDeleteSettlement() {
        const data = getSelectedRowData(this, CONFIG.selectors.tblSettlement);
        if (!confirm('Delete this settlement schedule?')) return;

        doAjax(CONFIG.endpoints.deleteSettlement, 'POST', { id: data.IncidentSettlementId })
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

    // Helpers
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

        const previewable = { image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'], pdf: ['pdf'] };
        const isImage = previewable.image.includes(ext);
        const isPdf = previewable.pdf.includes(ext);

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
                                style="border:none; border-radius:6px;"
                                onerror="this.replaceWith(document.createRange().createContextualFragment(noPreviewHtml('${escapeHtml(fileName)}','The PDF could not be loaded.')))">
                        </iframe>`;
        } else {
            bodyHtml = noPreviewHtml(fileName, `<strong>${ext.toUpperCase()}</strong> files cannot be previewed in the browser. Use the Download button to open the file.`);
        }

        $('#divPreviewBody').html(bodyHtml);
        $(CONFIG.selectors.mdlPreviewAttachment).modal('show');
    }

    function noPreviewHtml(fileName, message) {
        return `<div class="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-center">
                    <i class="bi bi-file-earmark-slash" style="font-size:4rem; color:#c0c0c0;"></i>
                    <p class="fw-semibold fs-14 mt-3 mb-1 text-muted">Preview Not Available</p>
                    <p class="fs-12 text-muted" style="max-width:380px;">${message}</p>
                    <p class="fs-11 text-muted fst-italic mt-1">${escapeHtml(fileName || '')}</p>
                </div>`;
    }

    function handlePrintIncident() {
        const kpCaseNo = $(CONFIG.selectors.divFormInner).find('[name="KPCaseNo"]').val();
        if (!kpCaseNo) {
            showToast('Save the incident first before printing.', 'warning');
            return;
        }
        window.open(`/Incident/PrintIncident?kpCaseNo=${encodeURIComponent(kpCaseNo)}`, '_blank');
    }

    // Formats party names for the list table.
    // 1 name: show as-is. 2+ names: show first name + "& N others" badge.
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
});