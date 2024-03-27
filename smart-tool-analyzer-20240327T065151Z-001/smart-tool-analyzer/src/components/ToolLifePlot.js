import React, { useState } from 'react';
import ApexCharts from 'react-apexcharts';

const FileBrowsing1 = ({ selectedFiles,  handleFileChange, handleRowClick, chartOptions }) => {
  const numLines = 15;
  const generateLines = () => {
    const lines = [];
    for (let i = 0; i < numLines; i++) {
      lines.push(
        <div
          key={i}
          style={{
            borderBottom: '1px solid black',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '10px',
            backgroundColor: selectedFiles[i]?.selected ? 'lightblue' : 'white',
            cursor: 'pointer',
          }}
          onClick={() => handleRowClick(i)}
        >
          <div>{selectedFiles[i]?.name || ''}</div>
        </div>
      );
    }
    return lines;
  };

  return (
    <div
      style={{
        height: '40vh',
        width: '20vw',
        border: '1px solid black',
        padding: '10px',
        boxSizing: 'border-box',
        backgroundColor: 'white',
        overflow: 'auto',
      }}
    >
      <h3 style={{ textAlign: 'left', fontWeight: 'bold' }}>Tool Life Plotting</h3>
      <label>Folder of Tool life Files </label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '10px',
        }}
      >
        <label
          htmlFor="folderInput"
          style={{
            display: 'flex',
            alignItems: 'center',
            marginRight: '10px',
            cursor: 'pointer',
          }}
        >
          <input
            type="text"
            readOnly
            style={{ marginRight: '5px', padding: '2px', border: '1px solid black' }}
          />
          <span role="img" aria-label="folder-icon">
            📁
          </span>
        </label>

        <input
          type="file"
          id="folderInput"
          style={{ display: 'none', border: '2px solid black' }}
          onChange={handleFileChange}
          multiple
        />
      </div>

      <div style={{ marginTop: '10px' }}>
        <h4 style={{ textAlign: 'left', paddingLeft: '5px' }}>List of Tool Life Files</h4>
        <div
          style={{
            height: '55%',
            width: '100%',
            border: '1px solid black',
            overflowY: 'auto',
            overflowX: 'auto',
          }}
        >
          {generateLines()}
        </div>
      </div>
      
    </div>
  );
};
// Second File BrowSing Component
const FileBrowsing2 = ({ selectedFiles  ,  handleFileChange1, handleRowClick1, chartOptions }) => {
  const numLines = 15;
  const generateLines = () => {
    const lines = [];
    for (let i = 0; i < numLines; i++) {
      lines.push(
        <div
          key={i}
          style={{
            borderBottom: '1px solid black',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '10px',
            backgroundColor: selectedFiles[i]?.selected ? 'lightblue' : 'white',
            cursor: 'pointer',
          }}
          onClick={() => handleRowClick1(i)}
        >
          <div>{selectedFiles[i]?.name || ''}</div>
        </div>
      );
    }
    return lines;
  };

  return (
    <div
      style={{
        height: '40vh',
        width: '20vw',
        border: '1px solid black',
        padding: '10px',
        boxSizing: 'border-box',
        backgroundColor: 'white',
        overflow: 'auto',
      }}
    >
     
      <label>Folder of Files </label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '10px',
        }}
      >
        <label
          htmlFor="folderInput"
          style={{
            display: 'flex',
            alignItems: 'center',
            marginRight: '10px',
            cursor: 'pointer',
          }}
        >
          <input
            type="text"
            readOnly
            style={{ marginRight: '5px', padding: '2px', border: '1px solid black' }}
          />
          <span role="img" aria-label="folder-icon">
            📁
          </span>
        </label>

        <input
          type="file"
          id="folderInput"
          style={{ display: 'none', border: '2px solid black' }}
          onChange={handleFileChange1}
          multiple
        />
      </div>

      <div style={{ marginTop: '10px' }}>
        <h4 style={{ textAlign: 'left', paddingLeft: '5px' }}>List of Files in the folder</h4>
        <div
          style={{
            height: '55%',
            width: '100%',
            border: '1px solid black',
            overflowY: 'auto',
            overflowX: 'auto',
          }}
        >
          {generateLines()}
        </div>
      </div>
      
    </div>
  );
};

