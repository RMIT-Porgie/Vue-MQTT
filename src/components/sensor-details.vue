<template>
    <div>
        <v-app-bar color="primary">
            <!-- <v-btn icon="mdi-arrow-left" @click="goBack"></v-btn> -->
            <v-toolbar-title>Sensor {{ id }} History</v-toolbar-title>
        </v-app-bar>

        <v-main>
            <v-container>
                <div v-if="!sensorData" class="text-center pa-4">
                    <v-alert type="warning">No data found for sensor {{ id }}</v-alert>
                </div>
                <v-card v-if="sensorData" class="mb-4">
                    <v-card-title>Temperature History (°C)</v-card-title>
                    <v-card-text>
                        <div class="chart-container">
                            <LineChart label="Temperature" :readings="limitedSensorData.temperatureHistory" color="#FF8080" />
                        </div>
                    </v-card-text>
                </v-card>

                <v-card v-if="sensorData" class="mb-4">
                    <v-card-title>Humidity History (%)</v-card-title>
                    <v-card-text>
                        <div class="chart-container">
                            <LineChart label="Humidity" :readings="limitedSensorData.humidityHistory" color="#66CC66" />
                        </div>
                    </v-card-text>
                </v-card>

                <v-card v-if="sensorData" class="mb-4">
                    <v-card-title>Wind Speed History (km/h)</v-card-title>
                    <v-card-text>
                        <div class="chart-container">
                            <LineChart label="Wind Speed" :readings="limitedSensorData.windSpeedHistory" color="#8080FF" />
                        </div>
                    </v-card-text>
                </v-card>
            </v-container>
        </v-main>

        <v-footer color="primary" app>
            <span class="text-white">&copy; {{ new Date().getFullYear() }}</span>
        </v-footer>
    </div>
</template>

<script>
import { mapStores } from "pinia";
import { requirejs } from "@widget-lab/3ddashboard-utils";
import { useGlobalStore } from "@/store/global";
import LineChart from "./LineChart.vue";

export default {
    name: "SensorDetails",
    components: {
        LineChart
    },
    props: {
        id: {
            type: [String, Number],
            required: true
        }
    },
    async mounted() {
        this.platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
        console.log(`User entered sensor details page for sensor ${this.id}`);
        // // Check if sensor data exists, if not redirect back
        // if (!this.sensorData) {
        //     console.warn("No sensor data found, redirecting back");
        //     this.$router.push("/");
        // }
    },
    computed: {
        ...mapStores(useGlobalStore),
        sensorData() {
            const sensor = this.globalStore.getSensorById(this.id);
            return sensor;
        },
        limitedSensorData() {
            if (!this.sensorData) return null;
            return {
                temperatureHistory: this.sensorData.temperatureHistory.slice(-50),
                humidityHistory: this.sensorData.humidityHistory.slice(-50),
                windSpeedHistory: this.sensorData.windSpeedHistory.slice(-50)
            };
        }
    },
    methods: {
        formatTimestamp(timestamp) {
            return new Date(timestamp).toLocaleString();
        },
        goBack() {
            console.log("Back button Clicked");
            this.platformAPI.subscribe("3DEXPERIENCity.OnItemDeselect", res => console.log("res :>> ", res));
            this.$router.push({ name: "home" });
        }
    }
};
</script>

<style scoped>
.chart-container {
    height: 300px;
    position: relative;
}
</style>
