// ===== SUPABASE CONFIG =====
const SUPABASE_URL = "https://aersbyzfglbffwypiayp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnNieXpmZ2xiZmZ3eXBpYXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODUxOTMsImV4cCI6MjA5MTc2MTE5M30.v19ajqRNIh34C7vziSd15dHyvf1SmJcX-obP_w4tYr8";

let students = [];

// ---- VALIDATION ----
function validateAndSubmit(event) {
  event.preventDefault();
  let valid = true;

  ['nameError','emailError','rollError','phoneError','cgpaError'].forEach(id => {
    document.getElementById(id).textContent = '';
  });

  const name  = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const roll  = document.getElementById('roll').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const cgpa  = document.getElementById('cgpa').value.trim();
  const branch = document.getElementById('branch').value;

  if (!name || name.length < 3) {
    document.getElementById('nameError').textContent = "Invalid name";
    valid = false;
  }

  if (!email.includes("@")) {
    document.getElementById('emailError').textContent = "Invalid email";
    valid = false;
  }

  if (!roll) {
    document.getElementById('rollError').textContent = "Invalid roll";
    valid = false;
  }

  if (!phone || phone.length !== 10) {
    document.getElementById('phoneError').textContent = "Invalid phone";
    valid = false;
  }

  const cgpaNum = parseFloat(cgpa);
  if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
    document.getElementById('cgpaError').textContent = "Invalid CGPA";
    valid = false;
  }

  if (valid) {
    addStudent({ name, email, roll, phone, branch, cgpa: cgpaNum });
  }
}

// ---- ADD STUDENT (SUPABASE) ----
async function addStudent(student) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify(student)
    });

    if (!res.ok) throw new Error("Insert failed");

    fetchStudents();
    resetForm();

    const msg = document.getElementById("successMsg");

if (msg) {
  msg.style.display = "block";
  msg.textContent = `✅ ${student.name} added successfully!`;

  setTimeout(() => {
    msg.style.display = "none";
  }, 2000);
}
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
}

// ---- FETCH STUDENTS ----
async function fetchStudents() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/students?select=*`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });

    students = await res.json();
    renderTable();

  } catch (err) {
    console.error(err);
  }
}

// ---- DELETE STUDENT ----
async function deleteStudent(id) {
  await fetch(`${SUPABASE_URL}/rest/v1/students?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  });

  fetchStudents();
}

// ---- RENDER TABLE ----
function renderTable() {
  const tbody = document.getElementById('studentBody');
  document.getElementById('count').textContent = students.length;

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">No data</td></tr>`;
    return;
  }

  tbody.innerHTML = students.map((s, i) => `
    <tr>
      <td>${i+1}</td>
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td>${s.roll}</td>
      <td>${s.branch}</td>
      <td>${s.cgpa}</td>
      <td><button onclick="deleteStudent(${s.id})">Delete</button></td>
    </tr>
  `).join('');
}

// ---- RESET ----
function resetForm() {
  document.getElementById('studentForm').reset();
}

// ---- LOAD DATA ----
window.onload = () => {
  if (document.getElementById('studentBody')) {
    fetchStudents();
  }
};