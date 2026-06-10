$(function () {
    set_active_sidebar('.dashboard-nav');

    const CONFIG = {
        endpoints: {
            getDashboardStats: '/Dashboard/getDashboardStatistics',
            getEducationalAttainment: '/Dashboard/getEducationalAttainment',
            getCivilStatus: '/Dashboard/getCivilStatus',
            getGender: '/Dashboard/getGender',
            getGenderDistribution: '/Dashboard/getGenderDistribution',
            getVotersDistribution: '/Dashboard/getVotersDistribution',

            getAgeStructure: '/Dashboard/getAgeStructure',
            getAgeStructuredPer5Years: '/Dashboard/getAgeStructuredPer5Years',
            getCollectionSummary: '/Dashboard/getCollectionSummary',
            getCollectionLast30Days: '/Dashboard/getCollectionLast30Days'
        },
        selectors: {
            chartAge: '#chartAge',
            chartEducation: '#chartEducation',
            chartStatus: '#chartStatus',
            chartBirthRate: '#chartBirthRate',
            chartCollection: '#chartCollection',

            divDasboardStats: '#divDasboardStats',
            divGenderStats: '#divGenderStats',
            divVotersStats: '#divVotersStats',
        }
    };

    LoadDashBoardStats();
    LoadGenderDistribution();
    LoadVotersDistribution();
    LoadEducationAttainmentChart();
    LoadCivilStatusChart();
    LoadAgeChart();
    LoadBirthRatePer5Years();
    LoadCTCCollectionSummary();
    LoadCollectionLast30Days();

    function LoadDashBoardStats() {
        doAjax(CONFIG.endpoints.getDashboardStats, 'GET', null)
            .then(res => {
                setValues(CONFIG.selectors.divDasboardStats, res);
            })
    }
    function LoadGenderDistribution() {
        doAjax(CONFIG.endpoints.getGenderDistribution, 'GET', null)
            .then(res => {
                setValues(CONFIG.selectors.divGenderStats, res);
            })
    }
    function LoadVotersDistribution() {
        doAjax(CONFIG.endpoints.getVotersDistribution, 'GET', null)
            .then(res => {
                setValues(CONFIG.selectors.divVotersStats, res);
            })
    }


    function LoadEducationAttainmentChart() {
        doAjax(CONFIG.endpoints.getEducationalAttainment, 'GET', null)
            .then(res => {
                renderChart(CONFIG.selectors.chartEducation, res, "Label", "Total", "line");
            })
    }
    function LoadCivilStatusChart() {
        doAjax(CONFIG.endpoints.getCivilStatus, 'GET', null)
            .then(res => {
                renderChart(CONFIG.selectors.chartStatus, res, "Label", "Total", "bar");
            })
    }
    function LoadAgeChart() {
        doAjax(CONFIG.endpoints.getAgeStructure, 'GET', null)
            .then(res => {
                renderChart(CONFIG.selectors.chartAge, res, "Label", "Total", "bar");
            })
    }

    function LoadBirthRatePer5Years() {
        doAjax(CONFIG.endpoints.getAgeStructuredPer5Years, 'GET', null)
            .then(res => {
                renderChart(CONFIG.selectors.chartBirthRate, res, "Label", "Total", "line");
            })
    }

    function LoadCollectionLast30Days() {
        doAjax(CONFIG.endpoints.getCollectionLast30Days, 'GET', null)
            .then(res => {
                renderChart(CONFIG.selectors.chartCollection, res, "Label", "Total", "line");
            })
    }

    function LoadCTCCollectionSummary() {
        doAjax(CONFIG.endpoints.getCollectionSummary, 'GET', null)
            .then(res => {
                const daily = res.find(r => r.Period === 'Daily');
                const monthly = res.find(r => r.Period === 'Monthly');
                const yearly = res.find(r => r.Period === 'Yearly');

                // Daily
                document.querySelector('#lblDailyIssued').textContent = daily.TotalIssued;
                document.querySelector('#lblDailyCollection').textContent = formatCurrency(daily.TotalCollection);

                // Monthly
                document.querySelector('#lblMonthlyIssued').textContent = monthly.TotalIssued;
                document.querySelector('#lblMonthlyCollection').textContent = formatCurrency(monthly.TotalCollection);

                // Yearly
                document.querySelector('#lblYearlyIssued').textContent = yearly.TotalIssued;
                document.querySelector('#lblYearlyCollection').textContent = formatCurrency(yearly.TotalCollection);
            });
    }

    


    function renderChart(canvasId, rows, labelField, valueField, customType = null) {
        const canvas = document.querySelector(canvasId);
        const ctx = canvas.getContext('2d');
        const labels = rows.map(r => r[labelField]);
        const data = rows.map(r => r[valueField]);

        let chartType = customType || (labels.length <= 4 ? 'doughnut' : 'bar');
        let indexAxis = chartType === 'bar' ? 'y' : 'x';
        const isLine = chartType === 'line';
        const isBar = chartType === 'bar';

        const lineGradients = labels.map(() => {
            const gradient = ctx.createLinearGradient(0, 300, 0, 10);
            gradient.addColorStop(0, 'rgb(218, 225, 241)');
            gradient.addColorStop(0.4, 'rgb(144, 165, 213)');
            gradient.addColorStop(0.7, 'rgb(107, 135, 199)');
            gradient.addColorStop(1, 'rgb(54, 83, 150)');
            return gradient;
        });

        new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: valueField,
                    data: data,
                    backgroundColor:  isLine ? lineGradients : undefined,
                    borderColor: isLine ? 'rgb(129, 154, 202)' : undefined,
                    borderWidth: isLine ? 2 : 0,
                    borderRadius: isBar ? 6 : 0,
                    tension: isLine ? 0.4 : 0,
                    fill: isLine,
                    pointBackgroundColor: isLine ? 'rgb(129, 154, 202)' : undefined,
                    pointBorderColor: isLine ? 'rgb(129, 154, 202)' : undefined,
                    pointBorderWidth: isLine ? 2 : undefined,
                    pointRadius: isLine ? 1 : undefined,
                    pointHoverRadius: isLine ? 1 : undefined,
                }]
            },
            plugins: [{
                id: 'customFill',
                beforeUpdate(chart) {          // ← beforeUpdate instead of beforeDraw
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return;

                    if (isBar) {
                        chart.data.datasets[0].backgroundColor = labels.map(() => {
                            const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
                            gradient.addColorStop(0,    'rgb(218, 225, 241)');
                            gradient.addColorStop(0.4,  'rgb(144, 165, 213)');
                            gradient.addColorStop(0.7,  'rgb(107, 135, 199)');
                            gradient.addColorStop(1,    'rgb(54, 83, 150)');
                            return gradient;
                        });
                    }
                }
            }],
            options: {
                indexAxis: indexAxis,
                plugins: {
                    legend: {
                        display: chartType === 'doughnut'
                    }
                },
                scales: isBar ? {
                    x: { grid: { display: false, drawBorder: false }, ticks: { display: false } },
                    y: { grid: { display: false, drawBorder: false } }
                } : isLine ? {
                    x: { grid: { display: false, drawBorder: false } },
                    y: { grid: { display: false, drawBorder: false } }
                } : {},
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
});