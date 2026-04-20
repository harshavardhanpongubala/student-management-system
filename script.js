// ================================
// STUDENTHUB PROFESSIONAL SCRIPT.JS
// Supabase + Validation + Search + Delete + UX
// ================================

// ===== SUPABASE CONFIG =====
const SUPABASE_URL = "https://aersbyzfglbffwypiayp.supabase.co";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

// ===== GLOBAL DATA =====
let students = [];

// ================================
// VALIDATE FORM
// ================================
function validateAndSubmit(event) {
    event.preventDefault();

    let valid = true;

    // Clear old errors
    ['nameError', 'emailError', 'rollError', 'phoneError', 'cgpaError'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
    });

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const roll = document.getElementById("roll").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const branch = document.getElementById("branch").value;
    const cgpa = document.getElementById("cgpa").value.trim();

    // Name
    if (name.length < 3) {
        document.getElementById("nameError").textContent = "Enter valid name";
        valid = false;
    }

    // Email
    if (!email.includes("@") || !email.includes(".")) {
        document.getElementById("emailError").textContent = "Enter valid email";
        valid = false;
    }

    // Roll
    if (roll.length < 2) {
        document.getElementById("rollError").textContent = "Enter valid roll no";
        valid = false;
    }

    // Phone
    if (phone.length !== 10 || isNaN(phone)) {
        document.getElementById("phoneError").textContent = "Enter valid phone";
        valid = false;
    }

    // CGPA
    const cgpaNum = parseFloat(cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
        document.getElementById("cgpaError").textContent = "CGPA must be 0 - 10";
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
}

// ================================
// ADD STUDENT
// ================================
async function addStudent(student) {

    showMessage("⏳ Saving student...", "#0d6efd");

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

        if (!res.ok) throw new Error("Insert failed");

        showMessage(`✅ ${student.name} added successfully!`, "#198754");

        resetForm();
        fetchStudents();

    } catch (error) {
        showMessage("❌ Failed to add student", "#dc3545");
        console.error(error);
    }
}

// ================================
// FETCH STUDENTS
// ================================
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
        console.error("Fetch Error:", error);
    }
}

// ================================
// DELETE STUDENT
// ================================
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

// ================================
// RENDER TABLE
// ================================
function renderTable(data) {

    const tbody = document.getElementById("studentBody");
    const count = document.getElementById("count");

    if (!tbody) return;

    count.textContent = data.length;

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">📭 No student records found</td>
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

// ================================
// SEARCH STUDENTS
// ================================
function searchStudents() {

    const term = document
        .getElementById("search")
        .value
        .toLowerCase();

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.roll.toLowerCase().includes(term) ||
        s.branch.toLowerCase().includes(term)
    );

    renderTable(filtered);
}

// ================================
// RESET FORM
// ================================
function resetForm() {
    const form = document.getElementById("studentForm");
    if (form) form.reset();
}

// ================================
// SUCCESS / ERROR MESSAGE
// ================================
function showMessage(text, color) {

    const msg = document.getElementById("successMsg");

    if (!msg) return;

    msg.style.display = "block";
    msg.style.background = color;
    msg.style.color = "white";
    msg.style.padding = "12px";
    msg.style.borderRadius = "8px";
    msg.style.marginTop = "15px";
    msg.textContent = text;

    setTimeout(() => {
        msg.style.display = "none";
    }, 2500);
}

// ================================
// PAGE LOAD
// ================================
window.onload = () => {

    // Students page
    if (document.getElementById("studentBody")) {
        fetchStudents();
    }

    console.log("🎓 StudentHub Loaded Successfully");
};