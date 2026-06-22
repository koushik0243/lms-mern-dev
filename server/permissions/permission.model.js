import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Permission = new Schema({
    name: { type: String, required: true, trim: true },    
    display_name: { type: String, required: true, trim: true },    
    desc: { type: String, default: "" },    
    deletedAt: { type: Date, default: null },    
    status: { type: String, enum: ['active', 'inactive'], default: 'active', required: true },    
    createdAt: { type: Date, default: Date.now },    
    updatedAt: { type: Date, default: Date.now }
});

// Compound unique index: name must be unique 
Permission.index({ name: 1 }, { unique: true, sparse: true });

export default mongoose.model('Permission', Permission);


