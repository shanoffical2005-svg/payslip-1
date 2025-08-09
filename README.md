# Payslip Management Server

This is a simple Node.js Express REST API for managing employee payslips. Payslip data is stored in memory.

## Endpoints

- **GET /api/payslips?employeeName=NAME&month=MONTH**
  - Retrieve payslip for an employee and month.
- **POST /api/payslips**
  - Add a new payslip (send JSON in request body).

## How to Run

1. Install dependencies (already done):
   ```powershell
   npm install
   ```
2. Start the server:
   ```powershell
   node index.js
   ```
3. The server runs on port 3000 by default.

## Example POST Body

See your earlier example for the payslip JSON structure.

---

You can extend this API with more features as needed.
