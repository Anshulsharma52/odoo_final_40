const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const {
  User,
  Customer,
  Product,
  ProductSerialNumber,
  Enquiry,
  Survey,
  Quotation,
  Order,
  Dispatch,
  Installation,
  Warranty,
  ServiceTicket,
  Payment,
  Invoice,
  Notification
} = require('../models');

const { getTemplate } = require('../utils/bomGenerator');

const CUSTOMER_SEEDS = [
  // --- Group A: 15 Customers with DISPATCHED Orders (Dispatched, In Transit, Out for Delivery) ---
  {
    idx: 1,
    name: 'Rajesh Khurana',
    email: 'cust01.rajesh@example.com',
    phone: '+91 98201 10001',
    address: 'Flat 602, Orchid Towers, Baner, Pune 411045',
    consumerNo: 'MSEDCL-901001',
    monthlyBill: 5800,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'In Transit',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 98901 22001',
    vehicleNo: 'MH-12-SP-4401'
  },
  {
    idx: 2,
    name: 'Priya Sharma',
    email: 'cust02.priya@example.com',
    phone: '+91 98201 10002',
    address: 'Bungalow 12, Pali Hill, Bandra West, Mumbai 400050',
    consumerNo: 'ADANI-802002',
    monthlyBill: 9200,
    connectedLoad: '8 kW',
    capacityKw: 8,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'Out for Delivery',
    driverName: 'Suresh Yadav',
    driverPhone: '+91 98901 22002',
    vehicleNo: 'MH-02-SP-8802'
  },
  {
    idx: 3,
    name: 'Amit Deshpande',
    email: 'cust03.amit@example.com',
    phone: '+91 98201 10003',
    address: 'Row House 4, Mayur Colony, Kothrud, Pune 411038',
    consumerNo: 'MSEDCL-903003',
    monthlyBill: 4100,
    connectedLoad: '3 kW',
    capacityKw: 3,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'In Transit',
    driverName: 'Dinesh Shinde',
    driverPhone: '+91 98901 22003',
    vehicleNo: 'MH-12-SP-3303'
  },
  {
    idx: 4,
    name: 'Sneha Kulkarni',
    email: 'cust04.sneha@example.com',
    phone: '+91 98201 10004',
    address: 'A-301, Vasant Vihar, Pokhran Road 2, Thane West 400610',
    consumerNo: 'MSEDCL-804004',
    monthlyBill: 4600,
    connectedLoad: '4 kW',
    capacityKw: 4,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'Out for Delivery',
    driverName: 'Mahesh Patil',
    driverPhone: '+91 98901 22004',
    vehicleNo: 'MH-04-SP-7704'
  },
  {
    idx: 5,
    name: 'Vikram Malhotra',
    email: 'cust05.vikram@example.com',
    phone: '+91 98201 10005',
    address: 'Plot 77, Sector 17, Vashi, Navi Mumbai 400703',
    consumerNo: 'MSEDCL-805005',
    monthlyBill: 12500,
    connectedLoad: '10 kW',
    capacityKw: 10,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'In Transit',
    driverName: 'Santosh Pawar',
    driverPhone: '+91 98901 22005',
    vehicleNo: 'MH-43-SP-9905'
  },
  {
    idx: 6,
    name: 'Ananya Joshi',
    email: 'cust06.ananya@example.com',
    phone: '+91 98201 10006',
    address: 'Penthouse 9, Silver Mist, Wakad, Pune 411057',
    consumerNo: 'MSEDCL-906006',
    monthlyBill: 6200,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'Dispatched',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 98901 22001',
    vehicleNo: 'MH-12-SP-4401'
  },
  {
    idx: 7,
    name: 'Suresh Patel',
    email: 'cust07.suresh@example.com',
    phone: '+91 98201 10007',
    address: '15, Shivalik Villa, Satellite, Ahmedabad 380015',
    consumerNo: 'UGVCL-707007',
    monthlyBill: 7400,
    connectedLoad: '6 kW',
    capacityKw: 6,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'In Transit',
    driverName: 'Suresh Yadav',
    driverPhone: '+91 98901 22002',
    vehicleNo: 'GJ-01-SP-5507'
  },
  {
    idx: 8,
    name: 'Pooja Verma',
    email: 'cust08.pooja@example.com',
    phone: '+91 98201 10008',
    address: '42, Shivaji Nagar, Dharampeth, Nagpur 440010',
    consumerNo: 'MSEDCL-908008',
    monthlyBill: 3800,
    connectedLoad: '3 kW',
    capacityKw: 3,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'Out for Delivery',
    driverName: 'Dinesh Shinde',
    driverPhone: '+91 98901 22003',
    vehicleNo: 'MH-31-SP-2208'
  },
  {
    idx: 9,
    name: 'Rohit Nair',
    email: 'cust09.rohit@example.com',
    phone: '+91 98201 10009',
    address: 'Villa 8, 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    consumerNo: 'BESCOM-509009',
    monthlyBill: 8900,
    connectedLoad: '7 kW',
    capacityKw: 7,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'In Transit',
    driverName: 'Mahesh Patil',
    driverPhone: '+91 98901 22004',
    vehicleNo: 'KA-03-SP-6609'
  },
  {
    idx: 10,
    name: 'Deepa Iyer',
    email: 'cust10.deepa@example.com',
    phone: '+91 98201 10010',
    address: 'Plot 23, Gandhi Nagar 1st Cross, Adyar, Chennai 600020',
    consumerNo: 'TANGEDCO-610010',
    monthlyBill: 5100,
    connectedLoad: '4 kW',
    capacityKw: 4,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'Dispatched',
    driverName: 'Santosh Pawar',
    driverPhone: '+91 98901 22005',
    vehicleNo: 'TN-07-SP-1110'
  },
  {
    idx: 11,
    name: 'Manoj Gupta',
    email: 'cust11.manoj@example.com',
    phone: '+91 98201 10011',
    address: 'B-3/44, Sector 13, Rohini, New Delhi 110085',
    consumerNo: 'TPDDL-111011',
    monthlyBill: 7200,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'In Transit',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 98901 22001',
    vehicleNo: 'DL-01-SP-3311'
  },
  {
    idx: 12,
    name: 'Neha Reddy',
    email: 'cust12.neha@example.com',
    phone: '+91 98201 10012',
    address: 'Villa 104, Financial District, Gachibowli, Hyderabad 500032',
    consumerNo: 'TSSPDCL-212012',
    monthlyBill: 11000,
    connectedLoad: '10 kW',
    capacityKw: 10,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'Out for Delivery',
    driverName: 'Suresh Yadav',
    driverPhone: '+91 98901 22002',
    vehicleNo: 'TS-09-SP-7712'
  },
  {
    idx: 13,
    name: 'Arjun Rao',
    email: 'cust13.arjun@example.com',
    phone: '+91 98201 10013',
    address: 'Flat 1102, Blue Ridge Phase 2, Hinjewadi, Pune 411057',
    consumerNo: 'MSEDCL-913013',
    monthlyBill: 4300,
    connectedLoad: '3 kW',
    capacityKw: 3,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'Dispatched',
    driverName: 'Dinesh Shinde',
    driverPhone: '+91 98901 22003',
    vehicleNo: 'MH-14-SP-5513'
  },
  {
    idx: 14,
    name: 'Meera Banerjee',
    email: 'cust14.meera@example.com',
    phone: '+91 98201 10014',
    address: 'Block CF-210, Sector 1, Salt Lake, Kolkata 700064',
    consumerNo: 'WBSEDCL-314014',
    monthlyBill: 6500,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'In Transit',
    driverName: 'Mahesh Patil',
    driverPhone: '+91 98901 22004',
    vehicleNo: 'WB-02-SP-8814'
  },
  {
    idx: 15,
    name: 'Sanjay Chauhan',
    email: 'cust15.sanjay@example.com',
    phone: '+91 98201 10015',
    address: 'Plot 88, Queens Road, Vaishali Nagar, Jaipur 302021',
    consumerNo: 'JVVNL-415015',
    monthlyBill: 5900,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'DISPATCHED',
    dispatchStatus: 'Out for Delivery',
    driverName: 'Santosh Pawar',
    driverPhone: '+91 98901 22005',
    vehicleNo: 'RJ-14-SP-9915'
  },

  // --- Group B: 15 Customers in QUOTATION Stage (Draft, Sent, Negotiation, Accepted) ---
  {
    idx: 16,
    name: 'Ritu Saxena',
    email: 'cust16.ritu@example.com',
    phone: '+91 98201 10016',
    address: '3/112, Vibhuti Khand, Gomti Nagar, Lucknow 226010',
    consumerNo: 'UPPCL-516016',
    monthlyBill: 4500,
    connectedLoad: '4 kW',
    capacityKw: 4,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Sent',
    discount: 4000
  },
  {
    idx: 17,
    name: 'Harish Bhat',
    email: 'cust17.harish@example.com',
    phone: '+91 98201 10017',
    address: 'Villa 45, Prestige Ozone, Whitefield, Bengaluru 560066',
    consumerNo: 'BESCOM-517017',
    monthlyBill: 9800,
    connectedLoad: '8 kW',
    capacityKw: 8,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Sent',
    discount: 8000
  },
  {
    idx: 18,
    name: 'Swati Tiwari',
    email: 'cust18.swati@example.com',
    phone: '+91 98201 10018',
    address: 'E-4/78, Arera Colony, Bhopal 462016',
    consumerNo: 'MPMKVVCL-618018',
    monthlyBill: 3900,
    connectedLoad: '3 kW',
    capacityKw: 3,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Draft',
    discount: 2000
  },
  {
    idx: 19,
    name: 'Alok Mishra',
    email: 'cust19.alok@example.com',
    phone: '+91 98201 10019',
    address: 'Row House 18, Serene Meadows, Gangapur Road, Nashik 422013',
    consumerNo: 'MSEDCL-919019',
    monthlyBill: 6100,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Negotiation',
    discount: 7500
  },
  {
    idx: 20,
    name: 'Divya Pillai',
    email: 'cust20.divya@example.com',
    phone: '+91 98201 10020',
    address: 'Skyline Ivy, Infopark Expressway, Kakkanad, Kochi 682030',
    consumerNo: 'KSEB-720020',
    monthlyBill: 4800,
    connectedLoad: '4 kW',
    capacityKw: 4,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Sent',
    discount: 3000
  },
  {
    idx: 21,
    name: 'Tarun Agarwal',
    email: 'cust21.tarun@example.com',
    phone: '+91 98201 10021',
    address: 'Tower B, The Magnolias, Golf Course Road, Gurugram 122002',
    consumerNo: 'DHBVN-821021',
    monthlyBill: 16500,
    connectedLoad: '12 kW',
    capacityKw: 10,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Accepted',
    discount: 10000
  },
  {
    idx: 22,
    name: 'Meenakshi Sundaram',
    email: 'cust22.meenakshi@example.com',
    phone: '+91 98201 10022',
    address: '14, East Sambandam Road, RS Puram, Coimbatore 641002',
    consumerNo: 'TANGEDCO-622022',
    monthlyBill: 3400,
    connectedLoad: '3 kW',
    capacityKw: 3,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Sent',
    discount: 2500
  },
  {
    idx: 23,
    name: 'Vivek Nambiar',
    email: 'cust23.vivek@example.com',
    phone: '+91 98201 10023',
    address: 'TC 15/88, Kowdiar Gardens, Thiruvananthapuram 695003',
    consumerNo: 'KSEB-723023',
    monthlyBill: 5400,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Draft',
    discount: 5000
  },
  {
    idx: 24,
    name: 'Sunita Choudhary',
    email: 'cust24.sunita@example.com',
    phone: '+91 98201 10024',
    address: 'Kothi 241, Sector 35-A, Chandigarh 160035',
    consumerNo: 'CED-924024',
    monthlyBill: 7100,
    connectedLoad: '6 kW',
    capacityKw: 6,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Sent',
    discount: 6000
  },
  {
    idx: 25,
    name: 'Rahul Bose',
    email: 'cust25.rahul@example.com',
    phone: '+91 98201 10025',
    address: 'Action Area 2B, Eco Park View, New Town, Kolkata 700156',
    consumerNo: 'WBSEDCL-325025',
    monthlyBill: 4200,
    connectedLoad: '3 kW',
    capacityKw: 3,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Sent',
    discount: 3000
  },
  {
    idx: 26,
    name: 'Shilpa Kadam',
    email: 'cust26.shilpa@example.com',
    phone: '+91 98201 10026',
    address: 'Plot 19, Anand Park, Aundh, Pune 411007',
    consumerNo: 'MSEDCL-926026',
    monthlyBill: 6600,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Draft',
    discount: 4000
  },
  {
    idx: 27,
    name: 'Gaurav Jain',
    email: 'cust27.gaurav@example.com',
    phone: '+91 98201 10027',
    address: '102, Scheme 54, Vijay Nagar, Indore 452010',
    consumerNo: 'MPWZ-827027',
    monthlyBill: 5200,
    connectedLoad: '4 kW',
    capacityKw: 4,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Sent',
    discount: 3500
  },
  {
    idx: 28,
    name: 'Rashmi Hegde',
    email: 'cust28.rashmi@example.com',
    phone: '+91 98201 10028',
    address: 'Kadri Hills View, Mallikatte, Mangaluru 575002',
    consumerNo: 'MESCOM-528028',
    monthlyBill: 3700,
    connectedLoad: '3 kW',
    capacityKw: 3,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Draft',
    discount: 2500
  },
  {
    idx: 29,
    name: 'Sandeep Shinde',
    email: 'cust29.sandeep@example.com',
    phone: '+91 98201 10029',
    address: 'Bungalow 7, Tarabai Park, Kolhapur 416003',
    consumerNo: 'MSEDCL-929029',
    monthlyBill: 8100,
    connectedLoad: '7 kW',
    capacityKw: 7,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Negotiation',
    discount: 8500
  },
  {
    idx: 30,
    name: 'Kavita Menon',
    email: 'cust30.kavita@example.com',
    phone: '+91 98201 10030',
    address: 'Palace Road, Round West, Thrissur 680001',
    consumerNo: 'KSEB-730030',
    monthlyBill: 5800,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'QUOTATION',
    quotationStatus: 'Accepted',
    discount: 5000
  },

  // --- Group C: 10 Customers with COMPLETED Installation, Site Delivery & ACTIVE Warranty ---
  {
    idx: 31,
    name: 'Nikhil Shenoy',
    email: 'cust31.nikhil@example.com',
    phone: '+91 98201 10031',
    address: 'Valley View Road, Manipal, Udupi 576104',
    consumerNo: 'MESCOM-531031',
    monthlyBill: 4200,
    connectedLoad: '3 kW',
    capacityKw: 3,
    systemType: 'On-Grid',
    group: 'DELIVERED_COMPLETED',
    serialInverter: 'INV-3KW-9131',
    serialPanels: 'PAN-PERC-9131-B'
  },
  {
    idx: 32,
    name: 'Anita Deshmukh',
    email: 'cust32.anita@example.com',
    phone: '+91 98201 10032',
    address: 'Plot 31, Samarth Nagar, Aurangabad 431001',
    consumerNo: 'MSEDCL-932032',
    monthlyBill: 6400,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'DELIVERED_COMPLETED',
    serialInverter: 'INV-5KW-9132',
    serialPanels: 'PAN-PERC-9132-B'
  },
  {
    idx: 33,
    name: 'Pradeep Goel',
    email: 'cust33.pradeep@example.com',
    phone: '+91 98201 10033',
    address: 'House 502, Sector 15, Faridabad 121007',
    consumerNo: 'DHBVN-833033',
    monthlyBill: 5100,
    connectedLoad: '4 kW',
    capacityKw: 4,
    systemType: 'On-Grid',
    group: 'DELIVERED_COMPLETED',
    serialInverter: 'INV-3KW-9133',
    serialPanels: 'PAN-PERC-9133-B'
  },
  {
    idx: 34,
    name: 'Shalini Mukherjee',
    email: 'cust34.shalini@example.com',
    phone: '+91 98201 10034',
    address: 'Windsor Court, RC Dutt Road, Alkapuri, Vadodara 390007',
    consumerNo: 'MGVCL-734034',
    monthlyBill: 7300,
    connectedLoad: '6 kW',
    capacityKw: 6,
    systemType: 'On-Grid',
    group: 'DELIVERED_COMPLETED',
    serialInverter: 'INV-5KW-9134',
    serialPanels: 'PAN-PERC-9134-B'
  },
  {
    idx: 35,
    name: 'Kiran Biradar',
    email: 'cust35.kiran@example.com',
    phone: '+91 98201 10035',
    address: 'Plot 12, Hotgi Road, Solapur 413003',
    consumerNo: 'MSEDCL-935035',
    monthlyBill: 3600,
    connectedLoad: '3 kW',
    capacityKw: 3,
    systemType: 'On-Grid',
    group: 'DELIVERED_COMPLETED',
    serialInverter: 'INV-3KW-9135',
    serialPanels: 'PAN-PERC-9135-B'
  },
  {
    idx: 36,
    name: 'Vandana Jadhav',
    email: 'cust36.vandana@example.com',
    phone: '+91 98201 10036',
    address: '18, Sadashiv Peth, Satara 415002',
    consumerNo: 'MSEDCL-936036',
    monthlyBill: 4100,
    connectedLoad: '3 kW',
    capacityKw: 3,
    systemType: 'On-Grid',
    group: 'DELIVERED_COMPLETED',
    serialInverter: 'INV-3KW-9136',
    serialPanels: 'PAN-PERC-9136-B'
  },
  {
    idx: 37,
    name: 'Nitin Kamat',
    email: 'cust37.nitin@example.com',
    phone: '+91 98201 10037',
    address: 'Villa Verde, Miramar, Panaji, Goa 403001',
    consumerNo: 'GED-637037',
    monthlyBill: 8800,
    connectedLoad: '8 kW',
    capacityKw: 8,
    systemType: 'On-Grid',
    group: 'DELIVERED_COMPLETED',
    serialInverter: 'INV-5KW-9137',
    serialPanels: 'PAN-PERC-9137-B'
  },
  {
    idx: 38,
    name: 'Bhavna Vyas',
    email: 'cust38.bhavna@example.com',
    phone: '+91 98201 10038',
    address: 'Royal Palms, Kalawad Road, Rajkot 360005',
    consumerNo: 'PGVCL-738038',
    monthlyBill: 6900,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'DELIVERED_COMPLETED',
    serialInverter: 'INV-5KW-9138',
    serialPanels: 'PAN-PERC-9138-B'
  },
  {
    idx: 39,
    name: 'Chetan Mahajan',
    email: 'cust39.chetan@example.com',
    phone: '+91 98201 10039',
    address: '22, Ring Road, Jalgaon 425001',
    consumerNo: 'MSEDCL-939039',
    monthlyBill: 4900,
    connectedLoad: '4 kW',
    capacityKw: 4,
    systemType: 'On-Grid',
    group: 'DELIVERED_COMPLETED',
    serialInverter: 'INV-3KW-9139',
    serialPanels: 'PAN-PERC-9139-B'
  },
  {
    idx: 40,
    name: 'Pallavi Chitnis',
    email: 'cust40.pallavi@example.com',
    phone: '+91 98201 10040',
    address: 'Sky Vista, Airport Road, Viman Nagar, Pune 411014',
    consumerNo: 'MSEDCL-940040',
    monthlyBill: 11500,
    connectedLoad: '10 kW',
    capacityKw: 10,
    systemType: 'On-Grid',
    group: 'DELIVERED_COMPLETED',
    serialInverter: 'INV-5KW-9140',
    serialPanels: 'PAN-PERC-9140-B'
  },

  // --- Group D: 10 Customers in ENQUIRY & SURVEY STAGE (New Enquiries, Survey Scheduled) ---
  {
    idx: 41,
    name: 'Deepak Tambe',
    email: 'cust41.deepak@example.com',
    phone: '+91 98201 10041',
    address: 'Tower 4, Rosa Bella, Ghodbunder Road, Thane 400615',
    consumerNo: 'MSEDCL-941041',
    monthlyBill: 5300,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'ENQUIRY_NEW'
  },
  {
    idx: 42,
    name: 'Jyoti Bhosale',
    email: 'cust42.jyoti@example.com',
    phone: '+91 98201 10042',
    address: 'Amanora Park Town, Hadapsar, Pune 411028',
    consumerNo: 'MSEDCL-942042',
    monthlyBill: 4700,
    connectedLoad: '4 kW',
    capacityKw: 4,
    systemType: 'On-Grid',
    group: 'ENQUIRY_NEW'
  },
  {
    idx: 43,
    name: 'Mahesh Kulkarni',
    email: 'cust43.mahesh@example.com',
    phone: '+91 98201 10043',
    address: 'Plot 7, Vishrambag, Sangli 416415',
    consumerNo: 'MSEDCL-943043',
    monthlyBill: 3500,
    connectedLoad: '3 kW',
    capacityKw: 3,
    systemType: 'On-Grid',
    group: 'ENQUIRY_NEW'
  },
  {
    idx: 44,
    name: 'Archana Rathore',
    email: 'cust44.archana@example.com',
    phone: '+91 98201 10044',
    address: 'Sector 4, Hiran Magri, Udaipur 313002',
    consumerNo: 'AVVNL-444044',
    monthlyBill: 6200,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'ENQUIRY_NEW'
  },
  {
    idx: 45,
    name: 'Vinay Bhatia',
    email: 'cust45.vinay@example.com',
    phone: '+91 98201 10045',
    address: 'Express View Apts, Sector 62, Noida 201309',
    consumerNo: 'PVVNL-545045',
    monthlyBill: 8400,
    connectedLoad: '7 kW',
    capacityKw: 7,
    systemType: 'On-Grid',
    group: 'ENQUIRY_NEW'
  },
  {
    idx: 46,
    name: 'Geeta Natarajan',
    email: 'cust46.geeta@example.com',
    phone: '+91 98201 10046',
    address: '12, 80 Feet Road, KK Nagar, Madurai 625020',
    consumerNo: 'TANGEDCO-646046',
    monthlyBill: 3900,
    connectedLoad: '3 kW',
    capacityKw: 3,
    systemType: 'On-Grid',
    group: 'SURVEY_SCHEDULED',
    surveyDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    technicianName: 'Rohan Joshi'
  },
  {
    idx: 47,
    name: 'Santosh Gawande',
    email: 'cust47.santosh@example.com',
    phone: '+91 98201 10047',
    address: 'Civil Lines, Camp Road, Amravati 444602',
    consumerNo: 'MSEDCL-947047',
    monthlyBill: 5600,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'SURVEY_SCHEDULED',
    surveyDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    technicianName: 'Rohan Joshi'
  },
  {
    idx: 48,
    name: 'Preeti Nimbalkar',
    email: 'cust48.preeti@example.com',
    phone: '+91 98201 10048',
    address: 'Plot 15, MIDC Residential Area, Baramati 413133',
    consumerNo: 'MSEDCL-948048',
    monthlyBill: 4300,
    connectedLoad: '3 kW',
    capacityKw: 3,
    systemType: 'On-Grid',
    group: 'SURVEY_SCHEDULED',
    surveyDate: new Date(Date.now() + 86400000).toISOString(),
    technicianName: 'Vikram Sharma'
  },
  {
    idx: 49,
    name: 'Hemant Sawant',
    email: 'cust49.hemant@example.com',
    phone: '+91 98201 10049',
    address: 'Shivaji Nagar, Near Bus Stand, Ratnagiri 415612',
    consumerNo: 'MSEDCL-949049',
    monthlyBill: 7200,
    connectedLoad: '6 kW',
    capacityKw: 6,
    systemType: 'On-Grid',
    group: 'SURVEY_SCHEDULED',
    surveyDate: new Date(Date.now() + 4 * 86400000).toISOString(),
    technicianName: 'Rohan Joshi'
  },
  {
    idx: 50,
    name: 'Smita Gokhale',
    email: 'cust50.smita@example.com',
    phone: '+91 98201 10050',
    address: 'Hare Krishna Mandir Road, Model Colony, Pune 411016',
    consumerNo: 'MSEDCL-950050',
    monthlyBill: 6800,
    connectedLoad: '5 kW',
    capacityKw: 5,
    systemType: 'On-Grid',
    group: 'SURVEY_SCHEDULED',
    surveyDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    technicianName: 'Vikram Sharma'
  }
];

