import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './FileUploadComponent.css'; // Import CSS file for styling

const FileUploadComponent = ({ onSubmit }) => {
  const [file, setFile] = useState(null);
  const [csvData, setCSVData] = useState(null);
  const [above4000Data, setAbove4000Data] = useState([]);
  const [below4000Data, setBelow4000Data] = useState([]);
  const [nameCountsData, setNameCountsData] = useState({});
  let above4000Chart;
  let nameCountsChart;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    Papa.parse(selectedFile, {
      complete: (result) => {
        setCSVData(result.data);
      },
      header: true // Assuming the first row contains headers
    });
  };

  const handleChangeValue = (rowIndex, columnName, value) => {
    const updatedData = [...csvData];
    updatedData[rowIndex] = { ...updatedData[rowIndex], [columnName]: value };
    setCSVData(updatedData);
  };

  const handleDeleteRow = (rowIndex) => {
    const updatedData = [...csvData];
    updatedData.splice(rowIndex, 1);
    setCSVData(updatedData);
  };

  const handleAddRow = () => {
    const newRow = {};
    if (csvData.length > 0) {
      Object.keys(csvData[0]).forEach((column) => {
        newRow[column] = '';
      });
    }
    setCSVData((prevData) => [...prevData, newRow]);
  };

  const handleAddColumn = () => {
    const newColumnName = prompt('Enter new column name:');
    if (newColumnName) {
      setCSVData((prevData) => {
        return prevData.map((row) => {
          return { ...row, [newColumnName]: '' };
        });
      });
    }
  };

  const handleDeleteColumn = (columnName) => {
    const updatedData = csvData.map((row) => {
      const newRow = { ...row };
      delete newRow[columnName];
      return newRow;
    });
    setCSVData(updatedData);
  };

  const handleDownloadCSV = () => {
    const csv = Papa.unparse(csvData, { delimiter: ';' }); // Specify delimiter as ';'
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modified_file.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    // Convert csvData back to CSV format
    const csv = Papa.unparse(csvData);
    const formData = new FormData();
    formData.append('file', new Blob([csv], { type: 'text/csv' }), file.name);

    try {
      const response = await axios.post('http://localhost:3001/upload', formData);
      console.log('Upload successful:', response.data);
      const { above4000, below4000, nameCounts } = response.data;
      console.log('above4000:', above4000);
      console.log('below4000:', below4000);
      console.log('nameCounts:', nameCounts);
      setAbove4000Data(above4000);
      setBelow4000Data(below4000);
      setNameCountsData(nameCounts);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (above4000Chart) {
      above4000Chart.destroy();
    }
    if (nameCountsChart) {
      nameCountsChart.destroy();
    }

    // Render pie chart for above and below 4000 employees
    above4000Chart = new Chart(document.getElementById('above4000Chart'), {
      type: 'pie',
      data: {
        labels: ['Above $4000', 'Below $4000'],
        datasets: [{
          label: 'Salary Distribution',
          data: [above4000Data.length, below4000Data.length],
          backgroundColor: ['#FF6384', '#36A2EB'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB']
        }]
      }
    });

    // Render column chart for name counts
    nameCountsChart = new Chart(document.getElementById('nameCountsChart'), {
      type: 'bar',
      data: {
        labels: Object.keys(nameCountsData),
        datasets: [{
          label: 'Name Counts',
          data: Object.values(nameCountsData),
          backgroundColor: '#FFCE56',
          borderColor: '#FFCE56',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    // Clean up function
    return () => {
      if (above4000Chart) {
        above4000Chart.destroy();
      }
      if (nameCountsChart) {
        nameCountsChart.destroy();
      }
    };
  }, [above4000Data, below4000Data, nameCountsData]);

  return (
    <div className="container">
      <label htmlFor="file">Upload CSV File: </label>
      <input type="file" onChange={handleFileChange} />
      <br/>
      <br/>
      {csvData && (
        <div>
          <table className="csv-table">
            <thead>
              <tr>
                {Object.keys(csvData[0]).map((column, index) => (
                  <th key={index}>
                    {column}
                    <button className="delete-column-btn" onClick={() => handleDeleteColumn(column)}>
                      X
                    </button>
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {csvData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.entries(row).map(([columnName, value], index) => (
                    <td key={index}>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleChangeValue(rowIndex, columnName, e.target.value)}
                      />
                    </td>
                  ))}
                  <td>
                    <button onClick={() => handleDeleteRow(rowIndex)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="buttons">
            <button className="add-row-btn" onClick={handleAddRow}>Add Row</button>
            <button className="add-column-btn" onClick={handleAddColumn}>Add Column</button>
            <button className="download-btn" onClick={handleDownloadCSV}>Download CSV</button>
            <button className="upload-btn" onClick={handleSubmit}>Submit File</button>
          </div>
        </div>
      )}
      <div className="charts" style={{ width: '450px', height: '450px' , display: 'flex' , margin: '20px' }}  >
        <canvas id="above4000Chart" width="400" height="400"></canvas>
        <canvas id="nameCountsChart" width="400" height="400"></canvas>
      </div>
    </div>
  );
};

export default FileUploadComponent;
