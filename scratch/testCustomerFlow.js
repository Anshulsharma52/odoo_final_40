const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('--- STARTING VERIFICATION TEST ---');

  const testUser = {
    name: 'Ramesh Sharma',
    email: `ramesh.${Date.now()}@example.com`,
    password: 'password123',
    phone: '+91 9123456789',
    address: 'Flat 402, Sunshine Residency, Pune 411028'
  };

  // 1. Register new customer
  console.log('1. Registering new customer:', testUser.name, testUser.email);
  const regRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, testUser);

  if (!regRes.data.success) {
    console.error('Registration failed:', regRes.data);
    process.exit(1);
  }
  const token = regRes.data.token;
  const user = regRes.data.user;
  console.log('Registered successfully! User ID:', user._id, 'Name:', user.name);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Submit Solar Feasibility Enquiry
  console.log('\n2. Submitting Solar Installation Enquiry for:', user.name);
  const enqPayload = {
    name: user.name,
    phone: user.phone,
    email: user.email,
    address: user.address,
    systemType: 'On-Grid',
    proposedCapacity: 5,
    monthlyBill: 5800,
    shadowFreeArea: 650
  };

  const enqRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/enquiries',
    method: 'POST',
    headers: authHeaders
  }, enqPayload);

  console.log('Enquiry response:', enqRes.data.success, 'Enquiry ID:', enqRes.data.enquiry?._id);
  console.log('Customer name on enquiry:', enqRes.data.enquiry?.customerName);
  if (enqRes.data.enquiry?.customerName !== 'Ramesh Sharma') {
    throw new Error(`Enquiry customerName is "${enqRes.data.enquiry?.customerName}", expected "Ramesh Sharma"`);
  }

  // 3. Submit Service Ticket
  console.log('\n3. Submitting Service Complaint for:', user.name);
  const tktPayload = {
    customerName: user.name,
    customerPhone: user.phone,
    customerEmail: user.email,
    customerAddress: user.address,
    issueCategory: 'Inverter Fault',
    faultCode: 'ERR-302',
    priority: 'High',
    description: 'Inverter showing ERR-302 DC isolation error code after rain.'
  };

  const tktRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/service-tickets',
    method: 'POST',
    headers: authHeaders
  }, tktPayload);

  console.log('Ticket response:', tktRes.data.success, 'Ticket #:', tktRes.data.ticket?.ticketNumber);
  console.log('Customer name on ticket:', tktRes.data.ticket?.customerName);
  if (tktRes.data.ticket?.customerName !== 'Ramesh Sharma') {
    throw new Error(`Ticket customerName is "${tktRes.data.ticket?.customerName}", expected "Ramesh Sharma"`);
  }

  // 4. Fetch Enquiries as Customer
  console.log('\n4. Testing GET /api/enquiries for logged in customer...');
  const getEnqRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/enquiries',
    method: 'GET',
    headers: authHeaders
  });

  console.log('Enquiries found for Ramesh Sharma:', getEnqRes.data.count);
  if (getEnqRes.data.count < 1) {
    throw new Error('Customer cannot see their submitted enquiry!');
  }
  const myEnq = getEnqRes.data.enquiries[0];
  console.log('Enquiry verified:', {
    id: myEnq._id,
    customerName: myEnq.customerName,
    capacity: myEnq.proposedCapacity + ' kW',
    status: myEnq.status
  });

  // 5. Fetch Service Tickets as Customer
  console.log('\n5. Testing GET /api/service-tickets for logged in customer...');
  const getTktRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/service-tickets',
    method: 'GET',
    headers: authHeaders
  });

  console.log('Tickets found for Ramesh Sharma:', getTktRes.data.count);
  if (getTktRes.data.count < 1) {
    throw new Error('Customer cannot see their submitted service ticket!');
  }
  const myTkt = getTktRes.data.tickets[0];
  console.log('Ticket verified:', {
    ticketNumber: myTkt.ticketNumber,
    customerName: myTkt.customerName,
    issueCategory: myTkt.issueCategory,
    status: myTkt.status,
    priority: myTkt.priority
  });

  console.log('\n ALL TESTS PASSED SUCCESSFULLY! Sunil Mehta is not hardcoded, customer sees their own requests and status.');
}

run().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
