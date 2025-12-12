import React, { useEffect, useState } from 'react';
import { UserProfile, WorkoutPlan } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';
import { Dumbbell, Activity, PlayCircle, Clock, CheckCircle2, Loader2, Info } from 'lucide-react';

interface Props {
  userProfile: UserProfile;
}

const WorkoutView: React.FC<Props> = ({ userProfile }) => {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      const generatedPlan = await generateWorkoutPlan(userProfile);
      setPlan(generatedPlan);
      setLoading(false);
    };

    fetchPlan();
  }, [userProfile.bodyShape, userProfile.gender]);

  return (
    <div className="p-4 md:p-8 space-y-8 pb-24 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-serif font-bold text-stone-900">Body-Balance Workout</h1>
        <p className="text-stone-500 mt-1">
          A routine designed to harmonize your <span className="font-bold text-stone-800">{userProfile.bodyShape}</span> silhouette.
        </p>
      </header>

      {loading ? (
         <div className="h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-stone-100">
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
            <p className="text-stone-500 font-serif text-lg">Designing your personalized routine...</p>
         </div>
      ) : plan ? (
        <div className="space-y-8">
          {/* Strategy Card */}
          <div className="bg-stone-900 text-white rounded-xl p-6 shadow-lg">
             <div className="flex items-start gap-4">
                <div className="bg-stone-800 p-3 rounded-full">
                    <Activity className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                    <h2 className="text-xl font-serif font-bold mb-1">Ixora's Strategy for You</h2>
                    <p className="text-stone-300 leading-relaxed">{plan.goal}</p>
                    <div className="mt-4 flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-stone-400" />
                            <span className="text-stone-200">Focus: {plan.focusArea}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-stone-400" />
                            <span className="text-stone-200">{plan.frequency}</span>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Routine */}
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xl font-bold text-stone-800 border-b border-stone-200 pb-2">Main Circuit</h3>
                <div className="space-y-4">
                    {plan.mainCircuit.map((exercise, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm hover:border-rose-200 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg text-stone-800">{exercise.name}</h4>
                                <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold">{exercise.reps}</span>
                            </div>
                            <p className="text-stone-600 text-sm mb-3">{exercise.description}</p>
                            <div className="flex items-center gap-2 text-xs text-rose-600 font-medium bg-rose-50 px-3 py-2 rounded-lg">
                                <Info className="w-3 h-3" />
                                Benefit: {exercise.benefit}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar: Warmup & Cooldown */}
            <div className="space-y-6">
                <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100">
                    <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                        <PlayCircle className="w-5 h-5" /> Warm Up
                    </h3>
                    <ul className="space-y-3">
                        {plan.warmup.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-stone-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Cool Down
                    </h3>
                    <ul className="space-y-3">
                        {plan.cooldown.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-stone-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-12 bg-white rounded-xl border border-dashed border-stone-300">
            <p className="text-stone-500">Could not generate plan. Please try again later.</p>
        </div>
      )}
    </div>
  );
};

export default WorkoutView;