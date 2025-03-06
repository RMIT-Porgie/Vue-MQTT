import paho.mqtt.client as mqtt
import random
import time
import json


# Define the MQTT broker details
MQTT_BROKER = "test.mosquitto.org" 
MQTT_PORT = 1883
MQTT_TOPIC = "skl6/sensor"
MQTT_QOS = 0  # Quality of Service (0, 1, or 2)

def on_connect(client, userdata, flags, rc):
    """Callback function when the client connects to the broker."""
    if rc == 0:
        print("Connected to MQTT broker")
    else:
        print("Failed to connect to MQTT broker")

def publish_message(client, topic, message):
    """Publish a message to the specified topic."""
    result = client.publish(topic, message, MQTT_QOS)
    if result.rc == mqtt.MQTT_ERR_SUCCESS:
        print(f"Published message to topic '{topic}': {message}")
    else:
        print(f"Failed to publish message to topic '{topic}': {result.rc}")


def generate_data():
    # Number of sensors to generate
    randID = random.randint(1, 5)
    sensor = {
        "id": randID,
        "name": "Sensor " + str(randID),
        "temperature": random.randint(20, 40),
        "humidity": random.randint(40, 60),
        "wind_speed": random.randint(1, 13)
    }
    sensor = json.dumps(sensor)
    return sensor


def main():
    # Create an MQTT client instance
    client = mqtt.Client()

    # Set the callback function for when the client connects
    client.on_connect = on_connect

    # Connect to the MQTT broker
    client.connect(MQTT_BROKER, MQTT_PORT)

    # Start the MQTT client loop
    client.loop_start()

    # Publish a message every 10 seconds
    while True:
        # message = str(random.randint(0, 100))
        message = str(generate_data())
        client.publish(MQTT_TOPIC, message)
        print("Sending: " + message)
        time.sleep(1)


if __name__ == "__main__":
    main()