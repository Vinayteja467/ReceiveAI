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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-[0_0_12px_rgba(255,87,34,0.35)]'
                  : 'bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU, name, or variant..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#121217] border border-white/[0.1] text-white placeholder-neutral-500 focus:border-orange-500 rounded-xl focus:outline-none transition-colors"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,87,34,0.35)] whitespace-nowrap transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-neutral-400 bg-[#0e0e13]/85 backdrop-blur-xl rounded-2xl border border-white/[0.08] animate-pulse">
            Loading products catalog...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center text-neutral-400 bg-[#0e0e13]/85 backdrop-blur-xl rounded-2xl border border-white/[0.08]">
            No products found matching criteria.
          </div>
        ) : (
          filtered.map(product => (
            <div 
              key={product.id} 
              onClick={() => setSelectedProduct(product)}
              className="bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl hover:border-orange-500/40 hover:shadow-[0_0_25px_rgba(255,87,34,0.12)] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Visual Thumbnail & Badge */}
                <div className="h-40 bg-black/40 relative overflow-hidden flex items-center justify-center border-b border-white/[0.06]">
                  {product.reference_image ? (
                    <img
                      src={product.reference_image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="text-neutral-600 text-center"><svg class="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg></div>';
                      }}
                    />
                  ) : (
                    <Package className="w-10 h-10 text-neutral-600" />
                  )}

                  <div className="absolute top-2.5 left-2.5">
                    <span className="font-mono text-[11px] font-bold text-white bg-black/80 backdrop-blur-md border border-white/[0.12] px-2.5 py-0.5 rounded-full shadow-lg">
                      {product.sku}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[10px] font-bold text-orange-400 bg-orange-500/15 backdrop-blur-md border border-orange-500/30 px-2.5 py-0.5 rounded-full shadow-lg">
                      {product.units_per_carton || 12}/ctn
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-1 text-[11px] text-neutral-400">
                    <span className="truncate">{product.category}</span>
                    <span className="font-semibold text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                      {product.variant || 'Standard'}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm leading-snug group-hover:text-orange-400 transition-colors">
                    {product.name}
                  </h4>

                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Packaging & Weight */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1 font-mono text-neutral-300">
                      <Barcode className="w-3.5 h-3.5 text-neutral-500" /> {product.barcode || 'No barcode'}
                    </span>
                    <span className="font-medium text-neutral-300">
                      {product.weight_kg} kg
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 py-2.5 bg-black/30 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">
                  AQL Sample: <strong className="text-neutral-200">{product.sampling_rate_pct}%</strong>
                </span>
                <span className="font-semibold text-orange-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
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
              <label className="font-semibold text-neutral-300 block mb-1.5">SKU Identifier</label>
              <input
                required
                placeholder="e.g. BLUE-BOTTLE-001"
                value={newProduct.sku}
                onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-300 block mb-1.5">Variant / Color</label>
              <input
                required
                placeholder="e.g. Blue, Matte Black, 32oz"
                value={newProduct.variant}
                onChange={e => setNewProduct({...newProduct, variant: e.target.value})}
                className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-300 block mb-1.5">Product Name</label>
            <input
              required
              placeholder="e.g. Premium Water Bottle"
              value={newProduct.name}
              onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-300 block mb-1.5">Category</label>
              <select
                value={newProduct.category}
                onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white focus:border-orange-500 focus:outline-none transition-colors"
              >
                <option className="bg-[#121217] text-white">Beverageware & Hydration</option>
                <option className="bg-[#121217] text-white">Industrial Electronics</option>
                <option className="bg-[#121217] text-white">Biomedical / Cold Chain</option>
                <option className="bg-[#121217] text-white">Automotive Hardware</option>
                <option className="bg-[#121217] text-white">Consumer Goods</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-neutral-300 block mb-1.5">Units per Carton</label>
              <input
                type="number"
                min="1"
                required
                value={newProduct.units_per_carton}
                onChange={e => setNewProduct({...newProduct, units_per_carton: parseInt(e.target.value, 10) || 12})}
                className="w-full border border-orange-500/30 rounded-xl p-2.5 bg-orange-500/10 font-bold text-orange-400 text-center focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-300 block mb-1.5">
              Required Components (Checklist items separated by comma)
            </label>
            <input
              placeholder="e.g. Stainless Steel Insulated Cap, Silicone Seal Ring, Carabiner Clip"
              value={newProduct.required_components}
              onChange={e => setNewProduct({...newProduct, required_components: e.target.value})}
              className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="font-semibold text-neutral-300 block mb-1.5">Reference Image URL</label>
            <input
              placeholder="https://example.com/images/blue-bottle.jpg"
              value={newProduct.reference_image}
              onChange={e => setNewProduct({...newProduct, reference_image: e.target.value})}
              className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-300 block mb-1.5">Barcode (UPC / EAN)</label>
              <input
                placeholder="0810024810924"
                value={newProduct.barcode}
                onChange={e => setNewProduct({...newProduct, barcode: e.target.value})}
                className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white font-mono placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-300 block mb-1.5">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.weight_kg}
                onChange={e => setNewProduct({...newProduct, weight_kg: parseFloat(e.target.value) || 0.5})}
                className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-white/[0.08] rounded-xl text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(255,87,34,0.35)] transition-all"
            >
              Save Product SKU
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
