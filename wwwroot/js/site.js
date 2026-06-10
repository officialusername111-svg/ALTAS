// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

let csrfToken = "";
function loadCsrfToken() { return $.get("/k4d5/54f71/x84123", function (res) { csrfToken = res.x9k5840; }); }
$.ajaxSetup({ beforeSend: function (xhr) { if (csrfToken) { xhr.setRequestHeader("X-CSRF-TOKEN", csrfToken); } } });
function set_active_sidebar(nav) { $(".sidebar ul li.active").removeClass('active'); $(nav).addClass('active'); }

async function doAjax(url, type, data) {
    try {
        const isFormData = data instanceof FormData;
        await loadCsrfToken();

        const result = await $.ajax({
            url: url, type: type, data: data, processData: !isFormData,
            contentType: isFormData ? false : 'application/x-www-form-urlencoded; charset=UTF-8',
            beforeSend: function (xhr) {
                if (csrfToken) {
                    xhr.setRequestHeader("X-CSRF-TOKEN", csrfToken);
                }
            },
            error: function (xhr, status, error) {
                console.error('AJAX Error:', error);
                console.error('Status:', status);
                console.error('XHR:', xhr);
            }
        });
        return result;
    } catch (error) {
        console.error('AJAX Exception:', error);
    }
}

function parseMSDate4DTable(dateString) {
    if (!dateString) return '';

    const d = new Date(dateString);
    if (isNaN(d)) return ''; // invalid date safeguard

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getCurrentDate() {
    var now = new Date();
    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    return now.getFullYear() + "-" + (month) + "-" + (day);
}


window.formatCurrency = function (amount) {
    return '₱ ' + parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

window.formatCurrencyNoSign = function (amount) {
    return parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function debounce(fn, wait) {
    let timer = null;
    return function () {
        const ctx = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(ctx, args), wait);
    };
}

function setValues(containerSelector, data) {
    const $container = $(containerSelector);

    $.each(data, function (key, value) {
        const $elements = $container.find(`[name="${key}"]`);

        $elements.each(function () {
            const $el = $(this);
            const tag = $el.prop('tagName').toLowerCase();
            const type = $el.attr('type');

            if (tag === 'input') {
                if (type === 'checkbox') {
                    $el.prop('checked', value == true || value == 1);
                } else if (type === 'radio') {
                    $container.find(`[name="${key}"][value="${value}"]`).prop('checked', true);
                } else if (type === 'date') {
                    if (value) {
                        const formatted = parseMSDate4DTable(value);
                        $el.val(formatted);
                    }
                } else {
                    $el.val(value);
                }
            } else if (tag === 'select') {
                $el.val(value).trigger('change');

                // If using Bootstrap Select picker
                if ($el.hasClass('selectpicker')) {
                    $el.selectpicker('refresh');
                }

                // If using Select2
                if ($el.hasClass('select2-hidden-accessible')) {
                    $el.trigger('change.select2');
                }
            } else if (tag === 'textarea') {
                $el.val(value);
            } else {
                $el.text(value);
            }
        });
    });
}

function getValues(containerSelector) {
    const $container = $(containerSelector);
    const result = {};

    $container.find('[name]').each(function () {
        const $el = $(this);
        const name = $el.attr('name');
        const tag = $el.prop('tagName').toLowerCase();
        const type = $el.attr('type');

        if (!name) return;

        // Avoid overwriting radio groups incorrectly
        if (type === 'radio') {
            if ($el.is(':checked')) {
                result[name] = $el.val();
            }
            return;
        }

        if (type === 'checkbox') {
            result[name] = $el.is(':checked');
        }
        else if (tag === 'select') {
            // Bootstrap Selectpicker
            if ($el.hasClass('selectpicker')) {
                result[name] = $el.selectpicker('val');
            }
            // Select2
            else if ($el.hasClass('select2-hidden-accessible')) {
                result[name] = $el.val();
            }
            // Normal select
            else {
                result[name] = $el.val();
            }
        }
        else if (tag === 'textarea') {
            result[name] = $el.val();
        }
        else if (tag === 'input') {
            result[name] = $el.val();
        }
        else {
            // span, label, div, etc.
            result[name] = $el.text();
        }
    });

    return result;
}

function clearContent(containerSelector) {
    const $container = $(containerSelector);

    // Text inputs
    $container.find('input[type="text"], input[type="number"], input[type="email"], input[type="password"]').val('');

    // Textarea
    $container.find('textarea').val('');

    // Checkbox (set to default = unchecked)
    $container.find('input[type="checkbox"]').prop('checked', false);

    // Radio buttons
    $container.find('input[type="radio"]').prop('checked', false);

    // Select (normal)
    $container.find('select').prop('selectedIndex', 0).trigger('change');

    // Hidden inputs
    $container.find('input[type="hidden"]').val('');

    // Date inputs (set to current date)
    $container.find('input[type="date"]').val(getCurrentDate());

    // File inputs (important!)
    $container.find('input[type="file"]').val('');

    // Select2
    $container.find('.select2-hidden-accessible').val(null).trigger('change');

    // Bootstrap Selectpicker
    $container.find('.selectpicker').val(null).trigger('change');
}

function showToast(message, type = 'primary') {
    const id = 'toast-' + Date.now();

    const toastHTML = `
        <div id="${id}" class="toast align-items-center bg-${type} border-0 mb-2 text-white" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    $('#toastContainer').append(toastHTML);

    const toastEl = document.getElementById(id);
    const toast = new bootstrap.Toast(toastEl, {
        delay: 3000
    });

    toast.show();

    // Remove after hidden (clean DOM)
    toastEl.addEventListener('hidden.bs.toast', function () {
        $(toastEl).remove();
    });
}


window.escapeHtml = function (text) {
    if (!text && text !== 0) return '';
    return String(text).replace(/[&<>"'`=\/]/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    })[c]);
};

