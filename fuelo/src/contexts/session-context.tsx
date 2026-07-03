import { createContext, useCallback, useContext, useState } from 'react';
import { Vibration } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

import { createIncident, getIncidentsBySession } from '@/repositories/incidents';
import { createSession, endSession, getActiveSession } from '@/repositories/sessions';
import { Incident, IncidentType, Session } from '@/types/incident';

type SessionContextType = {
  activeSession: Session | null;
  incidents: Incident[];
  isActive: boolean;
  startSession: () => void;
  stopSession: () => void;
  logIncident: (type?: IncidentType) => void;
};

const SessionContext = createContext<SessionContextType>({
  activeSession: null,
  incidents: [],
  isActive: false,
  startSession: () => {},
  stopSession: () => {},
  logIncident: () => {},
});

export function useSessionContext() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSession] = useState<Session | null>(() => getActiveSession() ?? null);
  const [incidents, setIncidents] = useState<Incident[]>(() =>
    activeSession ? getIncidentsBySession(activeSession.id) : [],
  );
  const player = useAudioPlayer(require('@/assets/sounds/coinCoin.mp3'));

  function playCoinCoin() {
    try { player.seekTo(0); player.play(); } catch {}
    Vibration.vibrate(80);
  }

  const startSession = useCallback(() => {
    const session = createSession(new Date().toISOString());
    setActiveSession(session);
    setIncidents([]);
  }, []);

  const stopSession = useCallback(() => {
    if (!activeSession) return;
    endSession(activeSession.id, new Date().toISOString());
    setActiveSession(null);
    setIncidents([]);
  }, [activeSession]);

  const logIncident = useCallback(
    (type?: IncidentType) => {
      if (!activeSession) return;
      const incident = createIncident(activeSession.id, new Date().toISOString(), type);
      setIncidents(prev => [...prev, incident]);
      playCoinCoin();
    },
    [activeSession],
  );

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        incidents,
        isActive: activeSession !== null,
        startSession,
        stopSession,
        logIncident,
      }}>
      {children}
    </SessionContext.Provider>
  );
}
