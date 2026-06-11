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
            getUpcomingSchedule: '/Incident/getUpcomingSchedule',
            saveSettlement: '/Incident/saveSettlement',
            updateSettlement: '/Incident/updateSettlement',
            deleteSettlement: '/Incident/deleteSettlement',
            getDashboard: '/Incident/getDashboard',
        },
        selectors: {
            // panels
            divSummaryCards: '#divSummaryCards',
            divList: '#divIncidentList',
            tblList: '#tblIncidentList',
            searchList: '#searchIncidentList',
            divForm: '#divIncidentForm',
            divFormInner: '#divIncidentInformation',
            btnNewIncident: '#btnNewIncident',
            btnBackToList: '#btnBackToList',
            btnSave: '#btnSave',
            btnClear: '#btnClear',
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
            // report preview
            mdlPreviewReport: '#mdlPreviewReport',
            pdfFrame: '#pdfFrame',
            // dashboard
            periodPills: '.dashboard-period-pills .nav-link',
            lblPeriodRange: '#lblPeriodRange',
            selMonth: '#selMonth',
            inpMonthYear: '#inpMonthYear',
            inpYear: '#inpYear',
            inpDateFrom: '#inpDateFrom',
            inpDateTo: '#inpDateTo',
            ctrlMonthly: '#ctrlMonthly',
            ctrlYearly: '#ctrlYearly',
            ctrlDateRange: '#ctrlDateRange',
            selTopResidentPartyType: '#selTopResidentPartyType',
            // all schedules modal
            mdlAllSchedules: '#mdlAllSchedules',
            tblAllSchedules: '#tblAllSchedules',
            searchAllSchedules: '#searchAllSchedules',
        }
    };

    // ── Module-level state ───────────────────────────────────

    let _settlementCache = [];
    let _chartTrend = null;
    let _chartCaseType = null;
    let _dashboardCache = null;
    let _activePeriod = 'Monthly';
    let _residentPage = 0;
    const _residentPerPage = 5;

    // Upcoming hearings
    let _upcomingCache = [];
    const _scheduleLimit = 5;

    // ── Init ─────────────────────────────────────────────────

    fnLoadCaseTypes();
    fnInitDashboard();
    attachEventHandlers();

    // ── Event Binding ────────────────────────────────────────

    function attachEventHandlers() {
        $(document)
            // list
            .on('input', CONFIG.selectors.searchList, debounce(fnLoadIncidentList, 250))
            .on('click', CONFIG.selectors.tblList + ' .btn-edit', handleEditRow)
            .on('click', CONFIG.selectors.tblList + ' .btn-print-form7', handlePrintForm7FromList)
            // form nav
            .on('click', CONFIG.selectors.btnNewIncident, handleNewIncident)
            .on('click', CONFIG.selectors.btnBackToList, handleBackToList)
            // form actions
            .on('click', CONFIG.selectors.btnSave, handleSave)
            .on('click', CONFIG.selectors.btnClear, handleClear)
            .on('change', CONFIG.selectors.inpStatus, handleStatusChange)
            .on('change', CONFIG.selectors.inpCaseTypeID, handleCaseTypeChange)
            // complainant
            .on('click', CONFIG.selectors.btnSaveComplainant, handleSaveComplainant)
            .on('click', CONFIG.selectors.divComplainantCards + ' .btn-edit-party', handleEditComplainant)
            .on('click', CONFIG.selectors.divComplainantCards + ' .btn-del-party', handleDeleteComplainant)
            .on('hidden.bs.modal', CONFIG.selectors.mdlAddComplainant, handleComplainantModalClose)
            // complainant resident lookup
            .on('shown.bs.modal', CONFIG.selectors.mdlFindComplainant, fnLoadComplainantResidents)
            .on('input', CONFIG.selectors.searchComplainantInput, debounce(fnLoadComplainantResidents, 250))
            .on('click', CONFIG.selectors.tblComplainantResident + ' .btn-select', handleComplainantResidentSelect)
            // respondent resident lookup
            .on('shown.bs.modal', CONFIG.selectors.mdlFindResident, fnLoadResidents)
            .on('input', CONFIG.selectors.searchResidentInput, debounce(fnLoadResidents, 250))
            .on('click', CONFIG.selectors.tblResident + ' .btn-select', handleResidentSelect)
            .on('hidden.bs.modal', CONFIG.selectors.mdlFindResident, handleResidentModalClose)
            .on('click', CONFIG.selectors.divRespondentCards + ' .btn-del-party', handleDeleteRespondent)
            // settlement
            .on('click', CONFIG.selectors.btnSaveSettlement, handleSaveSettlement)
            .on('click', CONFIG.selectors.divSettlementCards + ' .btn-edit-sett', handleEditSettlement)
            .on('click', CONFIG.selectors.divSettlementCards + ' .btn-del-sett', handleDeleteSettlement)
            .on('hidden.bs.modal', CONFIG.selectors.mdlSettlement, handleSettlementModalClose)
            .on('click', CONFIG.selectors.divSettlementCards + ' .btn-print-notice', handlePrintNotice)
            .on('click', CONFIG.selectors.divSettlementCards + ' .btn-print-summons', handlePrintSummons)
            // attachment
            .on('click', CONFIG.selectors.btnSaveAttachment, handleUploadAttachment)
            .on('click', '#divAttachmentList .btn-del-attach', handleDeleteAttachment)
            .on('click', '#divAttachmentList .btn-preview-attach', handlePreviewAttachment)
            .on('shown.bs.modal', CONFIG.selectors.mdlAttachment, handleAttachmentModalOpen)
            // form print
            .on('click', '#btnPrintIncident', handlePrintIncident)
            // dashboard
            .on('click', CONFIG.selectors.periodPills, handlePeriodPillClick)
            .on('click', '#btnApplyPeriod', handleApplyPeriod)
            .on('change', CONFIG.selectors.selTopResidentPartyType, handleTopResidentFilter)
            .on('click', '#btnResidentPrev', handleResidentPagePrev)
            .on('click', '#btnResidentNext', handleResidentPageNext)
            .on('click', '#btnViewAllSchedules', handleViewAllSchedules)
            .on('shown.bs.modal', CONFIG.selectors.mdlAllSchedules, fnLoadAllSchedulesTable)
            .on('input', CONFIG.selectors.searchAllSchedules, handleAllSchedulesSearch);
    }

    // ── Init helpers ─────────────────────────────────────────

    function fnInitDashboard() {
        var now = new Date();

        // Set control defaults
        $(CONFIG.selectors.selMonth).val(now.getMonth() + 1);
        $(CONFIG.selectors.inpMonthYear).val(now.getFullYear());
        $(CONFIG.selectors.inpYear).val(now.getFullYear());

        // Date Range defaults — last 7 days
        var to = new Date(now);
        var from = new Date(now);
        from.setDate(from.getDate() - 6);
        $(CONFIG.selectors.inpDateFrom).val(dashFmtDate(from));
        $(CONFIG.selectors.inpDateTo).val(dashFmtDate(to));

        // Apply correct initial visibility — Monthly is active on load
        applyPeriodControlVisibility('Monthly');

        // Load everything
        fnLoadIncidentList();
        fnLoadDashboard();
        fnLoadUpcomingSchedule();
    }

    // Single source of truth for showing/hiding period sub-controls
    function applyPeriodControlVisibility(period) {
        // Always hide everything first
        $('#ctrlMonthly').hide();
        $('#ctrlYearly').hide();
        $('#ctrlDateRange').hide();
        $('#btnApplyPeriod').hide();

        if (period === 'Weekly') {
            // No sub-controls for weekly
        } else if (period === 'Monthly') {
            $('#ctrlMonthly').css('display', 'inline-flex');
            $('#btnApplyPeriod').show();
        } else if (period === 'Yearly') {
            $('#ctrlYearly').css('display', 'inline-flex');
            $('#btnApplyPeriod').show();
        } else if (period === 'DateRange') {
            $('#ctrlDateRange').css('display', 'inline-flex');
            $('#btnApplyPeriod').show();
        }
    }

    // ── Load: Dashboard ──────────────────────────────────────

    function fnLoadDashboard() {
        const params = buildPeriodParams();

        doAjax(CONFIG.endpoints.getDashboard, 'GET', params).then(function (res) {
            if (!res) return;
            _dashboardCache = res;
            _residentPage = 0;

            renderKpiCards(res.Kpi);
            renderResolutionBar(res.Kpi);
            renderTrendChart(res.Trend, params.periodType);
            renderCaseTypeChart(res.CaseTypes);
            renderTopResidents(res.TopResidents, '');

            var from = res.Kpi && res.Kpi.PeriodFrom ? res.Kpi.PeriodFrom : '';
            var to = res.Kpi && res.Kpi.PeriodTo ? res.Kpi.PeriodTo : '';
            if (from && to) {
                $(CONFIG.selectors.lblPeriodRange).text(from + '  \u2192  ' + to);
            }
        }).catch(function () {
            showToast('Failed to load dashboard data.', 'danger');
        });
    }

    // ── Load: Upcoming Schedule ──────────────────────────────

    function fnLoadUpcomingSchedule() {
        // Fetch a generous set; the panel shows 5, the modal shows all.
        doAjax(CONFIG.endpoints.getUpcomingSchedule, 'GET', { limit: 100 }).then(function (res) {
            _upcomingCache = res || [];
            renderUpcomingSchedule();
        }).catch(function () {
            _upcomingCache = [];
            renderUpcomingSchedule();
        });
    }

    function renderUpcomingSchedule() {
        var $container = $('#divUpcomingSchedule');
        var all = _upcomingCache || [];
        $('#lblUpcomingCount').text(all.length);

        // Button label reflects total
        var $btn = $('#btnViewAllSchedules');
        if (all.length > _scheduleLimit) {
            $btn.html('<i class="bi bi-calendar-week me-1"></i> View All (' + all.length + ')');
        } else {
            $btn.html('<i class="bi bi-calendar-week me-1"></i> View All Schedules');
        }

        if (all.length === 0) {
            $container.html(
                '<div class="text-center py-4">' +
                '<i class="bi bi-calendar-x fs-24 text-muted"></i>' +
                '<p class="text-muted fs-11 mt-1 mb-0 fst-italic">No upcoming hearings.</p>' +
                '</div>'
            );
            return;
        }

        // Panel always shows only the first 5; the rest live in the modal
        var schedules = all.slice(0, _scheduleLimit);

        var today = new Date(); today.setHours(0, 0, 0, 0);
        var tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var accentColor = { Settle: '#198754', Unsettle: '#dc3545', Referred: '#ffc107', Pending: '#0d9488', '': '#0d9488' };

        // Group by date
        var groups = {};
        var order = [];
        schedules.forEach(function (s) {
            var dt = new Date(s.SettlementDate);
            var key = dt.getFullYear() + '-' + dt.getMonth() + '-' + dt.getDate();
            if (!groups[key]) { groups[key] = { date: dt, items: [] }; order.push(key); }
            groups[key].items.push(s);
        });

        var html = order.map(function (key) {
            var grp = groups[key];
            var d = new Date(grp.date); d.setHours(0, 0, 0, 0);
            var isToday = d.getTime() === today.getTime();
            var isTmrw = d.getTime() === tomorrow.getTime();

            var headLabel = fullDays[grp.date.getDay()] + ', ' + months[grp.date.getMonth()] + ' ' + grp.date.getDate();
            var headTag = isToday ? ' <span class="text-primary fw-semibold">· Today</span>'
                : isTmrw ? ' <span class="text-muted fw-normal">· Tomorrow</span>'
                    : '';
            var header = '<div class="inc-agenda-header fw-bold fs-13 mb-1 mt-3">' + headLabel + headTag + '</div>';

            var rows = grp.items.map(function (s) {
                var color = accentColor[s.Result || ''] || '#0d9488';
                var startTime = formatTime12(s.SettlementTime);
                var respondent = escapeHtml(s.RespondentName || s.KPCaseNo || '\u2014');
                var kpCaseNo = escapeHtml(s.KPCaseNo || '');
                var caseType = escapeHtml(s.CaseTypeName || '');
                var subtitle = caseType ? (kpCaseNo + '  \u00B7  ' + caseType) : kpCaseNo;

                return '<div class="inc-agenda-item d-flex align-items-stretch py-2 border-bottom">' +
                    '<div class="text-end pe-2 flex-shrink-0" style="width:60px;">' +
                    '<div class="fw-semibold fs-11 text-dark">' + startTime + '</div>' +
                    '<div class="text-muted" style="font-size:9px;">' + escapeHtml(s.Result || 'Pending') + '</div>' +
                    '</div>' +
                    '<div class="flex-shrink-0 me-2" style="width:3px;border-radius:3px;background:' + color + ';"></div>' +
                    '<div class="flex-grow-1 overflow-hidden">' +
                    '<div class="fw-bold fs-12 text-dark text-truncate">' + respondent + '</div>' +
                    '<div class="text-muted fs-10 text-truncate">' + subtitle + '</div>' +
                    '</div>' +
                    '</div>';
            }).join('');

            return header + rows;
        }).join('');

        $container.html(html);
    }

    // Opens the All Schedules modal (table populated on shown.bs.modal)
    function handleViewAllSchedules() {
        $(CONFIG.selectors.mdlAllSchedules).modal('show');
    }

    // Populates the modal DataTable with all cached upcoming hearings
    function fnLoadAllSchedulesTable() {
        var all = _upcomingCache || [];
        $('#lblAllSchedulesCount').text(all.length);
        $(CONFIG.selectors.searchAllSchedules).val('');

        initDataTable(CONFIG.selectors.tblAllSchedules, all, [
            {
                title: 'Date', data: 'SettlementDate',
                className: 'dt-start fw-semibold', orderable: false,
                render: function (d) { return parseMSDate4DTable(d); }
            },
            {
                title: 'Time', data: 'SettlementTime',
                className: 'dt-center', orderable: false,
                render: function (t) { return formatTime12(t); }
            },
            {
                title: 'Respondent', data: 'RespondentName',
                className: 'dt-start', orderable: false,
                render: function (n) { return escapeHtml(n || '\u2014'); }
            },
            {
                title: 'KP Case No.', data: 'KPCaseNo',
                className: 'dt-center', orderable: false,
                render: function (k) { return escapeHtml(k || '\u2014'); }
            },
            {
                title: 'Case Type', data: 'CaseTypeName',
                className: 'dt-start', orderable: false,
                render: function (c) { return escapeHtml(c || '\u2014'); }
            },
            {
                title: 'Result', data: 'Result',
                className: 'dt-center', orderable: false,
                render: function (r) {
                    var map = { Settle: 'success', Unsettle: 'danger', Referred: 'warning', Pending: 'primary' };
                    var v = r || 'Pending';
                    return createBadge('bg-' + (map[v] || 'secondary') + '-subtle text-' + (map[v] || 'secondary'), '', escapeHtml(v));
                }
            }
        ]);
    }

    function handleAllSchedulesSearch() {
        var term = $(CONFIG.selectors.searchAllSchedules).val();
        var dt = $(CONFIG.selectors.tblAllSchedules).DataTable();
        if (dt) dt.search(term).draw();
    }

    function fnLoadCaseTypes() {
        doAjax(CONFIG.endpoints.getCaseTypes, 'GET', {}).then(function (res) {
            var $sel = $(CONFIG.selectors.inpCaseTypeID);
            $sel.find('option:not(:first)').remove();
            res.forEach(function (ct) {
                $sel.append('<option value="' + ct.CaseTypeID + '">' + escapeHtml(ct.CaseTypeName) + '</option>');
            });
        });
    }

    function fnLoadComplaintTypes(caseTypeId, selectedId) {
        var $sel = $(CONFIG.selectors.inpComplaintTypeID);
        $sel.prop('disabled', true).find('option:not(:first)').remove();
        $sel.find('option:first').text('Loading...');

        doAjax(CONFIG.endpoints.getComplaintTypes, 'GET', { caseTypeId: caseTypeId }).then(function (res) {
            $sel.find('option:first').text('Select Complaint Type');
            res.forEach(function (ct) {
                $sel.append('<option value="' + ct.ComplaintTypeID + '">' + escapeHtml(ct.ComplaintTypeName) + '</option>');
            });
            if (selectedId) $sel.val(selectedId);
            $sel.prop('disabled', false);
        });
    }

    // ── Load: Incident List ──────────────────────────────────

    function fnLoadIncidentList() {
        var search = $(CONFIG.selectors.searchList).val();

        doAjax(CONFIG.endpoints.getData, 'GET', { searchKeyword: search }).then(function (res) {
            initDataTable(CONFIG.selectors.tblList, res, [
                {
                    title: 'KP Case No.', data: 'KPCaseNo',
                    className: 'dt-start fw-semibold', orderable: false
                },
                {
                    title: 'Incident Date', data: 'IncidentDate',
                    className: 'dt-center', orderable: false,
                    render: function (d) { return parseMSDate4DTable(d); }
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
                        var map = {
                            'Open': 'primary', 'On-going': 'warning',
                            'Settled': 'success', 'Transferred': 'info', 'Dismissed': 'secondary'
                        };
                        return createBadge('bg-' + (map[data] || 'secondary'), '', escapeHtml(data || ''));
                    }
                },
                {
                    title: 'For Transfer', data: 'IncidentForTransfer',
                    className: 'dt-center', orderable: false,
                    render: function (d) {
                        return d
                            ? createBadge('bg-danger', '', 'Yes')
                            : createBadge('bg-light text-dark border', '', 'No');
                    }
                },
                {
                    title: 'Actions', data: null,
                    className: 'dt-center', width: '160px', orderable: false,
                    render: function (data, type, row) {
                        return '<div class="d-flex gap-1 justify-content-center">' +
                            '<button class="btn btn-main-outline btn-sm py-1 btn-edit" title="Edit Incident">' +
                            '<i class="bi bi-pencil-square me-1"></i>Edit</button>' +
                            '<button class="btn btn-main-outline btn-sm py-1 btn-print-form7" data-id="' + row.IncidentID + '" title="Print KP Form 7">' +
                            '<i class="bi bi-printer me-1"></i>Form 7</button>' +
                            '</div>';
                    }
                }
            ]);
        });
    }

    // ── Load: Settlements ────────────────────────────────────

    function fnLoadSettlements() {
        var kpCaseNo = $(CONFIG.selectors.hidSettlementKPCaseNo).val()
            || $(CONFIG.selectors.divFormInner).find('[name="KPCaseNo"]').val();
        if (!kpCaseNo) return;

        doAjax(CONFIG.endpoints.getSettlements, 'GET', { kpCaseNo: kpCaseNo }).then(function (res) {
            _settlementCache = res || [];
            var $container = $(CONFIG.selectors.divSettlementCards);

            if (!res || res.length === 0) {
                $container.html('<div class="text-center py-4"><i class="bi bi-calendar-x fs-24 text-muted"></i><p class="text-muted fs-11 mt-1 mb-0">No settlement schedules yet.</p></div>');
                return;
            }

            var resultColor = { Settle: 'success', Unsettle: 'danger', Referred: 'warning', Pending: 'secondary' };

            var cards = res.map(function (s) {
                var sid = s.IncidentSettlementId;
                var color = resultColor[s.Result] || 'secondary';
                var date = parseMSDate4DTable(s.SettlementDate);
                var time = formatTime12(s.SettlementTime);
                var result = escapeHtml(s.Result || 'Pending');
                var remarks = s.Remarks
                    ? escapeHtml(s.Remarks)
                    : '<span class="fst-italic text-muted">No remarks</span>';

                return '<div class="settlement-card border rounded-3 p-3 position-relative" data-sid="' + sid + '" style="border-left:4px solid var(--bs-' + color + ') !important;">' +
                    '<div class="d-flex justify-content-between align-items-start mb-2">' +
                    '<div class="d-flex align-items-center gap-2"><i class="bi bi-calendar-event text-muted"></i>' +
                    '<div><div class="fw-semibold fs-12">' + date + '</div>' +
                    '<div class="text-muted fs-10"><i class="bi bi-clock me-1"></i>' + time + '</div></div></div>' +
                    '<span class="badge bg-' + color + '-subtle text-' + color + ' fs-10 fw-semibold px-2 py-1">' + result + '</span></div>' +
                    '<div class="fs-11 text-muted mb-3"><i class="bi bi-chat-left-text me-1"></i>' + remarks + '</div>' +
                    '<div class="d-flex justify-content-between align-items-center pt-2 border-top">' +
                    '<div class="d-flex gap-1">' +
                    '<button class="btn btn-main-outline btn-sm py-1 px-2 btn-print-notice" data-sid="' + sid + '" title="KP Form 8"><i class="bi bi-printer me-1"></i>Form 8</button>' +
                    '<button class="btn btn-main-outline btn-sm py-1 px-2 btn-print-summons" data-sid="' + sid + '" title="KP Form 9"><i class="bi bi-printer me-1"></i>Form 9</button>' +
                    '</div>' +
                    '<div class="d-flex gap-1">' +
                    '<button class="btn btn-main-outline btn-outline-secondary btn-sm py-1 px-2 btn-edit-sett" data-sid="' + sid + '"><i class="bi bi-pencil-square"></i></button>' +
                    '<button class="btn btn-danger btn-sm py-1 px-2 btn-del-sett" data-sid="' + sid + '"><i class="bi bi-trash"></i></button>' +
                    '</div></div></div>';
            }).join('');

            $container.html(cards);
        });
    }

    // ── Load: Attachments ────────────────────────────────────

    function fnLoadAttachments() {
        var kpCaseNo = $(CONFIG.selectors.divFormInner).find('[name="KPCaseNo"]').val();
        if (!kpCaseNo) {
            $(CONFIG.selectors.divAttachmentList).html('<span class="text-muted fs-11 fst-italic">Save the incident first to add attachments.</span>');
            return;
        }

        doAjax(CONFIG.endpoints.getAttachments, 'GET', { kpCaseNo: kpCaseNo }).then(function (res) {
            if (!res || res.length === 0) {
                $(CONFIG.selectors.divAttachmentList).html('<span class="text-muted fs-11 fst-italic">No attachments yet.</span>');
                return;
            }

            var items = res.map(function (a) {
                var filePath = a.FileLocation || '';
                var fileName = filePath.split('/').pop();
                var ext = fileName.split('.').pop().toLowerCase();
                var icon = getFileIcon(fileName);
                var label = escapeHtml(a.Description || fileName || 'Document');
                var date = parseMSDate4DTable(a.DateUploaded);
                return '<div class="d-flex align-items-center justify-content-between py-2 border-bottom">' +
                    '<div class="d-flex align-items-center gap-2">' +
                    '<i class="' + icon + ' fs-18 text-muted"></i>' +
                    '<div><div class="fw-semibold fs-12">' + label + '</div><div class="text-muted fs-10">' + date + '</div></div></div>' +
                    '<div class="d-flex gap-1">' +
                    '<button class="btn btn-sm btn-main-outline py-1 px-2 btn-preview-attach" data-path="' + filePath + '" data-name="' + escapeHtml(fileName) + '" data-desc="' + escapeHtml(a.Description || '') + '" data-ext="' + ext + '"><i class="bi bi-eye"></i></button>' +
                    '<button class="btn btn-sm btn-danger py-1 px-2 btn-del-attach" data-id="' + a.IncidentAttachementId + '"><i class="bi bi-trash"></i></button>' +
                    '</div></div>';
            }).join('');

            $(CONFIG.selectors.divAttachmentList).html(items);
        });
    }

    // ── Load: Residents ──────────────────────────────────────

    function fnLoadResidents() {
        var search = $(CONFIG.selectors.searchResidentInput).val();
        doAjax(CONFIG.endpoints.getResidents, 'GET', { searchKeyword: search }).then(function (res) {
            initDataTable(CONFIG.selectors.tblResident, res, [
                { title: 'Resident', data: 'Resident', className: 'dt-start fw-semibold', orderable: false },
                { title: 'Household', data: 'Household', className: 'dt-start', orderable: false },
                { title: 'Sex', data: 'Sex', className: 'dt-center', orderable: false },
                { title: 'Birthdate', data: 'Birthdate', className: 'dt-center', orderable: false, render: function (d) { return parseMSDate4DTable(d); } },
                { title: 'Age', data: 'Age', className: 'dt-center', orderable: false },
                { title: 'Birth Place', data: 'BirthPlace', className: 'dt-start', orderable: false },
                {
                    title: 'Action', data: null, className: 'dt-center', width: '80px', orderable: false,
                    render: function () {
                        return '<button class="btn btn-main-outline btn-outline-secondary btn-sm py-1 btn-select">Select <span class="icon-load me-1"></span></button>';
                    }
                }
            ]);
        });
    }

    function fnLoadComplainantResidents() {
        var search = $(CONFIG.selectors.searchComplainantInput).val();
        doAjax(CONFIG.endpoints.getResidents, 'GET', { searchKeyword: search }).then(function (res) {
            initDataTable(CONFIG.selectors.tblComplainantResident, res, [
                { title: 'Resident', data: 'Resident', className: 'dt-start fw-semibold', orderable: false },
                { title: 'Household', data: 'Household', className: 'dt-start', orderable: false },
                { title: 'Sex', data: 'Sex', className: 'dt-center', orderable: false },
                { title: 'Birthdate', data: 'Birthdate', className: 'dt-center', orderable: false, render: function (d) { return parseMSDate4DTable(d); } },
                { title: 'Age', data: 'Age', className: 'dt-center', orderable: false },
                { title: 'Birth Place', data: 'BirthPlace', className: 'dt-start', orderable: false },
                {
                    title: 'Action', data: null, className: 'dt-center', width: '80px', orderable: false,
                    render: function () {
                        return '<button class="btn btn-main-outline btn-outline-secondary btn-sm py-1 btn-select">Select <span class="icon-load me-1"></span></button>';
                    }
                }
            ]);
        });
    }

    function fnLoadParties(incidentId) {
        if (!incidentId) return;
        doAjax(CONFIG.endpoints.getParties, 'GET', { incidentId: incidentId }).then(function (res) {
            renderPartyCards(res.filter(function (p) { return p.PartyType === 'Complainant'; }), 'Complainant');
            renderPartyCards(res.filter(function (p) { return p.PartyType === 'Respondent'; }), 'Respondent');
        });
    }

    // ── Handlers: Navigation ─────────────────────────────────

    function handleNewIncident() {
        clearContent(CONFIG.selectors.divFormInner);
        $(CONFIG.selectors.inpComplaintTypeID).prop('disabled', true).find('option:first').text('Select Case Type first');
        toggleSettledDate();
        renderPartyCards([], 'Complainant');
        renderPartyCards([], 'Respondent');
        _settlementCache = [];
        $(CONFIG.selectors.divSettlementCards).html('<div class="text-center py-4"><i class="bi bi-calendar-x fs-24 text-muted"></i><p class="text-muted fs-11 mt-1 mb-0">No settlement schedules yet.</p></div>');
        $(CONFIG.selectors.divAttachmentList).html('<span class="text-muted fs-11 fst-italic">No attachments yet.</span>');
        showFormPanel();
    }

    function handleBackToList() {
        showListPanel();
        fnLoadIncidentList();
        fnLoadDashboard();
    }

    function handleEditRow() {
        var data = getSelectedRowData(this, CONFIG.selectors.tblList);
        setValues(CONFIG.selectors.divFormInner, data);
        toggleSettledDate();
        fnLoadParties(data.IncidentID);
        if (data.CaseTypeID) fnLoadComplaintTypes(data.CaseTypeID, data.ComplaintTypeID);
        $(CONFIG.selectors.hidSettlementKPCaseNo).val(data.KPCaseNo);
        fnLoadSettlements();
        fnLoadAttachments();
        showFormPanel();
    }

    // ── Handlers: Form ───────────────────────────────────────

    function handleCaseTypeChange() {
        var caseTypeId = $(this).val();
        if (!caseTypeId) return;
        fnLoadComplaintTypes(caseTypeId, null);
    }

    function handleSave() {
        if (!validateRequiredFields(CONFIG.selectors.divFormInner)) return;

        var data = getValues(CONFIG.selectors.divFormInner);
        var isUpdate = $(CONFIG.selectors.hidIncidentID).val() !== '';
        var endpoint = isUpdate ? CONFIG.endpoints.updateData : CONFIG.endpoints.saveData;
        var label = isUpdate ? 'updated' : 'saved';

        doAjax(endpoint, 'POST', data)
            .then(function (res) {
                if (res && res.rtn.success === true) {
                    showToast('Incident successfully ' + label + '.', 'success');
                    if (!isUpdate) $(CONFIG.selectors.hidIncidentID).val(res.rtn.value);
                    $(CONFIG.selectors.hidSettlementKPCaseNo).val(data.KPCaseNo);
                    fnLoadParties($(CONFIG.selectors.hidIncidentID).val());
                    fnLoadSettlements();
                    fnLoadAttachments();
                } else {
                    showToast(res.rtn.remarks, 'danger');
                }
            })
            .catch(function () { showToast('Failed to save incident.', 'danger'); });
    }

    function handleClear() {
        clearContent(CONFIG.selectors.divFormInner);
        $(CONFIG.selectors.inpComplaintTypeID).prop('disabled', true).find('option:first').text('Select Case Type first');
        toggleSettledDate();
        renderPartyCards([], 'Complainant');
        renderPartyCards([], 'Respondent');
    }

    function handleStatusChange() {
        toggleSettledDate();
    }

    // ── Handlers: Respondent ─────────────────────────────────

    function handleResidentSelect() {
        var row = getSelectedRowData(this, CONFIG.selectors.tblResident);
        fnEnsureIncidentSaved(function (incidentId) {
            var dto = {
                IncidentID: incidentId,
                PartyType: 'Respondent',
                ResidentId: row.ResidentId || row.Id || null,
                FullName: row.Resident || '',
                Gender: row.Sex || '',
                CivilStatus: row.CivilStatus || '',
                Address: row.Household || '',
                ContactNo: row.ContactNo || ''
            };
            doAjax(CONFIG.endpoints.saveParty, 'POST', dto).then(function (res) {
                if (res && res.rtn.success === true) {
                    showToast('Respondent added.', 'success');
                    $(CONFIG.selectors.mdlFindResident).modal('hide');
                    fnLoadParties(incidentId);
                } else {
                    showToast(res.rtn.remarks, 'danger');
                }
            }).catch(function () { showToast('Failed to add respondent.', 'danger'); });
        });
    }

    function handleResidentModalClose() {
        $(CONFIG.selectors.searchResidentInput).val('');
        resetDataTable(CONFIG.selectors.tblResident);
    }

    // ── Handlers: Complainant ────────────────────────────────

    function handleComplainantResidentSelect() {
        var row = getSelectedRowData(this, CONFIG.selectors.tblComplainantResident);
        fnEnsureIncidentSaved(function (incidentId) {
            var dto = {
                IncidentID: incidentId,
                PartyType: 'Complainant',
                ResidentId: row.ResidentId || row.Id || null,
                FullName: row.Resident || '',
                Gender: row.Sex || '',
                CivilStatus: row.CivilStatus || '',
                Address: row.Household || '',
                ContactNo: row.ContactNo || ''
            };
            doAjax(CONFIG.endpoints.saveParty, 'POST', dto).then(function (res) {
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
        var fullName = $(CONFIG.selectors.inpCFullName).val();
        if (!fullName) { showToast('Full Name is required.', 'warning'); return; }

        var partyId = $(CONFIG.selectors.hidComplainantPartyId).val();
        var isUpdate = partyId !== '';

        if (isUpdate) {
            var dto = {
                IncidentPartyId: partyId,
                FullName: $(CONFIG.selectors.inpCFullName).val(),
                Gender: $(CONFIG.selectors.inpCGender).val(),
                CivilStatus: $(CONFIG.selectors.inpCCivilStatus).val(),
                Address: $(CONFIG.selectors.inpCAddress).val(),
                ContactNo: $(CONFIG.selectors.inpCContactNo).val()
            };
            doAjax(CONFIG.endpoints.updateParty, 'POST', dto).then(function (res) {
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

        fnEnsureIncidentSaved(function (incidentId) {
            var dto = {
                IncidentID: incidentId,
                PartyType: 'Complainant',
                ResidentId: $(CONFIG.selectors.hidComplainantResidentId).val() || null,
                FullName: $(CONFIG.selectors.inpCFullName).val(),
                Gender: $(CONFIG.selectors.inpCGender).val(),
                CivilStatus: $(CONFIG.selectors.inpCCivilStatus).val(),
                Address: $(CONFIG.selectors.inpCAddress).val(),
                ContactNo: $(CONFIG.selectors.inpCContactNo).val()
            };
            doAjax(CONFIG.endpoints.saveParty, 'POST', dto).then(function (res) {
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
        var id = $(this).data('id');
        var incidentId = $(CONFIG.selectors.hidIncidentID).val();
        doAjax(CONFIG.endpoints.getParties, 'GET', { incidentId: incidentId }).then(function (res) {
            var p = res.find(function (x) { return x.IncidentPartyId == id; });
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
        var id = $(this).data('id');
        if (!confirm('Remove this complainant?')) return;
        doAjax(CONFIG.endpoints.deleteParty, 'POST', { id: id }).then(function (res) {
            if (res && res.rtn.success === true) {
                showToast('Complainant removed.', 'success');
                fnLoadParties($(CONFIG.selectors.hidIncidentID).val());
            } else {
                showToast(res.rtn.remarks, 'danger');
            }
        });
    }

    function handleDeleteRespondent() {
        var id = $(this).data('id');
        if (!confirm('Remove this respondent?')) return;
        doAjax(CONFIG.endpoints.deleteParty, 'POST', { id: id }).then(function (res) {
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

    // ── Handlers: Settlement ─────────────────────────────────

    function handleSaveSettlement() {
        if (!validateRequiredFields(CONFIG.selectors.divSettlementForm)) return;

        var data = getValues(CONFIG.selectors.divSettlementForm);
        var isUpdate = $(CONFIG.selectors.hidSettlementId).val() !== '';
        var endpoint = isUpdate ? CONFIG.endpoints.updateSettlement : CONFIG.endpoints.saveSettlement;

        if (!data.KPCaseNo) {
            data.KPCaseNo = $(CONFIG.selectors.divFormInner).find('[name="KPCaseNo"]').val();
        }

        doAjax(endpoint, 'POST', data)
            .then(function (res) {
                if (res && res.rtn.success === true) {
                    showToast('Settlement schedule saved.', 'success');
                    $(CONFIG.selectors.mdlSettlement).modal('hide');
                    fnLoadSettlements();
                } else {
                    showToast(res.rtn.remarks, 'danger');
                }
            })
            .catch(function () { showToast('Failed to save settlement.', 'danger'); });
    }

    function handleEditSettlement() {
        var sid = $(this).data('sid');
        var data = _settlementCache.find(function (s) { return s.IncidentSettlementId == sid; });
        if (!data) return;
        setValues(CONFIG.selectors.divSettlementForm, data);
        $(CONFIG.selectors.mdlSettlement).modal('show');
    }

    function handleDeleteSettlement() {
        var sid = $(this).data('sid');
        if (!sid || !confirm('Delete this settlement schedule?')) return;
        doAjax(CONFIG.endpoints.deleteSettlement, 'POST', { id: sid })
            .then(function (res) {
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

    // ── Handlers: Attachment ─────────────────────────────────

    function handleUploadAttachment() {
        var kpCaseNo = $(CONFIG.selectors.divFormInner).find('[name="KPCaseNo"]').val();
        var description = $(CONFIG.selectors.inpAttachmentDescription).val();
        var fileInput = $(CONFIG.selectors.inpAttachmentFile)[0];

        if (!kpCaseNo) { showToast('Save the incident first before uploading attachments.', 'warning'); return; }
        if (!fileInput.files.length) { showToast('Please select a file.', 'warning'); return; }

        var formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('kpCaseNo', kpCaseNo);
        formData.append('description', description);

        $.ajax({
            url: CONFIG.endpoints.uploadAttachment, type: 'POST', data: formData,
            processData: false, contentType: false,
            headers: { 'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val() }
        })
            .then(function (res) {
                if (res && res.rtn.success === true) {
                    showToast('Attachment uploaded.', 'success');
                    $(CONFIG.selectors.mdlAttachment).modal('hide');
                    fnLoadAttachments();
                } else {
                    showToast(res.rtn.remarks, 'danger');
                }
            })
            .catch(function () { showToast('Failed to upload attachment.', 'danger'); });
    }

    function handleDeleteAttachment() {
        var id = $(this).data('id');
        if (!confirm('Delete this attachment?')) return;
        doAjax(CONFIG.endpoints.deleteAttachment, 'POST', { id: id })
            .then(function (res) {
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
        var $btn = $(this);
        var filePath = $btn.data('path');
        var fileName = $btn.data('name');
        var desc = $btn.data('desc');
        var ext = ($btn.data('ext') || '').toLowerCase();

        var isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].indexOf(ext) > -1;
        var isPdf = ext === 'pdf';

        $('#lblPreviewFileName').text(fileName || 'Document Preview');
        $('#lblPreviewDescription').text(desc || '');
        $('#lnkDownloadAttachment').attr('href', filePath);

        var bodyHtml = '';
        if (isImage) {
            bodyHtml = '<div class="text-center"><img src="' + filePath + '" alt="' + escapeHtml(fileName) + '" class="img-fluid rounded shadow-sm" style="max-height:620px;object-fit:contain;"></div>';
        } else if (isPdf) {
            bodyHtml = '<iframe src="' + filePath + '" width="100%" height="620px" style="border:none;border-radius:6px;"></iframe>';
        } else {
            bodyHtml = noPreviewHtml(fileName, '<strong>' + ext.toUpperCase() + '</strong> files cannot be previewed. Use the Download button.');
        }

        $('#divPreviewBody').html(bodyHtml);
        $(CONFIG.selectors.mdlPreviewAttachment).modal('show');
    }

    // ── Handlers: Print ──────────────────────────────────────

    function handlePrintIncident() {
        var incidentId = $(CONFIG.selectors.hidIncidentID).val();
        if (!incidentId) { showToast('Save the incident first before printing.', 'warning'); return; }
        openReportPreview('/Reports/GENERATE_KPForm7Complaint?IncidentId=' + encodeURIComponent(incidentId));
    }

    function handlePrintForm7FromList() {
        var incidentId = $(this).data('id');
        if (!incidentId) { showToast('Could not retrieve incident. Please try again.', 'warning'); return; }
        openReportPreview('/Reports/GENERATE_KPForm7Complaint?IncidentId=' + encodeURIComponent(incidentId));
    }

    function handlePrintNotice() {
        var sid = $(this).data('sid');
        var incidentId = $(CONFIG.selectors.hidIncidentID).val();
        if (!incidentId || !sid) { showToast('Incident data is missing. Please try again.', 'warning'); return; }
        openReportPreview('/Reports/GENERATE_KPForm8NoticeOfHearing?IncidentId=' + encodeURIComponent(incidentId) + '&SettlementId=' + encodeURIComponent(sid));
    }

    function handlePrintSummons() {
        var sid = $(this).data('sid');
        var incidentId = $(CONFIG.selectors.hidIncidentID).val();
        if (!incidentId || !sid) { showToast('Incident data is missing. Please try again.', 'warning'); return; }
        openReportPreview('/Reports/GENERATE_KPForm9Summons?IncidentId=' + encodeURIComponent(incidentId) + '&SettlementId=' + encodeURIComponent(sid));
    }

    // ── Handlers: Dashboard period ───────────────────────────

    function handlePeriodPillClick() {
        var period = $(this).data('period');
        if (!period) return;
        _activePeriod = period;

        $(CONFIG.selectors.periodPills).removeClass('active');
        $(this).addClass('active');

        applyPeriodControlVisibility(period);

        // Weekly auto-fires; others wait for Apply
        if (period === 'Weekly') {
            fnLoadDashboard();
        }
    }

    function handleApplyPeriod() {
        fnLoadDashboard();
    }

    function handleTopResidentFilter() {
        if (!_dashboardCache) return;
        _residentPage = 0;
        var partyType = $(CONFIG.selectors.selTopResidentPartyType).val();
        renderTopResidents(_dashboardCache.TopResidents, partyType);
    }

    function handleResidentPagePrev() {
        if (_residentPage <= 0) return;
        _residentPage--;
        var partyType = $(CONFIG.selectors.selTopResidentPartyType).val();
        renderTopResidents(_dashboardCache ? _dashboardCache.TopResidents : [], partyType);
    }

    function handleResidentPageNext() {
        var partyType = $(CONFIG.selectors.selTopResidentPartyType).val();
        var filtered = getFilteredResidents(_dashboardCache ? _dashboardCache.TopResidents : [], partyType);
        var maxPage = Math.max(0, Math.ceil(filtered.length / _residentPerPage) - 1);
        if (_residentPage >= maxPage) return;
        _residentPage++;
        renderTopResidents(_dashboardCache ? _dashboardCache.TopResidents : [], partyType);
    }

    // ── Dashboard Renderers ──────────────────────────────────

    function renderKpiCards(kpi) {
        if (!kpi) return;
        var total = kpi.TotalIncidents || 0;

        function pct(n) {
            return total > 0 ? ' ' + Math.round(100 * n / total) + '%' : ' 0%';
        }

        // Main KPIs
        $('#statTotal').text(total);
        $('#statTotalSub').text(total === 1 ? '1 record this period' : total + ' records this period');
        $('#statSettlementRate').text(kpi.SettlementRate + '%');
        $('#statAvgDays').text(Math.round(kpi.AvgDaysToSettle));

        // Supporting KPIs
        $('#statOpen').text(kpi.TotalOpen);
        $('#statOpenPct').text(pct(kpi.TotalOpen));

        $('#statOngoing').text(kpi.TotalOngoing);
        $('#statOngoingPct').text(pct(kpi.TotalOngoing));

        $('#statSettled').text(kpi.TotalSettled);
        $('#statSettledPct').text(pct(kpi.TotalSettled));

        $('#statDismissed').text(kpi.TotalDismissed);
        $('#statDismissedPct').text(pct(kpi.TotalDismissed));

        $('#statTotalAmount').text(formatCurrency(kpi.TotalAmount));
        $('#statAvgAmount').text(formatCurrency(kpi.AvgAmount));
    }

    function renderResolutionBar(kpi) {
        if (!kpi) return;
        var total = kpi.TotalIncidents || 0;

        if (total === 0) {
            $('#divResolutionBar').html('<div class="bar-seg" style="width:100%;background:#e9ecef;"></div>');
            return;
        }

        var segments = [
            { key: 'Open', count: kpi.TotalOpen, color: '#0dcaf0' },
            { key: 'On-going', count: kpi.TotalOngoing, color: '#ffc107' },
            { key: 'Settled', count: kpi.TotalSettled, color: '#198754' },
            { key: 'Dismissed', count: kpi.TotalDismissed, color: '#6c757d' }
        ];

        var bars = segments
            .filter(function (s) { return s.count > 0; })
            .map(function (s) {
                var w = ((s.count / total) * 100).toFixed(1);
                return '<div class="bar-seg" style="width:' + w + '%;background:' + s.color + ';" title="' + s.key + ': ' + s.count + ' (' + w + '%)"></div>';
            }).join('');

        $('#divResolutionBar').html(bars);
    }

    function renderTrendChart(trendData, periodType) {
        var ctx = document.getElementById('chartTrend');
        if (!ctx) return;

        if (_chartTrend) { _chartTrend.destroy(); _chartTrend = null; }

        var labels = [], values = [];

        if (!trendData || trendData.length === 0) {
            $('#lblTrendSubtitle').text('No data for this period');
        } else {
            if (periodType === 'Yearly') {
                labels = trendData.map(function (d) { return d.PeriodLabel || ('Month ' + d.PeriodNo); });
                values = trendData.map(function (d) { return d.TotalCount || d.TrendCount || 0; });
                $('#lblTrendSubtitle').text('Monthly breakdown');
            } else {
                var moShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                labels = trendData.map(function (d) {
                    var dt = new Date(d.TrendDate);
                    return moShort[dt.getMonth()] + ' ' + dt.getDate();
                });
                values = trendData.map(function (d) { return d.TrendCount || 0; });
                $('#lblTrendSubtitle').text(trendData.length + ' day' + (trendData.length !== 1 ? 's' : '') + ' with activity');
            }
        }

        _chartTrend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Incidents',
                    data: values,
                    backgroundColor: 'rgba(26,108,138,0.75)',
                    borderColor: '#1a6c8a',
                    borderWidth: 1,
                    borderRadius: 5,
                    hoverBackgroundColor: 'rgba(26,108,138,1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (c) { return ' ' + c.parsed.y + ' incident' + (c.parsed.y !== 1 ? 's' : ''); }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: 'rgba(0,0,0,.05)' } },
                    x: { ticks: { font: { size: 10 } }, grid: { display: false } }
                }
            }
        });
    }

    function renderCaseTypeChart(caseTypes) {
        var ctx = document.getElementById('chartCaseType');
        if (!ctx) return;

        if (_chartCaseType) { _chartCaseType.destroy(); _chartCaseType = null; }

        if (!caseTypes || caseTypes.length === 0) {
            $('#divCaseTypeLegend').html('<span class="text-muted fs-11 fst-italic">No data.</span>');
            return;
        }

        var palette = ['#1a6c8a', '#0d9488', '#0d6efd', '#7c3aed', '#ea580c', '#ffc107', '#198754', '#dc3545', '#0dcaf0', '#6c757d'];
        var labels = caseTypes.map(function (c) { return c.Label || 'Unknown'; });
        var values = caseTypes.map(function (c) { return c.Value || 0; });
        var colors = labels.map(function (_, i) { return palette[i % palette.length]; });
        var total = values.reduce(function (a, b) { return a + b; }, 0);

        _chartCaseType = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 6
                }]
            },
            options: {
                cutout: '68%',
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (c) {
                                var p = total > 0 ? Math.round(100 * c.parsed / total) : 0;
                                return ' ' + c.label + ': ' + c.parsed + ' (' + p + '%)';
                            }
                        }
                    }
                }
            }
        });

        $('#chartCaseTypeCenter').html(
            '<div class="fw-bold fs-16" style="color:#1a3a5c;">' + total + '</div>' +
            '<div class="text-muted" style="font-size:10px;">cases</div>'
        );

        var legendHtml = caseTypes.map(function (c, i) {
            var p = total > 0 ? Math.round(100 * c.Value / total) : 0;
            return '<div class="d-flex align-items-center gap-2">' +
                '<span style="width:10px;height:10px;border-radius:50%;background:' + colors[i] + ';flex-shrink:0;display:inline-block;"></span>' +
                '<span class="fs-11 text-muted flex-grow-1" style="min-width:0;line-height:1.2;" title="' + escapeHtml(c.Label) + '">' + escapeHtml(c.Label) + '</span>' +
                '<span class="fw-semibold fs-11 ms-2 flex-shrink-0">' + c.Value + '</span>' +
                '<span class="text-muted fs-10 flex-shrink-0">' + p + '%</span>' +
                '</div>';
        }).join('');

        $('#divCaseTypeLegend').html(legendHtml);
    }

    // ── Top Residents ────────────────────────────────────────

    function getFilteredResidents(residents, partyTypeFilter) {
        if (!residents) return [];
        if (!partyTypeFilter) return residents;
        return residents.filter(function (r) { return r.PartyType === partyTypeFilter; });
    }

    function renderTopResidents(residents, partyTypeFilter) {
        var $container = $('#divTopResidentCards');
        var filtered = getFilteredResidents(residents, partyTypeFilter);

        if (filtered.length === 0) {
            $container.html('<div class="text-center py-3"><i class="bi bi-person-dash fs-24 text-muted"></i><p class="text-muted fs-11 fst-italic mt-1 mb-0">No data for this period.</p></div>');
            $('#btnResidentPrev').prop('disabled', true);
            $('#btnResidentNext').prop('disabled', true);
            $('#lblResidentPage').text('—');
            return;
        }

        var maxPage = Math.max(0, Math.ceil(filtered.length / _residentPerPage) - 1);
        if (_residentPage > maxPage) _residentPage = maxPage;
        var start = _residentPage * _residentPerPage;
        var pageData = filtered.slice(start, start + _residentPerPage);

        var rankColors = ['#ea580c', '#6c757d', '#a16207', '#1a3a5c', '#1a3a5c'];

        var cards = pageData.map(function (r, i) {
            var globalRank = start + i + 1;
            var rankColor = rankColors[Math.min(globalRank - 1, rankColors.length - 1)];
            var partyBadge = r.PartyType === 'Complainant'
                ? '<span class="badge bg-primary-subtle text-primary fs-10">Complainant</span>'
                : '<span class="badge bg-danger-subtle text-danger fs-10">Respondent</span>';
            var residentIcon = r.ResidentId
                ? '<i class="bi bi-check-circle-fill text-success ms-1 fs-10" title="Registered Resident"></i>'
                : '';

            return '<div class="kpi-card py-2 px-3">' +
                '<div class="d-flex justify-content-between align-items-start">' +
                '<div class="d-flex align-items-center gap-2">' +
                '<span class="fw-bold fs-14" style="color:' + rankColor + ';min-width:18px;">' + globalRank + '</span>' +
                '<div>' +
                '<div class="fw-semibold fs-12">' + escapeHtml(r.ResidentName || '\u2014') + ' ' + residentIcon + '</div>' +
                '<div class="mt-1 d-flex align-items-center flex-wrap gap-2">' +
                partyBadge +
                '<span class="fs-10 text-muted">' +
                '<span class="text-info">' + r.OpenCount + ' open</span> \xB7 ' +
                '<span class="text-warning">' + r.OngoingCount + ' on-going</span> \xB7 ' +
                '<span class="text-success">' + r.SettledCount + ' settled</span>' +
                '</span>' +
                '</div>' +
                '</div></div>' +
                '<div class="text-end"><div class="fw-bold fs-16" style="color:#1a3a5c;">' + r.CaseCount + '</div><div class="text-muted fs-10">cases</div></div>' +
                '</div></div>';
        }).join('');

        $container.html(cards);

        $('#btnResidentPrev').prop('disabled', _residentPage <= 0);
        $('#btnResidentNext').prop('disabled', _residentPage >= maxPage);
        $('#lblResidentPage').text((start + 1) + '\u2013' + Math.min(start + _residentPerPage, filtered.length) + ' of ' + filtered.length);
    }

    // ── Period params builder ────────────────────────────────

    function buildPeriodParams() {
        var params = { periodType: _activePeriod };
        var now = new Date();

        if (_activePeriod === 'Monthly') {
            // Last 30 days from today, filtered by the selected month/year
            params.month = parseInt($(CONFIG.selectors.selMonth).val(), 10) || (now.getMonth() + 1);
            params.year = parseInt($(CONFIG.selectors.inpMonthYear).val(), 10) || now.getFullYear();
        } else if (_activePeriod === 'Yearly') {
            params.year = parseInt($(CONFIG.selectors.inpYear).val(), 10) || now.getFullYear();
        } else if (_activePeriod === 'Weekly') {
            // Last 7 days (today − 6 → today)
            var weekTo = new Date(now);
            var weekFrom = new Date(now);
            weekFrom.setDate(weekFrom.getDate() - 6);
            params.dateFrom = dashFmtDate(weekFrom);
            params.dateTo = dashFmtDate(weekTo);
        } else if (_activePeriod === 'DateRange') {
            params.dateFrom = $(CONFIG.selectors.inpDateFrom).val();
            params.dateTo = $(CONFIG.selectors.inpDateTo).val();
        }

        return params;
    }

    // ── Panel helpers ────────────────────────────────────────

    function showListPanel() {
        $(CONFIG.selectors.divForm).hide();
        $(CONFIG.selectors.divSummaryCards).show();
        $(CONFIG.selectors.divList).show();
    }

    function showFormPanel() {
        $(CONFIG.selectors.divSummaryCards).hide();
        $(CONFIG.selectors.divList).hide();
        $(CONFIG.selectors.divForm).show();
        var complainantTab = new bootstrap.Tab(document.querySelector('#tab-complainant'));
        complainantTab.show();
    }

    function toggleSettledDate() {
        var status = $(CONFIG.selectors.inpStatus).val();
        if (status === 'Settled') {
            $(CONFIG.selectors.divSettledDate).show();
        } else {
            $(CONFIG.selectors.divSettledDate).hide();
            $(CONFIG.selectors.inpSettledDate).val('');
        }
    }

    // ── Party card renderer ──────────────────────────────────

    function renderPartyCards(parties, type) {
        var $container = type === 'Complainant'
            ? $(CONFIG.selectors.divComplainantCards)
            : $(CONFIG.selectors.divRespondentCards);

        var tabSelector = type === 'Complainant' ? '#tab-complainant' : '#tab-respondent';
        var baseIcon = type === 'Complainant'
            ? '<i class="bi bi-person-fill me-1"></i>'
            : '<i class="bi bi-person-fill-exclamation me-1"></i>';
        var countBadge = parties && parties.length > 0
            ? ' <span class="badge bg-secondary ms-1">' + parties.length + '</span>'
            : '';
        $(tabSelector).html(baseIcon + ' ' + type + countBadge);

        if (!parties || parties.length === 0) {
            var label = type === 'Complainant' ? 'complainants' : 'respondents';
            $container.html('<div class="text-center py-3"><i class="bi bi-person-dash fs-24 text-muted"></i><p class="text-muted fs-11 mt-1 mb-0">No ' + label + ' added yet.</p></div>');
            return;
        }

        var cards = parties.map(function (p) {
            var isResident = p.ResidentId
                ? '<span class="badge bg-success-subtle text-success fs-10 ms-1"><i class="bi bi-check-circle me-1"></i>Resident</span>'
                : '';
            var editBtn = type === 'Complainant'
                ? '<button class="btn btn-main-outline btn-sm py-1 px-2 btn-edit-party" data-id="' + p.IncidentPartyId + '"><i class="bi bi-pencil-square"></i></button>'
                : '';
            return '<div class="party-card border rounded-2 px-3 py-2 bg-light d-flex justify-content-between align-items-start" data-id="' + p.IncidentPartyId + '">' +
                '<div>' +
                '<div class="fw-semibold fs-13">' + escapeHtml(p.FullName || '\u2014') + ' ' + isResident + '</div>' +
                '<div class="text-muted fs-11 mt-1">' +
                '<span class="me-3"><i class="bi bi-gender-ambiguous me-1"></i>' + escapeHtml(p.Gender || '\u2014') + '</span>' +
                '<span class="me-3"><i class="bi bi-heart me-1"></i>' + escapeHtml(p.CivilStatus || '\u2014') + '</span>' +
                '</div>' +
                '<div class="text-muted fs-11 mt-1">' +
                '<span class="me-3"><i class="bi bi-geo-alt me-1"></i>' + escapeHtml(p.Address || '\u2014') + '</span>' +
                '<span><i class="bi bi-telephone me-1"></i>' + escapeHtml(p.ContactNo || '\u2014') + '</span>' +
                '</div></div>' +
                '<div class="d-flex gap-1 ms-2">' + editBtn +
                '<button class="btn btn-danger btn-sm py-1 px-2 btn-del-party" data-id="' + p.IncidentPartyId + '"><i class="bi bi-trash"></i></button>' +
                '</div></div>';
        }).join('');

        $container.html(cards);
    }

    // ── Misc helpers ─────────────────────────────────────────

    function fnEnsureIncidentSaved(callback) {
        var existingId = $(CONFIG.selectors.hidIncidentID).val();
        if (existingId) { callback(existingId); return; }

        var kpCaseNo = $(CONFIG.selectors.divFormInner).find('[name="KPCaseNo"]').val();
        if (!kpCaseNo) { showToast('Please fill in the KP Case No. before adding parties.', 'warning'); return; }

        var data = getValues(CONFIG.selectors.divFormInner);
        doAjax(CONFIG.endpoints.saveData, 'POST', data).then(function (res) {
            if (res && res.rtn.success === true) {
                var newId = res.rtn.value;
                $(CONFIG.selectors.hidIncidentID).val(newId);
                $(CONFIG.selectors.hidSettlementKPCaseNo).val(data.KPCaseNo);
                showToast('Incident saved. You can now add parties.', 'success');
                callback(newId);
            } else {
                showToast(res.rtn.remarks || 'Failed to save incident.', 'danger');
            }
        }).catch(function () { showToast('Failed to save incident.', 'danger'); });
    }

    function openReportPreview(url) {
        var frame = document.querySelector(CONFIG.selectors.pdfFrame);
        frame.src = 'about:blank';
        $(CONFIG.selectors.mdlPreviewReport).modal('show');
        frame.src = url + '&t=' + new Date().getTime();
    }

    function formatPartyNames(names, count) {
        if (!names) return '<span class="text-muted fst-italic fs-11">\u2014</span>';
        if (count <= 1) return escapeHtml(names);
        var first = names.split(',')[0].trim();
        return escapeHtml(first) + ' <span class="badge bg-secondary-subtle text-secondary fs-10">+' + (count - 1) + ' more</span>';
    }

    function getFileIcon(fileName) {
        if (!fileName) return 'bi bi-file-earmark';
        var ext = fileName.split('.').pop().toLowerCase();
        var map = {
            pdf: 'bi bi-file-earmark-pdf text-danger',
            jpg: 'bi bi-file-earmark-image text-primary',
            jpeg: 'bi bi-file-earmark-image text-primary',
            png: 'bi bi-file-earmark-image text-primary',
            doc: 'bi bi-file-earmark-word text-primary',
            docx: 'bi bi-file-earmark-word text-primary',
            xls: 'bi bi-file-earmark-excel text-success',
            xlsx: 'bi bi-file-earmark-excel text-success'
        };
        return map[ext] || 'bi bi-file-earmark text-muted';
    }

    function noPreviewHtml(fileName, message) {
        return '<div class="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-center">' +
            '<i class="bi bi-file-earmark-slash" style="font-size:4rem;color:#c0c0c0;"></i>' +
            '<p class="fw-semibold fs-14 mt-3 mb-1 text-muted">Preview Not Available</p>' +
            '<p class="fs-12 text-muted" style="max-width:380px;">' + message + '</p>' +
            '<p class="fs-11 text-muted fst-italic mt-1">' + escapeHtml(fileName || '') + '</p>' +
            '</div>';
    }

    function formatTime12(time24) {
        if (!time24) return '<span class="text-muted fst-italic fs-11">\u2014</span>';
        var parts = String(time24).split(':');
        if (parts.length < 2) return escapeHtml(time24);
        var h = parseInt(parts[0], 10);
        var m = parts[1].padStart(2, '0');
        var period = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return h + ':' + m + ' ' + period;
    }

    function dashFmtDate(date) {
        var y = date.getFullYear();
        var m = String(date.getMonth() + 1).padStart(2, '0');
        var d = String(date.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + d;
    }
});