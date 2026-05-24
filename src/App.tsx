import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useStore } from './store';
import Setup from './pages/Setup';
import Game from './pages/Game';

function RootRedirect() {
  const data = useStore((s) => s.data);
  const initialized = useStore((s) => s.initialized);
  if (!initialized) return null;
  return <Navigate to={data ? '/game' : '/setup'} replace />;
}

function GameGuard() {
  const data = useStore((s) => s.data);
  const initialized = useStore((s) => s.initialized);
  const navigate = useNavigate();
  useEffect(() => {
    if (initialized && !data) navigate('/setup', { replace: true });
  }, [initialized, data, navigate]);
  if (!initialized) return null;
  if (!data) return null;
  return <Game />;
}

export default function App() {
  const init = useStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="mx-auto min-h-full w-full max-w-app bg-sand">
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/game" element={<GameGuard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
