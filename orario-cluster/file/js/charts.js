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

                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            layout: {
                padding: 10
            },

            plugins: {

                title: {
                    display: true,
                    text: 'Distribuzione Presenze',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },

                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        boxWidth: 15
                    }
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {

                            const value = context.raw;

                            const total =
                                context.dataset.data.reduce(
                                    (a, b) => a + b,
                                    0
                                );

                            const perc =
                                total > 0
                                    ? ((value / total) * 100).toFixed(1)
                                    : 0;

                            return `${context.label}: ${value} (${perc}%)`;
                        }
                    }
                }
            }
        }
    });
}
