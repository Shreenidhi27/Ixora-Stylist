import React, { useState, useRef } from 'react';
import { UserProfile, BodyShape, SkinTone, Gender } from '../types';
import { User, MapPin, Ruler, Palette, Camera, Upload, X, Loader2 } from 'lucide-react';
import { analyzeBodyShape } from '../services/geminiService';

interface Props {
  initialProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const ProfileForm: React.FC<Props> = ({ initialProfile, onSave }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [showCamera, setShowCamera] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleStyleToggle = (style: string) => {
    setProfile(prev => {
      const styles = prev.stylePreferences.includes(style)
        ? prev.stylePreferences.filter(s => s !== style)
        : [...prev.stylePreferences, style];
      return { ...prev, stylePreferences: styles };
    });
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setAnalyzing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
      
      // Stop camera stream immediately after capture to be nice
      stopCamera();

      // Analyze
      const result = await analyzeBodyShape(imageBase64);
      if (result) {
        setProfile(prev => ({ ...prev, bodyShape: result.shape }));
        alert(`Analysis Complete! We detected a ${result.shape} shape. Reason: ${result.reasoning}`);
      } else {
        alert("Could not analyze image. Please try again with better lighting.");
      }
    }
    setAnalyzing(false);
  };

  const stylesList = ["Minimalist", "Bohemian", "Streetwear", "Classic", "Avant-Garde", "Athleisure", "Preppy", "Vintage"];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-stone-100 mb-20 relative">
      <h2 className="text-2xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-rose-500" />
        Your Profile
      </h2>

      {/* Camera Modal Overlay */}
      {(showCamera || analyzing) && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-stone-900 rounded-xl overflow-hidden relative">
            {analyzing ? (
               <div className="h-96 flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-12 h-12 animate-spin text-rose-500 mb-4" />
                  <p className="text-lg font-serif">Ixora is analyzing your silhouette...</p>
               </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full h-96 object-cover bg-stone-800" />
                <button 
                  onClick={stopCamera}
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="p-6 flex justify-center bg-stone-900">
                  <button 
                    onClick={captureAndAnalyze}
                    className="w-16 h-16 rounded-full bg-white border-4 border-stone-300 flex items-center justify-center hover:bg-rose-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-500" />
                  </button>
                </div>
              </>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <p className="text-stone-400 mt-4 text-sm text-center max-w-md">
            Tip: Stand in front of a plain background with contrasting clothes for the best accuracy.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Age</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value))}
              className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
            />
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Gender Identity</label>
            <select
              value={profile.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
            >
              {Object.values(Gender).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
        </div>

        {/* Physical Attributes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-stone-600 mb-1 flex items-center gap-1">
              <Ruler className="w-3 h-3" /> Body Shape
            </label>
            <div className="flex gap-2">
                <select
                  value={profile.bodyShape}
                  onChange={(e) => handleChange('bodyShape', e.target.value)}
                  className="flex-1 p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
                >
                  {Object.values(BodyShape).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button 
                  onClick={startCamera}
                  className="bg-stone-900 text-white p-2 rounded-lg hover:bg-stone-800 transition-colors"
                  title="Analyze with Camera"
                >
                  <Camera className="w-5 h-5" />
                </button>
            </div>
            <p className="text-xs text-stone-400 mt-1">Use the camera to let AI analyze your silhouette.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1 flex items-center gap-1">
              <Palette className="w-3 h-3" /> Skin Tone / Undertone
            </label>
            <select
              value={profile.skinTone}
              onChange={(e) => handleChange('skinTone', e.target.value)}
              className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
            >
              {Object.values(SkinTone).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Location (City)
          </label>
          <input
            type="text"
            value={profile.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full p-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-200 outline-none"
            placeholder="e.g. New York, London, Tokyo"
          />
        </div>

        {/* Style Preferences */}
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-2">Style Aesthetics</label>
          <div className="flex flex-wrap gap-2">
            {stylesList.map(style => (
              <button
                key={style}
                onClick={() => handleStyleToggle(style)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  profile.stylePreferences.includes(style)
                    ? 'bg-rose-500 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onSave(profile)}
          className="w-full py-3 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 transition-colors mt-4"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileForm;