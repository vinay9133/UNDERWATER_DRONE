import time
import websocket
from brping import PingDevice

sonar = PingDevice()
sonar.connect("COM11", 115200)

def send_sonar_data():
    ws = websocket.WebSocket()
    ws.connect("ws://localhost:8080")

    while True:
        data = sonar.get_distance()
        if data:
            distance = data['distance']
            ws.send(str(distance))
        time.sleep(1)

if __name__ == "__main__":
    send_sonar_data()
