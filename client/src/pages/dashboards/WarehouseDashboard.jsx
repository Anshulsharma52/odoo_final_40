import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  PackageCheck,
  AlertTriangle,
  QrCode,
  Truck,
  PlusCircle,
  Barcode,
  Search,
  CheckCircle,
  Plus,
  ArrowUpRight,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import toast from 'react-hot-toast';

const WarehouseDashboard = () => {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [serials, setSerials] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Forms
  const [replenishData, setReplenishData] = useState({
    productId: '',
    quantity: 10,
    costPerUnit: 15000,
    supplier: 'SunPower Global Tier-1 Suppliers'
  });

  const [serialData, setSerialData] = useState({
    productId: '',
    serialsList: ''
  });

  const [dispatchForm, setDispatchForm] = useState({
    vehicleNo: 'MH-12-SP-2026',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 98220 11223',
    inverterSerial: '',
    batterySerials: '',
    notes: 'Components inspected, tested, and secured for site transit.'
  });

  const fetchWarehouseData = async () => {
    try {
      const [prodRes, lowRes, snRes, ordRes, dspRes] = await Promise.all([
        api.get('/inventory/products'),
        api.get('/inventory/low-stock'),
        api.get('/inventory/serials'),
        api.get('/orders'),
        api.get('/dispatches')
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (lowRes.data.success) setLowStock(lowRes.data.products);
      if (snRes.data.success) setSerials(snRes.data.serials);
      if (ordRes.data.success) setOrders(ordRes.data.orders);
      if (dspRes.data.success) setDispatches(dspRes.data.dispatches);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  const handleReplenish = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/replenish', replenishData);
      if (res.data.success) {
        toast.success(res.data.message);
        setIsStockModalOpen(false);
        fetchWarehouseData();
      }
    } catch (err) {
      toast.error('Failed to replenish stock');
    }
  };

  const handleAddSerials = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/serials', serialData);
      if (res.data.success) {
        toast.success(res.data.message);
        setIsSerialModalOpen(false);
        setSerialData({ productId: '', serialsList: '' });
        fetchWarehouseData();
      }
    } catch (err) {
      toast.error('Failed to register serial numbers');
    }
  };

  const handleOpenDispatch = (order) => {
    setSelectedOrder(order);
    const availableInverters = serials.filter(s => s.category === 'Inverter' && s.status === 'In Stock');
    const availableBatteries = serials.filter(s => s.category === 'Battery' && s.status === 'In Stock');

    setDispatchForm({
      vehicleNo: 'MH-12-SP-2026',
      driverName: 'Ramesh Kumar',
      driverPhone: '+91 98220 11223',
      inverterSerial: availableInverters[0]?.serialNumber || 'INV-3KW-9901',
      batterySerials: availableBatteries.slice(0, 2).map(b => b.serialNumber).join(', '),
      notes: `All components for ${order.capacityKw}kW ${order.systemType} verified and loaded.`
    });
    setIsDispatchModalOpen(true);
  };

  const handleConfirmDispatch = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const dispatchedItems = [];
      if (dispatchForm.inverterSerial) {
        dispatchedItems.push({
          productName: `${selectedOrder.capacityKw} kW Inverter`,
          serialNumbers: [dispatchForm.inverterSerial.trim()]
        });
      }
      if (dispatchForm.batterySerials) {
        const batSns = dispatchForm.batterySerials.split(',').map(s => s.trim()).filter(Boolean);
        dispatchedItems.push({
          productName: '150Ah Solar Battery Bank',
          serialNumbers: batSns
        });
      }

      const res = await api.post('/dispatches', {
        orderId: selectedOrder._id,
        vehicleNo: dispatchForm.vehicleNo,
        driverName: dispatchForm.driverName,
        driverPhone: dispatchForm.driverPhone,
        dispatchedItems,
        notes: dispatchForm.notes
      });

      if (res.data.success) {
        toast.success(`Dispatch ${res.data.dispatch.dispatchNumber} prepared! Assigned to Installation Crew schedule.`);
        setIsDispatchModalOpen(false);
        fetchWarehouseData();
      }
    } catch (err) {
      toast.error('Failed to process dispatch');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const confirmedOrders = orders.filter(o => o.status === 'Confirmed' || o.dispatchStatus === 'Pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Warehouse & Inventory Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage solar panels, inverters, and battery serial numbers. Scan and allocate equipment to dispatch trucks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStockModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Incoming Stock
          </button>
          <button
            onClick={() => setIsSerialModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Barcode className="w-4 h-4" /> Register Serials
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Catalog Products"
          value={products.length}
          subtext="Panels, inverters, batteries"
          icon={PackageCheck}
          color="emerald"
        />
        <StatCard
          title="Low Stock Reorders"
          value={lowStock.length}
          subtext={lowStock.length > 0 ? 'Requires replenishment' : 'All stocks adequate'}
          icon={AlertTriangle}
          color={lowStock.length > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Tracked Serial Numbers"
          value={serials.length}
          subtext={`${serials.filter(s => s.status === 'In Stock').length} currently in stock`}
          icon={QrCode}
          color="blue"
        />
        <StatCard
          title="Pending Dispatches"
          value={confirmedOrders.length}
          subtext="Orders awaiting truck loading"
          icon={Truck}
          color="amber"
        />
      </div>

      {/* Pending Dispatch Orders */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Orders Ready for Dispatch & Serial Allocation</h2>
            <p className="text-xs text-slate-400">Step 6 & 7: Scan high-value inverters & batteries before truck departure</p>
          </div>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold border border-amber-200">
            {confirmedOrders.length} Awaiting Packing
          </span>
        </div>

        {confirmedOrders.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No pending orders waiting for warehouse dispatch right now.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {confirmedOrders.map((ord) => (
              <div key={ord._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{ord.orderNumber}</span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {ord.capacityKw} kW {ord.systemType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Customer: <strong>{ord.customerName}</strong> ({ord.customerPhone}) • {ord.customerAddress}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ord.bomItems?.map((bom, idx) => (
                      <span key={idx} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {bom.quantity}x {bom.name} {bom.serialRequired && '• (Serial Req.)'}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenDispatch(ord)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                >
                  <Truck className="w-4 h-4" /> Scan & Dispatch Truck
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Stock Inventory & Serial Number Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Stock Inventory */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-600" /> Stock Inventory Levels
            </h3>
            <span className="text-xs text-slate-400">{products.length} Products</span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {products.map((p) => {
              const isLow = Number(p.currentStock) <= Number(p.minStockAlert);
              return (
                <div
                  key={p._id}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    isLow ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{p.name}</span>
                      <span className="text-[10px] bg-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Cost: ₹{p.unitCost?.toLocaleString('en-IN')} • Selling: ₹{p.unitSellingPrice?.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-extrabold ${isLow ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {p.currentStock} {p.category === 'Wire/Cable' ? 'm' : 'Units'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Min: {p.minStockAlert}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Serial Number Records */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Barcode className="w-4 h-4 text-blue-600" /> Equipment Serial Barcodes
            </h3>
            <span className="text-xs text-slate-400">{serials.length} Tracked</span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {serials.slice(0, 15).map((sn) => (
              <div
                key={sn._id}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-slate-500" /> {sn.serialNumber}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{sn.productName}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={sn.status} />
                  {sn.customerName && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">Customer: {sn.customerName}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Incoming Stock Replenishment */}
      <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} title="Record Incoming Supplier Stock">
        <form onSubmit={handleReplenish} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Product *</label>
            <select
              required
              value={replenishData.productId}
              onChange={(e) => setReplenishData({ ...replenishData, productId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>{p.name} (Current: {p.currentStock})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity Received *</label>
              <input
                type="number"
                required
                min={1}
                value={replenishData.quantity}
                onChange={(e) => setReplenishData({ ...replenishData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Cost (₹)</label>
              <input
                type="number"
                value={replenishData.costPerUnit}
                onChange={(e) => setReplenishData({ ...replenishData, costPerUnit: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Supplier / Factory Name</label>
            <input
              type="text"
              value={replenishData.supplier}
              onChange={(e) => setReplenishData({ ...replenishData, supplier: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStockModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
            >
              Add to Stock Inventory
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Register Serial Numbers */}
      <Modal isOpen={isSerialModalOpen} onClose={() => setIsSerialModalOpen(false)} title="Register High-Value Serial Barcodes">
        <form onSubmit={handleAddSerials} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Equipment *</label>
            <select
              required
              value={serialData.productId}
              onChange={(e) => setSerialData({ ...serialData, productId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">-- Choose Inverter / Battery / Panel --</option>
              {products.filter(p => p.serialRequired || p.category.includes('Inverter') || p.category.includes('Battery')).map((p) => (
                <option key={p._id} value={p._id}>{p.name} ({p.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Barcode / Serial Numbers (Comma or line separated) *
            </label>
            <textarea
              rows={4}
              required
              placeholder="e.g. INV-3KW-9910, INV-3KW-9911, BAT-150-5510"
              value={serialData.serialsList}
              onChange={(e) => setSerialData({ ...serialData, serialsList: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Scan with barcode reader or enter multiple serials separated by commas.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSerialModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
            >
              Register Serial Numbers
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Dispatch Truck & Allocate Serials */}
      <Modal isOpen={isDispatchModalOpen} onClose={() => setIsDispatchModalOpen(false)} title={`Prepare Dispatch for Order: ${selectedOrder?.orderNumber}`}>
        <form onSubmit={handleConfirmDispatch} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
            Dispatch Day: Every inverter and battery serial must be recorded before the vehicle departs so that warranty tracking can be initiated.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Delivery Truck Vehicle No. *</label>
              <input
                type="text"
                required
                value={dispatchForm.vehicleNo}
                onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Driver Name & Contact *</label>
              <input
                type="text"
                required
                value={dispatchForm.driverName}
                onChange={(e) => setDispatchForm({ ...dispatchForm, driverName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scanned Inverter Serial Number *</label>
              <input
                type="text"
                required
                value={dispatchForm.inverterSerial}
                onChange={(e) => setDispatchForm({ ...dispatchForm, inverterSerial: e.target.value })}
                placeholder="e.g. INV-3KW-9901"
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scanned Battery Serials (if Off-Grid)</label>
              <input
                type="text"
                value={dispatchForm.batterySerials}
                onChange={(e) => setDispatchForm({ ...dispatchForm, batterySerials: e.target.value })}
                placeholder="e.g. BAT-150-5501, BAT-150-5502"
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dispatch Notes</label>
            <textarea
              rows={2}
              value={dispatchForm.notes}
              onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDispatchModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
            >
              Authorize Dispatch & Schedule Installation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WarehouseDashboard;
