// GET endpoint to retrieve a specific month's payslip for an employee
app.get('/api/payslips/month', async (req, res) => {
  const { employeeId, month, year } = req.query;
  if (!employeeId || !month || !year) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const employeeDoc = await Payslip.findOne({ 'employee.id': employeeId });
    if (!employeeDoc) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Debug log: show request and DB values
    console.log('Request:', { month, year });
    console.log('DB salaryDetails:', employeeDoc.salaryDetails.map(s => ({ month: s.month, year: s.year })));

    const payslip = (employeeDoc.salaryDetails || []).find(
      s => s.month === month && String(s.year) === String(year)
    );
    if (!payslip) {
      return res.status(404).json({ error: 'Payslip not found' });
    }

    // Optionally, include employee info in the response
    res.json({
      ...payslip,
      ...employeeDoc.employee,
      company: employeeDoc.employee.company
    });
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving payslip', details: err.message });
  }
});
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS for frontend with credentials and all methods
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: 'GET,POST,PUT,DELETE,OPTIONS'
}));

// MongoDB connection
mongoose.connect('mongodb+srv://shanoffical2005:UzZjzht1z7Cbcck8@payslip.vthwf5c.mongodb.net/')
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
