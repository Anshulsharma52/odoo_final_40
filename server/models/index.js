const { getModel } = require('../utils/storageEngine');

const User = getModel('users');
const Customer = getModel('customers');
const Enquiry = getModel('enquiries');
const Survey = getModel('surveys');
const Quotation = getModel('quotations');
const Order = getModel('orders');
const Product = getModel('products');
const Inventory = getModel('inventory');
const ProductSerialNumber = getModel('product_serial_numbers');
const Dispatch = getModel('dispatches');
const Installation = getModel('installations');
const Payment = getModel('payments');
const Invoice = getModel('invoices');
const Warranty = getModel('warranties');
const ServiceTicket = getModel('service_tickets');
const Notification = getModel('notifications');

module.exports = {
  User,
  Customer,
  Enquiry,
  Survey,
  Quotation,
  Order,
  Product,
  Inventory,
  ProductSerialNumber,
  Dispatch,
  Installation,
  Payment,
  Invoice,
  Warranty,
  ServiceTicket,
  Notification
};
