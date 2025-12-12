import React from 'react';
import { ShoppingCart, TrendingDown, Bell, MessageCircle } from 'lucide-react';
import { ProductItem } from '../types';

// Mock data for demonstration
const MOCK_CART: ProductItem[] = [
    {
        id: '1',
        name: 'Structured Wool Blazer',
        brand: 'The Row',
        price: 2450,
        currency: '$',
        imageUrl: 'https://picsum.photos/200/200?random=101',
        url: '#',
        tracking: true
    },
    {
        id: '2',
        name: 'High-Waist Wide Leg Trousers',
        brand: 'Cos',
        price: 135,
        currency: '$',
        imageUrl: 'https://picsum.photos/200/200?random=102',
        url: '#',
        tracking: false
    }
];

const WATCHLIST: ProductItem[] = [
    {
        id: '3',
        name: 'Silk Slip Dress',
        brand: 'Reformation',
        price: 198, // Original was higher
        currency: '$',
        imageUrl: 'https://picsum.photos/200/200?random=103',
        url: '#',
        tracking: true
    }
];

const CommerceView: React.FC = () => {
    return (
        <div className="p-4 md:p-8 space-y-8 pb-24">
            <header>
                <h1 className="text-3xl font-serif font-bold text-stone-900">Shopping Bag & Wishlist</h1>
                <p className="text-stone-500 mt-1">Aggregated from your favorite stores.</p>
            </header>

            {/* Price Alert Banner */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-emerald-900">Price Drop Alert!</h3>
                    <p className="text-sm text-emerald-800 mt-1">
                        The <strong>Silk Slip Dress</strong> in your wishlist has dropped by 15%. 
                        We've sent a notification to your WhatsApp.
                    </p>
                    <button className="mt-2 text-xs font-bold text-emerald-700 underline flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> Check WhatsApp
                    </button>
                </div>
            </div>

            {/* Cart Section */}
            <section>
                <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> Current Cart
                </h2>
                <div className="space-y-4">
                    {MOCK_CART.map(item => (
                        <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
                            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md bg-stone-100" />
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <p className="text-xs text-stone-400 font-bold uppercase">{item.brand}</p>
                                    <h3 className="font-medium text-stone-900">{item.name}</h3>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="font-bold">{item.currency}{item.price}</span>
                                    <button className="text-xs text-rose-500 font-medium hover:underline">Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 p-4 bg-stone-50 rounded-lg flex justify-between items-center">
                    <span className="font-bold text-stone-700">Total</span>
                    <span className="text-xl font-serif font-bold text-stone-900">$2,585.00</span>
                </div>
                <button className="w-full mt-4 bg-stone-900 text-white py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors">
                    Checkout All Items
                </button>
            </section>

             {/* Watchlist Section */}
             <section>
                <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5" /> Watchlist (Price Tracking)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {WATCHLIST.map(item => (
                         <div key={item.id} className="flex gap-3 bg-white p-3 rounded-xl border border-stone-100 shadow-sm relative overflow-hidden">
                             {item.tracking && (
                                 <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                     TRACKING ACTIVE
                                 </div>
                             )}
                             <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md bg-stone-100" />
                             <div>
                                 <p className="text-xs text-stone-400 font-bold uppercase">{item.brand}</p>
                                 <h3 className="text-sm font-medium text-stone-900">{item.name}</h3>
                                 <span className="text-sm font-bold text-emerald-600">{item.currency}{item.price}</span>
                             </div>
                         </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default CommerceView;