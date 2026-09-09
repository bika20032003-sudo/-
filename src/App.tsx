import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { MainSystem } from './views/MainSystem';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  return (
    <div className="app-root">
      {isAuthenticated ? (
        <MainSystem onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
};

export default App;
