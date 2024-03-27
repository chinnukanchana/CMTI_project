import React, { useRef, useState, useEffect } from 'react';
import Plotly from 'plotly.js-dist';
import Draggable from 'react-draggable';


const NewComponent = ({ isVisible, onClose }) => {
  const [selectedFolderFiles1, setSelectedFolderFiles1] = useState([]);
  const [selectedFolderCheckboxes1, setSelectedFolderCheckboxes1] = useState({});
  const [selectedFolderFiles2, setSelectedFolderFiles2] = useState([]);
  const [selectedFolderCheckboxes2, setSelectedFolderCheckboxes2] = useState({});
  const [selectedOption, setSelectedOption] = useState('tension');
  const graphRef = useRef(null);
  const graphRef2 = useRef(null); // Define graphRef2
 
  const [showBoundaries, setShowBoundaries] = useState(false);
  // Add two state variables to store the positions of the draggable lines
// Add two state variables to store the positions of the draggable lines
const [startLinePosition, setStartLinePosition] = useState({ x: 1 });
const [endLinePosition, setEndLinePosition] = useState({ x: 50 });

// Define a function to handle the drag event of the start line
const handleStartLineDrag = (e, data) => {
  setStartLinePosition({ x: data.x });
};

// Define a function to handle the drag event of the end line
const handleEndLineDrag = (e, data) => {
  setEndLinePosition({ x: data.x });
};

// Use the startLinePosition and endLinePosition to calculate boundaries
// Use the startLinePosition and endLinePosition to calculate boundaries
const boundaries = {
  start: graphRef2.current?._fullLayout?.xaxis?.p2l(startLinePosition.x),
  end: graphRef2.current?._fullLayout?.xaxis?.p2l(endLinePosition.x),
};

// Filter data points based on the boundaries
const filteredData = selectedFolderFiles1.reduce((acc, file) => {
  if (selectedFolderCheckboxes1[file.name] || selectedFolderCheckboxes2[file.name]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      const dataStartIndex = content.indexOf('Time;');
      const lines = content.substring(dataStartIndex + 6).split('\n').filter(line => line.trim() !== '');
      const xValues = lines.map((line) => parseFloat(line.split(';')[4])); // Time values
      const yValues = lines.map((line) => parseFloat(line.split(';')[['tension', 'torsion', 'bending moment X', 'bending moment Y'].indexOf(selectedOption)])); // Y-axis values based on selected option
      
      // Filter data points based on boundaries
      const filteredX = [];
      const filteredY = [];
      for (let i = 0; i < xValues.length; i++) {
        if (xValues[i] >= boundaries.start && xValues[i] <= boundaries.end) {
          filteredX.push(xValues[i]);
          filteredY.push(yValues[i]);
        }
      }

      // Push filtered data to the accumulator
      acc.push({ name: file.name, x: filteredX, y: filteredY });
      console.log('Filtered Data Points:', acc);
    };
    reader.readAsText(file);
  }
  return acc;
}, []);


   // Define static data for both graphs
   const staticData = {
    x: [10, 20, 30, 40, 50],
    y: [],
    mode: 'lines',
    type: 'scatter',
    name: 'Static Data',
  };

  useEffect(() => {
    if (graphRef.current) {
      Plotly.newPlot(graphRef.current, [staticData]);
    }
  }, [graphRef]);
  useEffect(() => {
    if (graphRef2.current) {
      Plotly.newPlot(graphRef2.current, [staticData]);
    }
  }, [graphRef2]);

  useEffect(() => {
    if (graphRef2.current) {
      Plotly.newPlot(graphRef2.current, [staticData]);
    }
  }, [graphRef2]);
  const handleFolderSelect1 = async () => {
    try {
      const folderInput = document.createElement('input');
      folderInput.setAttribute('type', 'file');
      folderInput.setAttribute('webkitdirectory', true);

      folderInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (files.length > 0) {
          const fileList = Array.from(files);
          setSelectedFolderFiles1(fileList);
        }
      });

      folderInput.click();
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };
 
  const handleFolderSelect2 = async () => {
    try {
      const folderInput = document.createElement('input');
      folderInput.setAttribute('type', 'file');
      folderInput.setAttribute('webkitdirectory', true);

      folderInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (files.length > 0) {
          const fileList = Array.from(files);
          setSelectedFolderFiles2(fileList);
        }
      });

      folderInput.click();
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleCheckboxChange1 = async (file) => {
    try {
      const updatedCheckboxes = { ...selectedFolderCheckboxes1 };
      updatedCheckboxes[file.name] = !updatedCheckboxes[file.name];

      setSelectedFolderCheckboxes1(updatedCheckboxes);
    } catch (error) {
      console.error('Error processing files:', error);
    }
  };

  const handleCheckboxChange2 = async (file) => {
    try {
      const updatedCheckboxes = { ...selectedFolderCheckboxes2 };
      updatedCheckboxes[file.name] = !updatedCheckboxes[file.name];

      setSelectedFolderCheckboxes2(updatedCheckboxes);
    } catch (error) {
      console.error('Error processing files:', error);
    }
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  useEffect(() => {
    if (graphRef.current) {
      const traces = [];

      const processFiles = (files, checkboxes) => {
        files.forEach((file) => {
          if (checkboxes[file.name]) {
            const reader = new FileReader();
            reader.onload = function (e) {
              const content = e.target.result;
              const dataStartIndex = content.indexOf('Time;');
              const lines = content.substring(dataStartIndex + 6).split('\n').filter(line => line.trim() !== '');
              const xValues = lines.map((line) => parseFloat(line.split(';')[4])); // Time values
              const yValues = lines.map((line) => parseFloat(line.split(';')[['tension', 'torsion', 'bending moment X', 'bending moment Y'].indexOf(selectedOption)])); // Y-axis values based on selected option
              const trace = {
                x: xValues,
                y: yValues,
                mode: 'lines',
                type: 'scatter',
                name: file.name,
              };
              traces.push(trace);
              Plotly.newPlot(graphRef.current, traces);
            };
            reader.readAsText(file);
          }
        });
      };

      processFiles(selectedFolderFiles1, selectedFolderCheckboxes1);
      processFiles(selectedFolderFiles2, selectedFolderCheckboxes2);
    }
  }, [selectedFolderFiles1, selectedFolderFiles2, selectedOption, selectedFolderCheckboxes1, selectedFolderCheckboxes2]);

  useEffect(() => {
    if (graphRef2.current) {
      const traces = [];
      const processFiles = (files, checkboxes) => {
        files.forEach((file) => {
          if (checkboxes[file.name]) {
            const reader = new FileReader();
            reader.onload = function (e) {
              const content = e.target.result;
              const dataStartIndex = content.indexOf('Time;');
              const lines = content.substring(dataStartIndex + 6).split('\n').filter(line => line.trim() !== '');
              const xValues = lines.map((line) => parseFloat(line.split(';')[4])); // Time values
              const yValues = lines.map((line) => parseFloat(line.split(';')[['tension', 'torsion', 'bending moment X', 'bending moment Y'].indexOf(selectedOption)])); // Y-axis values based on selected option
              const trace = {
                x: xValues,
                y: yValues,
                mode: 'lines',
                type: 'scatter',
                name: file.name,
              };
              traces.push(trace);
              Plotly.newPlot(graphRef2.current, traces);
            };
            reader.readAsText(file);
          }
        });
      };

      processFiles(selectedFolderFiles1, selectedFolderCheckboxes1);
    }
  }, [selectedFolderFiles1, selectedOption, selectedFolderCheckboxes1]);


  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isVisible ? '' : 'hidden'}`} >
      <div className="p-1 rounded-md flex flex-col  overflow-y-auto" style={{ backgroundColor: 'white', width:'90%' , height:'90%'}} onClick={(e) => e.stopPropagation()}>



        <div className="flex justify-between items-center mt-4">
          <div>
            <h2 className="text-lg font-bold mb-2">Select Folder 1:</h2>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue mb-4"
              onClick={handleFolderSelect1}
            >
              Select Folder 1
            </button>
            {selectedFolderFiles1.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto">
                <h2 className="text-lg font-bold mb-2">Selected Files from Folder 1:</h2>
                <ul className="list-disc list-inside">
                  {selectedFolderFiles1.map((file) => (
                    <li key={file.name} className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox text-blue-500 h-5 w-5"
                        checked={selectedFolderCheckboxes1[file.name] || false}
                        onChange={() => handleCheckboxChange1(file)}
                      />
                      <span className="ml-2 text-gray-700">{file.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold mb-2">Select Folder 2:</h2>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue mb-4"
              onClick={handleFolderSelect2}
            >
              Select Folder 2
            </button>
            {selectedFolderFiles2.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto">
                <h2 className="text-lg font-bold mb-2">Selected Files from Folder 2:</h2>
                <ul className="list-disc list-inside">
                  {selectedFolderFiles2.map((file) => (
                    <li key={file.name} className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox text-blue-500 h-5 w-5"
                        checked={selectedFolderCheckboxes2[file.name] || false}
                        onChange={() => handleCheckboxChange2(file)}
                      />
                      <span className="ml-2 text-gray-700">{file.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div>
          <input type="radio" id="tension" name="y-axis" value="tension" checked={selectedOption === 'tension'} onChange={() => handleOptionChange('tension')} />
          <label htmlFor="tension">Tension</label>
          <input type="radio" id="torsion" name="y-axis" value="torsion" checked={selectedOption === 'torsion'} onChange={() => handleOptionChange('torsion')} />
          <label htmlFor="torsion">Torsion</label>
          <input type="radio" id="bendingMomentX" name="y-axis" value="bending moment X" checked={selectedOption === 'bending moment X'} onChange={() => handleOptionChange('bending moment X')} />
          <label htmlFor="bendingMomentX">Bending Moment X</label>
          <input type="radio" id="bendingMomentY" name="y-axis" value="bending moment Y" checked={selectedOption === 'bending moment Y'} onChange={() => handleOptionChange('bending moment Y')} />
          <label htmlFor="bendingMomentY">Bending Moment Y</label>
        </div>   
{/*     {/* First graph */}
<div style={{ position: 'relative', width: '85%', height: '400px' }} ref={graphRef2}>
  {showBoundaries && (
    <>
      <Draggable
        axis="x"
        bounds="parent"
        onStop={handleStartLineDrag}
      >
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 4, background: 'blue', cursor: 'ew-resize' }} />
      </Draggable>

      <Draggable
        axis="x"
        bounds="parent"
        onStop={handleEndLineDrag}
      >
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '80%', transform: 'translateX(-50%)', width: 4, background: 'red', cursor: 'ew-resize' }} />
      </Draggable>
    </>
  )}
</div>

        {/* <div ref={graphRef}></div> */}
        <div ref={graphRef} style={{width:'85%'}}></div> 
    
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue mb-4"
          onClick={() => setShowBoundaries(!showBoundaries)}
          style={{width:'150px', position:'relative', left:'93%', bottom:'30%'}}
        >
          {showBoundaries ? "Boundaries off" : "Boundaries on"}
        </button>
        <div className="flex justify-end mt-4">

        
<button
  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-red"
  onClick={onClose}
  style={{position:'relative',bottom:'350px',width:'150px',right:'10px'}}
>
Exit</button>
</div>
        
      </div>
    </div>
  );
};

export default NewComponent;
