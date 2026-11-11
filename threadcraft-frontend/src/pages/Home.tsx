import { useEffect, useState } from 'react';
import { productsApi } from '../api/products';
import ProductCard from '../components/ProductCard';
import HighlightText from '../components/HighlightText';
import TeeViewer from '../components/TeeViewer';
//import { Link } from 'react-router-dom';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const heroProducts = products.slice(0, 4); // Show first 4 products in hero section


  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await productsApi.getAll();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);
  useEffect(()=> {
  if(heroProducts.length === 0) return;


  const interval = setInterval (() => {
    setHeroIndex((prev) => (prev + 1) % heroProducts.length);
  }, 5000);


  return () => clearInterval(interval);
}, [heroProducts.length]);




  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-text-dim font-mono">Loading collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-coral font-mono">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
           {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Text */}
          <div className="text-center lg:text-left">
            <p className="font-mono text-sm text-text-dim uppercase tracking-widest mb-4">
              Season 04 — Small Batch Run
            </p>
            <h1 className="font-sora font-extrabold text-5xl md:text-7xl mb-6 text-white">
              Wear the <br />
              <HighlightText color="#8B6BFF">next drop</HighlightText> <br />
              first.
            </h1>
            <p className="text-text-dim max-w-md mx-auto lg:mx-0 mb-10 text-lg">
              Original graphics, printed in tiny runs and shipped from one studio.
            </p>
            
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <button className="bg-white text-bg px-8 py-4 rounded-full font-mono text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                Shop the Drop
              </button>
            </div>
          </div>

          {/* Right Side: 3D Viewer */}
          
              {/* Right Side: 3D Viewer Carousel */}
          <div className="relative h-[500px] rounded-3xl bg-gradient-to-br from-[#1C1B22] to-[#141318] border border-white/5 overflow-hidden shadow-2xl">
            
            {heroProducts.length > 0 && (
              <TeeViewer 
                color="#111111" 
                ink={
                  heroProducts[heroIndex]?.variants[0]?.color.toLowerCase() === 'bone' ? '#F3F1FA' : 
                  heroProducts[heroIndex]?.variants[0]?.color.toLowerCase() === 'violet' ? '#8B6BFF' : 
                  heroProducts[heroIndex]?.variants[0]?.color.toLowerCase() === 'coral' ? '#FF6B4A' : 
                  heroProducts[heroIndex]?.variants[0]?.color.toLowerCase() === 'mint' ? '#3EE3A6' : 
                  '#3EE3A6'
                } 
              />
            )}
            
            {/* Glass overlay label */}
            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
              <span className="bg-black/50 backdrop-blur-md text-white font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full border border-white/10 transition-all duration-500">
                {heroProducts[heroIndex]?.name || 'Loading...'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-4">
          <h2 className="font-sora font-bold text-2xl text-white">Shop the Collection</h2>
          <span className="font-mono text-sm text-text-dim">
            {products.length} designs
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}