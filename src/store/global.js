import { defineStore } from "pinia";
import { createMqttClient } from "@/services/mqtt";

const MAX_HISTORY_SIZE = 100; // Limit history size
const SENSOR_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useGlobalStore = defineStore("global", {
    state: () => ({
        title: "Sensor Dashboard",
        sensors: new Map(),
        mqttClient: null,
        isConnected: false,
        connecting: false,
        cleanupInterval: null,
    }),
    getters: {
        sensorsArray: state => {
            return Array.from(state.sensors.values())
                .map(sensor => ({
                    id: sensor.id,
                    name: sensor.name,
                    currentTemperature: sensor.temperatureHistory.at(-1)?.value?.toFixed(1) ?? '-',
                    currentHumidity: sensor.humidityHistory.at(-1)?.value?.toFixed(1) ?? '-',
                    currentWindSpeed: sensor.windSpeedHistory.at(-1)?.value?.toFixed(1) ?? '-',
                    lastUpdated: sensor.lastUpdated
                }))
                .sort((a, b) => a.id - b.id);
        }
    },
    actions: {
        setTitle(title) {
            this.title = title;
        },
        updateSensors(sensorsMap) {
            this.sensors = sensorsMap instanceof Map ? new Map(sensorsMap) : new Map(sensorsMap);
        },
        getSensorById(id) {
            const numericId = Number(id);
            const sensor = this.sensors.get(numericId);
            if (!sensor) return null;

            return {
                ...sensor,
                currentTemperature: sensor.temperatureHistory.at(-1)?.value ?? null,
                currentHumidity: sensor.humidityHistory.at(-1)?.value ?? null,
                currentWindSpeed: sensor.windSpeedHistory.at(-1)?.value ?? null
            };
        },
        async connectMqtt() {
            if (this.connecting || this.isConnected) return;
            
            this.connecting = true;
            try {
                const config = {
                    host: "test.mosquitto.org",
                    port: 8081,
                    protocol: "wss",
                    topic: "skl6/sensor",
                    onMessage: this.handleMessage.bind(this)
                };

                this.mqttClient = await createMqttClient(config);
                this.isConnected = true;
                
                // Start cleanup interval
                this.cleanupInterval = setInterval(this.cleanupOldSensors.bind(this), SENSOR_CLEANUP_INTERVAL);
            } catch (error) {
                console.error("Connection failed:", error);
                this.mqttClient = null;
                this.isConnected = false;
            } finally {
                this.connecting = false;
            }
        },

        async disconnectMqtt() {
            if (!this.mqttClient) return;

            try {
                if (this.cleanupInterval) {
                    clearInterval(this.cleanupInterval);
                    this.cleanupInterval = null;
                }
                
                this.sensors.clear();
                await new Promise(resolve => {
                    this.mqttClient.end(true, () => resolve());
                });
            } catch (error) {
                console.error("Error disconnecting:", error);
            } finally {
                this.mqttClient = null;
                this.isConnected = false;
            }
        },

        cleanupOldSensors() {
            const now = Date.now();
            for (const [id, sensor] of this.sensors.entries()) {
                if (now - sensor.lastUpdated > SENSOR_CLEANUP_INTERVAL) {
                    this.sensors.delete(id);
                }
            }
            // Force reactivity
            if (this.sensors.size) {
                this.sensors = new Map(this.sensors);
            }
        },

        trimHistory(history) {
            if (history.length > MAX_HISTORY_SIZE) {
                return history.slice(-MAX_HISTORY_SIZE);
            }
            return history;
        },

        handleMessage(topic, message) {
            try {
                const payload = JSON.parse(message.toString());
                if (!payload.id) return;

                const timestamp = Date.now();
                const currentSensor = this.sensors.get(payload.id) || {
                    id: payload.id,
                    name: `Sensor ${payload.id}`, // Add default name if not provided
                    temperatureHistory: [],
                    humidityHistory: [],
                    windSpeedHistory: [],
                    lastUpdated: timestamp
                };

                // Update histories only if new values exist
                if (payload.temperature !== undefined) {
                    currentSensor.temperatureHistory = this.trimHistory([
                        ...currentSensor.temperatureHistory,
                        { value: Number(payload.temperature), timestamp }
                    ]);
                }
                if (payload.humidity !== undefined) {
                    currentSensor.humidityHistory = this.trimHistory([
                        ...currentSensor.humidityHistory,
                        { value: Number(payload.humidity), timestamp }
                    ]);
                }
                if (payload.wind_speed !== undefined) {
                    currentSensor.windSpeedHistory = this.trimHistory([
                        ...currentSensor.windSpeedHistory,
                        { value: Number(payload.wind_speed), timestamp }
                    ]);
                }

                currentSensor.lastUpdated = timestamp;
                this.sensors.set(payload.id, currentSensor);

                // Force reactivity
                this.sensors = new Map(this.sensors);
            } catch (error) {
                console.error("Error processing message:", error);
            }
        },

        updateSensorData(sensorData) {
            const sensor = this.sensors.get(sensorData.id);
            if (sensor) {
                // Update the sensor data
                Object.assign(sensor, {
                    ...sensorData,
                    lastUpdated: Date.now() // Add timestamp for updates
                });
            }
        }
    }
});
