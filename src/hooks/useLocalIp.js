import { useState, useEffect } from 'react';

export const useLocalIp = () => {
  const [localIp, setLocalIp] = useState(null);

  useEffect(() => {
    const getLocalIp = async () => {
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            const parts = e.candidate.candidate.split(' ');
            const ip = parts[4];
            if (ip && ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
              setLocalIp(ip);
              pc.close();
            }
          }
        };

        // Timeout cleanup
        setTimeout(() => pc.close(), 5000);
      } catch (err) {
        console.log('Could not detect local IP:', err);
      }
    };
    getLocalIp();
  }, []);

  return localIp;
};
