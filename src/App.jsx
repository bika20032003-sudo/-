import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { MainSystem } from './views/MainSystem';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App = () => {
    const [currentUser, setCurrentUser] = useState(null);

    return (
      <ErrorBoundary>
        <div className="app-root">
          {currentUser ? (
            <MainSystem 
              currentUser={currentUser} 
              onLogout={() => setCurrentUser(null)}
            />
          ) : (
            <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />
          )}
        </div>
      </ErrorBoundary>
    );
};

export default App;
