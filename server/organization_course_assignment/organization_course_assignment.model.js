import mongoose from "mongoose";
const Schema = mongoose.Schema;

const OrganizationCourseSchema = new Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dueDate: { type: Date, required: false, default: null },
  deletedAt: { type: Date, required: false, default: null },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("organization_course_assignments", OrganizationCourseSchema);
