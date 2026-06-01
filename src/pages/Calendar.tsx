import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { Loader2, Calendar as CalendarIcon, Trash2, Plus } from 'lucide-react';

interface PlannedOutfit {
  id: string;
  planned_date: string;
  outfit_id: string;
  outfits: {
    id: string;
    name: string;
    outfit_items: {
      clothing_items: {
        image_url: string;
      }
    }[];
  };
}

interface SavedOutfit {
  id: string;
  name: string;
  outfit_items: {
    clothing_items: {
      image_url: string;
    }
  }[];
}

export function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [plannedOutfits, setPlannedOutfits] = useState<PlannedOutfit[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plannedRes, savedRes] = await Promise.all([
        supabase.from('planned_outfits').select(`
          id,
          planned_date,
          outfit_id,
          outfits (
            id,
            name,
            outfit_items (
              clothing_items (
                image_url
              )
            )
          )
        `),
        supabase.from('outfits').select(`
          id,
          name,
          outfit_items (
            clothing_items (
              image_url
            )
          )
        `).order('created_at', { ascending: false })
      ]);

      if (plannedRes.data) setPlannedOutfits(plannedRes.data as unknown as PlannedOutfit[]);
      if (savedRes.data) setSavedOutfits(savedRes.data as unknown as SavedOutfit[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const plannedForSelected = plannedOutfits.find(p => p.planned_date === selectedDateStr);

  const handleAssignOutfit = async (outfitId: string) => {
    setIsAssigning(true);
    try {
      if (plannedForSelected) {
        // Edit existing
        await supabase
          .from('planned_outfits')
          .update({ outfit_id: outfitId })
          .eq('id', plannedForSelected.id);
      } else {
        // Create new
        await supabase
          .from('planned_outfits')
          .insert([{ planned_date: selectedDateStr, outfit_id: outfitId }]);
      }
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to schedule outfit.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemovePlanned = async () => {
    if (!plannedForSelected) return;
    try {
      await supabase.from('planned_outfits').delete().eq('id', plannedForSelected.id);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to remove outfit from date.');
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      const planned = plannedOutfits.find(p => p.planned_date === dateStr);
      if (planned) {
        const imageUrl = planned.outfits?.outfit_items?.[0]?.clothing_items?.image_url;
        return (
          <div className="mt-1 w-full h-10 md:h-16 rounded-md overflow-hidden bg-pastel-sand border border-pastel-taupe/30">
            {imageUrl && <img src={imageUrl} className="w-full h-full object-cover opacity-90" alt="outfit" />}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <style>{`
        .react-calendar {
          width: 100%;
          background: white;
          border: 1px solid rgba(226, 213, 208, 0.4);
          border-radius: 1.5rem;
          font-family: inherit;
          padding: 1rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .react-calendar__navigation button {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          color: #2a2523;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #fbf9f6;
          border-radius: 0.5rem;
        }
        .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-weight: 500;
          font-size: 0.75rem;
          color: #5c534f;
          padding: 0.5rem 0;
        }
        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }
        .react-calendar__tile {
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          aspect-ratio: 0.8;
          transition: all 0.2s;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: #fbf9f6;
          border-radius: 0.75rem;
        }
        .react-calendar__tile--now {
          background: #fdf8f6 !important;
          border-radius: 0.75rem;
          border: 1px solid #f4ebe8;
        }
        .react-calendar__tile--active {
          background: #f4ebe8 !important;
          color: #2a2523 !important;
          border-radius: 0.75rem;
          font-weight: 600;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: #b0a8a6;
        }
      `}</style>
      
      <header className="mb-8">
        <h2 className="font-serif text-3xl md:text-4xl text-ink-dark mb-2">Calendar</h2>
        <p className="text-ink-muted">Schedule your looks and visualize your week in style.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-pastel-taupe/20">
              <Loader2 className="animate-spin text-ink-muted" size={32} />
            </div>
          ) : (
            <Calendar
              value={selectedDate}
              onChange={(val) => setSelectedDate(val as Date)}
              tileContent={tileContent}
              formatShortWeekday={(locale, date) => format(date, 'EEE')}
            />
          )}
        </div>

        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-pastel-taupe/20 shadow-sm">
            <h3 className="font-serif text-2xl flex items-center gap-3 mb-6">
              <CalendarIcon size={24} className="text-ink-muted" />
              <span className="mt-1">{format(selectedDate, 'MMM d, yyyy')}</span>
            </h3>

            {plannedForSelected ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="inline-flex px-3 py-1 bg-pastel-rose/50 rounded-full text-xs font-medium text-ink-dark uppercase tracking-wider">
                    Outfit Planned
                  </div>
                  <button
                    onClick={handleRemovePlanned}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                    title="Remove from schedule"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h4 className="font-medium text-lg text-ink-dark mb-4">{plannedForSelected.outfits?.name}</h4>
                
                <div className="flex -space-x-4 mb-6">
                  {plannedForSelected.outfits?.outfit_items?.map((item, i) => (
                    <div key={i} className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-pastel-sand shadow-sm">
                      <img src={item.clothing_items.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center border border-dashed border-pastel-taupe/50 rounded-2xl bg-pastel-sand/30 mb-2">
                 <p className="text-ink-muted">No outfit planned for this date.</p>
              </div>
            )}
          </div>

          <div className="bg-pastel-rose/20 rounded-3xl p-6 border border-pastel-taupe/20 shadow-sm flex-1">
             <h4 className="font-serif text-lg text-ink-dark mb-4">
               {plannedForSelected ? 'Change Outfit' : 'Assign Saved Outfit'}
             </h4>
             
             {isAssigning && (
               <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-3xl">
                 <Loader2 className="animate-spin text-ink-dark" />
               </div>
             )}

             {savedOutfits.length === 0 ? (
               <p className="text-sm text-ink-muted text-center py-8">
                 You haven't saved any outfits yet. Head to the Outfit Builder to create one!
               </p>
             ) : (
               <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] hide-scrollbar pr-2">
                 {savedOutfits.map(outfit => (
                   <button
                     key={outfit.id}
                     onClick={() => handleAssignOutfit(outfit.id)}
                     className={`flex items-center gap-4 bg-white p-3 rounded-2xl transition-all border text-left ${
                       plannedForSelected?.outfit_id === outfit.id 
                         ? 'border-ink-dark ring-1 ring-ink-dark/20' 
                         : 'border-pastel-taupe/20 hover:border-pastel-taupe shadow-sm'
                     }`}
                   >
                     <div className="w-12 h-12 rounded-xl bg-pastel-sand overflow-hidden shrink-0 border border-pastel-taupe/10">
                        {outfit.outfit_items?.[0] && (
                           <img 
                             src={outfit.outfit_items[0].clothing_items.image_url} 
                             alt={outfit.name} 
                             className="w-full h-full object-cover"
                           />
                        )}
                     </div>
                     <span className="flex-1 font-medium text-sm text-ink-dark truncate">{outfit.name}</span>
                     
                     <div className="w-8 h-8 rounded-full bg-pastel-sand flex items-center justify-center text-ink-dark shrink-0">
                       <Plus size={16} />
                     </div>
                   </button>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
