const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
//cores
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
// Configure AWS SDK
const lambda = new AWS.Lambda({
  region: 'us-east-1', // Specify your AWS region
  endpoint: 'http://localhost:4566', // Assuming you are using LocalStack for local emulation
  s3ForcePathStyle: true,
});

// Lambda function name
const functionName = 'lambdaf'; // Replace with your Lambda function name

// Route to handle file upload
// Route to handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      // Retrieve file path
      const filePath = req.file.path;
  
      // Read CSV file
      const fs = require('fs');
      const csv = require('csv-parser');
      const rows = [];
  
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', async () => {
          try {
            // Close file stream
            fs.unlinkSync(filePath);

            console.log('Rows:', rows);
  
            // Invoke Lambda function
            const lambdaParams = {
              FunctionName: functionName,
              Payload: JSON.stringify({ rows }), // Ensure rows are passed as JSON
            };
            console.log(lambdaParams);
            const lambdaResponse = await lambda.invoke(lambdaParams).promise();
            console.log(lambdaResponse);
            const lambdaResult = JSON.parse(lambdaResponse.Payload);
  
            // Send Lambda function response
            res.json(lambdaResult);
          } catch (error) {
            console.error('Error invoking Lambda function:', error);
            res.status(500).json({ error: 'Internal server error' });
          }
        });
    } catch (error) {
      console.error('Error handling file upload:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

// Start server
const port = 3001; // Specify your desired port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
