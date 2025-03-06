import mqtt from "mqtt";

export const createMqttClient = ({ host, port, protocol, topic, onMessage }) => {
    const client = mqtt.connect(`${protocol}://${host}:${port}`, {
        protocol: protocol,
        protocolVersion: 4,
        rejectUnauthorized: false
    });

    return new Promise((resolve, reject) => {
        client.once("connect", () => {
            console.log("Connected to MQTT broker");

            client.subscribe(topic, err => {
                if (err) {
                    console.error("Subscription error:", err);
                    reject(err);
                    return;
                }
                console.log(`Subscribed to ${topic}`);
                client.on("message", onMessage);
                resolve(client);
            });
        });

        client.once("error", error => {
            console.error("MQTT Error:", error);
            reject(error);
        });

        // Add timeout
        setTimeout(() => reject(new Error("Connection timeout")), 5000);
    });
};
