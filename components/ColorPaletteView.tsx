import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ColorPaletteAnalysis } from '../types';
import { analyzeColorPalette } from '../services/geminiService';
import { Camera, Sparkles, RefreshCw, Palette, Check, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

const ColorPaletteView: React.FC<Props> = ({ userProfile, onUpdateProfile }) => {
  const [analysis, setAnalysis] = useState<ColorPaletteAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [mode, setMode] = useState<'camera' | 'result'>('camera');
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    }
    return () => stopCamera();
  }, [mode]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera", err);
      setError("Unable to access camera. Please enable permissions.");
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
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
      stopCamera(); // Stop camera while analyzing
      
      const result = await analyzeColorPalette(imageBase64);
      setAnalysis(result);
      setMode('result');
    }
    setAnalyzing(false);
  };

  const ColorSwatch = ({ name, hex, onClick }: { name: string; hex: string; onClick?: () => void }) => (
    <div 
        className="flex flex-col items-center gap-1 cursor-pointer group"
        onClick={onClick}
    >
        <div 
            className="w-16 h-16 rounded-full shadow-md border-2 border-white/10 group-hover:scale-110 transition-transform relative"
            style={{ backgroundColor: hex }}
        >
             {/* Optional selection indicator could go here */}
        </div>
        <span className="text-[10px] text-stone-300 uppercase tracking-wide text-center w-16 truncate">{name}</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-stone-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-stone-700 flex justify-between items-center bg-stone-900 z-10">
        <div>
           <h2 className="text-xl font-serif font-bold flex items-center gap-2">
             <Palette className="w-5 h-5 text-rose-400" />
             Color Palette
           </h2>
           <p className="text-xs text-stone-400">Seasonal Color Analysis</p>
        </div>
        {mode === 'result' && (
            <button 
                onClick={() => { setAnalysis(null); setMode('camera'); }}
                className="text-stone-300 hover:text-white flex items-center gap-1 text-sm bg-stone-800 px-3 py-1.5 rounded-full"
            >
                <RefreshCw className="w-4 h-4" /> New Photo
            </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {mode === 'camera' && (
            <div className="h-full flex flex-col items-center justify-center relative bg-black">
                {error ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center z-20">
                        <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Camera Error</h3>
                        <p className="text-stone-400 mb-6">{error}</p>
                        <button 
                            onClick={startCamera}
                            className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2"
                        >
                            <Camera className="w-5 h-5" />
                            Retry Camera
                        </button>
                    </div>
                ) : analyzing ? (
                     <div className="flex flex-col items-center justify-center">
                        <Sparkles className="w-16 h-16 text-rose-500 animate-spin mb-4" />
                        <p className="text-xl font-serif animate-pulse">Analyzing skin undertones...</p>
                        <p className="text-sm text-stone-500 mt-2">Determining your season</p>
                    </div>
                ) : (
                    <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-64 h-80 border-2 border-dashed border-white/30 rounded-[50%]"></div>
                            <div className="absolute bottom-24 text-white/80 text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                                Center your face in natural light
                            </div>
                        </div>
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
                            <button 
                                onClick={captureAndAnalyze}
                                className="w-20 h-20 rounded-full bg-white border-4 border-stone-400 flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                            >
                                <Camera className="w-10 h-10 text-stone-800" />
                            </button>
                        </div>
                    </>
                )}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        )}

        {mode === 'result' && analysis && (
            <div className="p-6 space-y-8 animate-fade-in pb-24">
                {/* Season Reveal */}
                <div className="text-center space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-widest border border-rose-500/30">
                        Your Season
                    </span>
                    <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-400">
                        {analysis.season}
                    </h1>
                    <p className="text-stone-300 leading-relaxed max-w-lg mx-auto">
                        {analysis.description}
                    </p>
                </div>

                {/* Best Colors */}
                <div className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Check className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-bold">Power Colors</h3>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {analysis.bestColors.map((c, i) => (
                            <ColorSwatch key={i} {...c} />
                        ))}
                    </div>
                </div>

                {/* Neutrals */}
                <div className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700">
                    <h3 className="text-lg font-bold mb-4">Essential Neutrals</h3>
                    <div className="flex flex-wrap gap-4 justify-center">
                         {analysis.neutrals.map((c, i) => (
                            <ColorSwatch key={i} {...c} />
                        ))}
                    </div>
                </div>

                {/* Avoid */}
                <div className="bg-stone-800/30 rounded-2xl p-6 border border-stone-800">
                    <div className="flex items-center gap-2 mb-4">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-bold text-stone-400">Colors to Avoid</h3>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center opacity-75">
                         {analysis.avoidColors.map((c, i) => (
                            <ColorSwatch key={i} {...c} />
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ColorPaletteView;