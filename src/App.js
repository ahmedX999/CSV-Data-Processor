// App.js
import React, { useState } from 'react';
import axios from 'axios';
import FileUploadComponent from './FileUploadComponent';

function App() {
  const [chartData, setChartData] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      const response = await axios.post('http://localhost:3001/upload', formData);
      setChartData(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>CSV Processor</h1>
      <FileUploadComponent onSubmit={handleSubmit} />
      {chartData && (
        <div>
          {/* Display chart using chartData */}
        </div>
      )}
    </div>
  );
}

export default App;