function destroyDataTable(selector) {
    if ($.fn.DataTable.isDataTable(selector)) {
        $(selector).DataTable().destroy();
        $(selector).empty();
    }
}

function getDataTable(selector) {
    return $.fn.DataTable.isDataTable(selector) ? $(selector).DataTable() : null;
}

function resetDataTable(tableSelector) {
    if ($.fn.DataTable.isDataTable(tableSelector)) {
        var table = $(tableSelector).DataTable();
        table.destroy();
        $(tableSelector).empty();
    }
}

function getSelectedRowData(element, datatableSelector) {
    // Get DataTable instance
    const table = $.fn.DataTable.isDataTable(datatableSelector)
        ? $(datatableSelector).DataTable()
        : null;

    if (!table) {
        console.error('DataTable instance not found for selector:', datatableSelector);
        return null;
    }

    // Find the closest <tr> from the clicked element
    const tr = $(element).closest('tr');

    // Try to get the row from DataTable
    let row = table.row(tr);

    // If row is not found (Responsive child row), look up the parent row
    if (!row.any()) {
        row = table.row(tr.parents('tr'));
    }

    // If still not found, fail gracefully
    if (!row.any()) {
        console.error('Row not found in DataTable for element:', element);
        return null;
    }

    // Return the row data
    return row.data();
}

function getTableDataAsObjects(tableSelector, mapperFn) {
    var table = $(tableSelector).DataTable();

    if (!table) {
        console.warn('DataTable not found for selector:', tableSelector);
        return [];
    }

    return table.rows().data().toArray().map(function (item, index) {
        return mapperFn(item, index);
    });
}
function removeRowFromDataTable(tableSelector, rowElement, callback) {
    var table = $(tableSelector).DataTable();

    if (!table) {
        console.warn('DataTable not found');
        return;
    }

    table.row($(rowElement).closest('tr')).remove().draw();

    if (typeof callback === 'function') {
        callback();
    }
}

function totalRowFromDataTable(tableSelector, outputSelector, fieldName, callback) {
    var table = $(tableSelector).DataTable();
    var sum = 0;

    if (!table) {
        console.warn('DataTable not found:', tableSelector);
        return;
    }

    table.rows().every(function () {
        var data = this.data();
        sum += parseFloat(Num(data[fieldName])) || 0;
    });

    $(outputSelector).text(formatCurrency(sum));

    if (typeof callback === 'function') {
        callback(sum);
    }
}

