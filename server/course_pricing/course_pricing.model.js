import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CoursePricingSchema = new Schema({
    courseId:        { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    quantity:        { type: Number, required: true, default: 1 },
    mrp_price:       { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString("0.00") },
    price:           { type: mongoose.Schema.Types.Decimal128, required: true, default: () => mongoose.Types.Decimal128.fromString("0.00") },
    isDefault:       { type: Boolean, default: false },
    status:          { type: String, enum: ['active', 'inactive'], default: 'active' },
    deletedAt:       { type: Date, default: null },
    createdAt:       { type: Date, default: Date.now },
    updatedAt:       { type: Date, default: Date.now },
});

export default mongoose.model('course_pricings', CoursePricingSchema);
