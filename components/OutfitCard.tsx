import React from 'react';
import { Outfit } from '../types';
import { ShoppingBag, Heart, ExternalLink, TrendingDown } from 'lucide-react';

interface Props {
  outfit: Outfit;
}

const OutfitCard: React.FC<Props> = ({ outfit }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-stone-100 overflow-hidden my-4 transition-all hover:shadow-lg">
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
          <div key={idx} className="group relative border border-stone-100 rounded-lg p-2 hover:border-rose-200 transition-colors">
            <div className="aspect-[3/4] overflow-hidden rounded-md bg-stone-100 mb-2">
              <img 
                src={`${item.imageUrl}&random=${idx}`} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-xs text-stone-400 uppercase tracking-wide">{item.brand}</p>
              <p className="text-sm font-medium text-stone-800 line-clamp-1">{item.name}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">{item.currency}{item.price}</span>
                <div className="flex gap-2">
                   {item.tracking && (
                       <span title="Price Drop Alert Active" className="text-green-600">
                           <TrendingDown className="w-4 h-4" />
                       </span>
                   )}
                   <a href="#" className="text-stone-400 hover:text-stone-900">
                     <ExternalLink className="w-4 h-4" />
                   </a>
                </div>
              </div>
            </div>
            <button className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <ShoppingBag className="w-4 h-4 text-stone-800" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutfitCard;