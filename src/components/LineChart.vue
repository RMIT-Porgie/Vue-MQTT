<template>
    <Line :data="chartData" :options="chartOptions" />
</template>

<script>
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from "chart.js";
import { Line } from "vue-chartjs";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default {
    name: "LineChart",
    components: { Line },
    props: {
        label: {
            type: String,
            required: true
        },
        readings: {
            type: Array,
            required: true
        },
        color: {
            type: String,
            default: "#f87979"
        }
    },
    computed: {
        chartData() {
            return {
                labels: this.readings.map(r => new Date(r.timestamp).toLocaleTimeString()),
                datasets: [
                    {
                        label: this.label,
                        backgroundColor: this.color,
                        data: this.readings.map(r => r.value),
                        borderColor: this.color,
                        fill: false,
                        tension: 0.1
                    }
                ]
            };
        },
        chartOptions() {
            return {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Time"
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: this.label
                        }
                    }
                }
            };
        }
    }
};
</script>

<style scoped>
canvas {
    width: 100% !important;
    height: 300px !important;
}
</style>
