import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, BeautyAnalysis, ColorPaletteAnalysis } from '../types';
import { analyzeBeautyProfile, analyzeColorPalette } from '../services/geminiService';
import { Sparkles, RefreshCw, Smile, Scissors, PenTool, Palette, Camera, AlertCircle, Shirt } from 'lucide-react';

interface Props {
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

type Tab = 'Lipstick' | 'Foundation' | 'Contour' | 'Concealer' | 'Hair' | 'Season';

const ColorAnalysisView: React.FC<Props> = ({ userProfile }) => {
  const [beautyAnalysis, setBeautyAnalysis] = useState<BeautyAnalysis | null>(null);
  const [paletteAnalysis, setPaletteAnalysis] = useState<ColorPaletteAnalysis | null>(null);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('Lipstick');
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Simulation of "Live" filter selections
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Trigger analysis when switching tabs if data is missing
  useEffect(() => {
    if (activeTab === 'Season' && !paletteAnalysis && !analyzing && videoStream) {
        captureAndAnalyze();
    } else if (activeTab !== 'Season' && !beautyAnalysis && !analyzing && videoStream) {
        captureAndAnalyze();
    }
  }, [activeTab, videoStream]);

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
      setError("Camera access is required for this feature.");
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
      
      if (activeTab === 'Season') {
          const result = await analyzeColorPalette(imageBase64);
          setPaletteAnalysis(result);
      } else {
          const result = await analyzeBeautyProfile(imageBase64);
          setBeautyAnalysis(result);
          
          // Default selection based on new analysis
          if (result) {
             if (activeTab === 'Lipstick' && result.bestColors.lipstick[0]) setSelectedFilter(result.bestColors.lipstick[0]);
             if (activeTab === 'Foundation' && result.bestColors.foundation) setSelectedFilter(result.bestColors.foundation);
          }
      }
    }
    setAnalyzing(false);
  };

  // Render Overlay Helper based on Analysis and Active Tab
  const renderOverlay = () => {
    if (activeTab === 'Season') {
        return (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                 <div className="w-64 h-80 border-2 border-dashed border-white/30 rounded-[50%] opacity-50"></div>
                 {paletteAnalysis && (
                     <div className="absolute bottom-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white font-serif">
                         {paletteAnalysis.season}
                     </div>
                 )}
            </div>
        );
    }

    if (!beautyAnalysis) return null;

    if (activeTab === 'Contour') {
        return (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-40">
                <div className="w-56 h-72 border-2 border-dashed border-white rounded-[45%] relative">
                   {/* Simple visualization of contour zones */}
                   <div className="absolute top-10 left-[-10px] w-4 h-12 bg-stone-900 blur-xl rounded-full"></div>
                   <div className="absolute top-10 right-[-10px] w-4 h-12 bg-stone-900 blur-xl rounded-full"></div>
                   <div className="absolute bottom-16 left-4 w-4 h-12 bg-stone-900 blur-xl rounded-full rotate-45"></div>
                   <div className="absolute bottom-16 right-4 w-4 h-12 bg-stone-900 blur-xl rounded-full -rotate-45"></div>
                </div>
                <div className="mt-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
                    {beautyAnalysis.faceShape} Face Guide
                </div>
            </div>
        );
    }

    if (activeTab === 'Lipstick' && selectedFilter) {
         return (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center translate-y-12 opacity-50 mix-blend-multiply">
                 <div className="w-16 h-8 rounded-[50%] blur-md" style={{ backgroundColor: selectedFilter }}></div>
            </div>
         );
    }
    
    return null;
  };

  const TabButton = ({ name, icon: Icon }: { name: Tab; icon: any }) => (
    <button
      onClick={() => setActiveTab(name)}
      className={`flex flex-col items-center gap-1 p-2 min-w-[60px] transition-colors ${
        activeTab === name ? 'text-rose-400' : 'text-stone-400'
      }`}
    >
      <div className={`p-2 rounded-full ${activeTab === name ? 'bg-rose-400/20' : 'bg-transparent'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-[10px] uppercase font-bold tracking-wide">{name}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Viewport */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-stone-900">
        {error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Camera Access Needed</h3>
            <p className="text-stone-400 mb-6 max-w-xs">{error}</p>
            <button 
              onClick={startCamera}
              className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Enable Camera
            </button>
          </div>
        ) : (
          <>
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* AR/Guide Overlay */}
            {renderOverlay()}

            {/* Status Indicators */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                    <Sparkles className="w-3 h-3 text-rose-400" />
                    <span className="text-xs font-medium">
                        {analyzing ? 'Analyzing...' : 
                         activeTab === 'Season' && paletteAnalysis ? `${paletteAnalysis.season} Palette` :
                         beautyAnalysis ? `${beautyAnalysis.faceShape} Face Detected` : 'Align Face'}
                    </span>
                </div>
                <button 
                    onClick={captureAndAnalyze} 
                    className="bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 hover:bg-white/10"
                >
                    <RefreshCw className="w-4 h-4 text-white" />
                </button>
            </div>

            {/* Loading State */}
            {analyzing && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20">
                     <div className="text-center">
                         <Sparkles className="w-10 h-10 text-rose-400 animate-spin mx-auto mb-2" />
                         <p className="font-serif text-lg">
                             {activeTab === 'Season' ? 'Analyzing Colors...' : 'Scanning Face...'}
                         </p>
                     </div>
                 </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      {/* Controls Sheet */}
      <div className="bg-stone-900 border-t border-stone-800 flex flex-col">
        {/* Dynamic Content based on Analysis */}
        <div className="p-4 min-h-[160px]">
            {activeTab === 'Season' ? (
                // Season Analysis Result
                paletteAnalysis ? (
                    <div className="space-y-3">
                         <div className="flex justify-between items-center">
                             <h3 className="text-lg font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-400">
                                 {paletteAnalysis.season}
                             </h3>
                             <span className="text-[10px] bg-stone-800 px-2 py-1 rounded text-stone-400 border border-stone-700">Your Palette</span>
                         </div>
                         <p className="text-xs text-stone-400 leading-snug line-clamp-2">{paletteAnalysis.description}</p>
                         
                         <div>
                             <p className="text-[10px] font-bold text-stone-500 uppercase mb-2">Best Colors</p>
                             <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                 {paletteAnalysis.bestColors.map((color, idx) => (
                                     <div key={idx} className="flex flex-col items-center gap-1 shrink-0">
                                         <div className="w-8 h-8 rounded-full border border-white/10" style={{ backgroundColor: color.hex }} />
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-stone-500 text-sm">
                        {analyzing ? 'Determining your season...' : 'Select this tab to analyze your color palette'}
                    </div>
                )
            ) : (
                // Beauty Analysis Result
                beautyAnalysis ? (
                    <>
                        {activeTab === 'Lipstick' && (
                            <div className="space-y-2">
                                 <p className="text-xs text-stone-400 uppercase font-bold">Recommended for {beautyAnalysis.skinTone} skin</p>
                                 <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                    {beautyAnalysis.bestColors.lipstick.map((color, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedFilter(color)}
                                            className={`shrink-0 w-10 h-10 rounded-full border-2 ${selectedFilter === color ? 'border-white scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                 </div>
                            </div>
                        )}

                        {activeTab === 'Foundation' && (
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border-2 border-white" style={{ backgroundColor: beautyAnalysis.bestColors.foundation }} />
                                <div>
                                    <h4 className="font-bold text-sm">Best Match</h4>
                                    <p className="text-xs text-stone-400">Based on {beautyAnalysis.undertone} undertone</p>
                                    <p className="text-xs font-mono text-stone-500 mt-1">{beautyAnalysis.bestColors.foundation}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Contour' && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-rose-300">
                                    <PenTool className="w-4 h-4" />
                                    Placement Advice
                                </div>
                                <p className="text-sm text-stone-300 leading-snug">{beautyAnalysis.placementAdvice.contour}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-stone-500">Rec. Shade:</span>
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: beautyAnalysis.bestColors.contour }} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'Concealer' && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-rose-300">
                                    <Sparkles className="w-4 h-4" />
                                    Brightening
                                </div>
                                <p className="text-sm text-stone-300 leading-snug">Use under eyes and t-zone.</p>
                                 <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-stone-500">Rec. Shade:</span>
                                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: beautyAnalysis.bestColors.concealer }} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'Hair' && (
                             <div className="space-y-3">
                                <p className="text-xs text-stone-400 uppercase font-bold">Best Cuts for {beautyAnalysis.faceShape} Face</p>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {beautyAnalysis.hairRecommendations.map((hair, idx) => (
                                        <div key={idx} className="shrink-0 bg-stone-800 p-3 rounded-lg w-40 border border-stone-700">
                                            <p className="font-bold text-sm text-white mb-1">{hair.style}</p>
                                            <p className="text-[10px] text-stone-400 leading-tight">{hair.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-stone-500 text-sm">
                        {error ? 'Camera access needed' : 'Waiting for analysis...'}
                    </div>
                )
            )}
        </div>

        {/* Tab Bar */}
        <div className="flex justify-around items-center bg-stone-950 pb-safe pt-2 border-t border-stone-800">
            <TabButton name="Lipstick" icon={Smile} />
            <TabButton name="Foundation" icon={Palette} />
            <TabButton name="Contour" icon={PenTool} />
            <TabButton name="Concealer" icon={Sparkles} />
            <TabButton name="Hair" icon={Scissors} />
            <div className="w-px h-8 bg-stone-800 mx-1"></div>
            <TabButton name="Season" icon={Shirt} />
        </div>
      </div>
    </div>
  );
};

export default ColorAnalysisView;