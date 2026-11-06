let presenzeChart = null;
let saldoChart = null;

function updateCharts(presenza, smartWorking, assenze) {

    const canvas = document.getElementById('presenzeChart');

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (presenzeChart) {
        presenzeChart.destroy();
    }

    presenzeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [
                'Presenza',
                'Smart Working',
                'Assenza'
            ],
            datasets: [{
                data: [
                    presenza,
                    smartWorking,
                    assenze
                ],
                backgroundColor: [
                    '#22c55e',
                    '#3b82f6',
                    '#ef4444'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateSaldoChart(records, workdayMin) {

    const canvas = document.getElementById('saldoChart');

    if (!canvas) return;

    const labels = [];
    const values = [];
    const colors = [];

    records.forEach(r => {

        if (
            r.sede === 'Assenza' ||
            !r.entrata ||
            !r.uscita
        ) {
            return;
        }

        const e = toMin(r.entrata);
        const u = toMin(r.uscita);

        if (e === null || u === null) {
            return;
        }

        const baseMin =
            e < APP_CONFIG.WORKDAY_START_MINUTES
                ? APP_CONFIG.WORKDAY_START_MINUTES
                : e;

        const uscitaTeorica =
            baseMin + workdayMin;

        const saldo =
            u - uscitaTeorica;

	const parts = r.date.split('-');    

        labels.push(
            `${parts[2]}/${parts[1]}`
        );

        values.push(saldo);

        colors.push(
            saldo >= 0
                ? '#22c55e'
                : '#ef4444'
        );
    });

    const ctx = canvas.getContext('2d');

    if (saldoChart) {
        saldoChart.destroy();
    }

    saldoChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Saldo minuti',
                data: values,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

		plugins: {
    legend: {
        display: false
    },

    tooltip: {
        callbacks: {
            label: function(context) {

                const value = context.raw;

                return `Saldo: ${fromMin(value)}`;
            }
        }
    }
}

            scales: {

                y: {
                    beginAtZero: true,

                    ticks: {
                        callback: function(value) {

                            const h =
                                Math.floor(
                                    Math.abs(value) / 60
                                );

                            const m =
                                Math.abs(value) % 60;

                            const segno =
                                value < 0 ? '-' : '+';

                            return `${segno}${h}:${String(m).padStart(2,'0')}`;
                        }
                    }
                }
            }
        }
    });
}
