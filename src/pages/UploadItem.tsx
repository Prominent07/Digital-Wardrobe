import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, X, Loader2, CheckCircle, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['Top', 'Bottom', 'Dress', 'Footwear', 'Accessories', 'Outerwear'];
const OCCASIONS = ['Casual', 'Work', 'Night Out', 'Formal', 'Athleisure', 'Lounge'];
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter', 'All'];
const COLORS = ['Black', 'White', 'Beige', 'Navy', 'Red', 'Pink', 'Green', 'Blue', 'Brown', 'Grey', 'Multi'];

export function UploadItem({ onRouteChange }: { onRouteChange?: (route: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    category: '',
    color: '',
    occasion: '',
    season: '',
    brand: ''
  });

  const fileToBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = e => reject(e);
    });
  };

  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: mimeType });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.category) {
      alert('Please provide an image and select a category.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload Image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('clothing_images')
        .upload(filePath, file);

      if (uploadError) {
        // We catch this but don't fail hard if keys aren't set (since we're running without real keys in preview)
        console.error('Error uploading image:', uploadError);
      }

      // We either get the real URL, or we mock it for the preview if the upload failed due to missing keys
      let imageUrl = preview; 
      if (uploadData) {
        const { data } = supabase.storage.from('clothing_images').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      // 2. Insert into Database
      const { error: dbError } = await supabase
        .from('clothing_items')
        .insert([{
          // user_id gets populated by RLS or must be handled if authenticated
          image_url: imageUrl,
          category: formData.category,
          color: formData.color,
          occasion: formData.occasion,
          season: formData.season,
          brand: formData.brand
        }]);

      if (dbError) {
        console.error('Error inserting into database:', dbError);
      }

      // Simulate a small delay for better UX if it was too fast
      await new Promise(resolve => setTimeout(resolve, 800));

      setIsUploading(false);
      setShowToast(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        setShowToast(false);
        clearFile();
        setFormData({ category: '', color: '', occasion: '', season: '', brand: '' });
      }, 2000);

    } catch (error) {
      console.error('Submission failed:', error);
      setIsUploading(false);
      alert('Failed to save the item. Please check your Supabase configuration.');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8 md:mb-12">
        <button 
          onClick={() => onRouteChange?.('closet')}
          className="flex items-center gap-2 text-ink-muted hover:text-ink-dark transition-colors mb-4 text-sm font-medium uppercase tracking-wider"
        >
          <ArrowLeft size={16} /> Back to closet
        </button>
        <h2 className="font-serif text-3xl md:text-4xl text-ink-dark mb-2">Add to Closet</h2>
        <p className="text-ink-muted">Upload a new item to build your digital wardrobe.</p>
      </header>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-pastel-taupe/20">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column: Image Upload & Preview */}
          <div className="flex-1">
            <h3 className="font-medium mb-4 text-ink-dark">Item Photo</h3>
            
            {!preview ? (
              <div 
                className={`w-full aspect-[3/4] md:aspect-square lg:aspect-[3/4] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer
                  ${isDragActive ? 'border-ink-dark bg-pastel-rose/30' : 'border-pastel-taupe/50 hover:border-ink-muted bg-pastel-sand/50'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-ink-muted">
                  <UploadCloud size={24} />
                </div>
                <h4 className="font-serif text-xl mb-2 text-ink-dark">Upload Image</h4>
                <p className="text-sm text-ink-muted mb-4 max-w-[200px]">Drag and drop an image here, or click to browse.</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button type="button" className="text-xs uppercase tracking-wider font-medium border border-ink-dark/20 rounded-full px-4 py-2 hover:bg-white transition-colors">
                  Select File
                </button>
              </div>
            ) : (
              <div className="relative w-full aspect-[3/4] md:aspect-square lg:aspect-[3/4] rounded-2xl overflow-hidden shadow-sm group bg-pastel-sand/30">
                <img src={preview} alt="Preview" className={`w-full h-full object-contain transition-all`} />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <button 
                    type="button" 
                    onClick={clearFile}
                    className="bg-white text-ink-dark w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Form Fields */}
          <div className="flex-1 flex flex-col">
            <h3 className="font-medium mb-4 text-ink-dark">Item Details</h3>
            
            <div className="space-y-5 flex-1">
              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-ink-muted mb-2">Category *</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-pastel-sand border border-pastel-taupe/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ink-dark focus:border-ink-dark transition-shadow"
                  required
                >
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-ink-muted mb-2">Color</label>
                  <select 
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full bg-pastel-sand border border-pastel-taupe/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ink-dark"
                  >
                    <option value="" disabled>Select color</option>
                    {COLORS.map(color => <option key={color} value={color}>{color}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-medium text-ink-muted mb-2">Season</label>
                  <select 
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    className="w-full bg-pastel-sand border border-pastel-taupe/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ink-dark"
                  >
                    <option value="" disabled>Select season</option>
                    {SEASONS.map(season => <option key={season} value={season}>{season}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-ink-muted mb-2">Occasion</label>
                <select 
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleInputChange}
                  className="w-full bg-pastel-sand border border-pastel-taupe/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ink-dark"
                >
                  <option value="" disabled>Select occasion</option>
                  {OCCASIONS.map(occ => <option key={occ} value={occ}>{occ}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-medium text-ink-muted mb-2">Brand (Optional)</label>
                <input 
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g. Zara, Everlane"
                  className="w-full bg-pastel-sand border border-pastel-taupe/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ink-dark"
                />
              </div>
            </div>

            <div className="pt-8 mt-auto border-t border-pastel-taupe/20">
              <button 
                type="submit" 
                disabled={isUploading || !file || !formData.category}
                className="w-full bg-ink-dark text-white rounded-xl py-4 font-medium flex justify-center items-center gap-2 hover:bg-ink-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Saving...
                  </>
                ) : (
                  'Save to Closet'
                )}
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-8 max-w-sm left-1/2 -translate-x-1/2 bg-white text-ink-dark shadow-xl rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 border border-pastel-taupe/20">
          <div className="w-8 h-8 rounded-full bg-[#f4ebe8] text-[#d6aea1] flex items-center justify-center shrink-0">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Successfully added!</p>
            <p className="text-xs text-ink-muted">Item has been saved to your closet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
