import React, { useState } from 'react';
import { UserProfile, BodyShape, SkinTone, Gender, ViewState, WeatherData } from './types';
import { Home, MessageSquare, UserCircle, ShoppingBag, Dumbbell, Sparkles } from 'lucide-react';

import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import ProfileForm from './components/ProfileForm';
import CommerceView from './components/CommerceView';
import WorkoutView from './components/WorkoutView';
import ColorAnalysisView from './components/ColorAnalysisView';

// Default initial state
const DEFAULT_PROFILE: UserProfile = {
  name: "Alex",
  age: 28,
  gender: Gender.Female,
  bodyShape: BodyShape.Hourglass,
  skinTone: SkinTone.MediumNeutral,
  heightCm: 165,
  location: "New York",
  stylePreferences: ["Minimalist", "Chic"],
  budget: 'Medium',
  favoriteShades: []
};

const MOCK_WEATHER: WeatherData = {
  temp: 18,
  condition: "Partly Cloudy",
  location: "New York"
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard userProfile={userProfile} weather={MOCK_WEATHER} />;
      case 'chat':
        return <ChatInterface userProfile={userProfile} />;
      case 'profile':
        return <ProfileForm initialProfile={userProfile} onSave={(p) => { setUserProfile(p); setView('dashboard'); }} />;
      case 'commerce':
        return <CommerceView />;
      case 'workout':
        return <WorkoutView userProfile={userProfile} />;
      case 'beauty':
        return <ColorAnalysisView userProfile={userProfile} onUpdateProfile={setUserProfile} />;
      default:
        return <Dashboard userProfile={userProfile} weather={MOCK_WEATHER} />;
    }
  };

  const NavItem = ({ target, icon: Icon, label }: { target: ViewState; icon: any; label: string }) => (
    <button
      onClick={() => setView(target)}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
        view === target ? 'text-rose-500' : 'text-stone-400 hover:text-stone-600'
      }`}
    >
      <Icon className={`w-6 h-6 ${view === target ? 'fill-current' : ''}`} />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200 h-full">
        <div className="p-6 border-b border-stone-100">
          <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Ixora.</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              view === 'dashboard' ? 'bg-rose-50 text-rose-600 font-medium' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Home className="w-5 h-5" /> Dashboard
          </button>
          <button
            onClick={() => setView('beauty')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              view === 'beauty' ? 'bg-rose-50 text-rose-600 font-medium' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Sparkles className="w-5 h-5" /> Beauty & Color
          </button>
          <button
            onClick={() => setView('workout')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              view === 'workout' ? 'bg-rose-50 text-rose-600 font-medium' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Dumbbell className="w-5 h-5" /> Workout
          </button>
          <button
            onClick={() => setView('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              view === 'chat' ? 'bg-rose-50 text-rose-600 font-medium' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <MessageSquare className="w-5 h-5" /> Stylist Chat
          </button>
          <button
            onClick={() => setView('commerce')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              view === 'commerce' ? 'bg-rose-50 text-rose-600 font-medium' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <ShoppingBag className="w-5 h-5" /> Bag & Wishlist
          </button>
          <button
            onClick={() => setView('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              view === 'profile' ? 'bg-rose-50 text-rose-600 font-medium' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <UserCircle className="w-5 h-5" /> Profile
          </button>
        </nav>
        <div className="p-6 border-t border-stone-100">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-serif font-bold">
                    {userProfile.name.charAt(0)}
                </div>
                <div className="text-sm">
                    <p className="font-medium text-stone-900">{userProfile.name}</p>
                    <p className="text-stone-400 text-xs">{userProfile.bodyShape}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden relative">
          <div className="h-full overflow-y-auto">
             {renderView()}
          </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-2 pb-safe z-50">
        <div className="flex justify-around items-center">
          <NavItem target="dashboard" icon={Home} label="Home" />
          <NavItem target="beauty" icon={Sparkles} label="Beauty" />
          <NavItem target="workout" icon={Dumbbell} label="Fit" />
          <NavItem target="chat" icon={MessageSquare} label="Chat" />
          <NavItem target="commerce" icon={ShoppingBag} label="Shop" />
        </div>
      </div>
    </div>
  );
};

export default App;