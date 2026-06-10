/**
 * _queuestatus.js
 * ──────────────────────────────────────────────────────────────────
 * Drives the #qsp-panel that lives in _Layout.cshtml.
 *
 * WHY normalizeState() EXISTS
 * ───────────────────────────
 * GET /Queue/GetState  → ASP.NET HTTP JSON  → camelCase properties
 * SignalR hub events   → SignalR serializer  → PascalCase properties
 * normalizeState() unifies both so every render path uses the same shape.
 */

$(function () {

    // ── Configuration ───────────────────────────────────────────────
    var CFG = {
        hubUrl:      '/queueHub',
        getStateUrl: '/Queue/GetState',
        callNextUrl: '/Queue/CallNext',
        reconnect:   [0, 1000, 2000, 5000, 10000],
        prefixes:    ['C', 'B', 'T'],
        serviceMap: {
            'C': { name: 'Barangay Clearance',               serviceId: 1 },
            'B': { name: 'Barangay Certification',            serviceId: 2 },
            'T': { name: 'Community Tax Certificate (CTC)',   serviceId: 3 }
        },
        windowMap: { 'C': 1, 'B': 2, 'T': 3 },
        storageKey: 'qsp_visible'          // remembers open/closed across navigation
    };

    // ── Cached jQuery refs ──────────────────────────────────────────
    var $panel      = $('#qsp-panel');
    var $toggleBtn  = $('#qsp-toggle-btn');
    var $badge      = $('#qsp-badge');
    var $dot        = $('#qsp-dot');
    var $serving    = $('#qsp-serving');
    var $servingSub = $('#qsp-serving-sub');
    var $servingBlk = $('.qsp-serving-block');

    var lastServing   = null;
    var lastBadgeVal  = -1;   // track previous badge value to avoid redundant pops

    // ── Panel visibility: restore last state (default = visible) ───
    var panelVisible = (sessionStorage.getItem(CFG.storageKey) !== 'false');
    applyPanelState(false);   // apply without animation on first load

    // ── Toggle button click ─────────────────────────────────────────
    $toggleBtn.on('click', function () {
        panelVisible = !panelVisible;
        sessionStorage.setItem(CFG.storageKey, panelVisible);
        applyPanelState(true);
    });

    function applyPanelState(animate) {
        if (!animate) {
            // Temporarily suppress the CSS transition on first load
            $panel.css('transition', 'none');
            requestAnimationFrame(function () {
                $panel.css('transition', '');
            });
        }

        if (panelVisible) {
            $panel.removeClass('qsp-collapsed');
            $toggleBtn.addClass('active');
        } else {
            $panel.addClass('qsp-collapsed');
            $toggleBtn.removeClass('active');
        }
    }

    // ── Normalize: camelCase (HTTP) OR PascalCase (SignalR) ────────
    function normalizeTicket(t) {
        if (!t) return null;
        return {
            ticketNumber: t.TicketNumber || t.ticketNumber || '',
            prefix:       t.Prefix       || t.prefix       || '',
            serviceName:  t.ServiceName  || t.serviceName  || ''
        };
    }

    function normalizeState(raw) {
        if (!raw) return { nowServing: null, pending: [], servedCount: {} };
        var ns      = raw.NowServing  || raw.nowServing  || null;
        var pending = raw.Pending     || raw.pending     || [];
        var served  = raw.ServedCount || raw.servedCount || {};
        return {
            nowServing:  normalizeTicket(ns),
            pending:     $.map(pending, function (t) { return normalizeTicket(t); }),
            servedCount: served
        };
    }

    // ── 1. Load initial state on page load ──────────────────────────
    $.get(CFG.getStateUrl, function (raw) {
        renderState(normalizeState(raw));
    }).fail(function () {
        console.warn('QSP: initial state fetch failed.');
    });

    // ── 2. SignalR connection ───────────────────────────────────────
    var connection = new signalR.HubConnectionBuilder()
        .withUrl(CFG.hubUrl)
        .withAutomaticReconnect(CFG.reconnect)
        .build();

    connection.onreconnecting(function () {
        setDot('reconnecting');
        console.info('QSP: SignalR reconnecting...');
    });

    connection.onreconnected(function () {
        setDot('connected');
        console.info('QSP: SignalR reconnected - refreshing state.');
        $.get(CFG.getStateUrl, function (raw) { renderState(normalizeState(raw)); });
    });

    connection.onclose(function () {
        setDot('disconnected');
        console.warn('QSP: SignalR connection closed.');
    });

    startHub();

    async function startHub() {
        try {
            await connection.start();
            setDot('connected');
            console.info('QSP: SignalR connected.');
        } catch (err) {
            setDot('disconnected');
            console.error('QSP: SignalR start failed - retrying in 5 s.', err);
            setTimeout(startHub, 5000);
        }
    }

    // ── 3. Hub event handlers ───────────────────────────────────────

    connection.on('ticketIssued', function (raw) {
        renderState(normalizeState(raw));
        flashServingBlock();
    });

    connection.on('ticketCalled', function (raw) {
        renderState(normalizeState(raw));
    });

    connection.on('queueReset', function () {
        renderState({ nowServing: null, pending: [], servedCount: {} });
    });

    // ── 4. Call-Number button handler ───────────────────────────────
    $(document).on('click', '.qsp-call-btn', function () {
        var $btn      = $(this);
        var serviceId = parseInt($btn.data('service'));
        var prefix    = $btn.data('prefix');

        if ($btn.hasClass('calling')) return;

        $('.qsp-call-btn').addClass('calling');

        doAjax(CFG.callNextUrl, 'POST', { ServiceId: serviceId })
            .then(function (res) {
                if (res && !res.Success) {
                    console.warn('QSP: CallNext - no tickets left for prefix', prefix);
                }
            })
            .catch(function (error) {
                console.error('QSP: CallNext failed.', error);
            })
            .finally(function () {
                setTimeout(function () {
                    $('.qsp-call-btn').removeClass('calling');
                }, 600);
            });
    });

    // ── Render helpers ──────────────────────────────────────────────

    function renderState(state) {
        renderNowServing(state.nowServing);
        renderCounts(state.pending);
        renderNextInQueue(state.pending);
        updateBadge(state.pending);
    }

    // Element 1 — Now Serving
    function renderNowServing(ticket) {
        if (!ticket || !ticket.ticketNumber) {
            $serving.text('—');
            $servingSub.text('Waiting for a ticket to be called');
            lastServing = null;
            return;
        }

        var num = ticket.ticketNumber;

        if (lastServing !== num) {
            $serving.removeClass('pop');
            $serving[0].offsetHeight;   // force reflow
            $serving.addClass('pop');
            lastServing = num;
        }

        $serving.text(num);

        var svcName = ticket.serviceName
            || (CFG.serviceMap[ticket.prefix] && CFG.serviceMap[ticket.prefix].name)
            || ticket.prefix;

        $servingSub.text(svcName + ' — Window ' + (CFG.windowMap[ticket.prefix] || 1));
    }

    // Element 2 — Queue count per transaction
    function renderCounts(pending) {
        var counts = { C: 0, B: 0, T: 0 };

        $.each(pending, function (_, t) {
            if (counts[t.prefix] !== undefined) counts[t.prefix]++;
        });

        $.each(CFG.prefixes, function (_, prefix) {
            var $el  = $('#qsp-count-' + prefix);
            var prev = parseInt($el.text()) || 0;
            var next = counts[prefix];

            $el.text(next);

            if (next !== prev) {
                $el.removeClass('bump');
                $el[0].offsetHeight;
                $el.addClass('bump');
            }
        });
    }

    // Element 3 — Next available number per transaction
    function renderNextInQueue(pending) {
        var groups = { C: [], B: [], T: [] };

        $.each(pending, function (_, t) {
            if (groups[t.prefix] !== undefined) {
                groups[t.prefix].push(t.ticketNumber);
            }
        });

        $.each(CFG.prefixes, function (_, prefix) {
            $('#qsp-next-' + prefix)
                .text(groups[prefix].length > 0 ? groups[prefix][0] : '—');
        });
    }

    // ── Badge on toggle button ───────────────────────────────────────
    // Shows total pending tickets. Hides when 0.
    // Animates with a pop whenever the number changes.
    function updateBadge(pending) {
        var total = pending ? pending.length : 0;

        if (total === lastBadgeVal) return;   // no change, skip update
        lastBadgeVal = total;

        if (total === 0) {
            $badge.addClass('hidden').text('0');
            return;
        }

        $badge.removeClass('hidden pop');
        $badge[0].offsetHeight;              // force reflow to restart animation
        $badge.addClass('pop').text(total);
    }

    // ── Utility ─────────────────────────────────────────────────────

    function setDot(status) {
        $dot.removeClass('connected reconnecting disconnected').addClass(status);
    }

    function flashServingBlock() {
        $servingBlk.removeClass('flash');
        $servingBlk[0].offsetHeight;
        $servingBlk.addClass('flash');
    }

});
