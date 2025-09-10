import React, { createContext, useContext, useState } from "react";
import { supabase } from "../config/supabase";
import { generateNextJobCardId } from "../utils/jobCardIdGenerator";

export interface JobCard {
  id: string;
  hospitalName: string;
  facilitySignature: string;
  machineType: string;
  machineModel: string;
  serialNumber: string;
  problemReported: string;
  servicePerformed: string;
  engineerName: string;
  engineerId: string;
  dateTime: string;
  createdAt: string;
  status: "completed" | "pending";
  beforeServiceImages?: string[];
  afterServiceImages?: string[];
  facilityStampImage?: string;
  // Manual upload fields
  manualUpload?: boolean;
  manualFile?: string;
  manualReason?: string;
}

interface JobCardContextType {
  jobCards: JobCard[];
  addJobCard: (jobCard: Omit<JobCard, "id" | "createdAt">) => Promise<string>;
  getJobCardsByEngineerId: (engineerId: string) => JobCard[];
  getAllJobCards: () => JobCard[];
  isDriveInitialized: boolean;
  isLoading: boolean;
  refreshJobCards: () => Promise<void>;
  loadJobCardsIfAuthenticated: () => Promise<void>;
}

const JobCardContext = createContext<JobCardContextType | undefined>(undefined);

export function useJobCard() {
  const context = useContext(JobCardContext);
  if (context === undefined) {
    throw new Error("useJobCard must be used within a JobCardProvider");
  }
  return context;
}

export function JobCardProvider({ children }: { children: React.ReactNode }) {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [isDriveInitialized, setIsDriveInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Start as false, only load when user is authenticated

  const loadJobCards = async () => {
    setIsLoading(true);
    try {
      console.log("🔄 Loading job cards from Supabase...");

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database query timeout")), 10000)
      );

      const queryPromise = supabase
        .from("job_cards")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = (await Promise.race([
        queryPromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        console.error("Error loading job cards:", error);
        // Fallback to localStorage
        const storedJobCards = localStorage.getItem("nxs-jobcards");
        if (storedJobCards) {
          console.log("Using cached job cards from localStorage");
          setJobCards(JSON.parse(storedJobCards));
        } else {
          console.log("No cached data available");
          setJobCards([]);
        }
        return;
      }

      if (data) {
        // Map snake_case to camelCase
        const mappedData: JobCard[] = data.map((item: any) => ({
          id: item.id,
          hospitalName: item.hospital_name,
          facilitySignature: item.facility_signature,
          machineType: item.machine_type,
          machineModel: item.machine_model,
          serialNumber: item.serial_number,
          problemReported: item.problem_reported,
          servicePerformed: item.service_performed,
          engineerName: item.engineer_name,
          engineerId: item.engineer_id,
          dateTime: new Date(item.date_time)
            .toLocaleString("sv-SE")
            .slice(0, 16), // Convert UTC to local time
          createdAt: item.created_at,
          status: item.status,
          beforeServiceImages: item.before_service_images || [],
          afterServiceImages: item.after_service_images || [],
          facilityStampImage: item.facility_stamp_image || "",
        }));

        console.log("✅ Loaded job cards from database:", mappedData.length);
        setJobCards(mappedData);

        // Cache the data in localStorage for faster loading next time
        localStorage.setItem("nxs-jobcards", JSON.stringify(mappedData));
      }
    } catch (error) {
      console.error("Error loading job cards:", error);
      // Fallback to localStorage
      const storedJobCards = localStorage.getItem("nxs-jobcards");
      if (storedJobCards) {
        setJobCards(JSON.parse(storedJobCards));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshJobCards = async () => {
    await loadJobCards();
  };

  // Function to load job cards when user is authenticated
  const loadJobCardsIfAuthenticated = async () => {
    if (jobCards.length === 0 && !isLoading) {
      await loadJobCards();
    }
  };

  const addJobCard = async (
    jobCardData: Omit<JobCard, "id" | "createdAt">
  ): Promise<string> => {
    // Generate sequential job card number starting with NXS-00001
    const jobCardId = await generateNextJobCardId(jobCards);
    const newJobCard: JobCard = {
      ...jobCardData,
      id: jobCardId,
      createdAt: new Date().toISOString(),
      status: "completed" as const,
    };

    try {
      console.log("Attempting to save job card to Supabase:", newJobCard);

      // Map camelCase to snake_case for database
      const dbJobCard = {
        id: newJobCard.id,
        hospital_name: newJobCard.hospitalName,
        facility_signature: newJobCard.facilitySignature,
        machine_type: newJobCard.machineType,
        machine_model: newJobCard.machineModel,
        serial_number: newJobCard.serialNumber,
        problem_reported: newJobCard.problemReported,
        service_performed: newJobCard.servicePerformed,
        engineer_name: newJobCard.engineerName,
        engineer_id: newJobCard.engineerId,
        date_time: new Date(newJobCard.dateTime).toISOString(), // Convert to UTC for database
        created_at: newJobCard.createdAt,
        status: newJobCard.status,
        before_service_images: newJobCard.beforeServiceImages || [],
        after_service_images: newJobCard.afterServiceImages || [],
        facility_stamp_image: newJobCard.facilityStampImage || "",
      };

      console.log("Mapped data for database:", dbJobCard);

      // Save to Supabase
      const { data, error } = await supabase
        .from("job_cards")
        .insert([dbJobCard])
        .select()
        .single();

      if (error) {
        console.error("Error saving job card to database:", error);
        console.log("Falling back to localStorage");
        // Fallback to localStorage
        const updatedJobCards = [...jobCards, newJobCard];
        setJobCards(updatedJobCards);
        localStorage.setItem("nxs-jobcards", JSON.stringify(updatedJobCards));
        return newJobCard.id;
      }

      console.log("Successfully saved to Supabase:", data);

      // Map snake_case back to camelCase for local state
      const mappedData: JobCard = {
        id: data.id,
        hospitalName: data.hospital_name,
        facilitySignature: data.facility_signature,
        machineType: data.machine_type,
        machineModel: data.machine_model,
        serialNumber: data.serial_number,
        problemReported: data.problem_reported,
        servicePerformed: data.service_performed,
        engineerName: data.engineer_name,
        engineerId: data.engineer_id,
        dateTime: new Date(data.date_time).toLocaleString("sv-SE").slice(0, 16), // Convert UTC to local time
        createdAt: data.created_at,
        status: data.status,
        beforeServiceImages: data.before_service_images || [],
        afterServiceImages: data.after_service_images || [],
        facilityStampImage: data.facility_stamp_image || "",
      };

      // Update local state with the data returned from Supabase
      setJobCards((prev) => [mappedData, ...prev]);
      return data.id;
    } catch (error) {
      console.error("Error saving job card:", error);
      console.log("Falling back to localStorage due to error");
      // Fallback to localStorage
      const updatedJobCards = [...jobCards, newJobCard];
      setJobCards(updatedJobCards);
      localStorage.setItem("nxs-jobcards", JSON.stringify(updatedJobCards));
      return newJobCard.id;
    }
  };

  const getJobCardsByEngineerId = (engineerId: string): JobCard[] => {
    return jobCards.filter((card) => card.engineerId === engineerId);
  };

  const getAllJobCards = (): JobCard[] => {
    return jobCards;
  };

  return (
    <JobCardContext.Provider
      value={{
        jobCards,
        addJobCard,
        getJobCardsByEngineerId,
        getAllJobCards,
        isDriveInitialized,
        isLoading,
        refreshJobCards,
        loadJobCardsIfAuthenticated,
      }}
    >
      {children}
    </JobCardContext.Provider>
  );
}
