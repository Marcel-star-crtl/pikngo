const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notificationsRoutes = require('./routes/notificationRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes')
const connectDB = require('./config/db');
const swaggerSpec = require('./swagger');
const socketService = require('./services/socketService');
const { initializeFirebase } = require('./config/firebase');


initializeFirebase();

const app = express();

// Payment Routes
const paymentRoutes = require('./routes/paymentRoutes');

const server = http.createServer(app);
socketService.initialize(server);

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// Endpoints to download Swagger documentation
const yaml = require('js-yaml');
app.get('/api-docs/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=swagger.json');
  res.send(swaggerSpec.specs);
});

app.get('/api-docs/yaml', (req, res) => {
  const yamlString = yaml.dump(swaggerSpec.specs);
  res.setHeader('Content-Type', 'text/yaml');
  res.setHeader('Content-Disposition', 'attachment; filename=swagger.yaml');
  res.send(yamlString);
});

// Add a download page route
app.get('/api-docs/download', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Download API Documentation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #1a365d;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        .container {
          background-color: #f8f9fa;
          border-radius: 5px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .btn {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          padding: 12px 24px;
          margin: 10px 10px 10px 0;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        }
        .info {
          background-color: #e7f3fe;
          border-left: 6px solid #2196F3;
          padding: 10px 20px;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <h1>PiknGo API Documentation</h1>
      
      <div class="container">
        <h2>Download API Documentation</h2>
        <p>Download the API documentation in your preferred format:</p>
        
        <a href="/api-docs/json" class="btn">Download JSON</a>
        <a href="/api-docs/yaml" class="btn">Download YAML</a>
        
        <div class="info">
          <h3>How to import into Postman:</h3>
          <ol>
            <li>Download the JSON format</li>
            <li>Open Postman</li>
            <li>Click on "Import" button in the top left</li>
            <li>Select "File" and choose the downloaded JSON file</li>
            <li>Click "Import" to create a collection with all API endpoints</li>
          </ol>
        </div>
      </div>
      
      <p><a href="/api-docs">Back to API Documentation</a></p>
    </body>
    </html>
  `);
});

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec.specs));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/task', taskRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
