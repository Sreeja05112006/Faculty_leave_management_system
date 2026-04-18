const express = require("express");
const router = express.Router();
const faculty = require("../controllers/facultyController");

// Test route
router.get("/test", (req, res) => {
    res.send("Faculty routes working");
});

// Main routes
router.post("/apply", faculty.applyLeave);
router.get("/my-applications/:id", faculty.myApplications);
router.delete("/cancel/:leave_id", faculty.cancelLeave);
router.get("/dashboard/:id", faculty.dashboardStats);

module.exports = router;