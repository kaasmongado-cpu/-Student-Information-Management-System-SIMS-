// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM elements
const studentsTableBody = document.getElementById('students-table-body');
const studentForm = document.getElementById('student-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const programFilter = document.getElementById('program-filter');
const genderFilter = document.getElementById('gender-filter');
const totalStudents = document.getElementById('total-students');
const maleStudents = document.getElementById('male-students');
const femaleStudents = document.getElementById('female-students');
const programsCount = document.getElementById('programs-count');
const displayCount = document.getElementById('display-count');
const totalCount = document.getElementById('total-count');
const successAlert = document.getElementById('success-alert');
const errorAlert = document.getElementById('error-alert');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');

// Global variables
let allStudents = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
    
    // Form submission
    studentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addStudent();
    });
    
    // Search functionality
    searchBtn.addEventListener('click', function() {
        loadStudents();
    });
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            loadStudents();
        }
    });
    // 🌀 REFRESH BUTTON FUNCTIONALITY
document.getElementById('refresh-btn').addEventListener('click', () => {
  // Optional: Show spinner or disable button while loading
  const btn = document.getElementById('refresh-btn');
  btn.disabled = true;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i>Refreshing...`;

  // Reload student list
  loadStudents().then(() => {
    // Restore button state
    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-sync-alt me-1"></i>Refresh`;
  });
});

    
    // Filter functionality
    programFilter.addEventListener('change', function() {
        loadStudents();
    });
    
    genderFilter.addEventListener('change', function() {
        loadStudents();
    });
});

// Load students from API
async function loadStudents() {
    try {
        showLoading();
        
        // Build query parameters
        const params = new URLSearchParams();
        if (searchInput.value) params.append('search', searchInput.value);
        if (programFilter.value) params.append('program', programFilter.value);
        if (genderFilter.value) params.append('gender', genderFilter.value);
        
        const response = await fetch(`${API_BASE_URL}/students?${params}`);
        const result = await response.json();
        
        if (result.success) {
            allStudents = result.data;
            renderStudents();
            updateStats();
        } else {
            throw new Error(result.error || 'Failed to load students');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showError('Failed to load students: ' + error.message);
        allStudents = [];
        renderStudents();
        updateStats();
    }
}

// Render students in the table
function renderStudents() {
    studentsTableBody.innerHTML = '';
    
    if (allStudents.length === 0) {
        studentsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <i class="fas fa-user-slash fa-2x mb-3 text-muted"></i>
                    <p class="text-muted">No students found matching your criteria.</p>
                </td>
            </tr>
        `;
    } else {
        allStudents.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.fullName}</td>
                <td>
                    <span class="${student.gender === 'Male' ? 'gender-male' : 'gender-female'}">
                        <i class="fas fa-${student.gender === 'Male' ? 'mars' : 'venus'} me-1"></i>
                        ${student.gender}
                    </span>
                </td>
                <td>${student.email}</td>
                <td>${student.program}</td>
                <td>${student.yearLevel}</td>
                <td>${student.university}</td>
                <td>
                    <span class="delete-btn" data-id="${student.id}" title="Delete Student">
                        <i class="fas fa-trash-alt"></i>
                    </span>
                </td>
            `;
            studentsTableBody.appendChild(row);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const studentId = this.getAttribute('data-id');
                deleteStudent(studentId);
            });
        });
    }
    
    displayCount.textContent = allStudents.length;
    totalCount.textContent = allStudents.length;
}

// Add a new student
async function addStudent() {
    // Get form values
    const studentId = document.getElementById('student-id').value;
    const fullName = document.getElementById('full-name').value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const email = document.getElementById('email').value;
    const program = document.getElementById('program').value;
    const yearLevel = document.getElementById('year-level').value;
    const university = document.getElementById('university').value;
    
    // Validate form
    if (!validateForm(studentId, fullName, gender, email, program, yearLevel, university)) {
        return;
    }
    
    try {
        const submitBtn = studentForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading-spinner me-2"></div> Adding...';
        submitBtn.disabled = true;
        
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: studentId,
                fullName: fullName,
                gender: gender,
                email: email,
                program: program,
                yearLevel: yearLevel,
                university: university
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Reset form
            studentForm.reset();
            studentForm.classList.remove('was-validated');
            
            // Reload students
            await loadStudents();
            
            // Show success message
            showSuccess(result.message || 'Student added successfully');
        } else {
            throw new Error(result.error || 'Failed to add student');
        }
    } catch (error) {
        console.error('Error adding student:', error);
        showError(error.message);
        
        // Highlight specific field if ID already exists
        if (error.message.includes('Student ID already exists')) {
            document.getElementById('student-id').classList.add('is-invalid');
            document.getElementById('student-id-feedback').textContent = 'Student ID already exists.';
        }
    } finally {
        const submitBtn = studentForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Add Student';
        submitBtn.disabled = false;
    }
}

