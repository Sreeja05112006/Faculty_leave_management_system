const addBtn = document.getElementById("addBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formSection = document.getElementById("formSection");
const tableSection = document.getElementById("tableSection");

addBtn.onclick = () => {
    formSection.style.display = "block";
    addBtn.style.display = "none";
    cancelBtn.style.display = "inline-block";
};

cancelBtn.onclick = () => {
    formSection.style.display = "none";
    tableSection.style.display = "block";
    addBtn.style.display = "inline-block";
    cancelBtn.style.display = "none";
};
// NEW BACKEND CONNECTION CODE
// Load all employees from backend
function loadEmployees() {
    fetch("http://localhost:5000/employees/all")
        .then(res => res.json())
        .then(data => {
            let tableContent = `
                <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Joined Date</th>
                </tr>
            `;

            data.forEach(emp => {
                tableContent += `
                    <tr>
                        <td>${emp.emp_code}</td>
                        <td>${emp.name}</td>
                        <td>${emp.email}</td>
                        <td>${emp.department}</td>
                        <td>${formatDate(emp.joined_date)}</td>
                    </tr>
                `;
            });

            document.querySelector("#tableSection table").innerHTML = tableContent;
        });
}

loadEmployees(); // Load employees on page load

// Convert date to dd-mm-yyyy
function formatDate(dateStr) {
    let d = new Date(dateStr);
    return d.getDate().toString().padStart(2, "0") + "-" +
           (d.getMonth() + 1).toString().padStart(2, "0") + "-" +
           d.getFullYear();
}

// Add new employee
document.querySelector(".submit-btn").onclick = () => {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const department = document.getElementById("department").value;

    if (!name || !email || !password || !department) {
        alert("Please fill all required fields");
        return;
    }

    fetch("http://localhost:5000/employees/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, department })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);

            if (data.success) {
                formSection.style.display = "none";
                addBtn.style.display = "inline-block";
                cancelBtn.style.display = "none";
                tableSection.style.display = "block";

                loadEmployees(); // Refresh table
            }
        });
};