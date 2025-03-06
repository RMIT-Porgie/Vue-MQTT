<template>
    <div class="sensor-details">
        <h2>Sensor {{ id }} Historical Data</h2>
        <div v-if="loading">Loading...</div>
        <div v-else>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Temperature</th>
                        <th>Humidity</th>
                        <th>CO2</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="record in historicalData" :key="record.timestamp">
                        <td>{{ new Date(record.timestamp).toLocaleString() }}</td>
                        <td>{{ record.temperature }}°C</td>
                        <td>{{ record.humidity }}%</td>
                        <td>{{ record.co2 }} ppm</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "SensorDetails",
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            historicalData: [],
            loading: true
        };
    },
    async created() {
        try {
            const response = await axios.get(`/api/sensors/${this.id}/history`);
            this.historicalData = response.data;
        } catch (error) {
            console.error("Error fetching sensor history:", error);
        } finally {
            this.loading = false;
        }
    }
};
</script>

<style scoped>
.sensor-details {
    padding: 20px;
}
table {
    width: 100%;
    border-collapse: collapse;
}
th,
td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}
th {
    background-color: #f2f2f2;
}
</style>
