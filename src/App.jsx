import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './Config/supabase'
import LoginView from './Views/LoginView'
import DashboardView from './Views/DashboardView'
import MoviesView from './Views/MoviesView'
import AddMoviesView from './Views/AddMoviesView'

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-[9999]">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-white bg-transparent shadow-2xl"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {!session ? (
          // Unauthenticated routes
          <>
            <Route path="/login" element={<LoginView />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          // Authenticated routes
          <>
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/movies" element={<MoviesView />} />
            <Route path="/movies/add" element={<AddMoviesView />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Router>
  )
}

export default App
