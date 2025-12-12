import React from 'react';
import { Outfit } from '../types';
import { ShoppingBag, Heart, TrendingDown, Star, ExternalLink } from 'lucide-react';

interface Props {
  outfit: Outfit;
}

const OutfitCard: React.FC<Props> = ({ outfit }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-stone-100 overflow-hidden my-4 transition-all hover:shadow-lg w-full">
      <div className="p-5 border-b border-stone-50 bg-rose-50/30">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-800">{outfit.title}</h3>
            <p className="text-sm text-stone-500 mt-1">{outfit.description}</p>
          </div>
          <button className="text-rose-500 hover:text-rose-600">
            <Heart className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 text-xs bg-white/60 p-2 rounded border border-rose-100 text-stone-600 italic">
          <span className="font-bold text-rose-500 not-italic">Why it works: </span>
          {outfit.reasoning}
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
        {outfit.items.map((item, idx) => (
          <div key={idx} className="group relative flex flex-col border border-stone-100 rounded-lg p-2 hover:border-rose-200 transition-colors bg-white">
             {/* Product Image */}
            <div className="aspect-[3/4] overflow-hidden rounded-md bg-stone-100 mb-2 relative">
              <img 
                src={item.imageUrl.includes('random') ? item.imageUrl : `${item.imageUrl}&random=${idx}`} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Source Badge */}
              {item.source && (
                  <div className={`absolute bottom-0 left-0 right-0 py-1.5 px-2 text-[10px] font-bold text-white text-center uppercase tracking-wide opacity-95 ${
                      item.source === 'Amazon' ? 'bg-[#232f3e]' : 
                      item.source === 'Myntra' ? 'bg-[#ff3f6c]' : 'bg-stone-800'
                  }`}>
                      Available on {item.source}
                  </div>
              )}
            </div>

            <div className="flex-1 flex flex-col space-y-1">
              <div className="flex justify-between items-start gap-1">
                  <p className="font-bold text-xs text-stone-400 uppercase tracking-wide truncate">{item.brand}</p>
                  {item.rating && (
                      <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{item.rating}</span>
                      </div>
                  )}
              </div>
              
              <p className="text-sm font-medium text-stone-800 line-clamp-2 leading-tight flex-1">{item.name}</p>
              
              <div className="flex justify-between items-center pt-2 mt-auto border-t border-stone-50">
                <span className="text-sm font-bold text-stone-900">{item.currency || '₹'}{item.price.toLocaleString('en-IN')}</span>
                <div className="flex gap-2 items-center">
                   {item.tracking && (
                       <span title="Price Drop Alert Active" className="text-emerald-600 bg-emerald-50 p-1 rounded-full">
                           <TrendingDown className="w-3.5 h-3.5" />
                       </span>
                   )}
                   <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-stone-100 p-1.5 rounded-full text-stone-600 hover:bg-stone-900 hover:text-white transition-colors"
                   >
                     <ShoppingBag className="w-4 h-4" />
                   </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutfitCard;