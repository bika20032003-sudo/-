import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { MainSystem } from './views/MainSystem';

export const App = () => {
    const [currentUser, setCurrentUser] = useState(null);

    return (
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
    );
};

export default App;
