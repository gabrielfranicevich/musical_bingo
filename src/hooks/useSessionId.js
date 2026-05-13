import { useState } from 'react';

export const useSessionId = () => {
  const [mySessionId] = useState(() => {
    let id = localStorage.getItem('mySessionId');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('mySessionId', id);
    }
    return id;
  });

  return mySessionId;
};
