import { createContext, useCallback, useContext, useState } from 'react';
import { Vibration } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

import { createIncident, getIncidentsBySession } from '@/repositories/incidents';
import { createSession, endSession, getActiveSession } from '@/repositories/sessions';
import { IncidentType, Session } from '@/types/incident';

type SessionContextType = {
  activeSession: Session | null;
  incidentCount: number;
  isActive: boolean;
  startSession: () => void;
  stopSession: () => void;
  logIncident: (type?: IncidentType) => void;
};

const SessionContext = createContext<SessionContextType>({
  activeSession: null,
  incidentCount: 0,
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
  const [incidentCount, setIncidentCount] = useState<number>(() => {
    const session = getActiveSession();
    return session ? getIncidentsBySession(session.id).length : 0;
  });

  const player = useAudioPlayer(require('@/assets/sounds/coinCoin.mp3'));

  const startSession = useCallback(() => {
    const session = createSession(new Date().toISOString());
    setActiveSession(session);
    setIncidentCount(0);
  }, []);

  const stopSession = useCallback(() => {
    if (!activeSession) return;
    endSession(activeSession.id, new Date().toISOString());
    setActiveSession(null);
    setIncidentCount(0);
  }, [activeSession]);

  const logIncident = useCallback(
    (type?: IncidentType) => {
      if (!activeSession) return;
      createIncident(activeSession.id, new Date().toISOString(), type);
      setIncidentCount(prev => prev + 1);
      setTimeout(() => {
        try { player.seekTo(0); player.play(); } catch {}
        Vibration.vibrate(80);
      }, 0);
    },
    [activeSession, player],
  );

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        incidentCount,
        isActive: activeSession !== null,
        startSession,
        stopSession,
        logIncident,
      }}>
      {children}
    </SessionContext.Provider>
  );
}
