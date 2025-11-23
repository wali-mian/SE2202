/**
 * Course Class
 * Encapsulates the details of each course entry
 * Provides methods for retrieving and formatting course details
 */
class Course {
    /**
     * Constructor to initialize a Course object with all relevant details
     * @param {string} id - Unique course identifier
     * @param {string} title - Course title
     * @param {string} department - Department offering the course
     * @param {number} level - Course level (100, 200, 300, 400)
     * @param {number} credits - Number of credits for the course
     * @param {string} instructor - Name of the course instructor
     * @param {string} description - Course description
     * @param {string} semester - Semester when course is offered (e.g., "Fall 2025")
     */
    constructor(id, title, department, level, credits, instructor, description, semester) {
        this.id = id;
        this.title = title;
        this.department = department;
        this.level = level;
        this.credits = credits;
        this.instructor = instructor;
        this.description = description;
        this.semester = semester;
    }

    /**
     * Returns detailed information about the course
     * @returns {object} Object containing all course details
     */
    getDetails() {
        return {
            id: this.id,
            title: this.title,
            department: this.department,
            level: this.level,
            credits: this.credits,
            instructor: this.instructor || 'TBD',
            description: this.description,
            semester: this.semester
        };
    }

    /**
     * Returns a formatted string representation of the course
     * @returns {string} Formatted string with course ID and title
     */
    getFormattedInfo() {
        return `${this.id} - ${this.title}`;
    }
}

/**
 * Global State Management
 * These variables track the current state of the application
 */
// Array to store all courses loaded from the JSON file
let allCourses = [];
// Array to store filtered courses based on current filter selections
let filteredCourses = [];
// Object to track current filter selections
let currentFilters = {
    level: '',
    credits: '',
    instructor: '',
    department: '',
    semester: ''
};
// String to track current sorting option
let currentSort = '';

/**
 * Initialize Event Listeners
 * Runs when DOM is fully loaded
 * Attaches event listeners to all interactive elements
 */
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const levelFilter = document.getElementById('levelFilter');
    const creditsFilter = document.getElementById('creditsFilter');
    const instructorFilter = document.getElementById('instructorFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    const semesterFilter = document.getElementById('semesterFilter');
    const sortBy = document.getElementById('sortBy');

    // Attach event listeners for file upload and filter changes
    fileInput.addEventListener('change', handleFileUpload);
    levelFilter.addEventListener('change', applyFilters);
    creditsFilter.addEventListener('change', applyFilters);
    instructorFilter.addEventListener('change', applyFilters);
    departmentFilter.addEventListener('change', applyFilters);
    semesterFilter.addEventListener('change', applyFilters);
    sortBy.addEventListener('change', applySorting);
});

/**
 * File Upload Handler
 * Handles file selection and reads JSON data from the selected file
 * Creates Course objects and populates the application with data
 * Implements error handling for invalid or malformed JSON
 * @param {Event} event - File input change event
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    const errorMessage = document.getElementById('errorMessage');

    // Clear any previous error messages
    errorMessage.textContent = '';

    if (!file) {
        return;
    }

    // Create FileReader to read the selected file
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            // Parse JSON data from file
            const data = JSON.parse(e.target.result);

            // Validate that data is an array
            if (!Array.isArray(data)) {
                throw new Error('JSON data must be an array of courses.');
            }

            // Validate that each course has required fields (id and title)
            data.forEach((course, index) => {
                if (!course.id || !course.title) {
                    throw new Error(`Course at index ${index} is missing required fields (id, title).`);
                }
            });

            // Create Course objects from the JSON data
            allCourses = data.map(courseData => {
                return new Course(
                    courseData.id,
                    courseData.title,
                    courseData.department || 'N/A',
                    courseData.level || 'N/A',
                    courseData.credits || 'N/A',
                    courseData.instructor,
                    courseData.description || 'No description available',
                    courseData.semester || 'N/A'
                );
            });

            // Initialize filtered courses with all courses
            filteredCourses = [...allCourses];

            // Populate filter dropdowns with unique values from the data
            populateFilterDropdowns();

            // Display courses in the UI
            displayCourses(filteredCourses);

            // Clear file input for next potential upload
            event.target.value = '';
        } catch (error) {
            // Display error message and clear application state on error
            errorMessage.textContent = `Error: ${error.message}`;
            allCourses = [];
            filteredCourses = [];
            clearUI();
        }
    };

    reader.onerror = () => {
        // Handle file reading errors
        errorMessage.textContent = 'Error: Failed to read the file.';
        allCourses = [];
        filteredCourses = [];
        clearUI();
    };

    // Read the file as text
    reader.readAsText(file);
}

/**
 * Populate Filter Dropdowns
 * Generates filter dropdown options based on available course data
 * Uses Set to collect unique values for each filter criterion
 * Ensures dropdowns only show relevant options from the actual data
 */
