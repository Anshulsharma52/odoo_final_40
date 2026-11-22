const bcrypt = require('bcryptjs');
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
  Notification,
  Inventory
} = require('../models');
const seed50DemoCustomers = require('../scripts/seed50DemoCustomers');

async function seed() {
  console.log('Seeding initial SunPower Solutions data...');

  // 1. Seed Users for 6 merged roles
  const salt = await bcrypt.genSalt(10);
  const commonPassword = await bcrypt.hash('password123', salt);

  const demoUsers = [
    {
      _id: 'user_admin_001',
      name: 'Vikramaditya Rao',
      email: 'admin@sunpower.com',
      password: commonPassword,
      role: 'Admin',
      phone: '+91 98201 10001',
      address: 'SunPower HQ, Nariman Point, Mumbai',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    {
      _id: 'user_sales_001',
      name: 'Ananya Sen',
      email: 'sales@sunpower.com',
      password: commonPassword,
      role: 'Sales',
      phone: '+91 98202 20002',
      address: 'Bandra West, Mumbai',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
    },
    {
      _id: 'user_technician_001',
      name: 'Rohan & Vikram (Field Technician)',
      email: 'technician@sunpower.com',
      password: commonPassword,
      role: 'Technician',
      phone: '+91 98203 30003',
      address: 'SunPower Field Operations Hub, Mumbai',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    {
      _id: 'user_survey_001',
      name: 'Rohan Joshi',
      email: 'survey@sunpower.com',
      password: commonPassword,
      role: 'Technician',
      phone: '+91 98203 30003',
      address: 'Kothrud, Pune',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    {
      _id: 'user_warehouse_001',
      name: 'Rajesh Verma',
      email: 'warehouse@sunpower.com',
      password: commonPassword,
      role: 'Warehouse',
      phone: '+91 98204 40004',
      address: 'Bhiwandi Logistics Hub, Thane',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    },
    {
      _id: 'user_install_001',
      name: 'Vikram Sharma',
      email: 'installation@sunpower.com',
      password: commonPassword,
      role: 'Technician',
      phone: '+91 98205 50005',
      address: 'Andheri East, Mumbai',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
    },
    {
      _id: 'user_service_001',
      name: 'Priya Nair',
      email: 'support@sunpower.com',
      password: commonPassword,
      role: 'Service & Support',
      phone: '+91 98206 60006',
      address: 'Vashi, Navi Mumbai',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
    },
    {
      _id: 'user_director_001',
      name: 'Aditya Singhania',
      email: 'director@sunpower.com',
      password: commonPassword,
      role: 'Admin',
      phone: '+91 98207 70007',
      address: 'Worli Sea Face, Mumbai',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80'
    },
    {
      _id: 'user_customer_001',
      name: 'Sunil Mehta',
      email: 'customer@gmail.com',
      password: commonPassword,
      role: 'Customer',
      phone: '+91 98208 80008',
      address: 'B-402, Green Acres Society, Baner, Pune 411045',
      active: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    }
  ];

  for (const u of demoUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      await User.create(u);
    }
  }

  // 2. Seed Customer record
  let customerMehta = await Customer.findOne({ phone: '+91 98208 80008' });
  if (!customerMehta) {
    customerMehta = await Customer.create({
      _id: 'cust_mehta_001',
      userId: 'user_customer_001',
      name: 'Sunil Mehta',
      email: 'customer@gmail.com',
      phone: '+91 98208 80008',
      address: 'B-402, Green Acres Society, Baner, Pune 411045',
      electricityConsumerNo: 'MSEDCL-88992011',
      monthlyBill: 4200,
      connectedLoad: '5 kW'
    });
  }

  // 3. Seed Products
  const productsData = [
    {
      _id: 'prod_panel_540',
      name: '540W Mono PERC Solar Panel',
      category: 'Solar Panel',
      brand: 'SunPower UltraTier',
      model: 'SP-540-PERC',
      specification: 'High Efficiency 21.3%, 144 Half-Cut Cells, IP68 Junction Box',
      unitCost: 11000,
      unitSellingPrice: 15000,
      warrantyYears: 20,
      serialRequired: true,
      currentStock: 84,
      minStockAlert: 20,
      imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb998?auto=format&fit=crop&w=400&q=80'
    },
    {
      _id: 'prod_inv_1kw',
      name: '1 kW Grid-Tie Solar Inverter',
      category: 'Inverter',
      brand: 'SunPower SmartSync',
      model: 'GT-1000-X',
      specification: 'Single Phase, 97.6% Max Efficiency, Built-in WiFi Monitoring',
      unitCost: 14500,
      unitSellingPrice: 20000,
      warrantyYears: 5,
      serialRequired: true,
      currentStock: 14,
      minStockAlert: 5,
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'
    },
    {
      _id: 'prod_inv_3kw',
      name: '3 kW Grid-Tie Smart Solar Inverter',
      category: 'Inverter',
      brand: 'SunPower SmartSync',
      model: 'GT-3000-PRO',
      specification: 'Dual MPPT, IP65 Waterproof, Cloud App Monitoring, Anti-Islanding',
      unitCost: 28000,
      unitSellingPrice: 38000,
      warrantyYears: 5,
      serialRequired: true,
      currentStock: 22,
      minStockAlert: 6,
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'
    },
    {
      _id: 'prod_inv_5kw',
      name: '5 kW Dual-MPPT Grid-Tie Inverter',
      category: 'Inverter',
      brand: 'SunPower SmartSync',
      model: 'GT-5000-MAX',
      specification: '3-Phase / Single Phase Dual MPPT, 98.4% Efficiency, Surge Suppressor',
      unitCost: 39000,
      unitSellingPrice: 52000,
      warrantyYears: 5,
      serialRequired: true,
      currentStock: 9,
      minStockAlert: 4,
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'
    },
    {
      _id: 'prod_bat_150ah',
      name: '150Ah Solar Tubular C10 Deep Cycle Battery',
      category: 'Battery',
      brand: 'SunPower VoltGuard',
      model: 'VG-150-C10',
      specification: 'Heavy Duty Lead Acid Tubular, 12V, 1500+ Cycles at 80% DOD',
      unitCost: 12000,
      unitSellingPrice: 16500,
      warrantyYears: 3,
      serialRequired: true,
      currentStock: 18,
      minStockAlert: 8,
      imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80'
    },
    {
      _id: 'prod_stand_hdg',
      name: 'Hot-Dip Galvanized Mounting Stand (6 panels)',
      category: 'Structure/Stand',
      brand: 'SunPower DuraMount',
      model: 'DM-6P-HDG',
      specification: 'High Wind Rated 150 km/h, 80 Micron Galvanizing, Rustproof',
      unitCost: 7500,
      unitSellingPrice: 12000,
      warrantyYears: 10,
      serialRequired: false,
      currentStock: 35,
      minStockAlert: 10,
      imageUrl: ''
    },
    {
      _id: 'prod_cable_dc',
      name: '4/6 sqmm UV Protected DC Solar Cable (100m Roll)',
      category: 'Wire/Cable',
      brand: 'SunPower SolarFlex',
      model: 'SF-DC-4MM',
      specification: 'Tinned Copper, Double Insulated, Cross-linked Polyolefin',
      unitCost: 6500,
      unitSellingPrice: 9000,
      warrantyYears: 5,
      serialRequired: false,
      currentStock: 48,
      minStockAlert: 15,
      imageUrl: ''
    },
    {
      _id: 'prod_earthing_kit',
      name: 'Chemical Earthing Kit & Copper Bonded Rod',
      category: 'Switchgear/Earthing',
      brand: 'SunPower EarthSafe',
      model: 'ES-CHEM-3M',
      specification: '3-Meter Pure Copper Bonded Rod + 25kg Bentonite Compound',
      unitCost: 1800,
      unitSellingPrice: 3000,
      warrantyYears: 5,
      serialRequired: false,
      currentStock: 3, // LOW STOCK FOR ALERT
      minStockAlert: 8,
      imageUrl: ''
    }
  ];

  for (const p of productsData) {
    const exists = await Product.findById(p._id);
    if (!exists) {
      await Product.create(p);
    }
  }

  // 4. Seed Serial Numbers for Inverters and Batteries in Stock
  const serials = [
    { serialNumber: 'INV-3KW-9901', productId: 'prod_inv_3kw', productName: '3 kW Grid-Tie Smart Solar Inverter', category: 'Inverter', status: 'In Stock', warrantyYears: 5 },
    { serialNumber: 'INV-3KW-9902', productId: 'prod_inv_3kw', productName: '3 kW Grid-Tie Smart Solar Inverter', category: 'Inverter', status: 'In Stock', warrantyYears: 5 },
    { serialNumber: 'INV-3KW-9903', productId: 'prod_inv_3kw', productName: '3 kW Grid-Tie Smart Solar Inverter', category: 'Inverter', status: 'In Stock', warrantyYears: 5 },
    { serialNumber: 'INV-5KW-7701', productId: 'prod_inv_5kw', productName: '5 kW Dual-MPPT Grid-Tie Inverter', category: 'Inverter', status: 'In Stock', warrantyYears: 5 },
    { serialNumber: 'INV-5KW-7702', productId: 'prod_inv_5kw', productName: '5 kW Dual-MPPT Grid-Tie Inverter', category: 'Inverter', status: 'In Stock', warrantyYears: 5 },
    { serialNumber: 'BAT-150-5501', productId: 'prod_bat_150ah', productName: '150Ah Solar Tubular C10 Deep Cycle Battery', category: 'Battery', status: 'In Stock', warrantyYears: 3 },
    { serialNumber: 'BAT-150-5502', productId: 'prod_bat_150ah', productName: '150Ah Solar Tubular C10 Deep Cycle Battery', category: 'Battery', status: 'In Stock', warrantyYears: 3 },
    { serialNumber: 'BAT-150-5503', productId: 'prod_bat_150ah', productName: '150Ah Solar Tubular C10 Deep Cycle Battery', category: 'Battery', status: 'In Stock', warrantyYears: 3 },
    { serialNumber: 'PAN-PERC-1001', productId: 'prod_panel_540', productName: '540W Mono PERC Solar Panel', category: 'Solar Panel', status: 'In Stock', warrantyYears: 20 },
    { serialNumber: 'PAN-PERC-1002', productId: 'prod_panel_540', productName: '540W Mono PERC Solar Panel', category: 'Solar Panel', status: 'In Stock', warrantyYears: 20 },
    { serialNumber: 'PAN-PERC-1003', productId: 'prod_panel_540', productName: '540W Mono PERC Solar Panel', category: 'Solar Panel', status: 'In Stock', warrantyYears: 20 },
    { serialNumber: 'PAN-PERC-1004', productId: 'prod_panel_540', productName: '540W Mono PERC Solar Panel', category: 'Solar Panel', status: 'In Stock', warrantyYears: 20 },
    { serialNumber: 'PAN-PERC-1005', productId: 'prod_panel_540', productName: '540W Mono PERC Solar Panel', category: 'Solar Panel', status: 'In Stock', warrantyYears: 20 },
    { serialNumber: 'PAN-PERC-1006', productId: 'prod_panel_540', productName: '540W Mono PERC Solar Panel', category: 'Solar Panel', status: 'In Stock', warrantyYears: 20 }
  ];

  for (const s of serials) {
    const exists = await ProductSerialNumber.findOne({ serialNumber: s.serialNumber });
    if (!exists) {
      await ProductSerialNumber.create(s);
    }
  }

  // 5. Seed Completed Customer Installation & Live Warranty (Scene from PDF: Sunil Mehta)
  let existingOrder = await Order.findOne({ orderNumber: 'ORD-2026-0001' });
  if (!existingOrder) {
    existingOrder = await Order.create({
      _id: 'ord_mehta_001',
      orderNumber: 'ORD-2026-0001',
      quotationNumber: 'QT-2026-0001',
      customerName: 'Sunil Mehta',
      customerPhone: '+91 98208 80008',
      customerEmail: 'customer@gmail.com',
      customerAddress: 'B-402, Green Acres Society, Baner, Pune 411045',
      systemType: 'On-Grid',
      capacityKw: 3,
      totalAmount: 165000,
      subsidyAmount: 45000,
      netPayable: 120000,
      advancePaid: 120000,
      balanceDue: 0,
      status: 'Completed',
      dispatchStatus: 'Delivered',
      installationStatus: 'Completed',
      bomItems: [
        { name: '540W Mono PERC Solar Panel', category: 'Solar Panel', quantity: 6, serialRequired: true, allocatedSerials: ['PAN-PERC-1001', 'PAN-PERC-1002', 'PAN-PERC-1003', 'PAN-PERC-1004', 'PAN-PERC-1005', 'PAN-PERC-1006'] },
        { name: '3 kW Grid-Tie Smart Solar Inverter', category: 'Inverter', quantity: 1, serialRequired: true, allocatedSerials: ['INV-3KW-8842'] },
        { name: 'Hot-Dip Galvanized Mounting Stand (6 panels)', category: 'Structure/Stand', quantity: 1, serialRequired: false, allocatedSerials: [] },
        { name: '4/6 sqmm UV Protected DC Solar Cable', category: 'Wire/Cable', quantity: 50, serialRequired: false, allocatedSerials: [] }
      ]
    });

    // Mark installed inverter serial
    await ProductSerialNumber.create({
      serialNumber: 'INV-3KW-8842',
      productId: 'prod_inv_3kw',
      productName: '3 kW Grid-Tie Smart Solar Inverter',
      category: 'Inverter',
      status: 'Installed',
      orderId: 'ord_mehta_001',
      orderNumber: 'ORD-2026-0001',
      customerName: 'Sunil Mehta',
      customerPhone: '+91 98208 80008',
      warrantyYears: 5,
      installationDate: '2025-05-15T10:00:00.000Z',
      warrantyExpiryDate: '2030-05-15T10:00:00.000Z'
    });

    // Create active warranty certificates
    await Warranty.create({
      warrantyNumber: 'WAR-2025-00010',
      orderId: 'ord_mehta_001',
      orderNumber: 'ORD-2026-0001',
      customerName: 'Sunil Mehta',
      customerPhone: '+91 98208 80008',
      productName: '3 kW Grid-Tie Smart Solar Inverter',
      category: 'Inverter',
      serialNumber: 'INV-3KW-8842',
      warrantyYears: 5,
      startDate: '2025-05-15T10:00:00.000Z',
      endDate: '2030-05-15T10:00:00.000Z',
      status: 'Active'
    });

    await Warranty.create({
      warrantyNumber: 'WAR-2025-00011',
      orderId: 'ord_mehta_001',
      orderNumber: 'ORD-2026-0001',
      customerName: 'Sunil Mehta',
      customerPhone: '+91 98208 80008',
      productName: '540W Mono PERC Solar Panels (6 Units)',
      category: 'Solar Panel',
      serialNumber: 'PAN-PERC-BATCH-01',
      warrantyYears: 20,
      startDate: '2025-05-15T10:00:00.000Z',
      endDate: '2045-05-15T10:00:00.000Z',
      status: 'Active'
    });

    // Installation sign-off record
    await Installation.create({
      orderId: 'ord_mehta_001',
      orderNumber: 'ORD-2026-0001',
      customerName: 'Sunil Mehta',
      customerPhone: '+91 98208 80008',
      customerAddress: 'B-402, Green Acres Society, Baner, Pune 411045',
      systemType: 'On-Grid',
      capacityKw: 3,
      leadTechnicianName: 'Vikram Sharma',
      status: 'Completed',
      scheduledDate: '2025-05-14T09:00:00.000Z',
      startTime: '2025-05-15T09:30:00.000Z',
      completionDate: '2025-05-15T16:45:00.000Z',
      checklist: {
        structureMounting: true,
        panelArrangement: true,
        inverterInstallation: true,
        batteryConnection: true,
        earthingProtection: true,
        cableTieAndConduit: true
      },
      testResults: {
        generationKw: 2.85,
        dcVocVoltage: 382,
        earthingResistanceOhms: 1.4,
        gridSyncConfirmed: true
      },
      sitePhotos: [
        'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=600&q=80'
      ],
      customerSignature: 'Sunil Mehta (Digitally Signed On Site)',
      customerFeedback: 'Very professional team. System generation verified at 2.85 kW instantly.'
    });

    // Invoice & Payment
    await Invoice.create({
      invoiceNumber: 'INV-2025-0001',
      orderId: 'ord_mehta_001',
      orderNumber: 'ORD-2026-0001',
      customerName: 'Sunil Mehta',
      customerPhone: '+91 98208 80008',
      customerAddress: 'B-402, Green Acres Society, Baner, Pune 411045',
      systemType: 'On-Grid',
      capacityKw: 3,
      subtotal: 165000,
      subsidyDeduction: 45000,
      grandTotal: 120000,
      paidAmount: 120000,
      balanceDue: 0,
      status: 'Paid',
      dueDate: '2025-05-20T00:00:00.000Z'
    });

    await Payment.create({
      receiptNo: 'REC-2025-0001',
      orderId: 'ord_mehta_001',
      orderNumber: 'ORD-2026-0001',
      customerName: 'Sunil Mehta',
      customerPhone: '+91 98208 80008',
      amount: 120000,
      paymentType: 'Final',
      paymentMethod: 'Bank Transfer',
      transactionRef: 'NEFT-ICICI-8812903',
      status: 'Completed',
      paymentDate: '2025-05-15T17:00:00.000Z'
    });
  }

  // 6. Seed Service Ticket (The rainy season breakdown scene from PDF!)
  const existingTicket = await ServiceTicket.findOne({ ticketNumber: 'TKT-2026-0001' });
  if (!existingTicket) {
    await ServiceTicket.create({
      ticketNumber: 'TKT-2026-0001',
      customerName: 'Sunil Mehta',
      customerPhone: '+91 98208 80008',
      customerAddress: 'B-402, Green Acres Society, Baner, Pune 411045',
      productName: '3 kW Grid-Tie Smart Solar Inverter',
      serialNumber: 'INV-3KW-8842',
      faultCode: 'ERR-302 (DC Isolation Fault)',
      issueCategory: 'Inverter Fault',
      description: 'Rainy weather breakdown: Inverter showing red LED fault code ERR-302 and generating zero power to home.',
      priority: 'High',
      status: 'In Progress',
      isUnderWarranty: true, // VERIFIED UNDER ACTIVE 5-YEAR WARRANTY! FREE OF CHARGE!
      costBilledToCustomer: 0,
      assignedTechnicianName: 'Priya Nair',
      resolutionNotes: 'Technician dispatched to inspect rooftop DC cable gland water ingress and replace surge protection device under warranty.',
      partsReplaced: ['DC Surge Protector SPD-40kA'],
      customerConfirmed: false
    });
  }

  // 7. Seed active pipeline enquiries & surveys
  const existingEnquiry = await Enquiry.findOne({ customerPhone: '+91 98900 12345' });
  if (!existingEnquiry) {
    const enq = await Enquiry.create({
      customerName: 'Deepak Deshmukh',
      customerPhone: '+91 98900 12345',
      customerEmail: 'deepak.deshmukh@outlook.com',
      address: 'Villa 14, Hill Crest, Bavdhan, Pune 411021',
      systemType: 'On-Grid',
      proposedCapacity: 5,
      monthlyBill: 7800,
      shadowFreeArea: 600,
      electricityConsumerNo: 'MSEDCL-55443322',
      status: 'Survey Scheduled',
      notes: 'High monthly bill, interested in government subsidy for 5 kW rooftop installation.'
    });

    await Survey.create({
      enquiryId: enq._id,
      customerName: 'Deepak Deshmukh',
      customerPhone: '+91 98900 12345',
      customerAddress: 'Villa 14, Hill Crest, Bavdhan, Pune 411021',
      systemType: 'On-Grid',
      requestedCapacity: 5,
      technicianName: 'Rohan Joshi',
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      status: 'Scheduled',
      notes: 'Bring laser distance meter and tilt inclinometer.'
    });
  }

  // 8. Seed Completed Survey ready for Quotation
  const surveyCustomer = await Customer.findOne({ phone: '+91 97654 32100' });
  if (!surveyCustomer) {
    await Customer.create({
      name: 'Kavita Patel',
      phone: '+91 97654 32100',
      email: 'kavita.patel@gmail.com',
      address: 'Sector 21, Plot 88, Vashi, Navi Mumbai',
      monthlyBill: 3400
    });

    const enq2 = await Enquiry.create({
      customerName: 'Kavita Patel',
      customerPhone: '+91 97654 32100',
      customerEmail: 'kavita.patel@gmail.com',
      address: 'Sector 21, Plot 88, Vashi, Navi Mumbai',
      systemType: 'On-Grid',
      proposedCapacity: 3,
      monthlyBill: 3400,
      shadowFreeArea: 400,
      status: 'Survey Done'
    });

    await Survey.create({
      enquiryId: enq2._id,
      customerName: 'Kavita Patel',
      customerPhone: '+91 97654 32100',
      customerAddress: 'Sector 21, Plot 88, Vashi, Navi Mumbai',
      systemType: 'On-Grid',
      requestedCapacity: 3,
      technicianName: 'Rohan Joshi',
      status: 'Completed',
      scheduledDate: new Date(Date.now() - 86400000).toISOString(),
      report: {
        roofAreaSqFt: 520,
        direction: 'True South (180°)',
        tiltAngle: 19,
        shadowFreeSpaceSqFt: 420,
        cableDistanceMeters: 28,
        roofType: 'RCC Flat Concrete Roof',
        obstacles: 'Clean rooftop, parapet height 3ft, zero shadow between 9 AM and 4:30 PM.',
        sanctionLoadKw: 5,
        supplyType: 'Single Phase',
        approved: true,
        approvedCapacity: 3,
        inspectionNotes: 'Ideal roof conditions. Recommended 3 kW On-Grid system with 6x 540W Mono PERC panels.',
        photographs: [
          'https://images.unsplash.com/photo-1508873696983-2df5293cb998?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=600&q=80'
        ],
        completedAt: new Date(Date.now() - 3600000).toISOString()
      }
    });

    // Quotation sent for Kavita
    await Quotation.create({
      quotationNumber: 'QT-2026-0002',
      enquiryId: enq2._id,
      customerName: 'Kavita Patel',
      customerPhone: '+91 97654 32100',
      customerEmail: 'kavita.patel@gmail.com',
      customerAddress: 'Sector 21, Plot 88, Vashi, Navi Mumbai',
      systemType: 'On-Grid',
      capacityKw: 3,
      items: [
        { name: '540W Mono PERC Solar Panel', category: 'Solar Panel', quantity: 6, unitPrice: 15000, total: 90000, serialRequired: true },
        { name: '3 kW Grid-Tie Smart Solar Inverter', category: 'Inverter', quantity: 1, unitPrice: 38000, total: 38000, serialRequired: true },
        { name: 'Hot-Dip Galvanized Mounting Stand (6 panels)', category: 'Structure/Stand', quantity: 1, unitPrice: 12000, total: 12000, serialRequired: false },
        { name: '4/6 sqmm UV Protected DC Cable (Meters)', category: 'Wire/Cable', quantity: 50, unitPrice: 90, total: 4500, serialRequired: false },
        { name: 'IP65 AC/DC Distribution Box with SPD', category: 'Switchgear/Earthing', quantity: 1, unitPrice: 6500, total: 6500, serialRequired: false },
        { name: 'Double Safety Earthing & Lightning Arrester', category: 'Switchgear/Earthing', quantity: 3, unitPrice: 3000, total: 9000, serialRequired: false },
        { name: 'Turnkey Installation & Grid Sync Service', category: 'Installation/Service', quantity: 1, unitPrice: 11000, total: 11000, serialRequired: false }
      ],
      totalAmount: 171000,
      discount: 6000,
      subsidyAmount: 45000,
      netPayable: 120000,
      advanceRequired: 24000,
      status: 'Sent',
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString(),
      notes: 'Eligible for Direct Benefit Transfer (DBT) subsidy of ₹45,000.'
    });
  }

  // 9. Seed Notifications
  const existingNote = await Notification.findOne({ title: 'Welcome to SunPower Solutions!' });
  if (!existingNote) {
    await Notification.create({
      role: 'All',
      title: 'SunPower Centralized Operations Live',
      message: 'Welcome to the complete Solar Installation Management System with 8 integrated role-based dashboards.',
      link: '/dashboard',
      read: false
    });
  }

  // 10. Sync any additional records from server/data/*.json to preserve all historical records in MongoDB
  const fs = require('fs');
  const path = require('path');
  const dataDir = path.join(__dirname, '..', 'data');
  const modelMap = {
    'users.json': User,
    'customers.json': Customer,
    'products.json': Product,
    'product_serial_numbers.json': ProductSerialNumber,
    'enquiries.json': Enquiry,
    'surveys.json': Survey,
    'quotations.json': Quotation,
    'orders.json': Order,
    'dispatches.json': Dispatch,
    'installations.json': Installation,
    'warranties.json': Warranty,
    'service_tickets.json': ServiceTicket,
    'payments.json': Payment,
    'invoices.json': Invoice,
    'notifications.json': Notification,
    'inventory.json': Inventory
  };

  for (const [filename, Model] of Object.entries(modelMap)) {
    const filePath = path.join(dataDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        const items = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
        for (const item of items) {
          if (!item._id) continue;
          const exists = await Model.findById(item._id);
          if (exists) continue;

          // Unique key duplicate guards
          if (filename === 'users.json' && item.email) {
            const emailExists = await User.findOne({ email: item.email.toLowerCase() });
            if (emailExists) continue;
          }
          if (filename === 'product_serial_numbers.json' && item.serialNumber) {
            const sExists = await ProductSerialNumber.findOne({ serialNumber: item.serialNumber });
            if (sExists) continue;
          }
          if (filename === 'quotations.json' && item.quotationNumber) {
            const qExists = await Quotation.findOne({ quotationNumber: item.quotationNumber });
            if (qExists) continue;
          }
          if (filename === 'orders.json' && item.orderNumber) {
            const oExists = await Order.findOne({ orderNumber: item.orderNumber });
            if (oExists) continue;
          }
          if (filename === 'warranties.json' && item.warrantyNumber) {
            const wExists = await Warranty.findOne({ warrantyNumber: item.warrantyNumber });
            if (wExists) continue;
          }
          if (filename === 'service_tickets.json' && item.ticketNumber) {
            const tExists = await ServiceTicket.findOne({ ticketNumber: item.ticketNumber });
            if (tExists) continue;
          }
          if (filename === 'payments.json' && item.receiptNo) {
            const pExists = await Payment.findOne({ receiptNo: item.receiptNo });
            if (pExists) continue;
          }
          if (filename === 'invoices.json' && item.invoiceNumber) {
            const iExists = await Invoice.findOne({ invoiceNumber: item.invoiceNumber });
            if (iExists) continue;
          }

          await Model.create(item);
        }
      } catch (err) {
        console.warn(`Sync warning for ${filename}:`, err.message);
      }
    }
  }

  // 11. Seed 50 realistic demo customer records & lifecycle states
  await seed50DemoCustomers();

  console.log(' Seeding & MongoDB synchronization completed successfully!');
}

if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB()
    .then(() => seed())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = seed;
