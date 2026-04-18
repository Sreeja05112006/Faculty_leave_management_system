const express = require("express");
const router = express.Router();
const admin = require("../controllers/adminController");

router.get("/leave-requests", admin.getLeaveRequests);
router.put("/update", admin.updateLeave);
router.get("/leave-counts", admin.leaveCounts);
router.get("/employee-count", admin.employeeCount);
router.get("/leave-type-breakdown", admin.leaveTypeBreakdown);

module.exports = router;