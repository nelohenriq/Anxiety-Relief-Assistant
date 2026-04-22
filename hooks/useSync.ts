import { useEffect } from 'react';
import { useUser } from '../context/UserContext';
import * as api from '../services/apiService';
import useLocalStorage from './useLocalStorage';

export function useSync() {
  const { userId, profile, consentLevel } = useUser();
  const [hasSynced, setHasSynced] = useLocalStorage('hasSyncedWithBackend', false);

  useEffect(() => {
    const sync = async () => {
      if (!hasSynced) {
        // One-time push of profile
        await api.saveUser(userId, { profile, consentLevel });
        
        // Push existing local history if any
        const planHistory = JSON.parse(localStorage.getItem('planHistory') || '[]');
        for (const entry of planHistory) {
          await api.savePlan(userId, entry);
        }

        const moodLogs = JSON.parse(localStorage.getItem('moodLogs') || '[]');
        for (const log of moodLogs) {
          await api.saveMood(userId, log);
        }

        const journalEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
        for (const entry of journalEntries) {
          await api.saveJournalEntry(userId, entry);
        }

        setHasSynced(true);
      }
    };
    sync();
  }, [userId, hasSynced]);
}
