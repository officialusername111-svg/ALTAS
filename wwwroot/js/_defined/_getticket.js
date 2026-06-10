$(function () {

    const CONFIG = {
        endpoints: {
            issueTicket: '/Queue/IssueTicket'
        },
        selectors: {
            btnService: '.service-btn',
            idleMsg: '#idleMsg',
            ticketCard: '#ticketCard',
            printMsg: '#printMsg',
            tcServiceName: '#tc-service-name',
            tcNumber: '#tc-number',
            clockTime: '#k-time',
            clockDate: '#k-date'
        }
    };

    startClock();
    attachEventHandlers();

    // ─── Event Handlers ────────────────────────────────────────────

    function attachEventHandlers() {
        $(document)
            .on('click', CONFIG.selectors.btnService, handleServiceSelect);
    }

    function handleServiceSelect() {
        var $btn = $(this);
        var serviceId = parseInt($btn.data('service'));  // DB ServiceId (1, 2, 3)
        var prefix = $btn.data('prefix');             // e.g. "C", "B", "T"

        if ($btn.hasClass('disabled-btn')) return;

        // Disable all buttons while processing
        $(CONFIG.selectors.btnService).addClass('disabled-btn').css('pointer-events', 'none');
        $btn.addClass('pressed');

        // Show printing indicator
        $(CONFIG.selectors.idleMsg).addClass('d-none');
        $(CONFIG.selectors.ticketCard).addClass('d-none');
        $(CONFIG.selectors.printMsg).removeClass('d-none').addClass('d-flex');

        doAjax(CONFIG.endpoints.issueTicket, 'POST', { serviceId: serviceId })
            .then(function (res) {
                if (!res || !res.Success) {
                    showError('Could not issue ticket. Please try again.');
                    resetButtons();
                    return;
                }

                var ticket = res.Data;

                setTimeout(function () {
                    $(CONFIG.selectors.printMsg).addClass('d-none').removeClass('d-flex');

                    // Populate and show ticket card
                    $(CONFIG.selectors.tcServiceName).text(ticket.ServiceName);
                    $(CONFIG.selectors.tcNumber).text(ticket.TicketNumber);
                    $(CONFIG.selectors.ticketCard).removeClass('d-none');

                    // Update the code badge on the clicked button
                    var parts = ticket.TicketNumber.split('-');
                    $('#code-' + prefix).text(prefix + '-' + parts[1]);

                    resetButtons();
                }, 1800);
            })
            .catch(function (error) {
                console.error('Error issuing ticket:', error);
                showError('Network error. Please try again.');
                resetButtons();
            });
    }

    // ─── Helpers ───────────────────────────────────────────────────

    function resetButtons() {
        setTimeout(function () {
            $(CONFIG.selectors.btnService) .removeClass('disabled-btn pressed') .css('pointer-events', '');
        }, 400);
    }

    function showError(msg) {
        $(CONFIG.selectors.printMsg).addClass('d-none').removeClass('d-flex');
        $(CONFIG.selectors.idleMsg).removeClass('d-none');
        showToast(msg, 'danger');
    }

    // ─── Clock ─────────────────────────────────────────────────────

    function startClock() {
        tickClock();
        setInterval(tickClock, 1000);
    }

    function tickClock() {
        $(CONFIG.selectors.clockTime).text(formatTime());
        $(CONFIG.selectors.clockDate).text(formatDate());
    }

    function formatTime() {
        var d = new Date();
        var hh = String(d.getHours()).padStart(2, '0');
        var mm = String(d.getMinutes()).padStart(2, '0');
        var ss = String(d.getSeconds()).padStart(2, '0');
        return hh + ':' + mm + ':' + ss;
    }

    function formatDate() {
        var d = new Date();
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'];
        return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    }

});