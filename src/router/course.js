const express = require("express");
const router = express.Router();
const Course = require("../models/course.model");

// GET endpoint to retrieve all courses
router.get("/getcourses", async (req, res) => {
  try {
    // Fetch all courses from the database
    const allCourses = await Course.find();

    // Return the courses as a response
    res.status(200).json(allCourses);
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const courseId = req.params.id;

    // Fetch the course by ID from the database
    const course = await Course.findById(courseId);

    // Check if the course with the specified ID exists
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Return the course as a response
    res.status(200).json(course);
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST endpoint to add a new course
router.post("/add", async (req, res) => {
  try {
    // Extract data from the request body
    const {
      name,
      instructor,
      description,
      enrollmentStatus,
      thumbnail,
      duration,
      schedule,
      location,
      prerequisites,
      syllabus,
    } = req.body;

    // Create a new course instance
    const newCourse = new Course({
      name,
      instructor,
      description,
      enrollmentStatus,
      thumbnail,
      duration,
      schedule,
      location,
      prerequisites,
      syllabus,
      students: [], // Initially, no students are enrolled
    });

    // Save the new course to the database
    const savedCourse = await newCourse.save();
    const responsePayload = {
      message: "Course added successfully",
      course: savedCourse,
    };

    // Return the detailed response as a JSON
    res.status(201).json(responsePayload);
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET endpoint to search courses by name or instructor
router.get("/searchcourse/:query", async (req, res) => {
  try {
    const query = req.params.query;
    // Check if the search query is provided
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Search courses by name or instructor using a case-insensitive regular expression
    const courses = await Course.find({
      $or: [
        { name: { $regex: new RegExp(query, "i") } },
        { instructor: { $regex: new RegExp(query, "i") } },
      ],
    });

    // Return the matched courses as a response
    res.status(200).json(courses);
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST endpoint to add a like to a course
router.post("/:id/like", async (req, res) => {
  try {
    const courseId = req.params.id;
    const studentId = req.body.studentId; // Assuming you have studentId in the request body

    // Find the course by ID
    const course = await Course.findById(courseId);

    // Check if the course exists
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check if the student has already liked the course
    if (
      course.students.some((student) => student.studentId.equals(studentId))
    ) {
      return res
        .status(400)
        .json({ error: "Student has already liked this course" });
    }

    // Increment the like count
    course.likeCount += 1;

    // Add the student to the list of students who have liked the course
    course.students.push({ studentId });

    // Save the updated course to the database
    const updatedCourse = await course.save();

    // Broadcast the updated like count and student list to connected clients (real-time update)
    // You may use a WebSocket library like socket.io for real-time communication

    // Return the updated course as a response
    res.status(200).json(updatedCourse);
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:id/unlike", async (req, res) => {
  try {
    const courseId = req.params.id;
    const studentId = req.body.studentId; // Assuming you have studentId in the request body

    // Find the course by ID
    const course = await Course.findById(courseId);

    // Check if the course exists
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check if the student has liked the course
    const likedIndex = course.students.findIndex((student) =>
      student.studentId.equals(studentId)
    );

    if (likedIndex === -1) {
      return res
        .status(400)
        .json({ error: "Student has not liked this course" });
    }

    // Decrement the like count
    course.likeCount -= 1;

    // Remove the student from the list of students who have liked the course
    course.students.splice(likedIndex, 1);

    // Save the updated course to the database
    const updatedCourse = await course.save();

    // Broadcast the updated like count and student list to connected clients (real-time update)
    // You may use a WebSocket library like socket.io for real-time communication

    // Return the updated course as a response
    res.status(200).json(updatedCourse);
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
