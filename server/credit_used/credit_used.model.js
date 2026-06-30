import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CreditUsedSchema = new Schema(
  {
    orgId:     { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId:  { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    status:    { type: String, enum: ["active", "inactive"], default: "active" },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("credit_used", CreditUsedSchema);
