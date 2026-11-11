import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  images: string[];
  category: { name: string; slug: string };
  variants: { currentStock: number; color: string }[];
}

export default function ProductCard({ product }: { product: Product }) {
  const totalStock = product.variants.reduce((sum, v) => sum + v.currentStock, 0);
  const isOutOfStock = totalStock === 0;
  
  // Get unique colors for the little dots
  const uniqueColors = Array.from(new Set(product.variants.map(v => v.color)));

  return (
    <Link 
      to={`/product/${product.slug}`} 
      className="group relative flex flex-col bg-card rounded-2xl overflow-hidden border border-white/5 hover:border-violet/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet/10"
    >
      {/* Media Area */}
      <div className="aspect-[4/5] relative flex items-center justify-center bg-gradient-to-b from-[#1C1B22] to-[#141318] p-6 overflow-hidden">
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-violet/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Placeholder for 3D Tee (Using a stylized shirt shape for now) */}
        <div className="w-32 h-32 relative z-10 text-white/20 group-hover:text-violet/60 transition-colors duration-500">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H5v10a1 1 0 001 1h12a1 1 0 001-1V10h1.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
          </svg>
        </div>

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute top-4 right-4 bg-coral/20 text-coral text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-md border border-coral/20">
            Out of Stock
          </span>
        ) : (
          <span className="absolute top-4 right-4 bg-mint/10 text-mint text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-md border border-mint/20">
            In Stock
          </span>
        )}
      </div>

      {/* Info Area */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="text-[10px] font-mono text-text-faint uppercase tracking-widest mb-2">
          {product.category.name}
        </div>
        <h3 className="font-sora font-bold text-lg text-white mb-3 group-hover:text-violet transition-colors">
          {product.name}
        </h3>
        
        <div className="mt-auto flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-text-faint uppercase tracking-widest mb-1">Price</span>
            <span className="font-mono text-mint text-sm">
              {Number(product.basePrice).toLocaleString()} RWF
            </span>
          </div>
          
          {/* Color Dots */}
          <div className="flex gap-1.5">
            {uniqueColors.slice(0, 3).map((color, i) => (
              <div 
                key={i} 
                className="w-3 h-3 rounded-full border border-white/20"
                style={{ backgroundColor: color.toLowerCase() === 'bone' ? '#F3F1FA' : color.toLowerCase() === 'violet' ? '#8B6BFF' : color.toLowerCase() === 'coral' ? '#FF6B4A' : color.toLowerCase() === 'mint' ? '#3EE3A6' : '#1A1A1A' }}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}