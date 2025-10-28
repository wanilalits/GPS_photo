import React, { useState, useRef } from "react";

function App() {
  const [photo, setPhoto] = useState(null);
  const [gps, setGps] = useState(null);
  const [time, setTime] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Ask for GPS
  const requestGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setGps({ latitude, longitude });
          const gpsTime = new Date(pos.timestamp); // convert to human-readable format
         
          setTime(gpsTime.toLocaleString());
        },
        (err) => alert("Please enable GPS to continue.")
      );
    } else {
      alert("Geolocation not supported.");
    }
  };

  // Start camera
  const startCamera = async () => {
    requestGPS();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (e) {
      alert("Camera access denied.");
    }
  };

  // Capture photo and draw GPS + time
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (gps && time) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText(
        `Lat: ${gps.latitude.toFixed(5)}, Lng: ${gps.longitude.toFixed(5)}`,
        10,
        canvas.height - 35
      );
      ctx.fillText(`Time: ${time}`, 10, canvas.height - 10);
    }

    const imageUrl = canvas.toDataURL("image/jpeg");
    setPhoto(imageUrl);
  };

  // Download photo (save to gallery)
  const downloadPhoto = () => {
    const link = document.createElement("a");
    link.href = photo;
    link.download = "photo_with_gps.jpg";
    link.click();
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>📸 GPS Photo Capture</h2>

      {!photo && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "90%", borderRadius: 10 }}
          />
          <br />
          <button onClick={startCamera}>Start Camera & GPS</button>
          <button onClick={capturePhoto}>Capture Photo</button>
        </>
      )}

      {photo && (
        <>
          <img
            src={photo}
            alt="Captured"
            style={{ width: "90%", borderRadius: 10 }}
          />
          <div>
            <button onClick={downloadPhoto}>Save to Gallery</button>
            <button onClick={() => setPhoto(null)}>Retake</button>
          </div>
        </>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default App;
