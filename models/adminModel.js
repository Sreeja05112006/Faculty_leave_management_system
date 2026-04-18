const db = require("../config/db");

module.exports = {
    getAllLeaveRequests(callback) {
        db.query(
            "SELECT leave_requests.*, faculty.name FROM leave_requests LEFT JOIN faculty ON faculty.faculty_id = leave_requests.faculty_id",
            callback
        );
    },

    updateLeaveStatus(id, status, callback) {
        db.query(
            "UPDATE leave_requests SET status = ? WHERE leave_id = ?",
            [status, id],
            callback
        );
    }
};