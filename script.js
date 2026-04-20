// =======================================
// STUDENTHUB FINAL WORKING SCRIPT.JS
// Supabase + Register + Fetch + Delete + Search
// =======================================

// ===== SUPABASE CONFIG =====
const SUPABASE_URL = "https://aersbyzfglbffwypiayp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnNieXpmZ2xiZmZ3eXBpYXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODUxOTMsImV4cCI6MjA5MTc2MTE5M30.v19ajqRNIh34C7vziSd15dHyvf1SmJcX-obP_w4tYr8"

// ===== GLOBAL DATA =====
let students = [];

// =======================================
// VALIDATE FORM
// =======================================
function validateAndSubmit(event) {
    event.preventDefault();

    let valid = true;

    clearErrors();

    const name   = document.getElementById("name").value.trim();
    const email  = document.getElementById("email").value.trim();
    const roll   = document.getElementById("roll").value.trim();
    const phone  = document.getElementById("phone").value.trim();
    const branch = document.getElementById("branch").value;
    const cgpa   = document.getElementById("cgpa").value.trim();

    // Name
    if (name.length < 3) {
        setError("nameError", "Enter valid full name");
        valid = false;
    }

    // Email
    if (!email.includes("@") || !email.includes(".")) {
        setError("emailError", "Enter valid email");
        valid = false;
    }

    // Roll
    if (roll.length < 2) {
        setError("rollError", "Enter valid roll number");
        valid = false;
    }

    // Phone
    if (phone.length !== 10 || isNaN(phone)) {
        setError("phoneError", "Enter valid 10-digit phone");
        valid = false;
    }

    // CGPA
    const cgpaNum = parseFloat(cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
        setError("cgpaError", "CGPA must be 0 to 10");
        valid = false;
    }

    if (valid) {
        addStudent({
            name,
            email,
            roll,
            phone,
            branch,
            cgpa: cgpaNum
        });
    }

    return false;
}

// =======================================
// ADD STUDENT
// =======================================
async function addStudent(student) {

    showMessage("Saving student...", "#0d6efd");

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Prefer": "return=representation"
            },
            body: JSON.stringify(student)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText);
        }

        showMessage(`✅ ${student.name} registered successfully!`, "#198754");

        resetForm();
        fetchStudents();

    } catch (error) {
        console.error(error);
        showMessage("❌ Failed to register student", "#dc3545");
    }
}

// =======================================
// FETCH STUDENTS
// =======================================
async function fetchStudents() {

    try {
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/students?select=*&order=id.desc`,
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        students = await res.json();

        renderTable(students);

    } catch (error) {
        console.error(error);
    }
}

// =======================================
// DELETE STUDENT
// =======================================
async function deleteStudent(id) {

    const confirmDelete = confirm("Delete this student permanently?");

    if (!confirmDelete) return;

    try {
        await fetch(`${SUPABASE_URL}/rest/v1/students?id=eq.${id}`, {
            method: "DELETE",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`
            }
        });

        showMessage("🗑 Student deleted", "#dc3545");

        fetchStudents();

    } catch (error) {
        console.error(error);
    }
}

// =======================================
// RENDER TABLE
// =======================================
function renderTable(data) {

    const tbody = document.getElementById("studentBody");
    const count = document.getElementById("count");

    if (!tbody) return;

    if (count) count.textContent = data.length;

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty">No student records found</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map((s, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.roll}</td>
            <td>${s.branch}</td>
            <td>${s.cgpa}</td>
            <td>
                <button onclick="deleteStudent(${s.id})">
                    Delete
                </button>
            </td>
        </tr>
    `).join("");
}

// =======================================
// SEARCH
// =======================================
function searchStudents() {

    const input = document.getElementById("search");
    if (!input) return;

    const term = input.value.toLowerCase();

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.roll.toLowerCase().includes(term) ||
        s.branch.toLowerCase().includes(term)
    );

    renderTable(filtered);
}

// =======================================
// HELPERS
// =======================================
function resetForm() {
    const form = document.getElementById("studentForm");
    if (form) form.reset();
}

function setError(id, message) {
    const el = document.getElementById(id);
    if (el) el.textContent = message;
}

function clearErrors() {
    const ids = [
        "nameError",
        "emailError",
        "rollError",
        "phoneError",
        "cgpaError"
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
    });
}

function showMessage(text, color) {

    const msg = document.getElementById("successMsg");

    if (!msg) return;

    msg.style.display = "block";
    msg.style.background = color;
    msg.style.color = "white";
    msg.style.padding = "12px";
    msg.style.marginTop = "15px";
    msg.style.borderRadius = "8px";
    msg.style.textAlign = "center";
    msg.textContent = text;

    setTimeout(() => {
        msg.style.display = "none";
    }, 2500);
}

// =======================================
// LOAD PAGE
// =======================================
window.onload = () => {

    if (document.getElementById("studentBody")) {
        fetchStudents();
    }

    console.log("🎓 StudentHub Loaded Successfully");
};