import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  Truck,
  MapPin,
  Phone,
  Barcode,
  CheckCircle2,
  Clock,
  Navigation,
  PlusCircle,
  Package,
  Layers,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['Dispatched', 'In Transit', 'Out for Delivery', 'Delivered'];

const DispatchList = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';
  const canDispatch = role === 'Admin' || role === 'Warehouse' || role === 'Director';

  const [dispatches, setDispatches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Dispatch Order Modal
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    orderId: '',
    vehicleNo: 'MH-12-SP-2026',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 98220 11223',
    inverterSerial: 'INV-3KW-9901',
    batterySerials: '',
    panelBatch: 'PAN-PERC-BATCH-A',
    notes: 'All equipment inspected, verified against BOM, and securely strapped for transit.'
  });

  const fetchData = async () => {
    try {
      const [dspRes, ordRes] = await Promise.all([
        api.get('/dispatches'),
        api.get('/orders')
      ]);

      if (dspRes.data.success) setDispatches(dspRes.data.dispatches || []);
      if (ordRes.data.success) setOrders(ordRes.data.orders || []);
    } catch (err) {
      console.error('Error fetching dispatches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Delivery Transit Status
  const handleUpdateStatus = async (dispatchId, newStatus) => {
    try {
      const res = await api.put(`/dispatches/${dispatchId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Delivery status updated to '${newStatus}'!`);
        setDispatches((prev) =>
          prev.map((d) => (d._id === dispatchId ? { ...d, status: newStatus } : d))
        );
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to update delivery status');
    }
  };

  // Open Dispatch Modal for an Order
  const handleOpenDispatchModal = (order = null) => {
    const readyOrders = orders.filter(
      (o) => o.status === 'Confirmed' || o.dispatchStatus === 'Pending' || !o.dispatchStatus
    );

    const initialOrder = order || readyOrders[0] || null;
    setSelectedOrder(initialOrder);

    setDispatchForm({
      orderId: initialOrder ? initialOrder._id : '',
      vehicleNo: 'MH-12-SP-2026',
      driverName: 'Ramesh Kumar',
      driverPhone: '+91 98220 11223',
      inverterSerial: initialOrder ? `INV-${initialOrder.capacityKw || 3}KW-8842` : 'INV-3KW-8842',
      batterySerials: initialOrder?.systemType === 'Off-Grid' ? 'BAT-150-5501, BAT-150-5502' : '',
      panelBatch: `PAN-PERC-${initialOrder?.capacityKw || 3}KW-BOM`,
      notes: `Materials verified for ${initialOrder?.customerName || 'Customer'} rooftop installation.`
    });
    setIsDispatchModalOpen(true);
  };

  // Submit Order Dispatch
  const handleCreateDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchForm.orderId) {
      toast.error('Please select an order to dispatch');
      return;
    }

    try {
      const dispatchedItems = [];
      if (dispatchForm.inverterSerial) {
        dispatchedItems.push({
          productName: `${selectedOrder?.capacityKw || 3} kW Inverter`,
          serialNumbers: [dispatchForm.inverterSerial.trim()]
        });
      }
      if (dispatchForm.batterySerials) {
        const batSns = dispatchForm.batterySerials.split(',').map((s) => s.trim()).filter(Boolean);
        dispatchedItems.push({
          productName: 'Solar Tubular Battery Bank',
          serialNumbers: batSns
        });
      }
      if (dispatchForm.panelBatch) {
        dispatchedItems.push({
          productName: 'Mono PERC Solar PV Panels',
          serialNumbers: [dispatchForm.panelBatch.trim()]
        });
      }

      const res = await api.post('/dispatches', {
        orderId: dispatchForm.orderId,
        vehicleNo: dispatchForm.vehicleNo,
        driverName: dispatchForm.driverName,
        driverPhone: dispatchForm.driverPhone,
        dispatchedItems,
        notes: dispatchForm.notes
      });

      if (res.data.success) {
        toast.success(`Order dispatched successfully! Manifest: ${res.data.dispatch.dispatchNumber}`);
        setIsDispatchModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch order');
    }
  };

  const pendingDispatchOrders = orders.filter(
    (o) => o.status === 'Confirmed' || o.dispatchStatus === 'Pending' || !o.dispatchStatus
  );

  const inTransitCount = dispatches.filter((d) => d.status === 'In Transit').length;
  const outForDeliveryCount = dispatches.filter((d) => d.status === 'Out for Delivery').length;
  const deliveredCount = dispatches.filter((d) => d.status === 'Delivered').length;

  const filteredDispatches = dispatches.filter((d) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (d.dispatchNumber || '').toLowerCase().includes(term) ||
      (d.orderNumber || '').toLowerCase().includes(term) ||
      (d.customerName || '').toLowerCase().includes(term) ||
      (d.customerAddress || '').toLowerCase().includes(term) ||
      (d.vehicleNo || '').toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Delivery & Dispatch Control Center</h1>
            {canDispatch && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Admin & Warehouse Dispatcher
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch confirmed customer orders, allocate serialized hardware, track delivery transit live, and coordinate handover with technicians.
          </p>
        </div>

        {canDispatch && (
          <button
            onClick={() => handleOpenDispatchModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Dispatch Order to Customer</span>
          </button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Pending Dispatch</span>
            <span className="text-xl font-extrabold text-amber-600 mt-0.5 block">{pendingDispatchOrders.length}</span>
            <span className="text-[10px] text-slate-400">Confirmed orders ready</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">In Transit</span>
            <span className="text-xl font-extrabold text-blue-600 mt-0.5 block">{inTransitCount}</span>
            <span className="text-[10px] text-slate-400">Trucks on the highway</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Out for Delivery</span>
            <span className="text-xl font-extrabold text-purple-600 mt-0.5 block">{outForDeliveryCount}</span>
            <span className="text-[10px] text-slate-400">Arriving at site today</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Navigation className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Delivered on Site</span>
            <span className="text-xl font-extrabold text-emerald-600 mt-0.5 block">{deliveredCount}</span>
            <span className="text-[10px] text-slate-400">Ready for mounting</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="max-w-md w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by manifest, order #, customer, or vehicle..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {['All', 'In Transit', 'Out for Delivery', 'Delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Dispatches Grid with Delivery Stepper & Action Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDispatches.map((d) => {
          const isDelivered = d.status === 'Delivered';
          const isOutForDelivery = d.status === 'Out for Delivery';
          const isInTransit = d.status === 'In Transit' || d.status === 'Dispatched';

          return (
            <div key={d._id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              {/* Manifest Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{d.dispatchNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                      Order: {d.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">{d.customerName}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>

              {/* 4-Step Visual Delivery Tracking Stepper */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Delivery Transit Progress
                </span>
                <div className="grid grid-cols-4 gap-1 text-center">
                  {/* Step 1: Dispatched */}
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      ✓
                    </div>
                    <span className="text-[10px] font-bold text-emerald-900 mt-1">Dispatched</span>
                  </div>

                  {/* Step 2: In Transit */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isInTransit || isOutForDelivery || isDelivered
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isOutForDelivery || isDelivered ? '✓' : '2'}
                    </div>
                    <span
                      className={`text-[10px] mt-1 ${
                        isInTransit || isOutForDelivery || isDelivered ? 'font-bold text-blue-900' : 'text-slate-400'
                      }`}
                    >
                      In Transit
                    </span>
                  </div>

                  {/* Step 3: Out for Delivery */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isOutForDelivery || isDelivered
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isDelivered ? '✓' : '3'}
                    </div>
                    <span
                      className={`text-[10px] mt-1 ${
                        isOutForDelivery || isDelivered ? 'font-bold text-purple-900' : 'text-slate-400'
                      }`}
                    >
                      Out for Delivery
                    </span>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isDelivered ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isDelivered ? '✓' : '4'}
                    </div>
                    <span
                      className={`text-[10px] mt-1 ${isDelivered ? 'font-bold text-emerald-900' : 'text-slate-400'}`}
                    >
                      Delivered
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                <p className="flex items-start gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    Destination: <strong>{d.customerAddress}</strong>
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-4 text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1 font-medium">
                    <Truck className="w-3.5 h-3.5 text-blue-600" /> Vehicle: <strong>{d.vehicleNo}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Driver: {d.driverName} ({d.driverPhone})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pt-0.5">
                  Dispatched On: {new Date(d.dispatchDate).toLocaleString()}
                </p>
              </div>

              {/* Scanned Serial Numbers */}
              {d.allAllocatedSerials?.length > 0 && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700 text-[11px] flex items-center gap-1 mb-1">
                    <Barcode className="w-3 h-3 text-emerald-600" /> Scanned Serial Numbers in Transit:
                  </span>
                  <div className="flex flex-wrap gap-1 font-mono">
                    {d.allAllocatedSerials.map((sn, idx) => (
                      <span
                        key={idx}
                        className="bg-white px-2 py-0.5 rounded border border-slate-200 text-emerald-800 font-bold text-[10px]"
                      >
                        {sn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Delivery Tracking Controls */}
              {canDispatch && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">Delivery Status Controls:</span>
                  <div className="flex items-center gap-1.5">
                    {!isDelivered && (
                      <>
                        {!isOutForDelivery && (
                          <button
                            onClick={() => handleUpdateStatus(d._id, 'Out for Delivery')}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                          >
                            <Navigation className="w-3 h-3" /> Mark Out for Delivery
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(d._id, 'Delivered')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Confirm Delivered
                        </button>
                      </>
                    )}
                    {isDelivered && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered on Site (Ready for Installation)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: DISPATCH ORDER TO CUSTOMER */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Dispatch Solar Materials & Equipment to Customer"
        size="lg"
      >
        <form onSubmit={handleCreateDispatch} className="space-y-4 text-xs">
          {/* Order Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Customer Order to Dispatch *</label>
            <select
              value={dispatchForm.orderId}
              onChange={(e) => {
                const ord = orders.find((o) => o._id === e.target.value);
                setSelectedOrder(ord);
                setDispatchForm({
                  ...dispatchForm,
                  orderId: e.target.value,
                  inverterSerial: ord ? `INV-${ord.capacityKw || 3}KW-8842` : 'INV-3KW-8842',
                  panelBatch: `PAN-PERC-${ord?.capacityKw || 3}KW-BOM`
                });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Choose an Order Ready for Dispatch --</option>
              {orders.map((ord) => (
                <option key={ord._id} value={ord._id}>
                  {ord.orderNumber} • {ord.customerName} ({ord.capacityKw}kW {ord.systemType}) - Status: {ord.status}
                </option>
              ))}
            </select>
          </div>

          {selectedOrder && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Selected Destination Site</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedOrder.customerName}</p>
              <p className="text-slate-600 text-[11px] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-rose-500" /> {selectedOrder.customerAddress}
              </p>
              <p className="text-blue-900 font-semibold text-[11px] mt-1">
                System: {selectedOrder.capacityKw} kW {selectedOrder.systemType} • Order Total: ₹{(selectedOrder.netPayable || selectedOrder.totalAmount).toLocaleString('en-IN')}
              </p>
            </div>
          )}

          {/* Vehicle and Driver Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dispatch Vehicle No. *</label>
              <input
                type="text"
                required
                value={dispatchForm.vehicleNo}
                onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Driver Name *</label>
              <input
                type="text"
                required
                value={dispatchForm.driverName}
                onChange={(e) => setDispatchForm({ ...dispatchForm, driverName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Driver Phone *</label>
              <input
                type="text"
                required
                value={dispatchForm.driverPhone}
                onChange={(e) => setDispatchForm({ ...dispatchForm, driverPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Serial Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Inverter Serial Number <span className="text-[10px] text-slate-400">(Barcode Scanned)</span>
              </label>
              <input
                type="text"
                value={dispatchForm.inverterSerial}
                onChange={(e) => setDispatchForm({ ...dispatchForm, inverterSerial: e.target.value })}
                placeholder="e.g. INV-3KW-8842"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-emerald-800 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Solar PV Modules Batch Code
              </label>
              <input
                type="text"
                value={dispatchForm.panelBatch}
                onChange={(e) => setDispatchForm({ ...dispatchForm, panelBatch: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Battery Bank Serials <span className="text-[10px] text-slate-400">(If Off-Grid / Hybrid)</span>
            </label>
            <input
              type="text"
              value={dispatchForm.batterySerials}
              onChange={(e) => setDispatchForm({ ...dispatchForm, batterySerials: e.target.value })}
              placeholder="e.g. BAT-150-5501, BAT-150-5502"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transit & Packaging Notes</label>
            <textarea
              rows={2}
              value={dispatchForm.notes}
              onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDispatchModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" /> Dispatch Materials & Assign Crew
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DispatchList;