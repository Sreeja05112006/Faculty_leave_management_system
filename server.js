const express = require("express");
console.log("SERVER FILE PATH:", __dirname);
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/auth", require("./routes/authRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/faculty", require("./routes/facultyRoutes"));
app.use("/employees", require("./routes/employeeRoutes"));

app.listen(5000, () => {
    console.log("Backend running on port 5000");
});