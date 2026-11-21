# ☀️ SunPower Solutions - Solar Installation Management System

A modern, full-stack **MERN** enterprise platform designed for rooftop solar installation companies. It replaces manual registers, WhatsApp messages, and spreadsheets with one centralized digital backbone connecting 8 dedicated role-based dashboards through a complete enquiry-to-warranty workflow.

---

## 🌟 Key Capabilities & Highlights

1. **8 Role-Based Dashboards & Workspaces:**
   - **Admin Dashboard**: Master control, user role assignments, order tracking, and live database synchronizations.
   - **Sales Dashboard**: Capture enquiries, schedule site visits, generate certified BOM package quotes (1kW to 5kW On-Grid & Off-Grid).
   - **Survey Technician Dashboard**: Record rooftop measurements, azimuth/direction, tilt angle, shadow-free space, cable run, and site photos.
   - **Warehouse Dashboard**: Manage stock levels, low-stock reorder alerts, register serial barcodes, and scan inverters/batteries before truck dispatch.
   - **Installation Technician Dashboard**: On-site checklist execution, power generation (kW) testing, DC voltage, earthing resistance (Ω), photo upload, and **digital canvas customer signature sign-off**.
   - **Service & Support Dashboard**: "Rainy season breakdown" rapid support: instant warranty lookup by serial number (`INV-3KW-8842`), free under-warranty replacements vs paid repairs, and ticket resolution.
   - **Director Dashboard**: Executive P&L, monthly profit/loss Recharts, profit margin per installation, subsidy (DBT) paperwork tracker, and technician performance scorecards.
   - **Customer Portal**: Transparent homeowner experience to submit enquiries, review & accept quotes, track dispatch/installation milestones, access 20-year digital warranty certificates, and make online payments.

2. **Convenient 1-Click Role Switcher**:
   A top navigation bar allows 1-click switching between all 8 user roles for rapid evaluation and testing.

3. **Dual Database Architecture**:
   Connects to MongoDB with Mongoose, and features a local JSON-document store fallback so the entire system runs out-of-the-box without requiring manual database installations.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Hot Toast, HTML5 Canvas Signatures
- **Backend**: Node.js, Express.js, JWT Authentication, Multer file upload
- **Database**: MongoDB with Mongoose (with embedded JSON document persistence engine)

---

## 👥 Demo Credentials (All 8 Roles)

Password for all accounts: `password123`

| Role | Email | Password | Primary Functions |
|---|---|---|---|
| **Admin** | `admin@sunpower.com` | `password123` | Master control, users & roles, full audit |
| **Sales** | `sales@sunpower.com` | `password123` | Enquiries, survey bookings, package quotes |
| **Survey Technician** | `survey@sunpower.com` | `password123` | Roof dimensions, tilt, shadow analysis |
| **Warehouse** | `warehouse@sunpower.com` | `password123` | Stock, low alerts, serial scanning & dispatch |
| **Installation Technician** | `installation@sunpower.com` | `password123` | Mount checklist, kW testing, digital signature |
| **Service & Support** | `support@sunpower.com` | `password123` | Fast serial warranty check, complaint tickets |
| **Director** | `director@sunpower.com` | `password123` | P&L analytics, profit/job, subsidy cashflow |
| **Customer** | `customer@gmail.com` | `password123` | Accept quotes, track installation, warranties |

---

## 🚀 Getting Started

### 1. Start the Backend API Server
In one terminal:
```bash
cd server
npm start
```
*Backend runs on `http://localhost:5000` (seeded automatically with sample data).*

### 2. Start the Frontend Client
In a second terminal:
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔄 End-to-End Solar Business Workflow

```
[Customer Enquiry] ➔ [Sales Reviews & Books Survey] ➔ [Survey Tech Submits Roof Report]
                             ▼
[Director Financial Audit] ◄ [Customer Accepts Quote] ➔ [Order Confirmed & BOM Created]
                             ▼
[Customer Verifies Sign-Off] ◄ [Tech Tests kW & Signs] ◄ [Warehouse Scans Serials & Dispatches]
                             ▼
[Auto-Activated 20-Yr Warranty] ➔ [Rainy Season Breakdown Ticket] ➔ [Free Warranty Claim Verified]
```
