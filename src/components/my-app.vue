<template>
    <v-app id="inspire">
        <v-app-bar color="primary">
            <v-toolbar-title>{{ globalStore.title }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn
                :color="isConnected ? 'red darken-2' : 'green darken-2'"
                class="text-none text-subtitle-1"
                variant="flat"
                @click="toggleConnection"
                :loading="connecting"
                :disabled="connecting"
            >
                {{ connectionButtonText }}
            </v-btn>
        </v-app-bar>

        <v-main>
            <v-container>
                <v-data-table v-if="isConnected" :headers="headers" :items="sensorsArray" :items-per-page="-1" hide-default-footer class="elevation-1">
                    <template v-slot:item="{ item }">
                        <tr :class="{ 'highlight-update': isRecentlyUpdated(item) }">
                            <td>
                                <a href="#" class="sensor-link" @click.prevent="goToSensorDetails(item.id)">
                                    {{ item.id }}
                                </a>
                            </td>
                            <td v-for="header in headers.slice(1)" :key="header.key">
                                {{ item[header.key] }}
                            </td>
                        </tr>
                    </template>
                </v-data-table>
                <v-card v-else class="mt-4 pa-4">
                    <v-table>
                        <thead>
                            <tr>
                                <th class="text-h6">Status</th>
                                <th class="text-h6">Action Required</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>MQTT Disconnected</td>
                                <td>Click the "Connect MQTT" button @ Top Right side to start receiving sensor data.</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card>
            </v-container>
        </v-main>
        <v-footer color="primary" app>
            <span class="text-white">&copy; {{ new Date().getFullYear() }}</span>
        </v-footer>
    </v-app>
</template>

<script>
import { mapStores } from "pinia";
import { requirejs, widget } from "@widget-lab/3ddashboard-utils";
import { useGlobalStore } from "@/store/global";

export default {
    name: "App",
    data() {
        return {
            headers: [
                { title: "Sensor ID", key: "id" },
                { title: "Name", key: "name" },
                { title: "Temperature (°C)", key: "currentTemperature" },
                { title: "Humidity (%)", key: "currentHumidity" },
                { title: "Wind Speed (km/h)", key: "currentWindSpeed" }
            ],
            updateThreshold: 2000,
            clickedPOIID: null,
            platformAPI: {},
            sensorData: {
                widgetID: widget.id,
                geojson: {
                    type: "FeatureCollection",
                    name: "sensor-points",
                    crs: { type: "name", properties: { name: "urn:ogc:def:crs:EPSG::7855" } },
                    features: [
                        // 344778.2247	5966176.809 344779.2247	5966176.809
                        {
                            type: "Feature",
                            properties: { "id": 1, "Temperature": 0, "Humidity": 0, "Wind Speed": 0 },
                            geometry: { type: "Point", coordinates: [344778.2247, 5966176.809, 200] }
                        },
                        {
                            type: "Feature",
                            properties: { "id": 2, "Temperature": 0, "Humidity": 0, "Wind Speed": 0 },
                            geometry: { type: "Point", coordinates: [344779.2247, 5966176.809, 200] }
                        },
                        // {
                        //     type: "Feature",
                        //     properties: { "id": 3, "Temperature": 0, "Humidity": 0, "Wind Speed": 0 },
                        //     geometry: { type: "Point", coordinates: [16269165.72, -4652406.49, 150] }
                        // },
                        // {
                        //     type: "Feature",
                        //     properties: { "id": 4, "Temperature": 0, "Humidity": 0, "Wind Speed": 0 },
                        //     geometry: { type: "Point", coordinates: [16260321.26, -4661436.45, 150] }
                        // },
                        // {
                        //     type: "Feature",
                        //     properties: { "id": 5, "Temperature": 0, "Humidity": 0, "Wind Speed": 0 },
                        //     geometry: { type: "Point", coordinates: [16263142.95, -4655997.14, 150] }
                        // }
                    ]
                },
                layer: {
                    id: "sensor-layer",
                    name: "Sensors POI",
                    attributeMapping: {
                        "STRID": "id",
                        "Temperature": "currentTemperature",
                        "Humidity": "currentHumidity",
                        "Wind Speed": "currentWindSpeed"
                    }
                },
                folder: {
                    id: "sensor-folder",
                    name: "Sensors Folder"
                },
                render: {
                    anchor: true,
                    color: "rgb(255,255,255)",
                    scale: [0.5, 0.5, 0.5],
                    shape: "billboard",
                    switchDistance: 500,
                    opacity: 1
                }
            }
        };
    },
    computed: {
        ...mapStores(useGlobalStore),
        isConnected() {
            return this.globalStore.isConnected;
        },
        connecting() {
            return this.globalStore.connecting;
        },
        connectionButtonText() {
            if (this.connecting) return "Connecting...";
            return this.isConnected ? "Disconnect" : "Connect MQTT";
        },
        sensorsArray() {
            const array = this.globalStore.sensorsArray;
            console.log('Sensors Array:', array);
            return array;
        }
    },
    async mounted() {
        this.platformAPI = await requirejs("DS/PlatformAPI/PlatformAPI");
    },
    methods: {
        async toggleConnection() {
            if (this.isConnected) {
                await this.globalStore.disconnectMqtt();
                this.manageSubscription();
            } else {
                await this.globalStore.connectMqtt();
                if (this.isConnected) {
                    this.manageSubscription();
                    this.initializeSensorData();
                    this.initializeItemSelect();
                    this.initializeDeselect();
                }
            }
        },
        initializeSensorData() {
            this.platformAPI.publish("3DEXPERIENCity.Add3DPOI", this.sensorData);
        },
        initializeItemSelect() {
            this.platformAPI.subscribe("3DEXPERIENCity.OnItemSelect", res => this.getSelectedSensorData(res));
        },
        initializeDeselect() {
            this.platformAPI.subscribe("3DEXPERIENCity.OnItemDeselect", () => this.$router.push({ name: "home" }));
        },
        async getSelectedSensorData(res) {
            console.log("getSelectedSensorData => ", res);

            this.platformAPI.subscribe("3DEXPERIENCity.GetSelectedItemsReturn", res => this.getSelectedItemsReturn(res.data[0].userData.id));
            this.platformAPI.publish("3DEXPERIENCity.GetSelectedItems", widget.id);
        },
        getSelectedItemsReturn(id) {
            this.platformAPI.unsubscribe("3DEXPERIENCity.GetSelectedItemsReturn");
            const selectedId = id;
            console.log("Selected ID: ", selectedId);

            this.goToSensorDetailsFromMap(selectedId);
        },
        isRecentlyUpdated(item) {
            console.log('Checking update for item:', item.id, 'Last updated:', item.lastUpdated);
            return item.lastUpdated && (Date.now() - item.lastUpdated) < this.updateThreshold;
        },
        manageSubscription() {
            this.platformAPI.unsubscribe("xCity.resolve");
            this.platformAPI.unsubscribe("3DEXPERIENCity.OnItemSelect");
        },
        goToSensorDetailsFromMap(id) {
            this.$router.push({ name: "sensorDetails", params: { id: id.toString() } });
        },
        goToSensorDetails(id) {
            this.platformAPI.publish("3DEXPERIENCity.SelectObject", {
                widget_id: widget.id,
                layer_id: "sensor-layer",
                folder_id: "sensor-folder",
                primitive_id: id,
                exclusive: true
            });
            this.$router.push({ name: "sensorDetails", params: { id: id.toString() } });
        }
    }
};
</script>

<style>
@keyframes highlight {
    0% {
        background-color: rgba(255, 255, 0, 0.3);
    }
    50% {
        background-color: rgba(255, 255, 0, 0.3);
    }
    100% {
        background-color: transparent;
    }
}

.highlight-update {
    animation: highlight 2s ease-out;
}

.sensor-link {
    color: #1976d2;
    text-decoration: none;
    cursor: pointer;
}

.sensor-link:hover {
    text-decoration: underline;
}
</style>