const GraphComponent1 = ({ chartOptions }) => {
  return (
    <div style={{ width: '40vw', height: '40vh', marginLeft: '2px',marginRight:'2px', backgroundColor: 'white' }}>
      <ApexCharts options={chartOptions} series={chartOptions.series} type="line" height={350} />
    </div>
  );
};

const ToolLifePlot = () => {
  // State for the first set of components
  
  const [selectedFiles1, setSelectedFiles1] = useState([]);
  const [chartOptions1, setChartOptions1] = useState({
    series: [
      {
        data: [],
      },
    ],
    chart: {
      type: 'line',
      height: 350,
    },
    xaxis: {
      title: {
        text: 'Time[hh:mm:ss]',
      },
      type: 'datetime',
      labels: {
        formatter: function (value) {
          const date = new Date(value);
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const seconds = date.getSeconds();

          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        },
      },
    },
    yaxis: {
      title: {
        text: 'Bending Moment X',
      },
      labels: {
        formatter: function (value) {
          return value.toFixed(1);
        },
      },
      tickAmount: 8,
      min: 0,
      max: 1.4,
    },
  });
  const handleFileChange1 = async (event, setSelectedFiles1, setChartOptions) => {
    const files = Array.from(event.target.files);

    const newFiles = files.map((file) => ({
      name: file.name,
      data: null,
    }));

    const folderPath = files.length > 0 ? files[0].webkitRelativePath : '';
    const folderInput = document.getElementById('folderInput');
    folderInput.value = folderPath;

    setSelectedFiles1(newFiles);
  };

  const handleRowClick1 = async (index, selectedFiles, setSelectedFiles, setChartOptions) => {
    const selectedFile = selectedFiles[index];

    if (!selectedFile.data) {
      const fileInput = document.getElementById('folderInput');
      fileInput.value = '';
      fileInput.click();

      fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        const data = await readFile(file);
        const parsedData = parseDataFile(data);

        if (parsedData.length > 0) {
          const updatedFiles = selectedFiles.map((file) => (file.name === selectedFile.name ? { ...file, data: parsedData } : file));

          setChartOptions({
            ...chartOptions2,
            series: [
              {
                data: parsedData,
              },
            ],
          });

          setSelectedFiles(updatedFiles);
        } else {
          console.error(`No valid data points found in ${file.name}.`);
        }
      });
    } else {
      setChartOptions({
        ...chartOptions2,
        series: [
          {
            data: selectedFile.data,
          },
        ],
      });
    }
  };

  const readFile1 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(file);
    });
  };

  const parseDataFile1 = (data) => {
    const lines = data.split('\n');
    const headersLine = lines[0];
    const headers = headersLine.split('\t');

    const timeIndex = headers.findIndex((header) => header.includes('Time'));
    const bendingMomentXIndex = headers.findIndex((header) => header.includes('Bending moment X'));

    const parsedData = lines.slice(1).map((line) => {
      const values = line.split('\t');
      const xValue = new Date(values[timeIndex] * 1000).getTime();
      const yValue = parseFloat(values[bendingMomentXIndex]);

      if (!isNaN(xValue) && !isNaN(yValue) && yValue >= 0) {
        return {
          x: xValue,
          y: yValue,
        };
      } else {
        return null;
      }
    }).filter(Boolean);

    return parsedData;
  };

  // State for the second set of components
  const [selectedFiles2, setSelectedFiles2] = useState([]);
  const [chartOptions2, setChartOptions2] = useState({
    series: [
      {
        data: [],
      },
    ],
    chart: {
      type: 'line',
      height: 350,
    },
    xaxis: {
      title: {
        text: 'Number of produced Unit',
      },
      tickAmount: 8,
      min: 2,
      max: 10,
    },
    yaxis: {
      title: {
        text: 'Bending Moment X',
      },
      labels: {
        formatter: function (value) {
          return value.toFixed(1);
        },
      },
      tickAmount: 10,
      min: 0.0,
      max: 1.4,
    },
  });
  const GraphComponent2 = ({ chartOptions }) => {
    return (
      <div style={{ width: '56vw', height: '40vh', marginLeft: '2px',marginRight:'2px', backgroundColor: 'white' }}>
        <ApexCharts options={chartOptions} series={chartOptions.series} type="line" height={350} />
      </div>
    );
  };

  const handleFileChange = async (event, setSelectedFiles2, setChartOptions) => {
    const files = Array.from(event.target.files);

    const newFiles = files.map((file) => ({
      name: file.name,
      data: null,
    }));

    const folderPath = files.length > 0 ? files[0].webkitRelativePath : '';
    const folderInput = document.getElementById('folderInput');
    folderInput.value = folderPath;

    setSelectedFiles2(newFiles);
  };

  const handleRowClick = async (index, selectedFiles, setSelectedFiles, setChartOptions) => {
    const selectedFile = selectedFiles[index];

    if (!selectedFile.data) {
      const fileInput = document.getElementById('folderInput');
      fileInput.value = '';
      fileInput.click();

      fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        const data = await readFile(file);
        const parsedData = parseDataFile(data);

        if (parsedData.length > 0) {
          const updatedFiles = selectedFiles.map((file) => (file.name === selectedFile.name ? { ...file, data: parsedData } : file));

          setChartOptions({
            ...chartOptions2,
            series: [
              {
                data: parsedData,
              },
            ],
          });

          setSelectedFiles(updatedFiles);
        } else {
          console.error(`No valid data points found in ${file.name}.`);
        }
      });
    } else {
      setChartOptions({
        ...chartOptions2,
        series: [
          {
            data: selectedFile.data,
          },
        ],
      });
    }
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(file);
    });
  };

  const parseDataFile = (data) => {
    const lines = data.split('\n');
    const headersLine = lines[0];
    const headers = headersLine.split('\t');

    const timeIndex = headers.findIndex((header) => header.includes('Time'));
    const bendingMomentXIndex = headers.findIndex((header) => header.includes('Bending moment X'));

    const parsedData = lines.slice(1).map((line) => {
      const values = line.split('\t');
      const xValue = new Date(values[timeIndex] * 1000).getTime();
      const yValue = parseFloat(values[bendingMomentXIndex]);

      if (!isNaN(xValue) && !isNaN(yValue) && yValue >= 0) {
        return {
          x: xValue,
          y: yValue,
        };
      } else {
        return null;
      }
    }).filter(Boolean);

    return parsedData;
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div style={{flexDirection:'column',width:'80vw',height:'90vh',justifyContent: 'space-between'}}>
    <div style={{display:'flex',  justifyContent: 'space-between'}} onClick={stopPropagation}>
      {/* File Browsing Component 1 */}
      <FileBrowsing1
        selectedFiles={selectedFiles1}
        handleFileChange={(event) => handleFileChange(event, setSelectedFiles1, setChartOptions1)}
        handleRowClick={(index) => handleRowClick(index, selectedFiles1, setSelectedFiles1, setChartOptions2)}
        chartOptions={chartOptions1}
      />

      {/* Graph Component 1 */}
      <GraphComponent1 chartOptions={chartOptions1} />

      {/* File Browsing Component 2 */}
      <FileBrowsing2
        selectedFiles={selectedFiles2}
        handleFileChange={(event) => handleFileChange1(event, setSelectedFiles2, setChartOptions2)}
        handleRowClick={(index) => handleRowClick1(index, selectedFiles2, setSelectedFiles2, setChartOptions2)}
        chartOptions={chartOptions1}
      />
 </div>
 {/* Graph Component 2 */}
 <div style={{display:"flex",flexDirection:"row"}}onClick={stopPropagation}>
   <div style={{padding:'5px',width:'56.5vw'}}onClick={stopPropagation}>
      <GraphComponent2 chartOptions={chartOptions2} />
    </div>
    <div style={{height: '40vh',padding:'15px', backgroundColor: 'white',border:"2px solid black"}}>
      <div class="flex mb-3">
   <div class="mr-6">
    <label class="flex items-center mb-3">To be calculated</label>
    <div class="bg-gray-400 h-50 w-40">
      <div class="flex items-center mb-3">
        <input id="default-radio-1" type="radio" value="" name="default-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
        <label for="default-radio-1" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Tension</label>
      </div>
      <div class="flex items-center mb-3">
        <input checked id="default-radio-2" type="radio" value="" name="default-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
        <label for="default-radio-2" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Torsion</label>
      </div>
      <div class="flex items-center mb-3">
        <input checked id="default-radio-3" type="radio" value="" name="default-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
        <label for="default-radio-3" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Bending moment</label>
      </div>
    </div>
   </div>

   <div>
    <label class="flex items-center mb-3">Calculate with</label>
    <div class="bg-gray-400 h-20 w-40">
      <div class="flex items-center mb-3">
        <input id="default-radio-4" type="radio" value="" name="default-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
        <label for="default-radio-4" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Max Value</label>
      </div>
      <div class="flex items-center mb-3">
        <input checked id="default-radio-5" type="radio" value="" name="default-radio" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
        <label for="default-radio-5" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Average Value</label>
      </div>
    </div>
   </div>
   </div>

   <div class="flex mb-4">
   <div class="mr-4">
    <button class="w-30 bg-transparent hover:bg-blue-500 text-black -700  font-small hover:text-white py-2 px-4 border border-black-500 hover:border-transparent rounded">
      Cursor on/off
    </button>
   </div>

   <div class="mr-4">
    <button class="w-30 bg-transparent hover:bg-blue-500 text-black-700 font-small hover:text-white py-2 px-4 border border-black-500 hover:border-transparent rounded">
      Export Graph in life
    </button>
   </div>

   <div class="mr-4">
    <button class="w-30 bg-transparent hover:bg-blue-500 text-black-700 font-small hover:text-white py-2 px-4 border border-black-500 hover:border-transparent rounded">
      Bounds on/off
    </button>
   </div>
   </div>

   <div class="flex mb-4">

   <div class="mr-4">
    <button class="w-30 bg-transparent hover:bg-blue-500 text-black-700 font-small hover:text-white py-2 px-4 border border-black-500 hover:border-transparent rounded">
      Clear Graph
    </button>
   </div>

   <div class="mr-4">
    <button class=" h-15 w-40 bg-transparent hover:bg-blue-500 text-black-700 font-small hover:text-white py-2 px-4 border border-black-500 hover:border-transparent rounded">
      Reset
    </button>
   </div>

   <div class="mr-4">
    <button class=" bg-transparent hover:bg-blue-500 text-black-700 font-small hover:text-white py-2 px-4 border border-black-500 hover:border-transparent rounded">
      Clear offset on/off
    </button>
   </div>
   </div>

   <div class="flex mb-4">

   <div class="mr-4">
    <button class="w-40 bg-transparent hover:bg-blue-500 text-black-700 font-small hover:text-white py-2 px-4 border border-black-500 hover:border-transparent rounded">
      Exit
    </button>
   </div>

   <div class="mr-4">
    <button class="w-40 bg-transparent hover:bg-blue-500 text-black-700 font-small hover:text-white py-2 px-4 border border-black-500 hover:border-transparent rounded">
      Image to clipboard
    </button>
   </div>

   <div class="mr-4">
    <button class="w-30 bg-transparent hover:bg-blue-500 text-black-700 font-small hover:text-white py-2 px-4 border border-black-500 hover:border-transparent rounded">
      Calculate
    </button>
      </div>
    </div>
    </div>
    </div>
    </div>
  );
};

export default ToolLifePlot;