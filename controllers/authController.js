const db = require("../config/db");

exports.login = (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.json({ success: false, message: "All fields are required" });
    }

    let sql = "";
    let params = [];

    if (role === "admin") {
        // admin uses username + password
        sql = "SELECT * FROM admin WHERE username = ? AND password = ?";
        params = [username, password];
    } else if (role === "faculty") {
        // faculty uses EMAIL + password
        sql = "SELECT * FROM faculty WHERE email = ? AND password = ?";
        params = [username, password];
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.json({ success: false, message: "DB Error" });

        if (results.length === 0) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        if (role === "admin") {
            return res.json({
                success: true,
                admin_id: results[0].admin_id,
                message: "Admin Login Successful"
            });
        }

        if (role === "faculty") {
            return res.json({
                success: true,
                faculty_id: results[0].faculty_id,
                email: results[0].email,
                faculty_name: results[0].name,
                department: results[0].department,
                message: "Faculty Login Successful"
            });
        }
    });
};