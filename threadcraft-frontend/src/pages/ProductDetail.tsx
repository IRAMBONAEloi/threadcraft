import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productsApi } from '../api/products';
import TeeViewer from '../components/TeeViewer';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await productsApi.getOne(slug as string);
        setProduct(data);
        if (data.variants.length > 0) {
          setSelectedColor(data.variants[0].color);
          setSelectedVariant(data.variants[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-bg text-white flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen bg-bg text-white flex items-center justify-center">Product not found.</div>;

  // Extract unique colors and sizes
  const uniqueColors = Array.from(new Set(product.variants.map((v: any) => v.color)));
  const sizesForColor = product.variants.filter((v: any) => v.color === selectedColor);

  return (
    <div className="min-h-screen bg-bg pt-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Left: 3D Viewer */}
        <div className="h-[500px] bg-card rounded-2xl border border-gray-800 relative overflow-hidden">
            <div className="absolute inset-0">
          <TeeViewer ink="#8B6BFF" color= "#111111" draggable={true}/>
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center font-mono text-xs text-text-dim uppercase tracking-widest pointer-events-none">
            ⟲ Drag to rotate
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="py-8">
          <p className="font-mono text-sm text-coral uppercase mb-2">{product.category.name}</p>
          <h1 className="font-sora font-bold text-4xl mb-4">{product.name}</h1>
          <p className="font-mono text-2xl text-mint mb-6">
            {Number(product.basePrice).toLocaleString()} RWF
          </p>
          <p className="text-text-dim mb-8 leading-relaxed">{product.description}</p>

          {/* Color Picker */}
          <div className="mb-6">
            <h3 className="font-mono text-sm text-text-faint uppercase mb-3">Color</h3>
            <div className="flex gap-2">
              {uniqueColors.map((color: any) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    const firstVariant = product.variants.find((v: any) => v.color === color);
                    if (firstVariant) setSelectedVariant(firstVariant);
                  }}
                  className={`px-4 py-2 border rounded-lg font-mono text-sm transition-all ${
                    selectedColor === color 
                      ? 'border-violet bg-violet/10 text-violet' 
                      : 'border-gray-700 text-text-dim hover:border-gray-500'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Picker */}
          <div className="mb-8">
            <h3 className="font-mono text-sm text-text-faint uppercase mb-3">Size</h3>
            <div className="flex gap-2">
              {sizesForColor.map((variant: any) => (
                <button
                  key={variant.id}
                  disabled={variant.currentStock === 0}
                  onClick={() => setSelectedVariant(variant)}
                  className={`w-12 h-12 border rounded-lg font-mono text-sm transition-all ${
                    selectedVariant?.id === variant.id 
                      ? 'border-violet bg-violet text-white' 
                      : variant.currentStock === 0
                      ? 'border-gray-800 text-gray-700 cursor-not-allowed line-through'
                      : 'border-gray-700 text-text-dim hover:border-gray-500'
                  }`}
                >
                  {variant.size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock & Add to Cart */}
          <p className="text-sm text-text-dim mb-4">
            {selectedVariant?.currentStock > 0 
              ? `${selectedVariant.currentStock} items in stock` 
              : 'Out of stock'}
          </p>
          <button 
            disabled={!selectedVariant || selectedVariant.currentStock === 0 || isAdding}
            onClick={async () => {
                if(!selectedVariant) return;
                setIsAdding(true);
                try{
                    await addToCart (selectedVariant.id, 1);
                }catch(err) {
                    console.error(err);
                }finally {
                    setIsAdding(false);
                }
            }}

            className="w-full bg-violet hover:bg-violet/90 disabled:bg-gray-800 disabled:text-gray-600 text-white font-semibold py-4 rounded-lg transition-colors"
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}