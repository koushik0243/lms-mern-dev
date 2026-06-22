import mongoose from "mongoose";
const Schema = mongoose.Schema;

const OrganizationsSchema = new Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: null },

  //organization information
  org_name: { type: String, required: false, default: null },        
  org_desc: { type: String, required: false, default: null },
  org_logo: { type: String, required: false, default: null },
  org_email: { type: String, required: false, default: null },
  org_phone: { type: String, required: false, default: null },        
  org_address1: { type: String, required: false, default: null },
  org_address2: { type: String, required: false, default: null },
  org_city: { type: String, required: false, default: null },        
  org_state: { type: String, required: false, default: null },
  org_country: { type: String, required: false, default: null },
  org_zipcode: { type: String, required: false, default: null },
  org_website: { type: String, required: false, default: null },
  org_whatsapp: { type: String, required: false, default: null },
  hr_manager_email: { type: String, required: false, default: null },
  hr_manager_no: { type: String, required: false, default: null },
  industry: { type: String, required: false, default: null },
  industryTypeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IndustryType' }],
  course_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  emp_count: { type: String, required: false, default: null },
  whatsapp_noti: { type: Boolean, required: false, default: false },
  email_digest: { type: Boolean, required: false, default: false },
  credit_alert: { type: Boolean, required: false, default: false },
  zoom_reminder: { type: Boolean, required: false, default: false },
  cert_issue_alert: { type: Boolean, required: false, default: false },
  // org_status: { type: String, enum: ['active', 'inactive', 'suspended', 'deleted'], default: 'active', required: true },
  // subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
  // maxUsers: { type: Number, required: false, default: 10 },
  deletedAt: { type: Date, required: false, default: null },
  status: { type: String, enum: ['active', 'inactive', 'suspended', 'deleted'], default: 'active', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Organization", OrganizationsSchema);


