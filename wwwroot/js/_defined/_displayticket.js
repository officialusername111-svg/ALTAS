

$(function () {

    const CONFIG = {
        hubUrl: '/queueHub?group=display',
        colorMap: {
            'C': 'green',
            'B': 'blue',
            'T': 'orange'
        },
        windowMap: {
            'C': 1,
            'B': 2,
            'T': 3
        }
    };

    var lastServing = null;

    startClock();

    // ── 1. Load initial state on page load ─────────────────────────
    $.get('/Queue/GetState', function (state) {
        renderNowServing(state.nowServing);
        renderQueues(state.pending);
    }).fail(function () {
        console.warn('Display: initial state fetch failed.');
    });

    // ── 2. SignalR connection ───────────────────────────────────────
    var connection = new  signalR.HubConnectionBuilder()
        .withUrl(CONFIG.hubUrl)
        .withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
        .build();

    connection.onreconnecting(function () {
        console.info('Display: SignalR reconnecting…');
    });

    connection.onreconnected(function () {
        console.info('Display: SignalR reconnected — refreshing state.');
        $.get('/Queue/GetState', function (state) {
            renderNowServing(state.nowServing);
            renderQueues(state.pending);
        });
    });

    connection.onclose(function () {
        console.warn('Display: SignalR connection closed.');
    });

    startHub();

    async function startHub() {
        try {
            await connection.start();
            console.info('Display: SignalR connected.');
        } catch (err) {
            console.error('Display: SignalR start failed.', err);
            setTimeout(startHub, 5000);
        }
    }

    // ── 3. Hub event handlers ───────────────────────────────────────

    // A new ticket was issued at the kiosk
    connection.on('ticketIssued', function (state) {
        renderNowServing(state.nowServing);
        renderQueues(state.pending);
        flashNewTicket(state.pending);
    });

    // Staff called the next ticket
    connection.on('ticketCalled', function (state) {
        renderNowServing(state.nowServing);
        renderQueues(state.pending);
    });

    // Queue was reset
    connection.on('queueReset', function () {
        renderNowServing(null);
        renderQueues([]);
    });

    // ── Render: Now Serving ─────────────────────────────────────────

    function renderNowServing(ticket) {
        if (!ticket) {
            $('#ns-number').text('—');
            $('#ns-window').text('—');
            renderUpNext([]);
            return;
        }

        var prefix = ticket.prefix;

        if (lastServing !== ticket.ticketNumber) {
            var $num = $('#ns-number');
            $num.css('animation', 'none');
            $num[0].offsetHeight; // force reflow
            $num.css('animation', '');
            lastServing = ticket.ticketNumber;
        }

        $('#ns-number').text(ticket.ticketNumber);
        $('#ns-window').text(CONFIG.windowMap[prefix] || 1);
    }

    // ── Render: Up Next sidebar ─────────────────────────────────────

    function renderUpNext(pending) {
        var $list = $('#up-next-list');
        $list.empty();

        var upcoming = pending ? pending.slice(0, 3) : [];

        if (upcoming.length === 0) {
            $list.html('<div class="qd-up-next-empty">No upcoming tickets</div>');
            return;
        }

        $.each(upcoming, function (_, t) {
            $list.append(
                $('<div>').addClass('qd-up-next-item').text(t.ticketNumber)
            );
        });
    }

    // ── Render: Pending Queues (three service columns) ──────────────

    function renderQueues(pending) {
        var groups = { 'C': [], 'B': [], 'T': [] };

        $.each(pending, function (_, t) {
            if (groups[t.prefix] !== undefined) {
                groups[t.prefix].push(t.ticketNumber);
            }
        });

        renderUpNext(pending);

        $.each(groups, function (prefix, tickets) {
            var $body = $('#q-' + prefix);
            $body.empty();

            if (tickets.length === 0) {
                $body.html('<div class="qd-no-tickets">No pending tickets</div>');
                return;
            }

            $.each(tickets.slice(0, 5), function (i, num) {
                var isNext = (i === 0);
                var $row = $('<div>').addClass('qd-ticket-row' + (isNext ? ' is-next' : ''));
                var $arrow = $('<i>').addClass('bi bi-play-fill qd-ticket-arrow');
                var $num = $('<span>').addClass('qd-ticket-num').text(num);
                $row.append($arrow, $num);
                $body.append($row);
            });
        });
    }

    // ── Visual flash when a new ticket appears ──────────────────────

    function flashNewTicket(pending) {
        if (!pending || pending.length === 0) return;
        var latest = pending[pending.length - 1];
        var prefix = latest ? latest.prefix : null;
        if (!prefix) return;

        var $col = $('#q-' + prefix).closest('.qd-queue-col');
        $col.addClass('qd-new-ticket-flash');
        setTimeout(function () { $col.removeClass('qd-new-ticket-flash'); }, 1200);
    }

    // ── Clock ───────────────────────────────────────────────────────

    function startClock() {
        tickClock();
        setInterval(tickClock, 1000);
    }

    function tickClock() {
        $('#disp-time').text(formatTime());
        $('#disp-date').text(formatDate());
    }

    function formatTime() {
        var d = new Date();
        var h = d.getHours();
        var mm = String(d.getMinutes()).padStart(2, '0');
        var ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return String(h).padStart(2, '0') + ':' + mm + ' ' + ampm;
    }

    function formatDate() {
        var d = new Date();
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'];
        return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    }

});