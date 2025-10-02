import { useState } from 'react';
import AppHeader from '../AppHeader';

export default function AppHeaderExample() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <AppHeader 
      userName="Sarah Johnson" 
      isDarkMode={isDark}
      onToggleDarkMode={() => setIsDark(!isDark)}
    />
  );
}
