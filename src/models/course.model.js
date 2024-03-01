const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  instructor: { type: String, required: true },
  description: { type: String, required: true },
  enrollmentStatus: { type: String, enum: ['Open', 'Closed', 'In Progress'], required: true },
  thumbnail: { type: String, required: true },
  duration: { type: String, required: true },
  schedule: { type: String, required: true },
  location: { type: String, required: true },
  prerequisites: { type: [String], required: true },
  syllabus: [
    {
      week: { type: Number, required: true },
      topic: { type: String, required: true },
      content: { type: String, required: true },
    }
  ],
  likeCount: { type: Number, default: 0 },
  likes: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    }
  ],
  enrolledStudents: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    }
  ],
  completedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    }
  ],
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
