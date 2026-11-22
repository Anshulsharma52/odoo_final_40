import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  FileSpreadsheet,
  Download,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Send,
  Save,
  Percent,
  Layers,
  Wrench,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuotationsList = () => {
  const { user } = useAuth();
  const role = user?.role || 'Admin';
  const canEdit = role === 'Admin' || role === 'Sales' || role === 'Director';

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedQuoteForView, setSelectedQuoteForView] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedQuoteForEdit, setSelectedQuoteForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    items: [],
    discount: 0,
    subsidyAmount: 0,
    notes: ''
  });

  const fetchQuotations = async () => {
    try {
      const res = await api.get('/quotations');
      if (res.data.success) setQuotations(res.data.quotations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const res = await api.post(`/quotations/${id}/respond`, { action });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchQuotations();
      }
    } catch (err) {
      toast.error('Failed to update quotation');
    }
  };

  const handleOpenView = (quote) => {
    setSelectedQuoteForView(quote);
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (quote) => {
    setSelectedQuoteForEdit(quote);
    setEditFormData({
      items: (quote.items || []).map((it) => ({
        name: it.name || 'Component',
        category: it.category || 'Equipment',
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
        serialRequired: Boolean(it.serialRequired)
      })),
      discount: Number(quote.discount) || 0,
      subsidyAmount: Number(quote.subsidyAmount) || 0,
      notes: quote.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...editFormData.items];
    const item = { ...updated[index] };

    if (field === 'quantity' || field === 'unitPrice') {
      const numVal = Math.max(0, Number(value) || 0);
      item[field] = numVal;
      item.total = (field === 'quantity' ? numVal : item.quantity) * (field === 'unitPrice' ? numVal : item.unitPrice);
    } else {
      item[field] = value;
    }

    updated[index] = item;
    setEditFormData({ ...editFormData, items: updated });
  };

  const handleAddItem = () => {
    setEditFormData({
      ...editFormData,
      items: [
        ...editFormData.items,
        {
          name: 'Additional Hardware / Protection Gear',
          category: 'Balance of System',
          quantity: 1,
          unitPrice: 3500,
          total: 3500,
          serialRequired: false
        }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    const updated = editFormData.items.filter((_, idx) => idx !== index);
    setEditFormData({ ...editFormData, items: updated });
  };

  const handleSaveQuotation = async (e) => {
    e.preventDefault();
    if (!selectedQuoteForEdit) return;

    try {
      const res = await api.put(`/quotations/${selectedQuoteForEdit._id}`, editFormData);
      if (res.data.success) {
        toast.success('Quotation and component prices updated in MongoDB!');
        setIsEditModalOpen(false);
        fetchQuotations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quotation');
    }
  };

  const filteredQuotes = quotations.filter((q) => {
    const term = searchTerm.toLowerCase();
    return (
      (q.quotationNumber || '').toLowerCase().includes(term) ||
      (q.customerName || '').toLowerCase().includes(term) ||
      (q.customerPhone || '').toLowerCase().includes(term) ||
      (q.systemType || '').toLowerCase().includes(term)
    );
  });

  const componentsSubtotal = editFormData.items.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const netPayable = Math.max(0, componentsSubtotal - Number(editFormData.discount || 0) - Number(editFormData.subsidyAmount || 0));
  const advanceRequired = Math.round(netPayable * 0.2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Solar Quotations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Certified quotes generated from predefined BOM package templates with independent component pricing & DBT subsidy deductions.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quote, customer, phone..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-3">Quotation #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">System / Capacity</th>
                <th className="py-3 px-3">Gross Total</th>
                <th className="py-3 px-3">DBT Subsidy</th>
                <th className="py-3 px-3">Net Customer Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredQuotes.map((q) => (
                <tr key={q._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{q.quotationNumber}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800 block">{q.customerName}</span>
                    <span className="text-[11px] text-slate-400">{q.customerPhone}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-emerald-800">{q.capacityKw} kW</span>
                    <span className="text-[11px] text-slate-400 block">{q.systemType}</span>
                  </td>
                  <td className="py-3 px-3">₹{(q.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-emerald-600 font-medium">-₹{(q.subsidyAmount || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 font-extrabold text-slate-900">₹{(q.netPayable || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={q.status} />
                  </td>
                  <td className="py-3 px-3 text-right space-x-1.5">
                    <button
                      onClick={() => handleOpenView(q)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg inline-flex items-center gap-1"
                      title="Inspect Quotation BOM"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    {canEdit && (
                      <button
                        onClick={() => handleOpenEdit(q)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg inline-flex items-center gap-1"
                        title="Edit Component Prices & Subsidy"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Prices</span>
                      </button>
                    )}

                    {q.status === 'Sent' && (
                      <>
                        <button
                          onClick={() => handleAction(q._id, 'accept')}
                          className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 inline-flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" /> Accept
                        </button>
                        <button
                          onClick={() => handleAction(q._id, 'reject')}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 font-semibold rounded-lg hover:bg-rose-100"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {q.status === 'Accepted' && (
                      <span className="text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Order Confirmed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: VIEW QUOTATION BOM BREAKDOWN */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Quotation Inspection: ${selectedQuoteForView?.quotationNumber || ''}`}
        size="lg"
      >
        <div className="space-y-4 text-xs max-h-[80vh] overflow-y-auto pr-1">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-mono text-slate-500 font-bold block">{selectedQuoteForView?.quotationNumber}</span>
              <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                {selectedQuoteForView?.customerName} • {selectedQuoteForView?.capacityKw} kW {selectedQuoteForView?.systemType}
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">{selectedQuoteForView?.customerAddress}</p>
            </div>
            <StatusBadge status={selectedQuoteForView?.status} />
          </div>

          {/* Component Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 font-bold text-slate-800">
              Quoted Components Bill of Materials
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Component Name</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price (₹)</th>
                    <th className="py-2 px-3 text-right">Subtotal (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedQuoteForView?.items || []).map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{it.name}</td>
                      <td className="py-2 px-3 text-slate-500">{it.category}</td>
                      <td className="py-2 px-3 text-center font-bold">{it.quantity}</td>
                      <td className="py-2 px-3 text-right">₹{(it.unitPrice || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ₹{((it.quantity || 1) * (it.unitPrice || 0)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Gross Component Value:</span>
              <span className="font-semibold text-slate-800">₹{(selectedQuoteForView?.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Special Promotional Discount:</span>
              <span className="font-semibold text-rose-600">-₹{(selectedQuoteForView?.discount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Government Subsidy (DBT):</span>
              <span className="font-semibold text-emerald-600">-₹{(selectedQuoteForView?.subsidyAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
              <span className="text-slate-900">Net Customer Payable:</span>
              <span className="text-emerald-700 text-base">₹{(selectedQuoteForView?.netPayable || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
              <span>Booking Advance Required (20%):</span>
              <span className="font-semibold text-slate-800">₹{(selectedQuoteForView?.advanceRequired || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: EDIT QUOTATION & INDEPENDENT COMPONENT PRICES */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Quotation & Component Prices: ${selectedQuoteForEdit?.quotationNumber || ''}`}
        size="xl"
      >
        <form onSubmit={handleSaveQuotation} className="space-y-4 text-xs max-h-[82vh] overflow-y-auto pr-1">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-blue-950 text-sm">{selectedQuoteForEdit?.customerName}</p>
              <p className="text-[11px] text-blue-700">
                {selectedQuoteForEdit?.capacityKw} kW {selectedQuoteForEdit?.systemType} System
              </p>
            </div>
            <span className="px-2.5 py-1 bg-blue-200 text-blue-900 font-bold rounded-lg text-xs">
              Admin & Sales Price Overrides
            </span>
          </div>

          {/* Independent Component Price Editor Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-800">Itemized Components & Independent Prices</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3 h-3" /> Add Component
              </button>
            </div>

            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 text-slate-600 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Component / Equipment</th>
                    <th className="py-2 px-2">Category</th>
                    <th className="py-2 px-2 text-center w-20">Qty</th>
                    <th className="py-2 px-2 text-right w-32">Unit Price (₹)</th>
                    <th className="py-2 px-3 text-right w-28">Total (₹)</th>
                    <th className="py-2 px-2 text-center w-12">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {editFormData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={item.category}
                          onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                          className="w-full px-1.5 py-1.5 border border-slate-200 rounded text-xs text-slate-700 focus:ring-1 focus:ring-emerald-500 outline-none"
                        >
                          <option value="Solar Panel">Solar Panel</option>
                          <option value="Inverter">Inverter</option>
                          <option value="Structure">Structure</option>
                          <option value="Battery">Battery</option>
                          <option value="Balance of System">BOS / Electrical</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-16 px-1.5 py-1.5 border border-slate-200 rounded text-xs text-center font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-28 px-2 py-1.5 border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none text-right font-mono"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 font-mono">
                        ₹{(item.total || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600">Total Hardware Components (BOM):</span>
              <span className="font-extrabold text-sm text-slate-900 font-mono">₹{componentsSubtotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Subsidy & Discount Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Special Promotional Discount (₹)</label>
              <input
                type="number"
                min="0"
                value={editFormData.discount}
                onChange={(e) => setEditFormData({ ...editFormData, discount: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Government Subsidy (DBT) (₹)
              </label>
              <input
                type="number"
                min="0"
                value={editFormData.subsidyAmount}
                onChange={(e) => setEditFormData({ ...editFormData, subsidyAmount: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/30 font-bold text-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />

              {/* Quick subsidy presets */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                <button
                  type="button"
                  onClick={() => setEditFormData({ ...editFormData, subsidyAmount: 78000 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-700 font-semibold"
                >
                  ₹78k (3kW+)
                </button>
                <button
                  type="button"
                  onClick={() => setEditFormData({ ...editFormData, subsidyAmount: 60000 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-700 font-semibold"
                >
                  ₹60k (2kW)
                </button>
                <button
                  type="button"
                  onClick={() => setEditFormData({ ...editFormData, subsidyAmount: 30000 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-700 font-semibold"
                >
                  ₹30k (1kW)
                </button>
                <button
                  type="button"
                  onClick={() => setEditFormData({ ...editFormData, subsidyAmount: 0 })}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-rose-100 text-slate-700 font-semibold"
                >
                  ₹0 (None)
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Recalculated Summary */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Gross Component Base Value:</span>
              <span className="font-semibold text-white font-mono">₹{componentsSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Special Promotional Rebate:</span>
              <span className="font-semibold text-rose-300 font-mono">-₹{Number(editFormData.discount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Direct Benefit Transfer (DBT) Subsidy:</span>
              <span className="font-semibold text-emerald-300 font-mono">-₹{Number(editFormData.subsidyAmount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-sm">
              <span className="font-bold text-amber-300">Net Customer Payable:</span>
              <span className="font-extrabold text-lg text-emerald-400 font-mono">₹{netPayable.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
              <span>20% Booking Commitment Advance:</span>
              <span className="font-bold text-amber-200 font-mono">₹{advanceRequired.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Guarantee & Warranty Notes</label>
            <textarea
              rows={2}
              value={editFormData.notes}
              onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save Quotation & Prices to MongoDB
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuotationsList;