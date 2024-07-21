from flask import Flask, render_template, Response
import cv2
from brping import Ping1D

app = Flask(__name__)

# Initialize the Ping sonar
sonar = Ping1D()
sonar.connect_serial("COM11", 115200)

if sonar.initialize() is False:
    print("Failed to initialize Ping!")
    exit(1)

@app.route('/')
def index():
    """Video streaming home page."""
    return render_template('index.html')

def gen():
    """Video streaming generator function."""
    cap = cv2.VideoCapture(0)  # Change the camera source as needed
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        ret, jpeg = cv2.imencode('.jpg', frame)
        frame = jpeg.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(gen(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

def get_sonar_data():
    data = sonar.get_distance()
    if data:
        return {"distance": data["distance"], "confidence": data["confidence"]}
    else:
        return {"distance": None, "confidence": None}

@app.route('/sonar_data')
def sonar_data():
    return get_sonar_data()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
