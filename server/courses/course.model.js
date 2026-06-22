import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  desc: { type: String, required: true },
  catId: { type: mongoose.Schema.Types.ObjectId, ref: "course_category", required: false, default: null },
  subCatIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "course_subcategory", default: [] }],
  tagIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag", default: [] }],
  level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  course_image: { type: String, required: false, default: null },
  intro_video: { type: String, required: false, default: null },
  intro_video_url: { type: String, required: false, default: null },
  course_price: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString("0.00") },
  duration_hr: { type: String, required: false, default: '0' },
  duration_min: { type: String, required: false, default: '0' },
  totalChapters: { type: Number, required: true, default: 0 },
  max_students: { type: Number, required: false, default: 0 },
  enable_review: { type: Boolean, default: true },
  qna_enabled: { type: Boolean, default: false },
  what_will_learn: { type: String, default: '' },
  target_audience: { type: String, default: '' },
  materials_included: { type: String, default: '' },
  requirements: { type: String, default: '' },
  certificate_template_id: { type: mongoose.Schema.Types.ObjectId, ref: 'certificate_template', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deletedAt: { type: Date, required: false, default: null },
  status: { type: String, enum: ['draft', 'published', 'deleted'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
 
export default mongoose.model("Course", CourseSchema);


