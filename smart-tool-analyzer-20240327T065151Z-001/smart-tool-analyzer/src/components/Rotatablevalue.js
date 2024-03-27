import React, { useState } from 'react';

function RotatableValue() {
  const [degree, setDegree] = useState(0);
  const [calculateAngle, setCalculateAngle] = useState(false);
  const [calculateValue, setCalculateValue] = useState(false);
  const [distance, setDistance] = useState(0);
  const [handlePosition, setHandlePosition] = useState(50);
  const [lineEnd, setLineEnd] = useState({ x: 50, y: 50 });

  const handleAngleScroll = (event) => {
    const scrollValue = event.target.value;
    if (calculateAngle) {
      setDegree(scrollValue);
    }
  };

  const handleValueScroll = (event) => {
    const scrollValue = event.target.value;
    if (calculateValue) {
      setHandlePosition(scrollValue);
      const radians = (-scrollValue * Math.PI) / 180;
      const newX = pointX + handlePosition * Math.tan(radians);
      const newY = pointY + handlePosition * Math.cos(radians);
      setLineEnd({ x: newX, y: newY });
      const distance = Math.sqrt((newX - pointX) ** 2 + (newY - pointY) ** 2); // Calculate distance from midpoint
      setDistance(parseFloat(distance).toFixed(2));  // Round to 2 decimal places
    }
  };
  
  
  

   const rotateCoordinates = (x, y, degree) => {
    const radians = (-degree * Math.PI) / 180;
    const newX = x * Math.cos(radians) - y * Math.sin(radians);
    const newY = x * Math.sin(radians) + y * Math.cos(radians);
    return { x: newX, y: newY };
  };

  const pointX = 200;
  const pointY = 0;

  const rotatedPoint = rotateCoordinates(pointX, pointY, degree);

  return (
    <div style={{ position: 'relative' }}>
      <svg width="400" height="200" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
        <line x1="0" y1="100" x2="200" y2="100" stroke="blue" />
      </svg>
      <svg width="400" height="200" style={{ position: 'absolute', top: 135, left: 327, zIndex: 1 }}>
        {calculateAngle && (
          <>
            <line
              x1="100"
              y1="100"
              x2={100 + rotatedPoint.x}
              y2={100 + rotatedPoint.y}
              stroke="blue"
            />
            <circle cx={100 + rotatedPoint.x} cy={100 + rotatedPoint.y} r="4" fill="blue" />
          </>
        )}

        {calculateValue && (
          <>
            <line x1="100" y1="100" x2={100 + lineEnd.x} y2={100 + lineEnd.y} stroke="red" />
            <circle cx={100 + lineEnd.x} cy={100 + lineEnd.y} r="4" fill="red" />
          </>
        )}
      </svg>
      <input
        type="range"
        min="0"
        max="360"
        value={degree}
        onChange={handleAngleScroll}
        style={{ width: '100px', position: 'absolute', top: '420px', left: 100, zIndex: 2 }}
      />
      <input
        type="range"
        min="0"
        max="100"
        value={handlePosition}
        onChange={handleValueScroll}
        style={{ width: '100px', position: 'absolute', top: '420px', left: 600, zIndex: 2 }}
      />
      <div style={{ position: 'absolute', top: '570px', left: '260px', zIndex: 2, border: '2px solid blue', padding: '6px' }}>
        <input
          type="number"
          value={degree}
          onChange={(e) => setDegree(e.target.value)}
          style={{ width: '50px' }}
        />
        <span style={{ marginLeft: '6px' }}>degrees</span>
      </div>

      <button onClick={() => setCalculateAngle(!calculateAngle)} className="absolute z-20 bg-blue-500 hover:bg-green-700 text-white font-bold py-0 px-0 rounded" style={{ width: '150px', height: '50px', top: '500px', left: '255px' }}>
        {calculateAngle ? 'Calculate Angle Off' : 'Calculate Angle'}
      </button>

      <button onClick={() => setCalculateValue(!calculateValue)} className="absolute z-20 bg-blue-500 hover:bg-green-700 text-white font-bold py-0 px-0 rounded" style={{ width: '150px', height: '50px', top: '500px', left: '465px' }}>
        {calculateValue ? 'Calculate Value Off' : 'Calculate Value'}
      </button>
      
      {calculateValue && (
  <div style={{ position: 'absolute', top: '570px', left: '460px', zIndex: 2, border: '2px solid blue', padding: '6px' }}>
    <span>{`Distance from midpoint: ${parseFloat(distance).toFixed(2)}`}</span>
  </div>
)}

    </div>
  );
}

export default RotatableValue;
