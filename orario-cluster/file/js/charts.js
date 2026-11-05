let presenzeChart = null;

function updateCharts(presenza, smartWorking, assenze) {

    const canvas = document.getElementById('presenzeChart');

    if (!canvas) {
        return;
    }

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
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Distribuzione Presenze'
                }
            }
        }
    });
}
