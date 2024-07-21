import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import * as d3 from 'd3';

const socket = io('http://localhost:8080');

function App() {
  const [connected, setConnected] = useState(false);
  const videoRef = useRef();
  const sonarRef = useRef();

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('sonar-data', (data) => {
      // Process and update sonar graph
      updateSonarGraph(data);
    });

    return () => socket.off();
  }, []);

  const updateSonarGraph = (data) => {
    const svg = d3.select(sonarRef.current);
    svg.selectAll('*').remove();

    const width = 500;
    const height = 500;

    const x = d3.scaleLinear().domain([0, data.length]).range([0, width]);
    const y = d3.scaleLinear().domain([d3.min(data), d3.max(data)]).range([height, 0]);

    const line = d3.line()
      .x((d, i) => x(i))
      .y((d) => y(d));

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('stroke-width', 1.5)
      .attr('d', line);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Underwater Drone Control</h1>
        <div className="status">{connected ? 'Connected' : 'Disconnected'}</div>
        {connected && <audio src="connected.mp3" autoPlay />}
        {!connected && <audio src="disconnected.mp3" autoPlay />}
        <div className="camera-feed">
          <video ref={videoRef} src="udp://localhost:1234" autoPlay controls />
        </div>
        <div className="sonar-graph">
          <svg ref={sonarRef} width={500} height={500}></svg>
        </div>
      </header>
    </div>
  );
}

export default App;
