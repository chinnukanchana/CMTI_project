import React, { useState, useRef, useEffect } from 'react';

const ViewBoundsToggle = ({ chartRef, leftLinePosition, rightLinePosition, chartData, setChartData, originalChartData, setOriginalChartData,width,height }) => {
  const [showViewBounds, setShowViewBounds] = useState(false);
  const [draggingLeft, setDraggingLeft] = useState(false);
  const [draggingRight, setDraggingRight] = useState(false);
  const [startPosition, setStartPosition] = useState(leftLinePosition);
  const [endPosition, setEndPosition] = useState(rightLinePosition);
  const [calculatedValues, setCalculatedValues] = useState(null);
  const dragRef = useRef(null);



  
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (draggingLeft) {
        handleLeftLineDrag(event);
      } else if (draggingRight) {
        handleRightLineDrag(event);
      }
    };
  
    const handleMouseUp = () => {
      setDraggingLeft(false);
      setDraggingRight(false);
    };
  
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingLeft, draggingRight]); // Add dependencies here
  

  useEffect(() => {
    console.log("Start position changed:", startPosition);
    console.log("End position changed:", endPosition);
  }, [startPosition, endPosition]);


  const toggleViewBounds = () => {
    setShowViewBounds(!showViewBounds);
  };

  const formatTime = (seconds) => {
    const date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 12);
  };
  const calculateYAxisValues = (x) => {
    if (!chartData || chartData.length === 0) {
      // Handle the case when chartData is empty
      return {
        x: 'N/A',
        tension: 'N/A',
        torsion: 'N/A',
        bendingMomentY: 'N/A',
        bendingMomentX: 'N/A',
        temperature: 'N/A',
      };
    }
  
    const closestPoint = chartData.reduce((prev, curr) => Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev);
    return {
      x: formatTime(closestPoint.x),
      tension: closestPoint.tension,
      torsion: closestPoint.torsion,
      bendingMomentY: closestPoint.bendingMomentY,
      bendingMomentX: closestPoint.bendingMomentX,
      temperature: closestPoint.temperature,
    };
  };
  
  
  const handleLeftLineDrag = (event) => {
    const chartBounds = chartRef.current.getBoundingClientRect();
    const chartWidth = chartBounds.width;
    const mouseX = event.clientX - chartBounds.left;
    const newPosition = mouseX / chartWidth;
    const newLeftPosition = Math.max(0, Math.min(newPosition, endPosition - 0.05));
    setStartPosition(newLeftPosition); // Update startPosition
    calculateValues(); // Calculate values after updating position
  };
  
  const handleRightLineDrag = (event) => {
    const chartBounds = chartRef.current.getBoundingClientRect();
    const chartWidth = chartBounds.width;
    const mouseX = event.clientX - chartBounds.left;
    let newPosition = mouseX / chartWidth;
    if (newPosition === 1) {
        newPosition = 0.99; 
    }
    const newRightPosition = Math.min(1, Math.max(newPosition, startPosition + 0.05));
    setEndPosition(newRightPosition); // Update endPosition
    calculateValues(); // Calculate values after updating position
  };
  const handleBoundsSelection = (option) => {
    if (option === "Cut") {
      cutData();
    } else if (option === "Clear Offset") {
      clearOffset();
    } else if (option === "Drift Compensation") {
      applyDriftCompensation();
    }
  };

  const clearOffset = () => {
    setChartData(originalChartData);
  };

  const cutData = () => {
    const newData = filterDataInRange(startPosition * 100, endPosition * 65);

    const filteredOriginalData = originalChartData.filter(item => {
      const x = item.x;
      return !(x >= startPosition * 100 && x <= endPosition * 65);
    });

    setChartData(newData);
    setOriginalChartData(filteredOriginalData);
  };

  //this below cut option code when i click clearoffset it reload the originalchartdata 
  // const cutData = () => {
  //   const newData = filterDataInRange(startPosition * 100, endPosition * 65); // Corrected multiplication factor
  //   setChartData(newData);
  //   // Don't modify originalChartData here
  // };

  const applyDriftCompensation = () => {
    const referenceStart = chartData[0];
    const referenceEnd = chartData[chartData.length - 1];

    const drift = {
      tension: referenceEnd.tension - referenceStart.tension,
      torsion: referenceEnd.torsion - referenceStart.torsion,
      bendingMomentX: referenceEnd.bendingMomentX - referenceStart.bendingMomentX,
      bendingMomentY: referenceEnd.bendingMomentX - referenceStart.bendingMomentY,
      temperature: referenceEnd.temperature - referenceStart.temperature,
    };

    const compensatedData = chartData.map((item) => ({
      x: item.x,
      tension: item.tension - drift.tension,
      torsion: item.torsion - drift.torsion,
      bendingMomentX: item.bendingMomentX - drift.bendingMomentX,
      bendingMomentY: item.bendingMomentY - drift.bendingMomentY,
      temperature: item.temperature - drift.temperature,
    }));

    setChartData(compensatedData);
  };

  const filterDataInRange = (startX, endX) => {
    let [start, end] = [startX, endX];
    if (start > end) {
      [start, end] = [end, start];
    }

    return chartData.filter(item => item.x >= start && item.x <= end);
  };

  const calculateValues = () => {
    const filteredData = filterDataInRange(startPosition * 100, endPosition * 65);
    const properties = ['tension', 'torsion', 'bendingMomentY', 'bendingMomentX', 'temperature'];
    const calculatedValues = {};

    properties.forEach(property => {
      const values = filteredData.map(item => item[property]);
      if (values.length > 0) {
        const max = Math.max(...values);
        const min = Math.min(...values);
        const mean = (values.reduce((acc, curr) => acc + curr, 0) / values.length);
        const slope = (max - min) / (filteredData[filteredData.length - 1].x - filteredData[0].x);

        calculatedValues[property] = {
          max: max.toFixed(6),
          min: min.toFixed(6),
          mean: mean.toFixed(9),
          slope: slope.toFixed(9)
        };
      } else {
        calculatedValues[property] = {
          max: null,
          min: null,
          mean: null,
          slope: null
        };
      }
    });
    setCalculatedValues(calculatedValues);
  };

  useEffect(() => {
    console.log("Start position changed:", startPosition);
    console.log("End position changed:", endPosition);

    calculateValues();
  }, [startPosition, endPosition]);

  return (
    <>
      <div className="border border-black p-4 rounded-lg shadow-lg bg-gray-300" style={{ position: 'relative', width: '1000px', height: '400px', bottom: '400px' }}>
        <button onClick={toggleViewBounds} className="border border-black text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-black" style={{ position: 'relative', width: '150px', height: '40px', left: '81%', top: '50px' }}>
          {showViewBounds ? 'Hide View Bounds' : 'Show View Bounds'}
        </button>
        <button onClick={calculateValues} className="border border-black text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-black" style={{ position: 'relative', height: '40px', width: '150px', left: '65%', top: '150px' }}>
          Calculate Values
        </button>
      </div>  

      {showViewBounds && (
        <>
          <div
            ref={dragRef}
            style={{ position: 'absolute', left: `${startPosition * 100}%`, top: '0%', borderLeft: '2px solid lightgreen', height: '25%', cursor: 'col-resize' }}
            onMouseDown={() => setDraggingLeft(true)}
          >
            <span>Start Range: X - {calculateYAxisValues(startPosition * 100).x}</span>
          </div>
          <div
            ref={dragRef}
            style={{ position: 'absolute', left: `${endPosition * 65}%`, top: '0%', borderLeft: '2px solid red', height: '25%', cursor: 'col-resize' }}
            onMouseDown={() => setDraggingRight(true)}
          >
            <span>End Range: X - {calculateYAxisValues(endPosition * 65).x}</span>
          </div>
        </>
      )}
      {calculatedValues && (
        <div className="mt-4 overflow-x-auto " style={{ width: '730px', position: 'relative', bottom: '790px', left: '45px' }}>
          <table className="min-w-full divide-y divide-gray-200" >
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mean</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">slope</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.keys(calculatedValues).map(property => (
                <tr key={property}>
                  <td className="px-6 py-4 whitespace-nowrap">{property}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{calculatedValues[property].max}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{calculatedValues[property].min}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{calculatedValues[property].mean}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{calculatedValues[property].slope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4">
        <select onChange={(e) => handleBoundsSelection(e.target.value)} className="border border-black text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-black" style={{ position: 'relative', height: '40px', width: '150px',bottom:'920px',left:'790px' }}>
          <option value="">Bounds</option>
          <option value="Cut">Cut</option>
          <option value="Clear Offset">Clear Offset</option>
          <option value="Drift Compensation">Drift Compensation</option>
        </select>
      </div>
    </>
  );
};

export default ViewBoundsToggle;