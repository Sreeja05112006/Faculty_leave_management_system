const db = require("../config/db");

// MAP ID → FULL NAME
const LEAVE_FULLNAME = {
    AL: "Academic Leave",
    CL: "Casual Leave",
    ML: "Maternity Leave",
    SL: "Medical Leave",
    VL: "Vacation Leave"
};

module.exports = {
    
    // APPLY LEAVE
    applyLeave(data, callback) {

        // Convert AL → Academic Leave
        const fullLeaveName = LEAVE_FULLNAME[data.leave_type] || data.leave_type;

        db.query(
            `INSERT INTO leave_requests 
            (faculty_id, leave_type, from_date, to_date, days, reason, applied_on, status)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), 'pending')`,
            [
                data.faculty_id,
                fullLeaveName,       // ← FIXED HERE
                data.from_date,
                data.to_date,
                data.days,
                data.reason
            ],
            callback
        );
    },

    // GET MY APPLICATIONS
    myApplications(faculty_id, callback) {
        db.query(
            `SELECT leave_id, leave_type, from_date, to_date, days, applied_on, reason, status
             FROM leave_requests
             WHERE faculty_id = ?
             ORDER BY leave_id DESC`,
            [faculty_id],
            callback
        );
    }
};