// Delete a student
async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Reload students
            await loadStudents();
            showSuccess(result.message || 'Student deleted successfully');
        } else {
            throw new Error(result.error || 'Failed to delete student');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showError(error.message);
    }
}

// Validate form inputs
function validateForm(studentId, fullName, gender, email, program, yearLevel, university) {
    let isValid = true;
    
    // Reset validation states
    document.querySelectorAll('.form-control, .form-select').forEach(element => {
        element.classList.remove('is-invalid');
    });
    
    // Validate Student ID
    if (!studentId.trim()) {
        document.getElementById('student-id').classList.add('is-invalid');
        isValid = false;
    }
    
    // Validate Full Name
    if (!fullName.trim()) {
        document.getElementById('full-name').classList.add('is-invalid');
        isValid = false;
    }
    
    // Validate Gender
    if (!gender) {
        document.querySelector('input[name="gender"]').closest('.mb-3').querySelector('.invalid-feedback').style.display = 'block';
        isValid = false;
    }
    
    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
        document.getElementById('email').classList.add('is-invalid');
        isValid = false;
    }
    
    // Validate Program
    if (!program) {
        document.getElementById('program').classList.add('is-invalid');
        isValid = false;
    }
    
    // Validate Year Level
    if (!yearLevel) {
        document.getElementById('year-level').classList.add('is-invalid');
        isValid = false;
    }
    
    // Validate University
    if (!university.trim()) {
        document.getElementById('university').classList.add('is-invalid');
        isValid = false;
    }
    
    if (!isValid) {
        studentForm.classList.add('was-validated');
    }
    
    return isValid;
}

// Update statistics
function updateStats() {
    totalStudents.textContent = allStudents.length;
    
    const maleCount = allStudents.filter(student => student.gender === 'Male').length;
    const femaleCount = allStudents.filter(student => student.gender === 'Female').length;
    
    maleStudents.textContent = maleCount;
    femaleStudents.textContent = femaleCount;
    
    const uniquePrograms = [...new Set(allStudents.map(student => student.program))];
    programsCount.textContent = uniquePrograms.length;
}

// Show success alert
function showSuccess(message) {
    successMessage.textContent = message;
    successAlert.style.display = 'block';
    
    setTimeout(() => {
        successAlert.style.display = 'none';
    }, 5000);
}

// Show error alert
function showError(message) {
    errorMessage.textContent = message;
    errorAlert.style.display = 'block';
    
    setTimeout(() => {
        errorAlert.style.display = 'none';
    }, 5000);
}

// Show loading state
function showLoading() {
    studentsTableBody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-4">
                <div class="loading-spinner mx-auto mb-3"></div>
                <p class="text-muted">Loading students...</p>
            </td>
        </tr>
    `;
}

// 🧼 CLEAR FILTERS BUTTON FUNCTIONALITY
document.getElementById('clear-filters').addEventListener('click', () => {
  const clearBtn = document.getElementById('clear-filters');
  const searchInput = document.getElementById('search-input');
  const programFilter = document.getElementById('program-filter');
  const genderFilter = document.getElementById('gender-filter');

  // Disable button while clearing (optional nice UX)
  clearBtn.disabled = true;
  clearBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-1"></i>Clearing...`;

  // Reset filters
  searchInput.value = '';
  programFilter.value = 'all';
  genderFilter.value = 'all';

  // Reload full student list or reapply filter logic
  loadStudents().then(() => {
    // Re-enable button after refresh
    clearBtn.disabled = false;
    clearBtn.innerHTML = `<i class="fas fa-times me-1"></i>Clear Filters`;
  });
});
