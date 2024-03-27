import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist';

const TensionGraph = () => {
  const graphRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState('tension');
  const [fileData, setFileData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [windowSize, setWindowSize] = useState(1);

  const handleFileChange = (event) => {
    const files = event.target.files;
    const newFileData = [];
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target.result;
        const lines = content.split('\n');
        const data = lines.slice(16).map(line => line.split(';').map(parseFloat));
        newFileData.push({ name: files[i].name, data });
        if (newFileData.length === files.length) {
          setFileData(newFileData);
        }
      };
      reader.readAsText(files[i]);
    }
  };

  useEffect(() => {
    if (graphRef.current && fileData.length > 0) {
      const traces = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const selectedFile = selectedFiles[i];
        const rawData = fileData.find(file => file.name === selectedFile)?.data || [];
        const rollingAverageData = calculateRollingAverage(rawData, windowSize);
        const trace = {
          x: rawData.map(row => row[4]),
          y: rollingAverageData.map(row => row[0]),
          type: 'scatter',
          mode: 'lines',
          name: `${selectedFile} (Rolling Avg)`
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

    return () => {
      if (graphRef.current) {
        Plotly.purge(graphRef.current);
      }
    };
  }, [selectedOption, fileData, selectedFiles, windowSize]);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleCheckboxChange = (event) => {
    const fileName = event.target.value;
    if (event.target.checked) {
      setSelectedFiles(prevSelectedFiles => [...prevSelectedFiles, fileName]);
    } else {
      setSelectedFiles(prevSelectedFiles => prevSelectedFiles.filter(file => file !== fileName));
    }
  };

  const handleWindowSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    if (!isNaN(newSize) && newSize > 0) {
      setWindowSize(newSize);
    }
  };

  const calculateRollingAverage = (data, size) => {
    const rollingAvgData = [];
    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      let count = 0;
      for (let j = Math.max(0, i - size + 1); j <= i; j++) {
        sum += data[j][getOptionIndex(selectedOption)];
        count++;
      }
      const avg = sum / count;
      rollingAvgData.push([avg]);
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

  return (
    <div>
      <div ref={graphRef} />
      <div>
        <input type="radio" value="tension" checked={selectedOption === 'tension'} onChange={handleOptionChange} /> Tension
        <input type="radio" value="torsion" checked={selectedOption === 'torsion'} onChange={handleOptionChange} /> Torsion
        <input type="radio" value="bendingMomentX" checked={selectedOption === 'bendingMomentX'} onChange={handleOptionChange} /> Bending Moment X
        <input type="radio" value="bendingMomentY" checked={selectedOption === 'bendingMomentY'} onChange={handleOptionChange} /> Bending Moment Y
      </div>
      <div>
        <input type="file" onChange={handleFileChange} multiple directory="" webkitdirectory="" />
      </div>
      <div>
        <label>Rolling Average Window Size: </label>
        <input type="number" value={windowSize} onChange={handleWindowSizeChange} />
      </div>
      <div>
        {fileData.map(file => (
          <div key={file.name}>
            <label>
              <input type="checkbox" value={file.name} checked={selectedFiles.includes(file.name)} onChange={handleCheckboxChange} />
              {file.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TensionGraph;
