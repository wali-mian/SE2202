/**
 * Observer Class
 * Manages notifications when assignment statuses change
 */
class Observer {
  /**
   * Notifies observers of status changes
   * @param {string} studentName - Name of the student
   * @param {string} assignmentName - Name of the assignment
   * @param {string} status - The status of the assignment
   */
  notify(studentName, assignmentName, status) {
    let message;
    
    // Format the status message appropriately
    if (status === "passed") {
      message = `Observer → ${studentName} has passed ${assignmentName}`;
    } else if (status === "failed") {
      message = `Observer → ${studentName} has failed ${assignmentName}`;
    } else if (status === "working") {
      message = `Observer → ${studentName} is working on ${assignmentName}.`;
    } else if (status === "submitted") {
      message = `Observer → ${studentName} has submitted ${assignmentName}.`;
    } else if (status === "released") {
      message = `Observer → ${studentName}, ${assignmentName} has been released.`;
    } else if (status === "final reminder") {
      message = `Observer → ${studentName} has received a final reminder for ${assignmentName}.`;
    } else {
      message = `Observer → ${studentName}, ${assignmentName} has ${status}.`;
    }
    
    console.log(message);
  }
}

/**
 * Assignment Class
 * Represents a single assignment with name, status, and grade
 */
class Assignment {
  /**
   * Creates an assignment
   * @param {string} assignmentName - Name of the assignment
   */
  constructor(assignmentName) {
    this.assignmentName = assignmentName;
    this.status = "released"; // Initial status
    this._grade = null; // Private grade property
  }

  /**
   * Sets the grade and updates status to pass/fail
   * @param {number} grade - The grade to set (0-100)
   */
  setGrade(grade) {
    this._grade = grade;
    // Update status based on grade threshold
    if (grade > 50) {
      this.status = "passed";
    } else {
      this.status = "failed";
    }
  }

  /**
   * Gets the grade
   * @returns {number|null} The grade or null if not set
   */
  getGrade() {
    return this._grade;
  }
}

/**
 * Student Class
 * Represents a student with name, email, and assignments
 */
class Student {
  /**
   * Creates a student
   * @param {string} fullName - Full name of the student
   * @param {string} email - Email of the student
   * @param {Observer} observer - Observer instance for notifications
   */
  constructor(fullName, email, observer) {
    this.fullName = fullName;
    this.email = email;
    this.assignmentStatuses = []; // Array of Assignment objects
    this.observer = observer;
  }

  /**
   * Sets the student's full name
   * @param {string} fullName - New full name
   */
  setFullName(fullName) {
    this.fullName = fullName;
  }

  /**
   * Sets the student's email
   * @param {string} email - New email
   */
  setEmail(email) {
    this.email = email;
  }

  /**
   * Updates the assignment status
   * If assignment doesn't exist, creates it with 'released' status
   * If it exists and grade is provided, sets the grade
   * @param {string} assignmentName - Name of the assignment
   * @param {number} [grade] - Optional grade to set
   */
  updateAssignmentStatus(assignmentName, grade) {
    let assignment = this.assignmentStatuses.find(
      (a) => a.assignmentName === assignmentName
    );

    if (!assignment) {
      // Create new assignment with 'released' status
      assignment = new Assignment(assignmentName);
      this.assignmentStatuses.push(assignment);
      this.observer.notify(this.fullName, assignmentName, "released");
      
      // If grade is provided when creating, set it immediately
      if (grade !== undefined) {
        assignment.setGrade(grade);
        if (assignment.status === "passed") {
          this.observer.notify(this.fullName, assignmentName, "passed");
        } else if (assignment.status === "failed") {
          this.observer.notify(this.fullName, assignmentName, "failed");
        }
      }
    } else if (grade !== undefined) {
      // Set grade if provided
      assignment.setGrade(grade);
      // Notify of the new status (pass/fail)
      if (assignment.status === "passed") {
        this.observer.notify(this.fullName, assignmentName, "passed");
      } else if (assignment.status === "failed") {
        this.observer.notify(this.fullName, assignmentName, "failed");
      }
    }
  }

  /**
   * Gets the status of an assignment
   * @param {string} assignmentName - Name of the assignment
   * @returns {string} The status or message indicating assignment status
   */
  getAssignmentStatus(assignmentName) {
    const assignment = this.assignmentStatuses.find(
      (a) => a.assignmentName === assignmentName
    );

    if (!assignment) {
      return "Hasn't been assigned";
    }

    // Return the current status
    if (assignment.status === "passed") {
      return "Pass";
    } else if (assignment.status === "failed") {
      return "Fail";
    }

    return assignment.status;
  }

  /**
   * Gets the overall grade (average of all graded assignments)
   * @returns {number} Average grade, or 0 if no grades
   */
  getGrade() {
    const gradedAssignments = this.assignmentStatuses.filter(
      (a) => a.getGrade() !== null
    );

    if (gradedAssignments.length === 0) {
      return 0;
    }

    const totalGrade = gradedAssignments.reduce(
      (sum, a) => sum + a.getGrade(),
      0
    );
    return totalGrade / gradedAssignments.length;
  }

