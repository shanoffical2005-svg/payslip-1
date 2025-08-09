require('dotenv').config();
// ...existing code...
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Enable CORS for frontend with credentials and all methods
const cors = require('cors');
const allowedOrigins = [
  'http://localhost:5173',
  'https://payslip-management-al.web.app'
];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,POST,PUT,DELETE,OPTIONS'
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const payslipSchema = new mongoose.Schema({
  employee: {
    company: String,
    designation: String,
    name: String,
    id: String,
    dateOfJoining: String
  },
  salaryDetails: [
    {
      month: String,
      year: String,
      basicSalary: Number,
      transfer: Number,
      loanDeduction: Number,
      absentLOP: Number,
      cashInHand: Number
    }
  ]
});

const Payslip = mongoose.model('Payslip', payslipSchema);

// GET endpoint to retrieve all employees or by name/id
app.get('/api/payslips', async (req, res) => {
  const { employeeName, employeeId } = req.query;
  try {
    if (employeeName || employeeId) {
      const query = {};
      if (employeeName) query['employee.name'] = employeeName;
      if (employeeId) query['employee.id'] = employeeId;
      const result = await Payslip.find(query);
      if (result.length > 0) {
        res.json(result);
      } else {
        res.status(404).json({ message: 'Employee not found' });
      }
    } else {
      // If no query params, return all employees
      const allPayslips = await Payslip.find();
      res.json(allPayslips);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving employee(s)', error: err.message });
  }
});

// POST endpoint to add a new employee with salary details
app.post('/api/payslips', async (req, res) => {
  try {
    const payslip = new Payslip(req.body);
    await payslip.save();
    res.status(201).json({ message: 'Employee and salary details added', payslip });
  } catch (err) {
    res.status(500).json({ message: 'Error adding employee', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Payslip management server running on port ${PORT}`);
});
