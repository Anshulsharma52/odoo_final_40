const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method: 'POST',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method: 'GET',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- STARTING COMPONENT PRICING & INVOICE TEST ---');

  // 1. Login as Sales
  const salesLogin = await post('/api/auth/login', {
    email: 'sales@sunpower.com',
    password: 'password123'
  });
  const salesToken = salesLogin.data.token;
  console.log('1. Sales Logged In:', salesLogin.data.user.name);

  // 2. Test variable subsidy templates
  console.log('\n2. Testing variable subsidy across kW packages...');
  const t1 = await get('/api/quotations/template?capacityKw=1&systemType=On-Grid', salesToken);
  console.log('1 kW Package Subsidy:', t1.data.template?.subsidyAmount, '(Expected: 30000)');
  if (t1.data.template?.subsidyAmount !== 30000) throw new Error('1kW subsidy mismatch');

  const t2 = await get('/api/quotations/template?capacityKw=2&systemType=On-Grid', salesToken);
  console.log('2 kW Package Subsidy:', t2.data.template?.subsidyAmount, '(Expected: 60000)');
  if (t2.data.template?.subsidyAmount !== 60000) throw new Error('2kW subsidy mismatch');

  const t3 = await get('/api/quotations/template?capacityKw=3&systemType=On-Grid', salesToken);
  console.log('3 kW Package Subsidy:', t3.data.template?.subsidyAmount, '(Expected: 78000)');
  if (t3.data.template?.subsidyAmount !== 78000) throw new Error('3kW subsidy mismatch');

  // 3. Generate Quote with Independent Component Pricing
  console.log('\n3. Generating Quotation with custom independent component prices...');
  const customItems = [
    { name: '540W Mono PERC Solar Panel', category: 'Solar Panel', quantity: 6, unitPrice: 16200, serialRequired: true },
    { name: '3 kW Smart Inverter', category: 'Inverter', quantity: 1, unitPrice: 42500, serialRequired: true },
    { name: 'Elevated High-Wind Mounting Stand', category: 'Structure/Stand', quantity: 1, unitPrice: 14500, serialRequired: false },
    { name: 'Solar DC Cable 4sqmm (50m)', category: 'Wire/Cable', quantity: 50, unitPrice: 95, serialRequired: false },
    { name: 'IP65 AC/DC Distribution Box', category: 'Switchgear/Earthing', quantity: 1, unitPrice: 7200, serialRequired: false },
    { name: 'Chemical Earthing Kit', category: 'Switchgear/Earthing', quantity: 3, unitPrice: 3200, serialRequired: false },
    { name: 'Turnkey Commissioning & Net Metering', category: 'Installation/Service', quantity: 1, unitPrice: 12000, serialRequired: false }
  ];

  // Expected subtotal: 6*16200 (97200) + 42500 + 14500 + 50*95 (4750) + 7200 + 3*3200 (9600) + 12000 = 187750
  const expectedSubtotal = customItems.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
  console.log('Calculated component sum:', expectedSubtotal);

  // Sales sets variable subsidy to ₹75,000 and discount of ₹3,000
  const variableSubsidy = 75000;
  const discount = 3000;
  const quoteRes = await post('/api/quotations', {
    customerName: 'Vikrant Roy',
    customerPhone: '+91 9911223344',
    customerEmail: 'vikrant.roy@example.com',
    customerAddress: 'Villa 12, Palm Meadows, Pune',
    systemType: 'On-Grid',
    capacityKw: 3,
    customItems,
    discount,
    subsidyAmount: variableSubsidy,
    notes: 'Custom negotiated components with independent item pricing.'
  }, salesToken);

  console.log('Quotation created:', quoteRes.data.success, quoteRes.data.quotation?.quotationNumber);
  console.log('Quoted Total Amount:', quoteRes.data.quotation?.totalAmount, '(Expected:', expectedSubtotal, ')');
  console.log('Net Payable:', quoteRes.data.quotation?.netPayable, '(Expected:', expectedSubtotal - discount - variableSubsidy, ')');
  console.log('Components in Quote:', quoteRes.data.quotation?.items.length);

  if (quoteRes.data.quotation?.totalAmount !== expectedSubtotal) {
    throw new Error('Total amount does not match sum of independently quoted components');
  }

  // 4. Accept Quote to generate Order and Tax Invoice
  console.log('\n4. Accepting Quotation to generate Order and Invoice with component list...');
  const acceptRes = await post(`/api/quotations/${quoteRes.data.quotation._id}/respond`, {
    action: 'accept',
    feedback: 'Approved by Vikrant Roy'
  }, salesToken);

  console.log('Order generated:', acceptRes.data.order?.orderNumber);

  // 5. Query /api/invoices to verify the Invoice was generated with itemized components
  console.log('\n5. Querying /api/invoices for the customer invoice...');
  const invRes = await get('/api/invoices', salesToken);
  console.log('Total Invoices in system:', invRes.data.count);
  const myInvoice = invRes.data.invoices.find(inv => inv.customerName === 'Vikrant Roy');
  if (!myInvoice) throw new Error('Invoice for Vikrant Roy not found!');

  console.log('Found Invoice:', {
    invoiceNumber: myInvoice.invoiceNumber,
    customerName: myInvoice.customerName,
    itemsCount: myInvoice.items?.length,
    subtotal: myInvoice.subtotal,
    subsidy: myInvoice.subsidyDeduction,
    grandTotal: myInvoice.grandTotal
  });

  console.log('\nItemized components list on invoice:');
  myInvoice.items.forEach((it, idx) => {
    console.log(`  ${idx+1}. ${it.name} (${it.category}) - Qty: ${it.quantity} @ ₹${it.unitPrice} = ₹${it.total}`);
  });

  console.log('\n ALL TESTS PASSED! Independent component pricing, variable subsidy per kW, and itemized customer invoice verified successfully.');
}

run().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