  /**
   * Student starts working on an assignment
   * Waits 500ms before submitting, unless a reminder is sent first
   * @param {string} assignmentName - Name of the assignment
   */
  startWorking(assignmentName) {
    const assignment = this.assignmentStatuses.find(
      (a) => a.assignmentName === assignmentName
    );

    if (assignment) {
      assignment.status = "working";
      this.observer.notify(this.fullName, assignmentName, "working");

      // Set timeout to submit after 500ms
      this.workingTimeout = setTimeout(() => {
        this.submitAssignment(assignmentName);
      }, 500);
    }
  }

  /**
   * Submits the assignment for grading
   * Changes status to "submitted" and assigns a random grade after 500ms
   * @param {string} assignmentName - Name of the assignment
   */
  submitAssignment(assignmentName) {
    const assignment = this.assignmentStatuses.find(
      (a) => a.assignmentName === assignmentName
    );

    if (assignment) {
      // Clear any pending working timeout
      if (this.workingTimeout) {
        clearTimeout(this.workingTimeout);
        this.workingTimeout = null;
      }

      assignment.status = "submitted";
      this.observer.notify(this.fullName, assignmentName, "submitted");

      // Simulate grading after 500ms
      setTimeout(() => {
        const randomGrade = Math.floor(Math.random() * 101); // 0-100
        this.updateAssignmentStatus(assignmentName, randomGrade);
      }, 500);
    }
  }
}

/**
 * ClassList Class
 * Manages a collection of students
 */
class ClassList {
  /**
   * Creates a class list
   * @param {Observer} observer - Observer instance for notifications
   */
  constructor(observer) {
    this.students = [];
    this.observer = observer;
  }

  /**
   * Adds a student to the class list
   * @param {Student} student - Student to add
   */
  addStudent(student) {
    this.students.push(student);
    console.log(`${student.fullName} has been added to the classlist.`);
  }

  /**
   * Removes a student from the class list
   * @param {string} fullName - Full name of student to remove
   * @returns {boolean} True if removed, false if not found
   */
  removeStudent(fullName) {
    const index = this.students.findIndex((s) => s.fullName === fullName);
    if (index !== -1) {
      this.students.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Finds a student by full name
   * @param {string} fullName - Full name to search for
   * @returns {Student|null} The student or null if not found
   */
  findStudentByName(fullName) {
    return this.students.find((s) => s.fullName === fullName) || null;
  }

  /**
   * Finds all students who have not completed an assignment
   * @param {string} assignmentName - Name of the assignment
   * @returns {string[]} Array of student names with outstanding assignments
   */
  findOutstandingAssignments(assignmentName) {
    const outstanding = [];

    for (const student of this.students) {
      const assignment = student.assignmentStatuses.find(
        (a) => a.assignmentName === assignmentName
      );

      // If assignment exists, check if it's not completed (not graded)
      if (assignment) {
        if (
          assignment.status === "released" ||
          assignment.status === "working" ||
          assignment.status === "submitted" ||
          assignment.status === "final reminder"
        ) {
          outstanding.push(student.fullName);
        }
      } else {
        // Assignment not assigned - check if ANY assignment is released but unsubmitted
        const hasReleasedUnsubmitted = student.assignmentStatuses.some(
          (a) =>
            a.status === "released" ||
            a.status === "working" ||
            a.status === "submitted" ||
            a.status === "final reminder"
        );
        if (hasReleasedUnsubmitted) {
          outstanding.push(student.fullName);
        }
      }
    }

    return outstanding;
  }

  /**
   * Releases assignments in parallel to all students
   * @param {string[]} assignmentNames - Array of assignment names to release
   * @returns {Promise} Promise that resolves when all assignments are released
   */
  releaseAssignmentsParallel(assignmentNames) {
    // Create promises for each assignment and each student
    const promises = [];

    for (const assignmentName of assignmentNames) {
      for (const student of this.students) {
        // Update assignment status for each student asynchronously
        promises.push(
          Promise.resolve().then(() => {
            student.updateAssignmentStatus(assignmentName);
          })
        );
      }
    }

    return Promise.all(promises);
  }

  /**
   * Sends a reminder to all students who haven't completed an assignment
   * Updates status to "final reminder" and forces submission
   * @param {string} assignmentName - Name of the assignment
   */
  sendReminder(assignmentName) {
    for (const student of this.students) {
      const assignment = student.assignmentStatuses.find(
        (a) => a.assignmentName === assignmentName
      );

      if (assignment) {
        // Only send reminder if not already graded
        if (assignment.status !== "passed" && assignment.status !== "failed") {
          this.observer.notify(
            student.fullName,
            assignmentName,
            "final reminder"
          );

          // Clear any pending working timeout and force submit
          if (student.workingTimeout) {
            clearTimeout(student.workingTimeout);
            student.workingTimeout = null;
          }

          // Update status and submit immediately
          assignment.status = "submitted";
          this.observer.notify(student.fullName, assignmentName, "submitted");

          // Simulate grading after 500ms
          setTimeout(() => {
            const randomGrade = Math.floor(Math.random() * 101); // 0-100
            student.updateAssignmentStatus(assignmentName, randomGrade);
          }, 500);
        }
      }
    }
  }
}

// Export classes for use in other files or tests
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    Observer,
    Assignment,
    Student,
    ClassList,
  };
}
