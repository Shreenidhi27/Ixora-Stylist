import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, BeautyAnalysis } from '../types';
import { analyzeBeautyProfile } from '../services/geminiService';
import { Camera, Sparkles, Heart, RefreshCw, X } from 'lucide-react';

interface Props {
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

const ColorAnalysisView: React.FC<Props> = ({ userProfile, onUpdateProfile }) => {
  const [analysis, setAnalysis] = useState<BeautyAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [mode, setMode] = useState<'camera' | 'analysis'>('camera');
  const [selectedLipColor, setSelectedLipColor] = useState<string | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera", err);
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
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
      
      const result = await analyzeBeautyProfile(imageBase64);
      setAnalysis(result);
      if (result && result.recommendedLipColors.length > 0) {
        setSelectedLipColor(result.recommendedLipColors[0]);
      }
      setMode('analysis');
    }
    setAnalyzing(false);
  };

  const toggleFavoriteShade = (color: string) => {
    const currentFavs = userProfile.favoriteShades || [];
    let newFavs;
    if (currentFavs.includes(color)) {
      newFavs = currentFavs.filter(c => c !== color);
    } else {
      newFavs = [...currentFavs, color];
    }
    onUpdateProfile({ ...userProfile, favoriteShades: newFavs });
  };

  return (
    <div className="flex flex-col h-full bg-stone-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-stone-700 flex justify-between items-center">
        <div>
           <h2 className="text-xl font-serif font-bold">Virtual Mirror</h2>
           <p className="text-xs text-stone-400">Color Analysis & Try-On</p>
        </div>
        {mode === 'analysis' && (
            <button 
                onClick={() => { setMode('camera'); setAnalysis(null); }}
                className="text-stone-300 hover:text-white flex items-center gap-1 text-sm"
            >
                <RefreshCw className="w-4 h-4" /> Reset
            </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {/* Video Feed */}
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${analyzing ? 'opacity-50' : 'opacity-100'}`}
        />
        
        {/* Face Guide Overlay (Only in initial camera mode) */}
        {mode === 'camera' && !analyzing && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-80 border-2 border-dashed border-white/30 rounded-[50%]"></div>
                <div className="absolute bottom-10 left-0 right-0 text-center">
                    <p className="text-white/80 text-sm mb-4">Align your face for analysis</p>
                </div>
            </div>
        )}

        {/* Lipstick Overlay (SVG Mask) - Simple estimation based on centered face */}
        {selectedLipColor && mode === 'analysis' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center translate-y-12">
               {/* This is a generic lip shape mask. In a real app, we'd use FaceMesh to position this points dynamically */}
               <svg width="120" height="60" viewBox="0 0 100 50" className="opacity-60 mix-blend-soft-light">
                   <path 
                     d="M10,20 Q50,0 90,20 Q50,40 10,20 Z" 
                     fill={selectedLipColor} 
                     filter="url(#blur)"
                   />
                   <defs>
                     <filter id="blur">
                       <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                     </filter>
                   </defs>
               </svg>
            </div>
        )}

        {analyzing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <Sparkles className="w-12 h-12 text-rose-400 animate-spin mb-4" />
                <p className="font-serif text-xl animate-pulse">Finding your perfect shades...</p>
            </div>
        )}

        {/* Capture Button */}
        {mode === 'camera' && !analyzing && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
                <button 
                    onClick={captureAndAnalyze}
                    className="w-16 h-16 rounded-full bg-white border-4 border-stone-500 flex items-center justify-center hover:scale-105 transition-transform"
                >
                    <div className="w-12 h-12 rounded-full bg-rose-500" />
                </button>
            </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control Panel */}
      {mode === 'analysis' && analysis && (
          <div className="bg-stone-800 p-4 border-t border-stone-700 animate-slide-up h-1/3 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h3 className="font-bold text-lg">{analysis.skinTone} <span className="text-stone-400 text-sm font-normal">({analysis.undertone})</span></h3>
                      <p className="text-xs text-stone-400 mt-1">Rec: {analysis.recommendedHairStyles.join(", ")}</p>
                  </div>
              </div>

              <div className="space-y-4">
                  <div>
                      <p className="text-xs font-bold text-stone-500 uppercase mb-2">Lipstick Try-On</p>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                          {analysis.recommendedLipColors.map((color, idx) => (
                              <button 
                                key={idx}
                                onClick={() => setSelectedLipColor(color)}
                                className={`relative shrink-0 w-12 h-12 rounded-full border-2 transition-transform ${selectedLipColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                              >
                                  {selectedLipColor === color && (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                          <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                                      </div>
                                  )}
                              </button>
                          ))}
                      </div>
                  </div>

                  {selectedLipColor && (
                      <div className="flex justify-between items-center bg-stone-700/50 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full border border-stone-600" style={{ backgroundColor: selectedLipColor }} />
                              <div className="text-sm">
                                  <p className="font-mono">{selectedLipColor}</p>
                                  <p className="text-xs text-stone-400">Selected Shade</p>
                              </div>
                          </div>
                          <button 
                             onClick={() => toggleFavoriteShade(selectedLipColor)}
                             className={`p-2 rounded-full transition-colors ${
                                 (userProfile.favoriteShades || []).includes(selectedLipColor)
                                 ? 'text-rose-500 bg-rose-500/10'
                                 : 'text-stone-400 hover:text-white hover:bg-stone-600'
                             }`}
                          >
                              <Heart className={`w-5 h-5 ${(userProfile.favoriteShades || []).includes(selectedLipColor) ? 'fill-current' : ''}`} />
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default ColorAnalysisView;