$(function () {
    set_active_sidebar('.ctc-nav');

    const CONFIG = {
        endpoints: {
            getResident: '/Resident/getResident',

            getCurrentOR: '/CommunityTax/getCurrentCTC',
            getORHistory: '/CommunityTax/getORList',
            saveORHistory: '/CommunityTax/saveORHistory',

            // CTC Collection
            getCTCCollection: '/CommunityTax/getCTCCollection',
            saveCTCCollection: '/CommunityTax/saveCTCCollection',
            cancelCTCCollection: '/CommunityTax/cancelCTCCollection',
            remitCTCCollection: '/CommunityTax/remitCTCCollection'
        },
        selectors: {
            tblResident: '#tblResident',
            searchResidentInput: '#searchResidentInput',
            divResidentInformation: '#divResidentInformation',
            mdlResident: '#mdlResident',

            inpBirthdate: '#inpBirthdate',
            inpYear: '#inpYear',
            inpDateOfIssue: '#inpDateOfIssue',
            inpORNumber: '#inpORNumber',

            tblORHistory: '#tblORHistory',
            mdlORHistory: '#mdlORHistory',

            btnAddNewOR: '#btnAddNewOR',
            btnSaveOR: '#btnSaveOR',
            btnCloseNewOR: '#btnCloseNewOR',

            mdlEncodeOR: '#mdlEncodeOR',
            divNewOR: '#divNewOR',

            tblCTCCollection: '#tblCTCCollection',
            mdlCTCCollection: '#mdlCTCCollection',

            btnSaveCTC: '#btnSaveCTC',
            inp1Value: '#inp1Value',
            inp1Amount: '#inp1Amount',
            inp2Value: '#inp2Value',
            inp2Amount: '#inp2Amount',
            inp3Value: '#inp3Value',
            inp3Amount: '#inp3Amount',
            inpTotal: '#inpTotal',
            inpInterest: '#inpInterest',
            inpGrandTotal: '#inpGrandTotal'
        },
        rules: {
            valuePerAmount: 1000,       // Rule 1: every 1000 value = 1 amount
            baseCap: 5000,       // Rule 2: total amount capped at 5000
            baseAdd: 5,          // Rule 2: +5 on top of cap → max 5005
            interestRate: 0.02        // Rule 3: 2% per month after Feb deadline
        }
    };

    handleLoadDefault();
    fnLoadResident();
    computeAll();

    attachEventHandlers();
    function attachEventHandlers() {
        $(document)
            .on('input', CONFIG.selectors.searchResidentInput, debounce(fnLoadResident, 250))
            .on('click', `${CONFIG.selectors.tblResident} .btn-select`, handleResidentSelect)
            .on('click', `${CONFIG.selectors.tblORHistory} .btn-edit`, handleEditOR)

            .on('click', CONFIG.selectors.btnAddNewOR, handleNewOR)
            .on('click', CONFIG.selectors.btnCloseNewOR, handleCloseOR)
            .on('click', CONFIG.selectors.btnSaveOR, handleSaveOR)

            // CTC Collection
            .on('click', CONFIG.selectors.btnSaveCTC, handleSaveCTC)
            .on('click', `${CONFIG.selectors.tblCTCCollection} .btn-cancel`, handleCancelCTC)
            .on('click', `${CONFIG.selectors.tblCTCCollection} .btn-remit`, handleRemitCTC)


            .on('input', CONFIG.selectors.inp1Value, computeAll)
            .on('input', CONFIG.selectors.inp2Value, computeAll)
            .on('input', CONFIG.selectors.inp3Value, computeAll)
            .on('change', CONFIG.selectors.inpDateOfIssue, computeAll);
    }

    function handleLoadDefault() {
        $(CONFIG.selectors.inpYear).val(getCurrentDate().split('-')[0]);
        $(CONFIG.selectors.inpDateOfIssue).val(getCurrentDate());
        handleGetOR()
        fnLoadORHistory();
        fnLoadCTCCollection();
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

    function fnLoadORHistory() {
        doAjax(CONFIG.endpoints.getORHistory, 'GET', null).then(res => {
            resetDataTable(CONFIG.selectors.tblORHistory);

            $(CONFIG.selectors.tblORHistory).DataTable({
                retrieve: true, searching: false, lengthMenu: [15, 20, 50], order: [], "dom": 'rtip', data: res.Data,
                pagingType: "full_numbers", language: returnPagination(),
                columns: [
                    { title: "Stub Number", data: 'StubNumber', visible: true, className: 'dt-center', orderable: false },
                    { title: "StartingOR", data: 'StartingOR', className: 'dt-start', orderable: false },
                    { title: "EndingOR", data: 'EndingOR', className: 'dt-center', orderable: false },
                    {
                        title: "DateAcquired", data: 'DateAcquired', className: 'dt-center', orderable: false,
                        render: d => parseMSDate4DTable(d)
                    },
                    { title: "OR Type", data: 'ORTypeDescription', className: 'dt-center', orderable: false },
                    { title: "Current OR", data: 'CurrentOR', className: 'dt-start', orderable: false },
                    { title: "Remaining Qty", data: 'RemainingQty', className: 'dt-start', orderable: false },
                    {
                        title: "Action", data: null, className: 'dt-center', width: '80px', orderable: false,
                        render: function (data, type, row) {
                            return `<button class="btn btn-main-outline btn-outline-secondary ms-1 btn-sm py-1 btn-edit"> Edit <span class="icon-edit me-1"></span></button>`;
                        }
                    }
                ]
            });
        });
    }

    function handleEditOR() {
        handleNewOR();
        const data = getSelectedRowData(this, CONFIG.selectors.tblORHistory);
        setValues(CONFIG.selectors.divNewOR, data);
    }

    function handleNewOR() {
        $(CONFIG.selectors.mdlEncodeOR).modal('show');
        $(CONFIG.selectors.mdlORHistory).modal('hide');
        clearContent(CONFIG.selectors.divNewOR);
    }

    function handleCloseOR() {
        $(CONFIG.selectors.mdlEncodeOR).modal('hide');
        $(CONFIG.selectors.mdlORHistory).modal('show');
        fnLoadORHistory();
    }

    function handleSaveOR() {
        const data = getValues(CONFIG.selectors.divNewOR);

        doAjax(CONFIG.endpoints.saveORHistory, 'POST', data)
            .then(res => {
                if (res && res.Success === true) {
                    showToast('Successfully saved OR information.', 'success');
                    handleCloseOR();
                } else {
                    showToast(res.Message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error saving OR information:', error);
                showToast('Failed to save OR information', 'danger');
            });
    }

    function handleGetOR() {
        doAjax(CONFIG.endpoints.getCurrentOR, 'GET', null)
            .then(res => {
                if (res && res.Success === true) {
                    $(CONFIG.selectors.inpORNumber).text(res.Data.CurrentOR)
                } else {
                    showToast(res.Message, 'danger');
                }
            })
    }


    // ─────────────────────────────────────────────────────────────
    // CTC COLLECTION
    // ─────────────────────────────────────────────────────────────

    function fnLoadCTCCollection() {
        doAjax(CONFIG.endpoints.getCTCCollection, 'GET', null).then(res => {
            resetDataTable(CONFIG.selectors.tblCTCCollection);

            $(CONFIG.selectors.tblCTCCollection).DataTable({
                retrieve: true, searching: false, lengthMenu: [15, 20, 50], order: [], "dom": 'rtip', data: res.Data,
                pagingType: "full_numbers", language: returnPagination(),
                columns: [
                    { title: "OR Number", data: 'ORNumber', className: 'dt-center', orderable: false },
                    { title: "Payer Name", data: 'PayerName', className: 'dt-start', orderable: false },
                    {
                        title: "OR Date", data: 'ORDate', className: 'dt-center', orderable: false,
                        render: d => parseMSDate4DTable(d)
                    },
                    { title: "Year Paid", data: 'YearPaid', className: 'dt-center', orderable: false },
                    { title: "Grand Total", data: 'GrandTotal', className: 'dt-center', orderable: false },
                    {
                        title: "Cancelled", data: 'Cancelled', className: 'dt-center', orderable: false,
                        render: d => d ? '<span class="badge bg-danger">Yes</span>' : '<span class="badge bg-secondary">No</span>'
                    },
                    {
                        title: "Remitted", data: 'Remitted', className: 'dt-center', orderable: false,
                        render: d => d ? '<span class="badge bg-success">Yes</span>' : '<span class="badge bg-secondary">No</span>'
                    },
                    {
                        title: "Action", data: null, className: 'dt-center', width: '110px', orderable: false,
                        render: function (data, type, row) {
                            const cancelBtn = !row.Cancelled ? `<button class="btn btn-outline-danger rounded-2 ms-1 btn-sm py-1 btn-cancel"> Cancel <span class="icon-close me-1"></span></button>` : '';
                            const remitBtn = !row.Remitted && !row.Cancelled ? `<button class="btn btn-outline-success  rounded-2 ms-1 btn-sm py-1 btn-remit"> Remit <span class="icon-check me-1"></span></button>` : '';
                            return `
                                ${cancelBtn}
                                ${remitBtn}
                            `;
                        }
                    }
                ]
            });
        });
    }



    function handleSaveCTC() {
        const data = getValues(CONFIG.selectors.divResidentInformation);

        doAjax(CONFIG.endpoints.saveCTCCollection, 'POST', data)
            .then(res => {
                if (res && res.Success === true) {
                    showToast(res.Message, 'success');
                    clearContent(CONFIG.selectors.divResidentInformation);
                    handleLoadDefault();
                } else {
                    showToast(res.Message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error saving CTC collection:', error);
                showToast('Failed to save CTC collection.', 'danger');
            });
    }

    function handleCancelCTC() {
        const data = getSelectedRowData(this, CONFIG.selectors.tblCTCCollection);

        if (!confirm(`Cancel OR Number: ${data.ORNumber}?`)) return;

        doAjax(`${CONFIG.endpoints.cancelCTCCollection}?ctcId=${data.CTCId}`, 'PATCH', null)
            .then(res => {
                if (res && res.Success === true) {
                    showToast(res.Message, 'success');
                    fnLoadCTCCollection();
                } else {
                    showToast(res.Message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error cancelling CTC collection:', error);
                showToast('Failed to cancel CTC collection.', 'danger');
            });
    }

    function handleRemitCTC() {
        const data = getSelectedRowData(this, CONFIG.selectors.tblCTCCollection);

        doAjax(`${CONFIG.endpoints.remitCTCCollection}?ctcId=${data.CTCId}`, 'PATCH', null)
            .then(res => {
                if (res && res.Success === true) {
                    showToast(res.Message, 'success');
                    fnLoadCTCCollection();
                } else {
                    showToast(res.Message, 'danger');
                }
            })
            .catch(error => {
                console.error('Error remitting CTC collection:', error);
                showToast('Failed to remit CTC collection.', 'danger');
            });
    }





    // ─────────────────────────────────────────────────────────────
    // RULE 1: Every 1000 value = 1 amount
    // ─────────────────────────────────────────────────────────────
    function computeAmount(value) {
        const v = parseFloat(value) || 0;
        return Math.floor(v / CONFIG.rules.valuePerAmount);
    }

    // ─────────────────────────────────────────────────────────────
    // RULE 2: Sum all amounts, cap at 5000, then add 5 → max 5005
    // ─────────────────────────────────────────────────────────────
    function computeTotal(amount1, amount2, amount3) {
        const sum = amount1 + amount2 + amount3;
        const capped = Math.min(sum, CONFIG.rules.baseCap);
        return capped + CONFIG.rules.baseAdd;   // max = 5005
    }

    // ─────────────────────────────────────────────────────────────
    // RULE 3: Interest = 2% of total per month after Feb 28/27
    //         Counts from March (month 1) up to and including
    //         the month of payment.
    //         e.g. paid May 1 → March, April, May = 3 months
    //              but per example in spec: May = 10% (5 months)
    //         So counting starts from Oct of PRIOR year? No —
    //         re-reading: "paid today May 1 → interest is 10%"
    //         Feb(1) Mar(2) Apr(3) May(4) = 4 months × 2% = 8%?
    //         Spec says 10% for May → that is 5 months:
    //         Feb deadline = month 0, Mar=1, Apr=2, May=3... 
    //         Checking: if we COUNT Feb itself as month 1 →
    //         Feb(1) Mar(2) Apr(3) May(4) = 4 — still not 10%.
    //         10% ÷ 2% = 5 months → Jan(1) Feb(2) Mar(3) Apr(4) May(5)
    //         So interest months = (paymentMonth - 0) where Jan=1
    //         meaning all months from Jan up to payment month.
    // ─────────────────────────────────────────────────────────────
    function computeInterest(total, paymentDate) {
        if (!paymentDate) return 0;

        const date = new Date(paymentDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;    // 1-based
        const day = date.getDate();

        // Deadline: Feb 28, or Feb 27 if year has no Feb 28
        const febDeadline = new Date(year, 1, 28).getMonth() === 1 ? 28 : 27;
        const isLeapFeb28 = febDeadline === 28;

        // No interest if paid on or before Feb deadline
        const deadlineMs = new Date(year, 1, febDeadline).getTime();
        if (date.getTime() <= deadlineMs) return 0;

        // Months = payment month (Jan=1 ... Dec=12)
        // Per spec: May 1 → 10% = 5 months = month index of May
        const months = month;   // Jan=1, Feb=2, ... May=5

        return parseFloat((total * CONFIG.rules.interestRate * months).toFixed(2));
    }

    // ─────────────────────────────────────────────────────────────
    // MASTER COMPUTE — triggered on any value or date change
    // ─────────────────────────────────────────────────────────────
    function computeAll() {
        const s = CONFIG.selectors;

        // Rule 1 — individual amounts
        const amount1 = computeAmount($(s.inp1Value).val());
        const amount2 = computeAmount($(s.inp2Value).val());
        const amount3 = computeAmount($(s.inp3Value).val());

        $(s.inp1Amount).text(amount1.toFixed(2));
        $(s.inp2Amount).text(amount2.toFixed(2));
        $(s.inp3Amount).text(amount3.toFixed(2));

        // Rule 2 — total (capped + 5)
        const total = computeTotal(amount1, amount2, amount3);
        $(s.inpTotal).text(total.toFixed(2));

        // Rule 3 — interest
        const paymentDate = $(s.inpDateOfIssue).val();
        const interest = computeInterest(total, paymentDate);
        $(s.inpInterest).text(interest.toFixed(2));

        // Rule 4 — grand total
        const grandTotal = total + interest;
        $(s.inpGrandTotal).text(grandTotal.toFixed(2));
    }
});