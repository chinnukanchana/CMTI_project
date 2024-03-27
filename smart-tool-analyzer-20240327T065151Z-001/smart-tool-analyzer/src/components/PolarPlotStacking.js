import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist';
import Rotatablevalue from './Rotatablevalue';
import ReactDOM from 'react-dom';



const PolarPlotStacking = ({ isVisible, onClose, setValueLinePosition }) => {
  const [selectedFolderFiles, setSelectedFolderFiles] = useState([]);
  const [selectedFolderCheckboxes, setSelectedFolderCheckboxes] = useState({});
  const plotColors = ['#FF5733', '#33FF57', '#334CFF', '#FF33EC', '#AACCFF', '#FFAABB', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
  const [graphData, setGraphData] = useState([]);
  const [showGraph, setShowGraph] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const graphContainerRef = useRef(null);
  const [graphLimits, setGraphLimits] = useState([-1, 1]);
  const [angleLineData, setAngleLineData] = useState(null);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [draggablePoint, setDraggablePoint] = useState({ x: 0, y: 0 });
  const [calculateAngle, setCalculateAngle] = useState(null);
  
  const handleCalculateAngle = () => {
    calculateAngle();
  };

  const handleCalculateValue = () => {
    // Calculate distance between midpoint and draggable point
    const distance = Math.sqrt(Math.pow(draggablePoint.x, 2) + Math.pow(draggablePoint.y, 2));
  
    // Set the position of the value line based on the distance
    const valueLineNewPosition = {
      x: draggablePoint.x / 2, // Set x-coordinate to half of draggablePoint.x
      y: draggablePoint.y / 2, // Set y-coordinate to half of draggablePoint.y
    };
  
    // Limit the movement of the value line within the graph area
    const graphWidth = graphContainerRef.current.offsetWidth;
    const graphHeight = graphContainerRef.current.offsetHeight;
    const halfGraphWidth = graphWidth / 2;
    const halfGraphHeight = graphHeight / 2;
    const minX = -halfGraphWidth;
    const maxX = halfGraphWidth;
    const minY = -halfGraphHeight;
    const maxY = halfGraphHeight;
  
    // Ensure the value line stays within the graph area
    const limitedPosition = {
      x: Math.min(Math.max(valueLineNewPosition.x, minX), maxX),
      y: Math.min(Math.max(valueLineNewPosition.y, minY), maxY),
    };
  
    // Set the position of the value line
    setValueLinePosition(limitedPosition);
  };
  
  

  const handleFolderSelect = async () => {
    try {
      const folderInput = document.createElement('input');
      folderInput.setAttribute('type', 'file');
      folderInput.setAttribute('webkitdirectory', true);

      folderInput.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (files.length > 0) {
          const fileList = Array.from(files);
          setSelectedFolderFiles(fileList);
        }
      });

      folderInput.click();
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleCheckboxChange = async (file) => {
    try {
      const updatedCheckboxes = { ...selectedFolderCheckboxes };
      updatedCheckboxes[file.name] = !updatedCheckboxes[file.name];

      const updatedSelectedFiles = Object.keys(updatedCheckboxes)
        .filter((fileName) => updatedCheckboxes[fileName])
        .map((fileName) => selectedFolderFiles.find((file) => file.name === fileName));

      setSelectedFolderCheckboxes(updatedCheckboxes);
      setSelectedFiles(updatedSelectedFiles);

      const processedData = await Promise.all(updatedSelectedFiles.map(async (file, index) => {
        const fileContent = await readFileContent(file);
        const processedContent = processFileContent(fileContent);
        return { file: file.name, data: processedContent, index };
      }));

      let maxAbsoluteValue = 0;
      processedData.forEach(({ data }) => {
        data.forEach(({ bendingMomentX, bendingMomentY }) => {
          const absX = Math.abs(bendingMomentX);
          const absY = Math.abs(bendingMomentY);
          maxAbsoluteValue = Math.max(maxAbsoluteValue, absX, absY);
        });
      });

      const graphLimits = [-maxAbsoluteValue, maxAbsoluteValue];

      setGraphData(processedData);
      setShowGraph(true);
      setGraphLimits(graphLimits);
    } catch (error) {
      console.error('Error processing files:', error);
    }
  };

  const readFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        resolve(content);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const processFileContent = (fileContent) => {
    const lines = fileContent.split('\n');
    const dataStartIndex = lines.findIndex(line => line.startsWith('Tension;Torsion;Bending moment X;Bending moment Y;Time;Temperature'));

    if (dataStartIndex !== -1) {
      const data = lines.slice(dataStartIndex + 2).map(line => {
        const [Tension, _torsion_, bendingMomentX, bendingMomentY, _time__, _temperature__] = line.split(';');
        return { bendingMomentX: parseFloat(bendingMomentX), bendingMomentY: parseFloat(bendingMomentY) };
      });

      const maxLength = Math.max(data.length, data.filter(({ bendingMomentX }) => !isNaN(bendingMomentX)).length, data.filter(({ bendingMomentY }) => !isNaN(bendingMomentY)).length);
      const alignedData = data.map(({ bendingMomentX, bendingMomentY }) => ({
        bendingMomentX: isNaN(bendingMomentX) ? 0 : bendingMomentX,
        bendingMomentY: isNaN(bendingMomentY) ? 0 : bendingMomentY,
      }));

      while (alignedData.length < maxLength) {
        alignedData.push({ bendingMomentX: 0, bendingMomentY: 0 });
      }

      return alignedData;
    } else {
      return [];
    }
  };

  useEffect(() => {
    if (showGraph) {
      const graphContainer = graphContainerRef.current;

      const modifiedData = graphData.map((data, index) => {
        const newData = data.data.map((point, pointIndex, arr) => {
          if (pointIndex === arr.length - 1) {
            return {
              bendingMomentX: arr[0].bendingMomentX,
              bendingMomentY: arr[0].bendingMomentY,
            };
          }
          return point;
        });

        return {
          ...data,
          data: newData,
        };
      });

      const horizontalMidpointLine = {
        x: [graphLimits[0], graphLimits[1]],
        y: [0, 0],
        mode: 'lines',
        type: 'scatter',
        line: {
          color: 'black',
          width: 2,
          dash: 'line',
        },
      };

      const verticalMidpointLine = {
        x: [0, 0],
        y: [-graphLimits[1], graphLimits[1]],
        mode: 'lines',
        type: 'scatter',
        line: {
          color: 'black',
          width: 2,
          dash: 'line',
        },
      };

      const traces = modifiedData.map((data, index) => ({
        x: data.data.map(d => d.bendingMomentX),
        y: data.data.map(d => d.bendingMomentY),
        text: data.data.map(d => `(${d.bendingMomentX}, ${d.bendingMomentY})`),
        mode: 'markers',
        type: 'scatter',
        marker: {
          symbol: 'diamond',
          color: plotColors[index % plotColors.length],
        },
        hoverinfo: 'none'
      }));
      traces.push(horizontalMidpointLine);
      traces.push(verticalMidpointLine);

      if (angleLineData) {
        traces.push(angleLineData);
      }

      const layout = {
        title: 'Bending Moments Scatter Plot',
        xaxis: {
          title: 'Bending Moment X',
          zeroline: true,
          zerolinecolor: 'black',
          showline: true,
          showticklabels: true,
          tickmode: 'linear',
          ticks: 'inside',
          range: graphLimits,
          fixedrange: true,
          layer: 'above traces',
        },
        yaxis: {
          title: 'Bending Moment Y',
          zeroline: true,
          zerolinecolor: 'black',
          showline: true,
          showticklabels: true,
          tickmode: 'linear',
          ticks: 'inside',
          range: graphLimits,
          fixedrange: true,
          layer: 'above traces',
        },
        dragmode: false,
      };

      const config = {
        responsive: false,
        displayModeBar: true,
        displaylogo: false,
        scrollZoom: true,
        editable: false,
        staticPlot: false,
      };


// Define newGraphContainer and graphElement
const newGraphContainer = document.createElement('div');
const graphElement = document.createElement('div');

// Set style for newGraphContainer
newGraphContainer.style.zIndex = '1';

// Define RotatableLineComponent before using it
const RotatableLineComponent = document.createElement('div');
RotatableLineComponent.style.zIndex = '1'; 
newGraphContainer.appendChild(RotatableLineComponent);
ReactDOM.render(<Rotatablevalue />, RotatableLineComponent);

// Append RotatableLineComponent to newGraphContainer
newGraphContainer.appendChild(graphElement);



      if (graphContainer) {
        Plotly.newPlot(graphContainer, traces, layout, config);
      }
    }
  }, [showGraph, graphData, graphLimits, angleLineData]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${isVisible ? '' : 'hidden'}`}>
      
      <div className="bg-white p-1 rounded-md flex flex-col w-full max-w-4xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <Rotatablevalue />
        <div className="w-full" ref={graphContainerRef}></div>

       

        <div className="flex justify-between items-center mt-4">
          <div>
            <h2 className="text-lg font-bold mb-2">Select Folder:</h2>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-blue mb-4"
              onClick={handleFolderSelect}
            >
              Select Folder
            </button>
            {selectedFolderFiles.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto">
                <h2 className="text-lg font-bold mb-2">Selected Files:</h2>
                <ul className="list-disc list-inside">
                  {selectedFolderFiles.map((file) => (
                    <li key={file.name} className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox text-blue-500 h-5 w-5"
                        checked={selectedFolderCheckboxes[file.name] || false}
                        onChange={() => handleCheckboxChange(file)}
                      />
                      <span className="ml-2 text-gray-700">{file.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

         

          

            
            
        
        </div>

        <div className="flex justify-end mt-4">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-red"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolarPlotStacking;