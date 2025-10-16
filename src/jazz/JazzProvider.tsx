import { useMemo, type ReactNode } from 'react';
import { JazzReactProvider } from 'jazz-tools/react';
import { buildSyncConfig } from './types';
import { SkincareAccount } from './schema';

const resolveApiKey = () => {
  return (
    import.meta.env.VITE_JAZZ_API_KEY ??
    import.meta.env.JAZZ_API_KEY ??
    null
  );
};

interface JazzProviderProps {
  children: ReactNode;
}

export function SkincareJazzProvider({ children }: JazzProviderProps) {
  const syncConfig = useMemo(() => buildSyncConfig(resolveApiKey()), []);
  const guestMode = !('peer' in syncConfig);

  return (
    <JazzReactProvider
      AccountSchema={SkincareAccount}
      sync={syncConfig}
      guestMode={guestMode}
      fallback={
        <div className="p-6 text-center text-muted-foreground">
          Ładowanie danych pielęgnacji...
        </div>
      }
    >
      {children}
    </JazzReactProvider>
  );
}
