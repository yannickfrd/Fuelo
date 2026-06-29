import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Vibration } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

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

const SPEECH_OPTIONS = {
  lang: 'fr-FR',
  continuous: true,
  interimResults: true,
  contextualStrings: ['canard'],
};

// Debounce: one incident per 2 seconds via voice
const VOICE_DEBOUNCE_MS = 2000;

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSession] = useState<Session | null>(() => getActiveSession() ?? null);
  const [incidents, setIncidents] = useState<Incident[]>(() =>
    activeSession ? getIncidentsBySession(activeSession.id) : [],
  );
  // TODO: placez coinCoin.mp3 dans assets/sounds/ puis décommentez la ligne ci-dessous
  // const player = useAudioPlayer(require('@/assets/sounds/coinCoin.mp3'));
  const player = useAudioPlayer(null);

  const isActiveRef = useRef(activeSession !== null);
  const lastVoiceLogRef = useRef(0);
  const logIncidentRef = useRef<(type?: IncidentType) => void>(() => {});

  useSpeechRecognitionEvent('result', (event) => {
    if (!isActiveRef.current) return;
    const transcript = event.results[0]?.transcript ?? '';
    if (/canard/i.test(transcript)) {
      const now = Date.now();
      if (now - lastVoiceLogRef.current > VOICE_DEBOUNCE_MS) {
        lastVoiceLogRef.current = now;
        logIncidentRef.current();
      }
    }
  });

  // Restart automatically when recognition ends (Android doesn't support true continuous)
  useSpeechRecognitionEvent('end', () => {
    if (isActiveRef.current) {
      ExpoSpeechRecognitionModule.start(SPEECH_OPTIONS);
    }
  });

  function playCoinCoin() {
    try { player.play(); } catch {}
    Vibration.vibrate(80);
  }

  const startSession = useCallback(() => {
    const session = createSession(new Date().toISOString());
    setActiveSession(session);
    setIncidents([]);
    isActiveRef.current = true;
    ExpoSpeechRecognitionModule.requestPermissionsAsync().then(({ granted }) => {
      if (granted) ExpoSpeechRecognitionModule.start(SPEECH_OPTIONS);
    });
  }, []);

  const stopSession = useCallback(() => {
    if (!activeSession) return;
    isActiveRef.current = false;
    endSession(activeSession.id, new Date().toISOString());
    setActiveSession(null);
    setIncidents([]);
    ExpoSpeechRecognitionModule.stop();
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

  useEffect(() => {
    logIncidentRef.current = logIncident;
  }, [logIncident]);

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
