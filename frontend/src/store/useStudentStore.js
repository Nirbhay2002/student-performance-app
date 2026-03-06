import { create } from 'zustand';
import { studentService } from '../services/studentService';

// Time-to-live for cache in milliseconds (e.g., 5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

const getCacheKey = (params = {}) => {
    if (!params || Object.keys(params).length === 0) return 'all';
    return JSON.stringify(params, Object.keys(params).sort());
};

const useStudentStore = create((set, get) => ({
    cache: {},
    performanceCache: {},
    loading: false,
    error: null,

    fetchStudents: async (params = {}, forceRefetch = false) => {
        const cacheKey = getCacheKey(params);
        const state = get();
        const cachedData = state.cache[cacheKey];

        if (!forceRefetch && cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
            return cachedData.data;
        }

        // Set loading only if we are actually making a network request
        set({ loading: true, error: null });
        try {
            const data = await studentService.getAllStudents(params);

            set((prevState) => ({
                cache: {
                    ...prevState.cache,
                    [cacheKey]: {
                        data,
                        timestamp: Date.now(),
                    },
                },
                loading: false,
            }));

            return data;
        } catch (err) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    fetchStudentPerformance: async (studentId, forceRefetch = false) => {
        const state = get();
        const cachedEntry = state.performanceCache[studentId];

        if (!forceRefetch && cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL)) {
            return cachedEntry.data;
        }

        try {
            const data = await studentService.getStudentPerformance(studentId);

            set((prevState) => ({
                performanceCache: {
                    ...prevState.performanceCache,
                    [studentId]: {
                        data,
                        timestamp: Date.now(),
                    },
                },
            }));

            return data;
        } catch (err) {
            throw err;
        }
    },

    invalidateCache: () => {
        set({ cache: {}, performanceCache: {} });
    },
}));

export default useStudentStore;
