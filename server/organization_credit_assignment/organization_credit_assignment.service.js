import mongoose from 'mongoose';
import OrgCreditAssignment from './organization_credit_assignment.model.js';
import Credit from '../credits/credit.model.js';
import Organization from '../organizations/organization.model.js';
import Order from '../orders/order.model.js';
import Invoice from '../invoices/invoice.model.js';

const { ObjectId } = mongoose.Types;

const buildQuery = (filters = {}) => {
    const query = { deletedAt: null };
    if (filters.status) query.status = filters.status;
    if (filters.orgId && ObjectId.isValid(filters.orgId)) {
        query.orgId = new ObjectId(filters.orgId);
    }
    if (filters.creditId && ObjectId.isValid(filters.creditId)) {
        query.creditId = new ObjectId(filters.creditId);
    }
    if (filters.assignedBy && ObjectId.isValid(filters.assignedBy)) {
        query.assignedBy = new ObjectId(filters.assignedBy);
    }
    return query;
};

const populateRefs = (query) =>
    query
        .populate('orgId', '_id org_name org_phone org_email org_whatsapp')
        .populate('creditId', '_id title limit_from limit_to price')
        .populate('assignedBy', '_id name email');

export const createOrgCreditAssignment = async (data, assignedBy = null) => {
    try {
        const assignment = await new OrgCreditAssignment({
            orgId:      data.orgId,
            creditId:   data.creditId,
            assignedBy: data.assignedBy || assignedBy,
            dueDate:    data.dueDate || null,
            status:     data.status || 'active',
        }).save();

        // Auto-create order + invoice for this credit assignment
        const [credit, org] = await Promise.all([
            Credit.findById(data.creditId).lean(),
            Organization.findById(data.orgId).lean(),
        ]);

        const creditAmount = credit?.price ? parseFloat(credit.price.toString()) : 0;

        const order = await new Order({
            organizer_id:    data.orgId,
            credit_id:       data.creditId,
            credit_amount:   creditAmount,
            purchase_date:   new Date(),
            payment_gateway: 'manual',
            status:          'success',
        }).save();

        await new Invoice({
            org_id:         data.orgId,
            order_id:       order._id,
            invoice_no:     `INV-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            currency:       'INR',
            sub_total:      creditAmount,
            discount:       0,
            tax:            0,
            total_amount:   creditAmount,
            payment_status: 'paid',
            payment_method: 'manual',
            payment_date:   new Date(),
            bill_name:      org?.org_name   || null,
            bill_email:     org?.org_email  || null,
            bill_phone:     org?.org_phone  || null,
            bill_addr:      org?.org_address1 || org?.org_address2 || null,
            bill_city:      org?.org_city     || null,
            bill_state:     org?.org_state    || null,
            bill_country:   org?.org_country  || null,
            bill_pincode:   org?.org_zipcode  || null,
            status:         'active',
        }).save();

        return assignment;
    } catch (error) {
        throw error;
    }
};

export const editOrgCreditAssignment = async (editId) => {
    try {
        return await populateRefs(
            OrgCreditAssignment.findOne({ _id: editId, deletedAt: null })
        );
    } catch (error) {
        throw error;
    }
};

export const updateOrgCreditAssignment = async (updateId, data) => {
    try {
        const fields = ['orgId', 'creditId', 'assignedBy', 'dueDate', 'status'];
        const updateFields = {};
        for (const field of fields) {
            if (data[field] !== undefined) updateFields[field] = data[field];
        }

        if (Object.keys(updateFields).length === 0) {
            return await populateRefs(
                OrgCreditAssignment.findOne({ _id: updateId, deletedAt: null })
            );
        }

        updateFields.updatedAt = new Date();

        return await OrgCreditAssignment.findOneAndUpdate(
            { _id: updateId, deletedAt: null },
            { $set: updateFields },
            { new: false, runValidators: true }
        );
    } catch (error) {
        throw error;
    }
};

export const listOrgCreditAssignment = async (filters = {}) => {
    try {
        const query = buildQuery(filters);
        return await populateRefs(
            OrgCreditAssignment.find(query).sort({ createdAt: -1 })
        );
    } catch (error) {
        throw error;
    }
};

export const listOrgCreditAssignmentPagination = async (page, limit, filters = {}) => {
    try {
        const query = buildQuery(filters);
        return await populateRefs(
            OrgCreditAssignment.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
        );
    } catch (error) {
        throw error;
    }
};

export const getOrgCreditAssignmentCount = async (filters = {}) => {
    try {
        const query = buildQuery(filters);
        return await OrgCreditAssignment.countDocuments(query);
    } catch (error) {
        throw error;
    }
};

export const deleteOrgCreditAssignment = async (delId) => {
    try {
        return await OrgCreditAssignment.findOneAndUpdate(
            { _id: delId, deletedAt: null },
            { $set: { deletedAt: new Date(), status: 'inactive' } },
            { new: false }
        );
    } catch (error) {
        throw error;
    }
};
