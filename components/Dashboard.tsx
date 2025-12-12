import React, { useEffect, useState } from 'react';
import { UserProfile, Outfit, WeatherData } from '../types';
import { generateDailyOutfit } from '../services/geminiService';
import OutfitCard from './OutfitCard';
import { CloudRain, Sun, Loader2, Calendar } from 'lucide-react';

interface Props {
  userProfile: UserProfile;
  weather: WeatherData;
}

const Dashboard: React.FC<Props> = ({ userProfile, weather }) => {
  const [dailyOutfit, setDailyOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutfit = async () => {
      setLoading(true);
      const outfit = await generateDailyOutfit(userProfile, weather);
      setDailyOutfit(outfit);
      setLoading(false);
    };

    fetchOutfit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile.id]); // Should depend on something stable if profile changes

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24">
      <header className="flex justify-between items-end border-b border-stone-200 pb-4">
        <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Good Morning, {userProfile.name}</h1>
            <p className="text-stone-500 mt-1">Ready to express yourself today?</p>
        </div>
        <div className="text-right hidden sm:block">
            <div className="flex items-center justify-end gap-2 text-stone-700">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
        </div>
      </header>

      {/* Weather Context */}
      <div className="bg-gradient-to-r from-stone-800 to-stone-700 rounded-xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
            <p className="text-stone-300 text-sm uppercase tracking-wider mb-1">Forecast for {weather.location}</p>
            <div className="text-4xl font-serif font-light">{weather.temp}°C</div>
            <p className="font-medium opacity-90">{weather.condition}</p>
        </div>
        <div>
            {weather.condition.toLowerCase().includes('rain') ? (
                <CloudRain className="w-16 h-16 opacity-80" />
            ) : (
                <Sun className="w-16 h-16 opacity-80" />
            )}
        </div>
      </div>

      {/* Daily Look */}
      <div className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-stone-800">Your Daily Edit</h2>
        {loading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border border-stone-100">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-2" />
                <p className="text-stone-500 animate-pulse">Curating your look...</p>
            </div>
        ) : dailyOutfit ? (
            <OutfitCard outfit={dailyOutfit} />
        ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-stone-300">
                <p className="text-stone-500">Could not generate a look at this moment.</p>
            </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-rose-50 p-6 rounded-xl border border-rose-100 hover:shadow-md transition-shadow cursor-pointer">
             <h3 className="font-serif font-bold text-rose-900 text-lg mb-2">Color Palette</h3>
             <p className="text-sm text-rose-800/70">View your recommended colors for {userProfile.skinTone}.</p>
         </div>
         <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 hover:shadow-md transition-shadow cursor-pointer">
             <h3 className="font-serif font-bold text-emerald-900 text-lg mb-2">Deal Alerts</h3>
             <p className="text-sm text-emerald-800/70">3 items in your wishlist dropped in price.</p>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;