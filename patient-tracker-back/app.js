const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const patientRoutes = require('./routes/patientRoutes')
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientHealthMetricsRoutes = require('./routes/patientHealthMetricsRoutes');
const { verifyToken } = require('./jwt-middleware');
const fs = require('fs');
const path = require('path');


const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'https://patient-tracker.netlify.app' }));


const ca = fs.readFileSync(path.join(__dirname, 'rds-combined-ca-bundle.pem'));

// Amazon DocumentDB Connection
const docDbUri = `mongodb://${process.env.DOCDB_USER}:${process.env.DOCDB_PWD}@${process.env.DOCDB_HOST}:27017/${process.env.DOCDB_DATABASE}?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;

mongoose.connect(docDbUri, {
  tls: true,
  tlsCAFile: path.join(__dirname, 'rds-combined-ca-bundle.pem'),
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000
}).then(() => {
  console.log('✅ Connected to Amazon DocumentDB');
}).catch((err) => {
  console.log('❌ Error connecting to Amazon DocumentDB:', err);
});

app.use('/api/doctors', doctorRoutes);
app.use(verifyToken)
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patient-health-metrics', patientHealthMetricsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));