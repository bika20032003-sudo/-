import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { MainSystem } from './views/MainSystem';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App = () => {
    const [currentUser, setCurrentUser] = useState(() => {
      try {
        const saved = localStorage.getItem('portal_logged_user');
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        return null;
      }
    });

    const handleLoginSuccess = (user) => {
      try {
        localStorage.setItem('portal_logged_user', JSON.stringify(user));
      } catch (e) {}
      setCurrentUser(user);
    };

    const handleLogout = () => {
      try {
        localStorage.removeItem('portal_logged_user');
      } catch (e) {}
      setCurrentUser(null);
    };

    const handleUpdateUser = (updatedFields) => {
      setCurrentUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, ...updatedFields };
        try {
          localStorage.setItem('portal_logged_user', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    };

    return (
      <ErrorBoundary>
        <div className="app-root">
          {currentUser ? (
            <MainSystem 
              currentUser={currentUser} 
              onLogout={handleLogout}
              onUpdateUser={handleUpdateUser}
            />
          ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          )}
        </div>
      </ErrorBoundary>
    );
};

export default App;
