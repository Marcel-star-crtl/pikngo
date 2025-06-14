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