async function seed50DemoCustomers() {
  console.log('--- Starting Seeding of 50 Demo Customers & Solar Lifecycle Records ---');

  // Single salt and hash for all users for speed
  const salt = await bcrypt.genSalt(10);
  const commonPassword = await bcrypt.hash('password123', salt);

  let createdUsers = 0;
  let createdCustomers = 0;
  let createdQuotations = 0;
  let createdOrders = 0;
  let createdDispatches = 0;
  let createdInstallations = 0;
  let createdWarranties = 0;
  let createdEnquiries = 0;

  for (const c of CUSTOMER_SEEDS) {
    const padded = String(c.idx).padStart(2, '0');
    const userId = `user_demo_${padded}`;
    const custId = `cust_demo_${padded}`;

    // 1. Create or ensure User record
    let user = await User.findOne({ email: c.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        _id: userId,
        name: c.name,
        email: c.email.toLowerCase(),
        password: commonPassword,
        role: 'Customer',
        phone: c.phone,
        address: c.address,
        active: true,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name)}`
      });
      createdUsers++;
    }

    // 2. Create or ensure Customer profile record
    let customer = await Customer.findOne({ phone: c.phone });
    if (!customer) {
      customer = await Customer.create({
        _id: custId,
        userId: user._id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address,
        electricityConsumerNo: c.consumerNo,
        monthlyBill: c.monthlyBill,
        connectedLoad: c.connectedLoad
      });
      createdCustomers++;
    }

    // 3. Handle by Lifecycle Group
    const template = getTemplate(c.capacityKw || 3, c.systemType || 'On-Grid');
    const totalAmount = template.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const subsidy = template.subsidyAmount || (c.capacityKw >= 3 ? 78000 : c.capacityKw * 30000);
    const discount = c.discount || 0;
    const netPayable = Math.max(0, totalAmount - subsidy - discount);
    const advancePaid = Math.round(netPayable * 0.5);
    const balanceDue = netPayable - advancePaid;

    if (c.group === 'DISPATCHED') {
      const qNum = `QT-2026-01${padded}`;
      const oNum = `ORD-2026-01${padded}`;
      const dNum = `DSP-2026-01${padded}`;
      const invSerial = `INV-${c.capacityKw}KW-91${padded}`;
      const batSerial = `BAT-150-51${padded}`;

      // Create ProductSerialNumber for inverter
      const snExists = await ProductSerialNumber.findOne({ serialNumber: invSerial });
      if (!snExists) {
        await ProductSerialNumber.create({
          serialNumber: invSerial,
          productId: c.capacityKw >= 5 ? 'prod_inv_5kw' : 'prod_inv_3kw',
          productName: `${c.capacityKw} kW Grid-Tie Smart Solar Inverter`,
          category: 'Inverter',
          status: 'Dispatched',
          orderNumber: oNum,
          customerName: c.name,
          customerPhone: c.phone,
          warrantyYears: 5
        });
      }

      // Create Quotation (Accepted)
      let quotation = await Quotation.findOne({ quotationNumber: qNum });
      if (!quotation) {
        quotation = await Quotation.create({
          _id: `quo_demo_${padded}`,
          quotationNumber: qNum,
          customerName: c.name,
          customerPhone: c.phone,
          customerEmail: c.email,
          customerAddress: c.address,
          systemType: c.systemType,
          capacityKw: c.capacityKw,
          items: template.items.map(it => ({
            name: it.name,
            category: it.category,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.quantity * it.unitPrice,
            serialRequired: it.serialRequired
          })),
          totalAmount,
          discount,
          subsidyAmount: subsidy,
          netPayable,
          advanceRequired: advancePaid,
          status: 'Accepted',
          validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
          notes: 'Customer accepted quotation. Order confirmed and dispatched.'
        });
        createdQuotations++;
      }

      // Create Order (Dispatched / Confirmed)
      let order = await Order.findOne({ orderNumber: oNum });
      if (!order) {
        const bomItems = template.items.map(it => ({
          name: it.name,
          category: it.category,
          quantity: it.quantity,
          serialRequired: it.serialRequired,
          allocatedSerials: it.serialRequired ? (it.category === 'Inverter' ? [invSerial] : (it.category === 'Battery' ? [batSerial] : [])) : []
        }));

        order = await Order.create({
          _id: `ord_demo_${padded}`,
          orderNumber: oNum,
          quotationNumber: qNum,
          customerName: c.name,
          customerPhone: c.phone,
          customerEmail: c.email,
          customerAddress: c.address,
          systemType: c.systemType,
          capacityKw: c.capacityKw,
          totalAmount,
          subsidyAmount: subsidy,
          netPayable,
          advancePaid,
          balanceDue,
          status: 'Dispatched',
          dispatchStatus: c.dispatchStatus, // 'In Transit', 'Out for Delivery', or 'Dispatched'
          installationStatus: 'Pending',
          bomItems
        });
        createdOrders++;
      }

      // Create Dispatch record
      let dispatch = await Dispatch.findOne({ dispatchNumber: dNum });
      if (!dispatch) {
        dispatch = await Dispatch.create({
          _id: `dsp_demo_${padded}`,
          dispatchNumber: dNum,
          orderId: order._id,
          orderNumber: oNum,
          customerName: c.name,
          customerPhone: c.phone,
          customerAddress: c.address,
          vehicleNo: c.vehicleNo,
          driverName: c.driverName,
          driverPhone: c.driverPhone,
          dispatchedItems: [
            { productName: `${c.capacityKw} kW Grid-Tie Smart Solar Inverter`, serialNumbers: [invSerial] }
          ],
          allAllocatedSerials: [invSerial],
          dispatchDate: new Date(Date.now() - 3600000 * c.idx).toISOString(),
          status: c.dispatchStatus, // In Transit / Out for Delivery / Dispatched
          deliveryNotes: `Shipment routed via logistics partner. Target delivery slot: 10:00 AM - 4:00 PM.`,
          notes: `Vehicle inspected and all materials loaded safely.`
        });
        createdDispatches++;
      }

      // Create Scheduled Installation Job
      let install = await Installation.findOne({ orderId: order._id });
      if (!install) {
        install = await Installation.create({
          _id: `inst_demo_${padded}`,
          orderId: order._id,
          orderNumber: oNum,
          dispatchId: dispatch._id,
          customerName: c.name,
          customerPhone: c.phone,
          customerAddress: c.address,
          systemType: c.systemType,
          capacityKw: c.capacityKw,
          allocatedSerials: [invSerial],
          leadTechnicianName: 'Vikram Sharma',
          status: 'Scheduled',
          scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          checklist: {
            structureMounting: false,
            panelArrangement: false,
            inverterInstallation: false,
            batteryConnection: false,
            earthingProtection: false,
            cableTieAndConduit: false
          },
          testResults: {
            generationKw: 0,
            dcVocVoltage: 0,
            earthingResistanceOhms: 0,
            gridSyncConfirmed: false
          }
        });
        createdInstallations++;
      }

    } else if (c.group === 'QUOTATION') {
      const qNum = `QT-2026-01${padded}`;

      // Create Enquiry
      let enquiry = await Enquiry.findOne({ customerPhone: c.phone });
      if (!enquiry) {
        enquiry = await Enquiry.create({
          _id: `enq_demo_${padded}`,
          customerId: customer._id,
          customerName: c.name,
          customerPhone: c.phone,
          customerEmail: c.email,
          address: c.address,
          systemType: c.systemType,
          proposedCapacity: c.capacityKw,
          monthlyBill: c.monthlyBill,
          shadowFreeArea: c.capacityKw * 100 + 50,
          electricityConsumerNo: c.consumerNo,
          status: 'Quoted',
          notes: `High solar generation potential. Rooftop surveyed. Quotation sent (${c.quotationStatus}).`
        });
        createdEnquiries++;
      }

      // Create Quotation
      let quotation = await Quotation.findOne({ quotationNumber: qNum });
      if (!quotation) {
        quotation = await Quotation.create({
          _id: `quo_demo_${padded}`,
          quotationNumber: qNum,
          enquiryId: enquiry._id,
          customerName: c.name,
          customerPhone: c.phone,
          customerEmail: c.email,
          customerAddress: c.address,
          systemType: c.systemType,
          capacityKw: c.capacityKw,
          items: template.items.map(it => ({
            name: it.name,
            category: it.category,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.quantity * it.unitPrice,
            serialRequired: it.serialRequired
          })),
          totalAmount,
          discount,
          subsidyAmount: subsidy,
          netPayable,
          advanceRequired: Math.round(netPayable * 0.25),
          status: c.quotationStatus, // 'Draft', 'Sent', 'Negotiation', 'Accepted'
          validUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
          notes: `Includes 5-year comprehensive maintenance & PM Surya Ghar DBT subsidy of ₹${subsidy.toLocaleString('en-IN')}.`
        });
        createdQuotations++;
      }

    } else if (c.group === 'DELIVERED_COMPLETED') {
      const qNum = `QT-2026-01${padded}`;
      const oNum = `ORD-2026-01${padded}`;
      const dNum = `DSP-2026-01${padded}`;
      const invSerial = c.serialInverter;
      const panSerial = c.serialPanels;

      // Register Installed Serial in ProductSerialNumber
      const snExists = await ProductSerialNumber.findOne({ serialNumber: invSerial });
      if (!snExists) {
        await ProductSerialNumber.create({
          serialNumber: invSerial,
          productId: c.capacityKw >= 5 ? 'prod_inv_5kw' : 'prod_inv_3kw',
          productName: `${c.capacityKw} kW Grid-Tie Smart Solar Inverter`,
          category: 'Inverter',
          status: 'Installed',
          orderNumber: oNum,
          customerName: c.name,
          customerPhone: c.phone,
          warrantyYears: 5,
          installationDate: new Date(Date.now() - 30 * 86400000).toISOString(),
          warrantyExpiryDate: new Date(Date.now() + (5 * 365 - 30) * 86400000).toISOString()
        });
      }

      // Create Order (Completed & Delivered)
      let order = await Order.findOne({ orderNumber: oNum });
      if (!order) {
        order = await Order.create({
          _id: `ord_demo_${padded}`,
          orderNumber: oNum,
          quotationNumber: qNum,
          customerName: c.name,
          customerPhone: c.phone,
          customerEmail: c.email,
          customerAddress: c.address,
          systemType: c.systemType,
          capacityKw: c.capacityKw,
          totalAmount,
          subsidyAmount: subsidy,
          netPayable,
          advancePaid: netPayable,
          balanceDue: 0,
          status: 'Completed',
          dispatchStatus: 'Delivered',
          installationStatus: 'Completed',
          bomItems: template.items.map(it => ({
            name: it.name,
            category: it.category,
            quantity: it.quantity,
            serialRequired: it.serialRequired,
            allocatedSerials: it.category === 'Inverter' ? [invSerial] : []
          }))
        });
        createdOrders++;
      }

      // Create Dispatch (Delivered)
      let dispatch = await Dispatch.findOne({ dispatchNumber: dNum });
      if (!dispatch) {
        dispatch = await Dispatch.create({
          _id: `dsp_demo_${padded}`,
          dispatchNumber: dNum,
          orderId: order._id,
          orderNumber: oNum,
          customerName: c.name,
          customerPhone: c.phone,
          customerAddress: c.address,
          vehicleNo: 'MH-12-SP-1099',
          driverName: 'Ramesh Kumar',
          driverPhone: '+91 98901 22001',
          dispatchedItems: [
            { productName: `${c.capacityKw} kW Grid-Tie Smart Solar Inverter`, serialNumbers: [invSerial] }
          ],
          allAllocatedSerials: [invSerial],
          dispatchDate: new Date(Date.now() - 35 * 86400000).toISOString(),
          deliveredAt: new Date(Date.now() - 34 * 86400000).toISOString(),
          status: 'Delivered',
          deliveryNotes: 'All components safely delivered on site and received by customer.',
          notes: 'Customer signed delivery challan on site.'
        });
        createdDispatches++;
      }

      // Create Completed Installation Record
      let install = await Installation.findOne({ orderId: order._id });
      if (!install) {
        install = await Installation.create({
          _id: `inst_demo_${padded}`,
          orderId: order._id,
          orderNumber: oNum,
          dispatchId: dispatch._id,
          customerName: c.name,
          customerPhone: c.phone,
          customerAddress: c.address,
          systemType: c.systemType,
          capacityKw: c.capacityKw,
          allocatedSerials: [invSerial],
          leadTechnicianName: 'Vikram Sharma',
          status: 'Completed',
          scheduledDate: new Date(Date.now() - 32 * 86400000).toISOString(),
          startTime: new Date(Date.now() - 31 * 86400000).toISOString(),
          completionDate: new Date(Date.now() - 30 * 86400000).toISOString(),
          checklist: {
            structureMounting: true,
            panelArrangement: true,
            inverterInstallation: true,
            batteryConnection: true,
            earthingProtection: true,
            cableTieAndConduit: true
          },
          testResults: {
            generationKw: +(c.capacityKw * 0.94).toFixed(2),
            dcVocVoltage: 390 + c.capacityKw * 10,
            earthingResistanceOhms: 1.3,
            gridSyncConfirmed: true
          },
          sitePhotos: [
            'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80'
          ],
          customerSignature: `${c.name} (Signed On Site)`,
          customerFeedback: `Installation completed smoothly. System generating ${+(c.capacityKw * 0.94).toFixed(2)} kW.`
        });
        createdInstallations++;
      }

      // Create Active Warranty Certificates
      let warrantyInv = await Warranty.findOne({ serialNumber: invSerial });
      if (!warrantyInv) {
        await Warranty.create({
          _id: `war_inv_${padded}`,
          warrantyNumber: `WAR-2026-01${padded}`,
          orderId: order._id,
          orderNumber: oNum,
          customerName: c.name,
          customerPhone: c.phone,
          productName: `${c.capacityKw} kW Grid-Tie Smart Solar Inverter`,
          category: 'Inverter',
          serialNumber: invSerial,
          warrantyYears: 5,
          startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
          endDate: new Date(Date.now() + (5 * 365 - 30) * 86400000).toISOString(),
          status: 'Active'
        });
        createdWarranties++;
      }

      let warrantyPan = await Warranty.findOne({ serialNumber: panSerial });
      if (!warrantyPan) {
        await Warranty.create({
          _id: `war_pan_${padded}`,
          warrantyNumber: `WAR-2026-02${padded}`,
          orderId: order._id,
          orderNumber: oNum,
          customerName: c.name,
          customerPhone: c.phone,
          productName: `540W Mono PERC Solar Panels (${c.capacityKw * 2} Units)`,
          category: 'Solar Panel',
          serialNumber: panSerial,
          warrantyYears: 20,
          startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
          endDate: new Date(Date.now() + (20 * 365 - 30) * 86400000).toISOString(),
          status: 'Active'
        });
        createdWarranties++;
      }

      // Create Paid Invoice
      let invoice = await Invoice.findOne({ orderId: order._id });
      if (!invoice) {
        await Invoice.create({
          _id: `inv_demo_${padded}`,
          invoiceNumber: `INV-2026-01${padded}`,
          orderId: order._id,
          orderNumber: oNum,
          customerName: c.name,
          customerPhone: c.phone,
          customerAddress: c.address,
          systemType: c.systemType,
          capacityKw: c.capacityKw,
          subtotal: totalAmount,
          subsidyDeduction: subsidy,
          grandTotal: netPayable,
          paidAmount: netPayable,
          balanceDue: 0,
          status: 'Paid',
          dueDate: new Date(Date.now() - 25 * 86400000).toISOString()
        });
      }

      // Create Payment
      let payment = await Payment.findOne({ orderId: order._id });
      if (!payment) {
        await Payment.create({
          _id: `pay_demo_${padded}`,
          receiptNo: `REC-2026-01${padded}`,
          orderId: order._id,
          orderNumber: oNum,
          customerName: c.name,
          customerPhone: c.phone,
          amount: netPayable,
          paymentType: 'Full',
          paymentMethod: 'Bank Transfer',
          transactionRef: `NEFT-HDFC-${900000 + c.idx}`,
          status: 'Completed',
          paymentDate: new Date(Date.now() - 30 * 86400000).toISOString()
        });
      }

    } else if (c.group === 'ENQUIRY_NEW' || c.group === 'SURVEY_SCHEDULED') {
      let enquiry = await Enquiry.findOne({ customerPhone: c.phone });
      if (!enquiry) {
        enquiry = await Enquiry.create({
          _id: `enq_demo_${padded}`,
          customerId: customer._id,
          customerName: c.name,
          customerPhone: c.phone,
          customerEmail: c.email,
          address: c.address,
          systemType: c.systemType,
          proposedCapacity: c.capacityKw,
          monthlyBill: c.monthlyBill,
          shadowFreeArea: c.capacityKw * 90 + 40,
          electricityConsumerNo: c.consumerNo,
          status: c.group === 'SURVEY_SCHEDULED' ? 'Survey Scheduled' : 'New',
          notes: c.group === 'SURVEY_SCHEDULED'
            ? `Survey scheduled for ${new Date(c.surveyDate).toLocaleDateString()}. Assigned to ${c.technicianName}.`
            : `New solar rooftop inquiry received. Ready for survey scheduling.`
        });
        createdEnquiries++;
      }

      if (c.group === 'SURVEY_SCHEDULED') {
        let survey = await Survey.findOne({ enquiryId: enquiry._id });
        if (!survey) {
          await Survey.create({
            _id: `surv_demo_${padded}`,
            enquiryId: enquiry._id,
            customerName: c.name,
            customerPhone: c.phone,
            customerAddress: c.address,
            systemType: c.systemType,
            requestedCapacity: c.capacityKw,
            technicianName: c.technicianName,
            scheduledDate: c.surveyDate,
            status: 'Scheduled',
            notes: 'Perform shadow analysis, measure roof orientation, and inspect distribution box proximity.'
          });
        }
      }
    }
  }

  console.log('✅ Seeding 50 Demo Customers Finished Successfully!');
  console.log(`   - Users created: ${createdUsers}`);
  console.log(`   - Customers created: ${createdCustomers}`);
  console.log(`   - Enquiries created: ${createdEnquiries}`);
  console.log(`   - Quotations created: ${createdQuotations}`);
  console.log(`   - Orders created: ${createdOrders}`);
  console.log(`   - Dispatches created: ${createdDispatches}`);
  console.log(`   - Installations created: ${createdInstallations}`);
  console.log(`   - Warranties created: ${createdWarranties}`);
}

module.exports = seed50DemoCustomers;

if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB()
    .then(() => seed50DemoCustomers())
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal seed error:', err);
      process.exit(1);
    });
}
