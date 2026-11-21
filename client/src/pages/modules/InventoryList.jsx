import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import { PackageCheck, Barcode, AlertTriangle, Search } from 'lucide-react';

const InventoryList = () => {
  const [products, setProducts] = useState([]);
  const [serials, setSerials] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          api.get('/inventory/products'),
          api.get('/inventory/serials')
        ]);
        if (pRes.data.success) setProducts(pRes.data.products);
        if (sRes.data.success) setSerials(sRes.data.serials);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSerials = serials.filter(s =>
    s.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Warehouse & Stock Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock monitoring, reorder thresholds, and serialized equipment tracking.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'products' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}
          >
            Catalog Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('serials')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'serials' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}
          >
            Serial Barcodes ({serials.length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="mb-4 max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment or serial barcodes..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {activeTab === 'products' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Brand / Model</th>
                  <th className="py-3 px-3">Cost Price</th>
                  <th className="py-3 px-3">Selling Price</th>
                  <th className="py-3 px-3">Stock Available</th>
                  <th className="py-3 px-3">Min Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((p) => {
                  const isLow = Number(p.currentStock) <= Number(p.minStockAlert);
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{p.brand} ({p.model})</td>
                      <td className="py-3 px-3">₹{p.unitCost?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-semibold">₹{p.unitSellingPrice?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3">
                        <span className={`font-extrabold ${isLow ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {p.currentStock} {p.category === 'Wire/Cable' ? 'meters' : 'Units'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{p.minStockAlert}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Serial Number</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Customer Allocated</th>
                  <th className="py-3 px-3">Warranty Protection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSerials.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{s.serialNumber}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{s.productName}</td>
                    <td className="py-3 px-3 text-slate-500">{s.category}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3 px-3 text-slate-600">{s.customerName || 'In Warehouse'}</td>
                    <td className="py-3 px-3 font-semibold text-emerald-700">{s.warrantyYears || 5} Years</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryList;
