function approve(btn) {
    let row = btn.closest("tr");

    row.querySelector(".badge").className = "badge approved";
    row.querySelector(".badge").innerText = "Approved";

    btn.parentElement.innerHTML = "<span class='processed'>Processed</span>";
    row.setAttribute("data-status", "approved");
}

function reject(btn) {
    let row = btn.closest("tr");

    row.querySelector(".badge").className = "badge rejected";
    row.querySelector(".badge").innerText = "Rejected";

    btn.parentElement.innerHTML = "<span class='processed'>Processed</span>";
    row.setAttribute("data-status", "rejected");
}

function filterData(status) {
    let rows = document.querySelectorAll("tbody tr");
    let buttons = document.querySelectorAll(".filter");

    buttons.forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");

    rows.forEach(row => {
        if (status === "all" || row.dataset.status === status) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}