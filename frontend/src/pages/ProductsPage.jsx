import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Boxes, 
  Barcode, 
  ThermometerSnowflake, 
  AlertOctagon, 
  ShieldAlert, 
  Plus, 
  Scale, 
  Ruler, 
  ExternalLink,
  Package,
  Layers
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ProductDetailsModal from '../components/products/ProductDetailsModal';
import { productsApi } from '../services/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Detail Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Add Product Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: 'Beverageware & Hydration',
    variant: 'Standard',
    units_per_carton: 12,
    required_components: 'Cap, Silicone Seal Ring',
    reference_image: '',
    barcode: '',
    weight_kg: 0.5,
    dimensions_cm: '10x10x25',
    unit_of_measure: 'EA',
    packaging_type: 'Corrugated Box',
    is_temperature_controlled: false,
    is_fragile: false,
    is_hazardous: false,
    sampling_rate_pct: 10.0,
    acceptable_defect_tolerance_pct: 1.0,
    inspection_notes: ''
  });

  useEffect(() => {
    loadProducts();
  }, [categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.list({ category: categoryFilter });
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await productsApi.create(newProduct);
      setShowAddModal(false);
      loadProducts();
      setNewProduct({
        sku: '',
        name: '',
        category: 'Beverageware & Hydration',
        variant: 'Standard',
        units_per_carton: 12,
        required_components: '',
        reference_image: '',
        barcode: '',
        weight_kg: 0.5,
        dimensions_cm: '10x10x25',
        unit_of_measure: 'EA',
        packaging_type: 'Corrugated Box',
        is_temperature_controlled: false,
        is_fragile: false,
        is_hazardous: false,
        sampling_rate_pct: 10.0,
        acceptable_defect_tolerance_pct: 1.0,
        inspection_notes: ''
      });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create product");
    }
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (
      p.sku.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.variant?.toLowerCase().includes(q) ||
      p.barcode?.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'Beverageware & Hydration', 'Industrial Electronics', 'Biomedical / Cold Chain', 'Automotive Hardware'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU, name, or variant..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 animate-pulse">
            Loading products catalog...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            No products found matching criteria.
          </div>
        ) : (
          filtered.map(product => (
            <div 
              key={product.id} 
              onClick={() => setSelectedProduct(product)}
              className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Visual Thumbnail & Badge */}
                <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                  {product.reference_image ? (
                    <img
                      src={product.reference_image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="text-slate-400 text-center"><svg class="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg></div>';
                      }}
                    />
                  ) : (
                    <Package className="w-10 h-10 text-slate-400" />
                  )}

                  <div className="absolute top-2.5 left-2.5">
                    <span className="font-mono text-[11px] font-bold text-slate-900 bg-white/95 backdrop-blur-xs border border-slate-200/80 px-2 py-0.5 rounded shadow-2xs">
                      {product.sku}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50/95 backdrop-blur-xs border border-indigo-200/80 px-2 py-0.5 rounded shadow-2xs">
                      {product.units_per_carton || 12}/ctn
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500">
                    <span className="truncate">{product.category}</span>
                    <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                      {product.variant || 'Standard'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Packaging & Weight */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 font-mono text-slate-700">
                      <Barcode className="w-3.5 h-3.5 text-slate-400" /> {product.barcode || 'No barcode'}
                    </span>
                    <span className="font-medium text-slate-700">
                      {product.weight_kg} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  AQL Sample: <strong className="text-slate-800">{product.sampling_rate_pct}%</strong>
                </span>
                <span className="font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Details &rarr;
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed Product Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product SKU"
        subtitle="Configure SKU, variants, carton packaging, and required components"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">SKU Identifier</label>
              <input
                required
                placeholder="e.g. BLUE-BOTTLE-001"
                value={newProduct.sku}
                onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Variant / Color</label>
              <input
                required
                placeholder="e.g. Blue, Matte Black, 32oz"
                value={newProduct.variant}
                onChange={e => setNewProduct({...newProduct, variant: e.target.value})}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Product Name</label>
            <input
              required
              placeholder="e.g. Premium Water Bottle"
              value={newProduct.name}
              onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              className="w-full border border-slate-300 rounded p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={newProduct.category}
                onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                className="w-full border border-slate-300 rounded p-2 bg-white"
              >
                <option>Beverageware & Hydration</option>
                <option>Industrial Electronics</option>
                <option>Biomedical / Cold Chain</option>
                <option>Automotive Hardware</option>
                <option>Consumer Goods</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Units per Carton</label>
              <input
                type="number"
                min="1"
                required
                value={newProduct.units_per_carton}
                onChange={e => setNewProduct({...newProduct, units_per_carton: parseInt(e.target.value, 10) || 12})}
                className="w-full border border-slate-300 rounded p-2 font-bold text-indigo-700"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Required Components (Checklist items separated by comma)
            </label>
            <input
              placeholder="e.g. Stainless Steel Insulated Cap, Silicone Seal Ring, Carabiner Clip"
              value={newProduct.required_components}
              onChange={e => setNewProduct({...newProduct, required_components: e.target.value})}
              className="w-full border border-slate-300 rounded p-2"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Reference Image URL</label>
            <input
              placeholder="https://example.com/images/blue-bottle.jpg"
              value={newProduct.reference_image}
              onChange={e => setNewProduct({...newProduct, reference_image: e.target.value})}
              className="w-full border border-slate-300 rounded p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Barcode (UPC / EAN)</label>
              <input
                placeholder="0810024810924"
                value={newProduct.barcode}
                onChange={e => setNewProduct({...newProduct, barcode: e.target.value})}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.weight_kg}
                onChange={e => setNewProduct({...newProduct, weight_kg: parseFloat(e.target.value) || 0.5})}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
            >
              Save Product SKU
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
