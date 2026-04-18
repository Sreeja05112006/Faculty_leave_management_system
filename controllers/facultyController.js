const db = require("../config/db");
const Faculty = require("../models/facultyModel");

// 🔹 Leave Name → Frontend ID
const LEAVE_ID = {
    "Academic Leave": "AL",
    "Casual Leave": "CL",
    "Maternity Leave": "ML",
    "Medical Leave": "SL",
    "Vacation Leave": "VL"
};
// Shortcode → Full Leave Name
const LEAVE_FULLNAME = {
    AL: "Academic Leave",
    CL: "Casual Leave",
    ML: "Maternity Leave",
    SL: "Medical Leave",
    VL: "Vacation Leave"
};
// 🔹 Total Leaves mapped by IDs (Frontend table)
const TOTAL_LEAVES = {
    AL: 10,
    CL: 12,
    ML: 180,
    SL: 15,
    VL: 30
};

// APPLY LEAVE
exports.applyLeave = (req, res) => {
    let { faculty_id, leave_type, days } = req.body;

// If frontend sends AL/SL/CL...
if (LEAVE_FULLNAME[leave_type]) {
    leave_type = LEAVE_FULLNAME[leave_type];
}

// Convert full name → ID
const id = LEAVE_ID[leave_type];

    if (!id) {
        return res.json({
            success: false,
            message: "Invalid leave type"
        });
    }

    // Fetch used leaves for this type
    const usedQuery = `
        SELECT SUM(days) AS used 
        FROM leave_requests 
        WHERE faculty_id = ? AND leave_type = ? AND status = 'approved'
    `;

    db.query(usedQuery, [faculty_id, leave_type], (err, result) => {
        if (err) return res.json({ success: false, message: "DB Error" });

        const used = result[0].used || 0;
        const total = TOTAL_LEAVES[id];
        const available = total - used;

        // ❌ Can't apply if 0 available
        if (available <= 0) {
            return res.json({
                success: false,
                message: `No remaining ${leave_type} available`
            });
        }

        // ❌ Can't request more days than available
        if (days > available) {
            return res.json({
                success: false,
                message: `Only ${available} days remaining for ${leave_type}`
            });
        }

        // ✔ Otherwise apply normally
        Faculty.applyLeave(req.body, (err2) => {
            if (err2) return res.json({ success: false, message: "DB Error" });
            res.json({ success: true, message: "Leave applied successfully" });
        });
    });
};

// MY APPLICATIONS
exports.myApplications = (req, res) => {
    Faculty.myApplications(req.params.id, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
};

// CANCEL LEAVE (only pending)
exports.cancelLeave = (req, res) => {
    const { leave_id } = req.params;

    db.query(
        "SELECT status FROM leave_requests WHERE leave_id = ?",
        [leave_id],
        (err, results) => {
            if (err) return res.json({ success: false, message: "DB Error" });

            if (results.length === 0)
                return res.json({ success: false, message: "Leave not found" });

            if (results[0].status !== "pending") {
                return res.json({
                    success: false,
                    message: "Only pending leave requests can be cancelled"
                });
            }

            db.query(
                "DELETE FROM leave_requests WHERE leave_id = ?",
                [leave_id],
                (err2) => {
                    if (err2) return res.json({ success: false, message: "DB Error" });

                    return res.json({
                        success: true,
                        message: "Leave request cancelled"
                    });
                }
            );
        }
    );
};

// DASHBOARD DATA
exports.dashboardStats = (req, res) => {
    const faculty_id = req.params.id;

    const statsQuery = `
        SELECT 
            COUNT(*) AS total,
            SUM(status='approved') AS approved,
            SUM(status='pending') AS pending,
            SUM(status='rejected') AS rejected
        FROM leave_requests
        WHERE faculty_id = ?;
    `;

    const recentQuery = `
        SELECT leave_type, from_date, to_date, days, reason, status
        FROM leave_requests
        WHERE faculty_id = ?
        ORDER BY leave_id DESC
        LIMIT 5;
    `;

    const leaveBalanceQuery = `
        SELECT leave_type, SUM(days) AS used
        FROM leave_requests
        WHERE faculty_id = ? AND status = 'approved'
        GROUP BY leave_type;
    `;

    db.query(statsQuery, [faculty_id], (err, statsResult) => {
        if (err) return res.json({ success: false });

        db.query(recentQuery, [faculty_id], (err2, recentResult) => {
            if (err2) return res.json({ success: false });

            db.query(leaveBalanceQuery, [faculty_id], (err3, balanceResult) => {
                if (err3) return res.json({ success: false });

                // Initialize leave balance by IDs
                let leaveBalances = {};
                for (let id in TOTAL_LEAVES) {
                    leaveBalances[id] = {
                        total: TOTAL_LEAVES[id],
                        taken: 0,
                        available: TOTAL_LEAVES[id]
                    };
                }

                // Fill taken leave using DB data
                balanceResult.forEach(row => {
                    const fullName = row.leave_type;           // e.g. "Academic Leave"
                    const id = LEAVE_ID[fullName];             // → AL

                    if (id) {
                        let used = row.used;
                        leaveBalances[id].taken = used;
                        leaveBalances[id].available = TOTAL_LEAVES[id] - used;
                    }
                });

                res.json({
                    success: true,
                    stats: statsResult[0],
                    leaveBalances: leaveBalances,
                    recent: recentResult
                });
            });
        });
    });
};