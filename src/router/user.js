const express = require("express");
const router = express.Router();
const Student = require("../models/user.model");
const Course = require("../models/course.model");

// POST endpoint to add a new student
router.post("/student", async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if the email is unique
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // Create a new student instance
    const newStudent = new Student({
      name,
      email,
      enrolledCourses: [], // Initially, no courses are enrolled
    });

    // Save the new student to the database
    const savedStudent = await newStudent.save();

    // Return the saved student as a response
    res.status(201).json(savedStudent);
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/get-student/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find the user by _id
    const user = await Student.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user information as a response
    res.status(200).json(user);
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// GET endpoint to retrieve all students
router.get("/students", async (req, res) => {
  try {
    // Fetch all students from the database
    const allStudents = await Student.find();

    // Return the list of students as a response
    res.status(200).json(allStudents);
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST endpoint to enroll a student in a course
router.post("/:studentId/enroll/:courseId", async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const courseId = req.params.courseId;

    // Find the student by ID
    const student = await Student.findById(studentId);

    // Check if the student exists
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check if the student is already enrolled in the course
    if (student.enrolledCourses.includes(courseId)) {
      return res
        .status(400)
        .json({ error: "Student is already enrolled in this course" });
    }

    // Add the course to the list of enrolled courses for the student
    student.enrolledCourses.push(courseId);

    // Save the updated student to the database
    const updatedStudent = await student.save();

    // Find the course by ID
    const course = await Course.findById(courseId);

    // Check if the course exists
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Add the student to the list of enrolled students for the course
    course.enrolledStudents.push({ studentId: studentId });

    // Save the updated course to the database
    await course.save();

    // Return the updated student as a response
    res.status(200).json(updatedStudent);
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT endpoint to mark a course as completed for a student
router.put("/students/:studentId/markCompleted/:courseId", async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const courseId = req.params.courseId;

    // Find the student by ID
    const student = await Student.findById(studentId);

    // Check if the student exists
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check if the student is enrolled in the course
    if (!student.enrolledCourses.includes(courseId)) {
      return res
        .status(400)
        .json({ error: "Student is not enrolled in this course" });
    }

    // Check if the course is already marked as completed for the student
    if (student.completedCourses.includes(courseId)) {
      return res.status(400).json({
        error: "Course is already marked as completed for this student",
      });
    }

    // Mark the course as completed for the student
    student.completedCourses.push(courseId);

    // Save the updated student to the database
    const updatedStudent = await student.save();

    // Add the student to the list of completedBy in the Course model
    const course = await Course.findById(courseId);
    course.completedBy.push(studentId);
    await course.save();

    // Return the updated student as a response
    res.status(200).json(updatedStudent);
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// PUT endpoint to unmark a course as completed for a student
router.put(
  "/students/:studentId/unmarkCompleted/:courseId",
  async (req, res) => {
    try {
      const studentId = req.params.studentId;
      const courseId = req.params.courseId;

      // Find the student by ID
      const student = await Student.findById(studentId);

      // Check if the student exists
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Check if the student is enrolled in the course
      if (!student.enrolledCourses.includes(courseId)) {
        return res
          .status(400)
          .json({ error: "Student is not enrolled in this course" });
      }

      // Check if the course is marked as completed for the student
      if (!student.completedCourses.includes(courseId)) {
        return res.status(400).json({
          error: "Course is not marked as completed for this student",
        });
      }

      // Unmark the course as completed for the student
      student.completedCourses.pull(courseId);

      // Save the updated student to the database
      const updatedStudent = await student.save();

      // Remove the student from the list of completedBy in the Course model
      const course = await Course.findById(courseId);
      course.completedBy.pull(studentId);
      await course.save();

      // Return the updated student as a response
      res.status(200).json(updatedStudent);
    } catch (error) {
      // Handle any errors
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Endpoint to get all enrolled courses and their details for a student
router.get("/:studentId/enrolled-courses", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Find the student by ID
    const student = await Student.findById(studentId).populate(
      "enrolledCourses"
    );

    // Check if the student exists
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Extract enrolled courses details
    const enrolledCoursesDetails = await Course.find({
      _id: { $in: student.enrolledCourses.map((course) => course._id) },
    });

    res.status(200).json(enrolledCoursesDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to get all completed courses and their details for a student
router.get("/:studentId/completed-courses", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Find the student by ID
    const student = await Student.findById(studentId).populate(
      "completedCourses"
    );

    // Check if the student exists
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Extract completed courses details
    const completedCoursesDetails = await Course.find({
      _id: { $in: student.completedCourses.map((course) => course._id) },
    });

    res.status(200).json(completedCoursesDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
