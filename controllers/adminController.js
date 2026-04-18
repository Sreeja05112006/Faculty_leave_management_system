const Admin = require("../models/adminModel");

exports.getLeaveRequests = (req, res) => {
    Admin.getAllLeaveRequests((err, result) => {
        if (err) throw err;
        res.json(result);
    });
};

exports.updateLeave = (req, res) => {
    const { leave_id, status } = req.body;

    Admin.updateLeaveStatus(leave_id, status, (err) => {
        if (err) throw err;
        res.json({ message: "Status updated" });
    });
};


const db = require("../config/db");
// GET COUNTS OF LEAVE REQUESTS
exports.leaveCounts = (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) AS total,
            SUM(status = 'pending') AS pending,
            SUM(status = 'approved') AS approved,
            SUM(status = 'rejected') AS rejected
        FROM leave_requests
    `;

    db.query(sql, (err, results) => {
        if (err) return res.json({ success: false, message: "DB Error" });

        return res.json({
            success: true,
            data: results[0]
        });
    });
};

exports.employeeCount = (req, res) => {
    db.query("SELECT COUNT(*) AS total FROM faculty", (err, result) => {
        if (err) return res.json({ success: false });
        res.json({ success: true, total: result[0].total });
    });
};

exports.leaveTypeBreakdown = (req, res) => {
    const sql = `
        SELECT 
            leave_type,
            COUNT(*) AS total,
            SUM(status='pending') AS pending,
            SUM(status='approved') AS approved,
            SUM(status='rejected') AS rejected
        FROM leave_requests
        GROUP BY leave_type
    `;

    db.query(sql, (err, result) => {
        if (err) return res.json({ success: false });
        res.json({ success: true, data: result });
    });
};