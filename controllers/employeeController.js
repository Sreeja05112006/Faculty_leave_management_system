const db = require("../config/db");

// Get all employees
exports.getAllEmployees = (req, res) => {
    const sql = "SELECT emp_code, name, email, department, CURDATE() AS joined_date FROM faculty";
    db.query(sql, (err, result) => {
        if (err) return res.json({ success: false, message: "DB Error" });

        res.json(result);
    });
};

// Add new employee
exports.addEmployee = (req, res) => {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password || !department) {
        return res.json({ success: false, message: "All fields are required" });
    }

    // Map department → short code
    const deptCodes = {
        "Computer Science and Engineering (CSE)": "CS",
        "Information Technology (IT)": "IT",
        "Electronics and Communication Engineering (ECE)": "EC",
        "Electrical and Electronics Engineering (EEE)": "EEE",
        "Mechanical Engineering (ME)": "ME",
        "Civil Engineering (CE)": "CE"
    };

    const deptCode = deptCodes[department];

    // 1) Find last emp_code for this department
    const findSql = "SELECT emp_code FROM faculty WHERE emp_code LIKE ? ORDER BY emp_code DESC LIMIT 1";
    const likeSearch = deptCode + "%";

    db.query(findSql, [likeSearch], (err, result) => {
        if (err) return res.json({ success: false, message: "DB Error (search)" });

        let nextNumber = 1;

        if (result.length > 0) {
            // Extract last 3 digits
            let last = result[0].emp_code;
            let num = parseInt(last.replace(deptCode, ""));
            nextNumber = num + 1;
        }

        const newEmpCode = deptCode + String(nextNumber).padStart(3, '0');

        // 2) Insert new employee WITH generated emp_code
        const insertSql = 
            "INSERT INTO faculty (name, email, password, department, emp_code) VALUES (?, ?, ?, ?, ?)";

        db.query(insertSql, [name, email, password, department, newEmpCode], (err2, result2) => {
            if (err2) return res.json({ success: false, message: "DB Error (insert)" });

            res.json({ success: true, message: "Employee Added Successfully", emp_code: newEmpCode });
        });
    });
};