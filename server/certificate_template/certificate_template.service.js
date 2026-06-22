import slugify from 'slugify';
import CertificateTemplate from './certificate_template.model.js';

const generateSlug = (title) => slugify(title, { lower: true, strict: true, trim: true });

const buildQuery = (filters = {}) => {
    const query = { deletedAt: null };
    if (filters.status) query.status = filters.status;
    return query;
};

export const createCertificateTemplate = async (data) => {
    try {
        const baseSlug = generateSlug(data.title);
        let slug = baseSlug;
        let counter = 1;
        while (await CertificateTemplate.findOne({ slug })) {
            slug = `${baseSlug}-${counter++}`;
        }
        return await new CertificateTemplate({
            title: data.title,
            slug,
            desc: data.desc,
            status: data.status || 'active'
        }).save();
    } catch (error) {
        throw error;
    }
};

export const getCertificateTemplate = async (id) => {
    try {
        return await CertificateTemplate.findOne({ _id: id, deletedAt: null });
    } catch (error) {
        throw error;
    }
};

export const updateCertificateTemplate = async (id, data) => {
    try {
        const updateFields = {};
        if (data.title !== undefined) {
            updateFields.title = data.title;
            updateFields.slug = generateSlug(data.title);
        }
        if (data.desc !== undefined) updateFields.desc = data.desc;
        if (data.status !== undefined) updateFields.status = data.status;
        updateFields.updatedAt = new Date();

        return await CertificateTemplate.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { $set: updateFields },
            { new: true, runValidators: true }
        );
    } catch (error) {
        throw error;
    }
};

export const listCertificateTemplates = async (filters = {}) => {
    try {
        const query = buildQuery(filters);
        return await CertificateTemplate.find(query).sort({ title: 1 });
    } catch (error) {
        throw error;
    }
};

export const listCertificateTemplatesPagination = async (page, limit, filters = {}) => {
    try {
        const query = buildQuery(filters);
        return await CertificateTemplate.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (error) {
        throw error;
    }
};

export const getCertificateTemplateCount = async (filters = {}) => {
    try {
        const query = buildQuery(filters);
        return await CertificateTemplate.countDocuments(query);
    } catch (error) {
        throw error;
    }
};

export const deleteCertificateTemplate = async (id) => {
    try {
        return await CertificateTemplate.findOneAndUpdate(
            { _id: id, deletedAt: null },
            { $set: { deletedAt: new Date(), updatedAt: new Date() } },
            { new: true }
        );
    } catch (error) {
        throw error;
    }
};
