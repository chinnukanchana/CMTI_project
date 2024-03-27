import React, { useState } from 'react';

function RotatableLine() {
  const [degree, setDegree] = useState(0);
  const [showLine, setShowLine] = useState(false); // State to track if line should be displayed

  const handleScroll = (event) => {
    const scrollValue = event.target.value;
    setDegree(scrollValue);
  };

  const rotateCoordinates = (x, y, degree) => {
    const radians = (-degree * Math.PI) / 180;
    const newX = x * Math.cos(radians) - y * Math.sin(radians);
    const newY = y * Math.cos(radians) + x * Math.sin(radians);
    return { x: newX, y: newY };
  };

  const toggleLine = () => {
    setShowLine(!showLine); // Toggle the state when the button is clicked
  };

  // Example point coordinates
  const pointX = 100;
  const pointY = 0;

  const rotatedPoint = rotateCoordinates(pointX, pointY, degree);

  return (
    <div style={{ position: 'relative' }}>
      <svg width="400" height="200" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
        {/* Your graph elements */}
        <line x1="0" y1="100" x2="200" y2="100" stroke="black" />
      </svg>
      {showLine && ( // Render line only if showLine is true
        <svg
          width="400"
          height="200"
          style={{ position: 'absolute', top: 135, left: 249, zIndex: 1 }}
        >
          {/* Rotatable line */}
          <line
            x1="100"
            y1="100"
            x2={100 + rotatedPoint.x}
            y2={100 + rotatedPoint.y}
            stroke="red"
          />
          <circle cx={100 + rotatedPoint.x} cy={100 + rotatedPoint.y} r="4" fill="red" />
        </svg>
      )}
      <input
        type="range"
        min="0"
        max="360"
        value={degree}
        onChange={handleScroll}
        style={{ width: '100px', position: 'absolute', top: '400px', left: 100, zIndex: 2 }}
      />
      <input
        type="number"
        value={degree}
        onChange={(e) => setDegree(e.target.value)}
        style={{ position: 'absolute', left: '500px', zIndex: 2, width: '50px', top: '400px' }}
      />
      <span style={{ position: 'absolute', top: '400px', left: '580px', zIndex: 2 }}>
        degrees
      </span>
      <button
        onClick={toggleLine}
        className="absolute z-20 bg-gray-500 hover:bg-green-700 text-white font-bold py-0 px-0 rounded"
        style={{ width: '50px', height: '30px', top: '400px', left: '35px' }}
      >
        {showLine ? 'Hide Line' : 'Angle'}
      </button>
    </div>
  );
}

export default RotatableLine;

