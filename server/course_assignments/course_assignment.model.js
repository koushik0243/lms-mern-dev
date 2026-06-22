import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CourseAssignmentSchema = new Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  answers: Object,
  score: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  attemptedAt: { type: Date, default: Date.now }
});

export default mongoose.model("course_assignments", CourseAssignmentSchema);
