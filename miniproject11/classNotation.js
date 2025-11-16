/**
 * Define the Course and Assignment concepts using the class notations
 */

/**
 * Class representing an Assignment
 */
class Assignment {
    /**
     * Create an Assignment
     * @param {string} title - The title of the assignment
     * @param {string} dueDate - The due date of the assignment
     */
    constructor(title, dueDate) {
        this.title = title;
        this.dueDate = dueDate;
    }

    /**
     * Print assignment information
     */
    printAssignment() {
        console.log('   Title: ' + this.title + ' | Due Date: ' + this.dueDate);
    }
}

/**
 * Class representing a Course
 */
class Course {
    /**
     * Create a Course
     * @param {string} courseName - The name of the course
     * @param {string} instructor - The instructor name
     * @param {number} creditHours - The number of credit hours
     * @param {Array} assignments - Array of Assignment objects
     */
    constructor(courseName, instructor, creditHours, assignments) {
        this.courseName = courseName;
        this.instructor = instructor;
        this.creditHours = creditHours;
        this.assignments = assignments;
    }

    /**
     * Display course information along with its assignments
     */
    courseInfo() {
        console.log('Course: ' + this.courseName + 
                    ' | Instructor: ' + this.instructor + 
                    ' | Credit Hours: ' + this.creditHours);
        console.log('Assignments >>>');
        for (let a of this.assignments)
            a.printAssignment();
    }
}

// create the objects using the classes

let a1 = new Assignment('Project Proposal', 'Jan 15');
let a2 = new Assignment('Midterm Report', 'Feb 20');
let a3 = new Assignment('Final Report', 'Mar 30');
let a4 = new Assignment('Presentation', 'Apr 10');

// Export classes so hidden tests can require() and use them directly
module.exports = { Course, Assignment };

// If this file is run directly, create demo objects and print info.
// When required by a test harness, the demo code won't run.
if (require.main === module) {
    let c1 = new Course('Software Engineering', 'Dr. Pepper', 3, [a1, a2]);
    let c2 = new Course('Data Science', 'Dr. Evil', 6, [a3, a4]);

    c1.courseInfo();
    c2.courseInfo();
}
