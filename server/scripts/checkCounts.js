const connectDB = require('../config/db');
const { Customer, User, Order, Quotation, Dispatch, Warranty, Enquiry } = require('../models');

async function check() {
  await connectDB();
  console.log('--- DATABASE METRICS ---');
  console.log('Customers in DB:', await Customer.countDocuments());
  console.log('Customer Users in DB:', await User.countDocuments({ role: 'Customer' }));
  console.log('Total Orders:', await Order.countDocuments());
  console.log('Orders In Transit / Dispatched / Out for Delivery:', await Order.countDocuments({ dispatchStatus: { $in: ['Dispatched', 'In Transit', 'Out for Delivery'] } }));
  console.log('Orders Delivered:', await Order.countDocuments({ dispatchStatus: 'Delivered' }));
  console.log('Total Quotations:', await Quotation.countDocuments());
  console.log('Quotations in Draft/Sent/Negotiation:', await Quotation.countDocuments({ status: { $in: ['Sent', 'Draft', 'Negotiation'] } }));
  console.log('Total Dispatches in Fleet Tracker:', await Dispatch.countDocuments());
  console.log('Total Warranties Issued:', await Warranty.countDocuments());
  console.log('Total Enquiries in Pipeline:', await Enquiry.countDocuments());
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