function totalRowProductFromDataTable(tableSelector, outputSelector, field1, field2, callback) {
    var table = $(tableSelector).DataTable();
    var sum = 0;

    if (!table) {
        console.warn('DataTable not found:', tableSelector);
        return;
    }

    table.rows().every(function () {
        var data = this.data();

        var val1 = parseFloat(data[field1]) || 0;
        var val2 = parseFloat(data[field2]) || 0;

        sum += (val1 * val2);
    });

    $(outputSelector).text(formatCurrency(sum));

    if (typeof callback === 'function') {
        callback(sum);
    }
}

function countRowsWithFilter(tableSelector, outputSelector, fieldName, keyword, callback) {
    if (!$.fn.DataTable.isDataTable(tableSelector)) {
        console.warn('DataTable not initialized:', tableSelector);
        return;
    }

    var table = $(tableSelector).DataTable();
    var count = 0;

    table.rows().every(function () {
        var data = this.data();

        if (data[fieldName] && data[fieldName].toString().trim().toLowerCase() === keyword.toLowerCase()) {
            count++;
        }
    });

    $(outputSelector).text(count);

    if (typeof callback === 'function') {
        callback(count);
    }
}

function countAllRows(tableSelector) {
    if (!$.fn.DataTable.isDataTable(tableSelector)) return 0;

    var table = $(tableSelector).DataTable();
    return table.rows().count();
}

function returnPagination() {
    return {
        paginate: {
            first: '<img src="../img/_icons/datatable/chevron-bar-left.svg" class="icon-sm"/>',
            previous: '<img src="../img/_icons/datatable/chevron-left.svg" class="icon-sm"/>',
            next: '<img src="../img/_icons/datatable/chevron-right.svg" class="icon-sm"/>',
            last: '<img src="../img/_icons/datatable/chevron-bar-right.svg" class="icon-sm"/>'
        }
    };
}

function deepFreeze(obj) {
    Object.getOwnPropertyNames(obj).forEach(prop => {
        if (obj[prop] !== null
            && (typeof obj[prop] === 'object' || typeof obj[prop] === 'function')
            && !Object.isFrozen(obj[prop])) {
            deepFreeze(obj[prop]);
        }
    });
    return Object.freeze(obj);
}

function validateRequiredFields(containerSelector) {
    let isValid = true;

    const $fields = $(containerSelector).find('input, select, textarea');

    $fields.each(function () {
        const $el = $(this);
        const value = $el.val()?.trim();

        $el.removeClass('is-invalid');
        $el.next('.invalid-feedback').remove();

        // Only validate fields marked as required
        if ($el.prop('required') && !value) {
            $el.addClass('is-invalid');
            $el.after('<div class="invalid-feedback">This field is required.</div>');
            isValid = false;
        }
    });

    return isValid;
}

function initDataTable(selector, data, columns) {
    resetDataTable(selector);
    $(selector).DataTable({
        retrieve: true,
        searching: false,
        lengthMenu: [10, 20, 50],
        order: [],
        dom: 'rtip',
        data: data,
        pagingType: 'full_numbers',
        language: returnPagination(),
        columns: columns
    });
}


function createBadge(badgeClass, iconn, text) {
    return `<span class="fs-12 bg-${badgeClass}-subtle text-${badgeClass} p-2 rounded-2 border border-1 border-${badgeClass}"><i class="${iconn} pe-1"></i> ${text}</span>`;

}












