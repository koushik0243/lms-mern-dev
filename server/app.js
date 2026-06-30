import dotenv from 'dotenv';
dotenv.config();
import './_helpers/db.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import protect from './middleware/authMiddleware.js';

// Recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Routes inclusion
import chapterRouter from './chapters/chapter.controller.js';
import courseCategoryRouter from './course_category/course_category.controller.js';
import courseSubCategoryRouter from './course_subcategory/course_subcategory.controller.js';
import courseRouter from './courses/course.controller.js';
import topicRouter from './topics/topic.controller.js';
import courseAssignmentRouter from './course_assignments/course_assignment.controller.js';

import organizationRouter from './organizations/organization.controller.js';
import creditRouter from './credits/credit.controller.js';

import organizationCourseRouter from './organization_course/organization_course.controller.js';
import subscriptionRouter from './subscription/subscription.controller.js';
import coursePricingRouter from './course_pricing/course_pricing.controller.js';
import planRouter from './plans/plan.controller.js';
import organizationCourseAssignmentRouter from './organization_course_assignment/organization_course_assignment.controller.js';
import organizationCreditAssignmentRouter from './organization_credit_assignment/organization_credit_assignment.controller.js';

import industryTypeRouter from './industry_type/industry_type.controller.js';
import tagRouter from './tags/tag.controller.js';
import certificateTemplateRouter from './certificate_template/certificate_template.controller.js';
import roleRouter from './roles/role.controller.js';
import permissionRouter from './permissions/permission.controller.js';
import rolePermissionRouter from './role_permissions/role_permission.controller.js';
import userRouter from './users/user.controller.js';
import orderRouter from './orders/order.controller.js';
import invoiceRouter from './invoices/invoice.controller.js';
import supportTicketRouter from './support_tickets/support_ticket.controller.js';
import creditUsedRouter from './credit_used/credit_used.controller.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://lms.thinksurfmedia.co.in',
    'https://api.thinksurfmedia.co.in',
];

app.use(cors({
   origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization, Origin, X-Requested-With, Accept, currency, timezone, country",
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use('/course-category', protect, courseCategoryRouter);
app.use('/course-subcategory', protect, courseSubCategoryRouter);
app.use('/course', protect, courseRouter);
app.use('/chapter', protect, chapterRouter);
app.use('/topic', protect, topicRouter);
app.use('/course-assignment', protect, courseAssignmentRouter);

app.use('/course-pricing', protect, coursePricingRouter);
app.use('/plan', protect, planRouter);
app.use('/subscription', protect, subscriptionRouter);

app.use('/organization', protect, organizationRouter);
app.use('/credit', protect, creditRouter);

app.use('/organization-course', protect, organizationCourseRouter);
app.use('/organization-course-assignment', protect, organizationCourseAssignmentRouter);
app.use('/organization-credit-assignment', protect, organizationCreditAssignmentRouter);
app.use('/industry-type', protect, industryTypeRouter);
app.use('/tags', protect, tagRouter);
app.use('/certificate-template', protect, certificateTemplateRouter);
app.use('/role', protect, roleRouter);
app.use('/permission', protect, permissionRouter);
app.use('/role-permission', protect, rolePermissionRouter);
app.use('/order', protect, orderRouter);
app.use('/invoice', protect, invoiceRouter);
app.use('/support-ticket', protect, supportTicketRouter);
app.use('/credit-used', protect, creditUsedRouter);
app.use('/user', userRouter);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    status: statusCode,
    message: error.message || 'Internal server error'
  });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

