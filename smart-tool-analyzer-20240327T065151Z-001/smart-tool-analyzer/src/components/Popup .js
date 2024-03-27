import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';

const Popup = ({ isOpen, onClose, selectedFiles }) => {
  const graphRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState('tension');
  const [windowSize, setWindowSize] = useState(1);
  const [selectedRows, setSelectedRows] = useState({}); // State to track selected rows
  
   
   // Define static data for initial graph
   const staticData = {
    x: [1, 2, 3, 4, 5], // Example x values
    y: [], // Example y values
    type: 'scatter',
    mode: 'lines',
    name: 'Static Data',
    line: { color: 'gray' } // Define line color
  };
  
  useEffect(() => {
    if (graphRef.current) {
      // Initialize Plotly and render the static graph
      Plotly.newPlot(graphRef.current, [staticData]);
    }
  }, [staticData]);
  useEffect(() => {
    const fetchData = async () => {
      if (graphRef.current && selectedFiles.length > 0) {
        const filteredSelectedFiles = selectedFiles.filter(file => selectedRows[file.name]);
        const traces = [];
        const colors = ['darkblue', 'green', 'red', 'purple', 'orange'];

        for (let i = 0; i < filteredSelectedFiles.length; i++) {
          const selectedFile = filteredSelectedFiles[i];
          const rawData = await readFile(selectedFile);
          
          const rollingAverageData = calculateRollingAverage(rawData, windowSize);
          const xValues = rawData.map(row => row[4]); // Assuming time is at index 4
          const trace = {
            x: xValues,
            y: rollingAverageData,
            type: 'scatter',
            mode: 'lines',
            name: `${selectedFile.name} (Rolling Avg)`,
            line: {color: colors[i % 5]} // Assign color from the array based on index
          };
          
          traces.push(trace);
        }
  
        const layout = {
          title: `${selectedOption} over Time with Rolling Average (Window Size: ${windowSize})`,
          xaxis: { title: 'Time' },
          yaxis: { title: selectedOption }
        };
  
        Plotly.newPlot(graphRef.current, traces, layout);
      }
    };
  
    fetchData();
  
    return () => {
      if (graphRef.current) {
        Plotly.purge(graphRef.current);
      }
    };
  }, [selectedOption, selectedFiles, windowSize, selectedRows]);
  

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleWindowSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    if (!isNaN(newSize) && newSize > 0) {
      setWindowSize(newSize);
    }
  };

  const handleRowCheckboxChange = (fileName, checked) => {
    setSelectedRows(prevState => ({
      ...prevState,
      [fileName]: checked,
    }));
  };

  const calculateRollingAverage = (data, size) => {
    const rollingAvgData = [];
    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      let count = 0;
      for (let j = Math.max(0, i - size + 1); j <= i; j++) {
        sum += parseFloat(data[j][getOptionIndex(selectedOption)]);
        count++;
      }
      const avg = sum / count;
      rollingAvgData.push(avg);
    }
    return rollingAvgData;
  };
  
  const getOptionIndex = (option) => {
    switch (option) {
      case 'tension':
        return 0;
      case 'torsion':
        return 1;
      case 'bendingMomentX':
        return 2;
      case 'bendingMomentY':
        return 3;
      default:
        return 0; // Default to tension if option is invalid
    }
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const lines = event.target.result.split('\n');
        // Skip metadata lines by starting from index 29
        const rawData = lines.slice(29).map(row => row.split(';'));
        resolve(rawData);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };
  

  return (
    <>
      {isOpen && (
        <div className="popup fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="popup-inner bg-white p-8 rounded-lg shadow-md relative" style={{ width: '80%', height: '80%' }}>
            <button className="text-red-500 hover:text-red-700 absolute top-2 right-2 z-10" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {selectedFiles.length === 0 && ( // Render static content only when no files are selected
              <div>
                <h2>Static Content</h2>
                {/* Add your static content here */}
              </div>
            )}
            {selectedFiles.length > 0 && ( // Render graph when files are selected
              <>
                <div ref={graphRef} />
                <div>
                  <input type="radio" value="tension" checked={selectedOption === 'tension'} onChange={handleOptionChange} /> Tension
                  <input type="radio" value="torsion" checked={selectedOption === 'torsion'} onChange={handleOptionChange} /> Torsion
                  <input type="radio" value="bendingMomentX" checked={selectedOption === 'bendingMomentX'} onChange={handleOptionChange} /> Bending Moment X
                  <input type="radio" value="bendingMomentY" checked={selectedOption === 'bendingMomentY'} onChange={handleOptionChange} /> Bending Moment Y
                </div>
                <div>
                  <label>Rolling Average Window Size: </label>
                  <input type="number" value={windowSize} onChange={handleWindowSizeChange} />
                </div>
                <div>
                  <h2>Selected Files</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Select</th> {/* Added Select column */}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedFiles.map(file => (
                        <tr key={file.name}>
                          <td>{file.name}</td>
                          <td>
                            <input 
                              type="checkbox" 
                              checked={selectedRows[file.name]} 
                              onChange={(e) => handleRowCheckboxChange(file.name, e.target.checked)} 
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
  
};

export default Popup;