/**
 * _queuestatus.js
 * ──────────────────────────────────────────────────────────────────
 * Drives the #qsp-panel that lives in _Layout.cshtml.
 *
 * Responsibilities:
 *   1. Connect to /queueHub via SignalR (with auto-reconnect).
 *   2. Fetch initial state from GET /Queue/GetState on load.
 *   3. React to hub events: ticketIssued | ticketCalled | queueReset.
 *   4. Handle "Call Number" button clicks -> POST /Queue/CallNext.
 *   5. Keep all 5 panel elements up to date in real time.
 *
 * WHY normalizeState() EXISTS
 * ───────────────────────────
 * GET /Queue/GetState  → ASP.NET's HTTP JSON serializer → camelCase
 *   { nowServing, pending, servedCount }
 *
 * SignalR hub events   → SignalR's own serializer      → PascalCase
 *   { NowServing, Pending, ServedCount }
 *
 * normalizeState() reads both casings so every code path below uses
 * a guaranteed-camelCase shape, regardless of the source.
 * The same logic is applied to each ticket inside the arrays.
 */

$(function () {

    // ── Configuration ───────────────────────────────────────────────
    var CFG = {
        hubUrl: '/queueHub',
        getStateUrl: '/Queue/GetState',
        callNextUrl: '/Queue/CallNext',
        reconnect: [0, 1000, 2000, 5000, 10000],
        prefixes: ['C', 'B', 'T'],
        serviceMap: {
            'C': { name: 'Barangay Clearance', serviceId: 1 },
            'B': { name: 'Barangay Certification', serviceId: 2 },
            'T': { name: 'Community Tax Certificate (CTC)', serviceId: 3 }
        },
        windowMap: { 'C': 1, 'B': 2, 'T': 3 }
    };

    // ── Cached jQuery refs ──────────────────────────────────────────
    var $dot = $('#qsp-dot');
    var $serving = $('#qsp-serving');
    var $servingSub = $('#qsp-serving-sub');
    var $servingBlk = $('.qsp-serving-block');

    var lastServing = null;

    // ── Normalize: accept camelCase (HTTP) OR PascalCase (SignalR) ──
    //
    //  Ticket fields normalized:
    //    TicketNumber / ticketNumber  -> ticketNumber
    //    Prefix       / prefix        -> prefix
    //    ServiceName  / serviceName   -> serviceName
    //
    function normalizeTicket(t) {
        if (!t) return null;
        return {
            ticketNumber: t.TicketNumber || t.ticketNumber || '',
            prefix: t.Prefix || t.prefix || '',
            serviceName: t.ServiceName || t.serviceName || ''
        };
    }

    function normalizeState(raw) {
        if (!raw) return { nowServing: null, pending: [], servedCount: {} };

        var ns = raw.NowServing || raw.nowServing || null;
        var pending = raw.Pending || raw.pending || [];
        var served = raw.ServedCount || raw.servedCount || {};

        return {
            nowServing: normalizeTicket(ns),
            pending: $.map(pending, function (t) { return normalizeTicket(t); }),
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

    // New ticket issued at the kiosk
    connection.on('ticketIssued', function (raw) {
        renderState(normalizeState(raw));
        flashServingBlock();
    });

    // Staff called the next number
    connection.on('ticketCalled', function (raw) {
        renderState(normalizeState(raw));
    });

    // Queue was wiped
    connection.on('queueReset', function () {
        renderState({ nowServing: null, pending: [], servedCount: {} });
    });

    // ── 4. Call-Number button handler ───────────────────────────────
    $(document).on('click', '.qsp-call-btn', function () {
        var $btn = $(this);
        var serviceId = parseInt($btn.data('service'));
        var prefix = $btn.data('prefix');

        if ($btn.hasClass('calling')) return;

        $('.qsp-call-btn').addClass('calling');

        doAjax(CFG.callNextUrl, 'POST', { ServiceId: serviceId })
            .then(function (res) {
                // State update arrives via ticketCalled hub broadcast.
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
            $serving[0].offsetHeight;   // force reflow to restart animation
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
            var $el = $('#qsp-count-' + prefix);
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

    // ── Utility ─────────────────────────────────────────────────────

    function setDot(status) {
        $dot.removeClass('connected reconnecting disconnected').addClass(status);
    }

    function flashServingBlock() {
        $servingBlk.removeClass('flash');
        $servingBlk[0].offsetHeight;
        $servingBlk.addClass('flash');
    }


    function formatCurrency(value) {
        return '₱ ' + parseFloat(value).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
});