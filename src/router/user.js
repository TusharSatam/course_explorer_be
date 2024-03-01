const express = require('express');
const router = express.Router();
const Student = require('../models/user.model');

// POST endpoint to add a new student
router.post('/student', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if the email is unique
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ error: 'Email is already in use' });
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
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET endpoint to retrieve all students
router.get('/students', async (req, res) => {
    try {
      // Fetch all students from the database
      const allStudents = await Student.find();
  
      // Return the list of students as a response
      res.status(200).json(allStudents);
    } catch (error) {
      // Handle any errors
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
module.exports = router;
