// Updated input validation function - Removed ID format restriction
const validateStudentData = (studentData) => {
    const errors = [];
    
    // Student ID validation - Only check if it exists, no format restriction
    if (!studentData.id || studentData.id.trim().length === 0) {
        errors.push('Student ID is required');
    } else if (studentData.id.trim().length > 20) {
        errors.push('Student ID must be less than 20 characters');
    }
    
    // Full Name validation
    if (!studentData.fullName || studentData.fullName.trim().length === 0) {
        errors.push('Full Name is required');
    } else if (studentData.fullName.trim().length < 2) {
        errors.push('Full Name must be at least 2 characters long');
    } else if (studentData.fullName.trim().length > 100) {
        errors.push('Full Name must be less than 100 characters');
    }
    
    // Gender validation
    if (!studentData.gender || !['Male', 'Female'].includes(studentData.gender)) {
        errors.push('Gender must be Male or Female');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!studentData.email || !emailRegex.test(studentData.email)) {
        errors.push('Valid email address is required');
    }
    
    // Program validation
    if (!studentData.program || studentData.program.trim().length === 0) {
        errors.push('Program is required');
    } else if (studentData.program.trim().length < 2) {
        errors.push('Program must be at least 2 characters long');
    }
    
    // Year Level validation
    const validYearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year'];
    if (!studentData.yearLevel || !validYearLevels.includes(studentData.yearLevel)) {
        errors.push('Valid year level is required (1st Year to 6th Year)');
    }
    
    // University validation
    if (!studentData.university || studentData.university.trim().length === 0) {
        errors.push('University is required');
    } else if (studentData.university.trim().length < 2) {
        errors.push('University must be at least 2 characters long');
    }
    
    return errors;
};