function populateFilterDropdowns() {
    const levelFilter = document.getElementById('levelFilter');
    const creditsFilter = document.getElementById('creditsFilter');
    const instructorFilter = document.getElementById('instructorFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    const semesterFilter = document.getElementById('semesterFilter');

    // Use Set to collect unique values (Set automatically removes duplicates)
    const levels = new Set(allCourses.map(c => String(c.level)).filter(l => l !== 'N/A'));
    const credits = new Set(allCourses.map(c => String(c.credits)).filter(cr => cr !== 'N/A'));
    const instructors = new Set(allCourses.map(c => c.instructor).filter(i => i !== null && i !== 'N/A'));
    const departments = new Set(allCourses.map(c => c.department).filter(d => d !== 'N/A'));
    const semesters = new Set(allCourses.map(c => c.semester).filter(s => s !== 'N/A'));

    // Sort and populate each dropdown
    populateSelect(levelFilter, Array.from(levels).sort((a, b) => a - b));
    populateSelect(creditsFilter, Array.from(credits).sort((a, b) => a - b));
    populateSelect(instructorFilter, Array.from(instructors).sort());
    populateSelect(departmentFilter, Array.from(departments).sort());
    populateSelect(semesterFilter, Array.from(semesters).sort(compareSemesters));
}

/**
 * Populate Select Element
 * Helper function to add options to a select dropdown
 * @param {HTMLSelectElement} selectElement - The select element to populate
 * @param {Array} options - Array of option values to add
 */
function populateSelect(selectElement, options) {
    // Remove all options except the first default option
    while (selectElement.options.length > 1) {
        selectElement.remove(1);
    }

    // Add each option to the select element
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

/**
 * Apply Filters
 * Updates the currentFilters object and applies all active filters
 * Uses the Array.filter() method to filter courses based on multiple criteria
 * Maintains any active sorting while filtering
 */
function applyFilters() {
    const levelFilter = document.getElementById('levelFilter');
    const creditsFilter = document.getElementById('creditsFilter');
    const instructorFilter = document.getElementById('instructorFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    const semesterFilter = document.getElementById('semesterFilter');

    // Update current filter selections
    currentFilters = {
        level: levelFilter.value,
        credits: creditsFilter.value,
        instructor: instructorFilter.value,
        department: departmentFilter.value,
        semester: semesterFilter.value
    };

    // Filter courses using the filter() method - returns courses matching ALL active filters
    filteredCourses = allCourses.filter(course => {
        const levelMatch = currentFilters.level === '' || String(course.level) === currentFilters.level;
        const creditsMatch = currentFilters.credits === '' || String(course.credits) === currentFilters.credits;
        const instructorMatch = currentFilters.instructor === '' || course.instructor === currentFilters.instructor;
        const departmentMatch = currentFilters.department === '' || course.department === currentFilters.department;
        const semesterMatch = currentFilters.semester === '' || course.semester === currentFilters.semester;

        // Course must match ALL selected filter criteria
        return levelMatch && creditsMatch && instructorMatch && departmentMatch && semesterMatch;
    });

    // Apply current sorting if one is selected
    if (currentSort) {
        sortCourses(filteredCourses, currentSort);
    }

    // Update the display with filtered courses
    displayCourses(filteredCourses);
}

/**
 * Apply Sorting
 * Handles sorting option changes from the UI
 * @param {Event} event - Sort dropdown change event
 */
function applySorting(event) {
    currentSort = event.target.value;

    // Only sort if a valid sort option is selected
    if (currentSort) {
        sortCourses(filteredCourses, currentSort);
    }

    // Update the display with sorted courses
    displayCourses(filteredCourses);
}

/**
 * Sort Courses
 * Implements sorting functionality using the Array.sort() method
 * Supports sorting by title (A-Z and Z-A), ID, and semester
 * @param {Array} courses - Array of Course objects to sort
 * @param {string} sortOption - The sorting option selected (title-asc, title-desc, id-asc, id-desc, semester-asc, semester-desc)
 */
function sortCourses(courses, sortOption) {
    // Use sort() method for all sorting operations
    switch (sortOption) {
        case 'title-asc':
            // Sort by title alphabetically (A-Z)
            courses.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            // Sort by title reverse alphabetically (Z-A)
            courses.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'id-asc':
            // Sort by ID in ascending order
            courses.sort((a, b) => a.id.localeCompare(b.id));
            break;
        case 'id-desc':
            // Sort by ID in descending order
            courses.sort((a, b) => b.id.localeCompare(a.id));
            break;
        case 'semester-asc':
            // Sort by semester from earliest to latest
            courses.sort(compareSemestersForSort);
            break;
        case 'semester-desc':
            // Sort by semester from latest to earliest
            courses.sort((a, b) => compareSemestersForSort(b, a));
            break;
        default:
            break;
    }
}

/**
 * Parse Semester
 * Parses a semester string and returns a sortable object with season and year
 * Handles format: "Season YYYY" (e.g., "Fall 2025", "Winter 2026")
 * @param {string} semesterStr - The semester string to parse
 * @returns {object} Object with season (0-3) and year (numeric)
 */
function parseSemester(semesterStr) {
    const parts = semesterStr.split(' ');
    if (parts.length !== 2) return { season: '', year: 0 };

    const season = parts[0];
    const year = parseInt(parts[1], 10);

    // Map seasons to numeric values for proper sorting
    // Winter=0, Spring=1, Summer=2, Fall=3
    const seasonOrder = { 'Winter': 0, 'Spring': 1, 'Summer': 2, 'Fall': 3 };
    return { season: seasonOrder[season] || 0, year };
}

/**
 * Compare Semesters For Sort
 * Comparator function for sorting semesters chronologically
 * First compares by year, then by season within the same year
 * @param {Course} a - First course to compare
 * @param {Course} b - Second course to compare
 * @returns {number} Negative if a < b, positive if a > b, 0 if equal
 */
function compareSemestersForSort(a, b) {
    const semesterA = parseSemester(a.semester);
    const semesterB = parseSemester(b.semester);

    // First compare by year
    if (semesterA.year !== semesterB.year) {
        return semesterA.year - semesterB.year;
    }

    // If years are equal, compare by season
    return semesterA.season - semesterB.season;
}

/**
 * Compare Semesters
 * Comparator function for sorting semester strings (used for dropdown sorting)
 * @param {string} a - First semester string to compare
 * @param {string} b - Second semester string to compare
 * @returns {number} Negative if a < b, positive if a > b, 0 if equal
 */
function compareSemesters(a, b) {
    const semesterA = parseSemester(a);
    const semesterB = parseSemester(b);

    // First compare by year
    if (semesterA.year !== semesterB.year) {
        return semesterA.year - semesterB.year;
    }

    // If years are equal, compare by season
    return semesterA.season - semesterB.season;
}

/**
 * Display Courses
 * Renders course cards in the courses list section
 * Each course card is clickable to display detailed information
 * @param {Array} courses - Array of Course objects to display
 */
function displayCourses(courses) {
    const coursesList = document.getElementById('coursesList');
    coursesList.innerHTML = '';

    // Show message if no courses match current filters
    if (courses.length === 0) {
        coursesList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #999;">No courses found.</p>';
        return;
    }

    // Create a card for each course
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <h3>${course.title}</h3>
            <p class="course-id"><strong>ID:</strong> ${course.id}</p>
            <p class="course-level"><strong>Level:</strong> ${course.level}</p>
            <p><strong>Credits:</strong> ${course.credits}</p>
            <p><strong>Semester:</strong> ${course.semester}</p>
        `;
        // Add click event to display course details
        courseCard.addEventListener('click', () => displayCourseDetails(course));
        coursesList.appendChild(courseCard);
    });
}

/**
 * Display Course Details
 * Shows detailed information about a selected course in the details panel
 * @param {Course} course - The Course object whose details to display
 */
function displayCourseDetails(course) {
    const courseDetails = document.getElementById('courseDetails');
    const details = course.getDetails();

    // Render all course details
    courseDetails.innerHTML = `
        <p><span class="detail-label">ID:</span> <span class="detail-value">${details.id}</span></p>
        <p><span class="detail-label">Title:</span> <span class="detail-value">${details.title}</span></p>
        <p><span class="detail-label">Department:</span> <span class="detail-value">${details.department}</span></p>
        <p><span class="detail-label">Level:</span> <span class="detail-value">${details.level}</span></p>
        <p><span class="detail-label">Credits:</span> <span class="detail-value">${details.credits}</span></p>
        <p><span class="detail-label">Instructor:</span> <span class="detail-value">${details.instructor}</span></p>
        <p><span class="detail-label">Semester:</span> <span class="detail-value">${details.semester}</span></p>
        <p><span class="detail-label">Description:</span> <span class="detail-value">${details.description}</span></p>
    `;
}

/**
 * Clear UI
 * Resets the application UI to its initial state
 * Used when an error occurs during file loading to clear any previous data
 */
function clearUI() {
    // Clear course listings and details
    document.getElementById('coursesList').innerHTML = '';
    document.getElementById('courseDetails').innerHTML = '<p>Select a course to view details</p>';

    // Get all filter elements
    const levelFilter = document.getElementById('levelFilter');
    const creditsFilter = document.getElementById('creditsFilter');
    const instructorFilter = document.getElementById('instructorFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    const semesterFilter = document.getElementById('semesterFilter');
    const sortBy = document.getElementById('sortBy');

    // Reset all filter dropdowns to default state (remove all options except first)
    while (levelFilter.options.length > 1) levelFilter.remove(1);
    while (creditsFilter.options.length > 1) creditsFilter.remove(1);
    while (instructorFilter.options.length > 1) instructorFilter.remove(1);
    while (departmentFilter.options.length > 1) departmentFilter.remove(1);
    while (semesterFilter.options.length > 1) semesterFilter.remove(1);

    // Reset all select values to empty/default
    levelFilter.value = '';
    creditsFilter.value = '';
    instructorFilter.value = '';
    departmentFilter.value = '';
    semesterFilter.value = '';
    sortBy.value = '';
}
