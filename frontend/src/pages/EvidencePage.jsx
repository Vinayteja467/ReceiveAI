import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  ShieldCheck, 
  ExternalLink, 
  Trash2, 
  Eye, 
  Boxes, 
  Tag, 
  Package, 
  DoorOpen 
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { evidenceApi, inspectionsApi } from '../services/api';

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Evidence' },
  { id: 'CARTONS', label: 'Cartons' },
  { id: 'PRODUCTS', label: 'Products' },
  { id: 'LABELS', label: 'Labels' },
  { id: 'PACKAGING', label: 'Packaging' },
  { id: 'RECEIVING_AREA', label: 'Receiving Area' },
];

export default function EvidencePage() {
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    loadEvidence();
  }, [categoryFilter]);

  const loadEvidence = async () => {
    try {
      setLoading(true);
      const data = await evidenceApi.list({ category: categoryFilter });
      setEvidenceList(data);
    } catch (err) {
      console.error("Failed to load evidence:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Remove this evidence photograph?")) return;
    try {
      await evidenceApi.delete(id);
      setEvidenceList(prev => prev.filter(ev => ev.id !== id));
    } catch (err) {
      alert("Failed to delete evidence.");
    }
  };

  const filtered = evidenceList.filter(ev => {
    const q = search.toLowerCase();
    return (
      ev.file_name.toLowerCase().includes(q) ||
      ev.caption?.toLowerCase().includes(q) ||
      ev.category?.toLowerCase().includes(q) ||
      ev.po_number?.toLowerCase().includes(q) ||
      ev.inspection_number?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-[0_0_12px_rgba(255,87,34,0.35)]'
                  : 'bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filename, category, or PO..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#121217] border border-white/[0.1] text-white placeholder-neutral-500 focus:border-orange-500 rounded-xl focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Evidence Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-neutral-400 bg-[#0e0e13]/85 backdrop-blur-xl rounded-2xl border border-white/[0.08] animate-pulse">
            Loading receiving evidence files...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-8 text-center text-neutral-400 bg-[#0e0e13]/85 backdrop-blur-xl rounded-2xl border border-white/[0.08]">
            No evidence photographs found matching category "{categoryFilter}".
          </div>
        ) : (
          filtered.map(ev => (
            <div 
              key={ev.id} 
              className="bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl hover:border-orange-500/40 hover:shadow-[0_0_25px_rgba(255,87,34,0.12)] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Visual Thumbnail with Overlay */}
                <div 
                  className="h-36 bg-black/40 relative overflow-hidden cursor-pointer border-b border-white/[0.06]"
                  onClick={() => setZoomImage(ev.url || ev.file_path)}
                >
                  <img
                    src={ev.url || ev.file_path}
                    alt={ev.file_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="h-full flex items-center justify-center text-neutral-500 text-xs">Photo Preview</div>';
                    }}
                  />

                  {/* Category Pill */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/[0.12] shadow-lg">
                      {ev.category || 'RECEIVING'}
                    </span>
                  </div>

                  {/* Zoom Icon Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Eye className="w-5 h-5 drop-shadow" />
                  </div>
                </div>

                <div className="p-3.5 space-y-1.5">
                  <p className="font-bold text-white text-xs truncate" title={ev.file_name}>
                    {ev.file_name}
                  </p>

                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {ev.caption || 'Receiving photograph stored.'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                    <span>{ev.po_number || 'General Inbound'}</span>
                    <span>{(ev.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-3.5 py-2 bg-black/30 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setZoomImage(ev.url || ev.file_path)}
                  className="font-bold text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Inspect Photo
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDelete(ev.id, e)}
                  className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-500/20 rounded transition-colors"
                  title="Delete evidence"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox Zoom Modal */}
      <Modal
        isOpen={!!zoomImage}
        onClose={() => setZoomImage(null)}
        title="Evidence Photographic Proof View"
        maxWidth="max-w-4xl"
      >
        <div className="flex items-center justify-center p-2 bg-black/90 border border-white/[0.1] rounded-xl overflow-hidden">
          <img
            src={zoomImage}
            alt="Evidence zoom"
            className="max-h-[75vh] object-contain rounded-lg"
          />
        </div>
      </Modal>
    </div>
  );
}
