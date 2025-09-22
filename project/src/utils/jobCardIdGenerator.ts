import { supabase } from "../config/supabase";
import { JobCard } from "../contexts/JobCardContext";

/**
 * Generates the next sequential job card ID in the format NXS-00001, NXS-00002, etc.
 * Checks both database and local state to ensure no duplicates
 */
export const generateNextJobCardId = async (existingJobCards: JobCard[]): Promise<string> => {
  try {
    // First check database for the highest number
    const { data: dbJobCards, error } = await supabase
      .from("job_cards")
      .select("id")
      .like("id", "NXS-%")
      .order("created_at", { ascending: false })
      .limit(10);

    let maxNumber = 0;
    
    if (!error && Array.isArray(dbJobCards)) {
      for (const row of dbJobCards) {
        const idValue = typeof row.id === 'string' ? row.id : '';
        const match = idValue.match(/NXS-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          maxNumber = Math.max(maxNumber, num);
        }
      }
    }

    // Also check local state for any higher numbers
    const localMaxNumber = (existingJobCards || []).reduce((max, card) => {
      const idValue = typeof card?.id === 'string' ? card.id : '';
      const match = idValue.match(/NXS-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return Math.max(max, num);
      }
      return max;
    }, 0);

    maxNumber = Math.max(maxNumber, localMaxNumber);
    const nextNumber = maxNumber + 1;
    return `NXS-${nextNumber.toString().padStart(5, '0')}`;
  } catch (error) {
    console.error("Error generating job card ID:", error);
    // Fallback to local state only
    const maxNumber = existingJobCards.reduce((max, card) => {
      const match = card.id.match(/NXS-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return Math.max(max, num);
      }
      return max;
    }, 0);
    
    const nextNumber = maxNumber + 1;
    return `NXS-${nextNumber.toString().padStart(5, '0')}`;
  }
};
