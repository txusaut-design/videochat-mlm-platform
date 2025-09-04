// src/hooks/useNetworkQuality.ts
import { useState, useEffect, useCallback } from 'react';

interface NetworkQuality {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  rtt: number;
  downlink: number;
  effectiveType: string;
}

export function useNetworkQuality() {
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>({
    quality: 'good',
    rtt: 0,
    downlink: 0,
    effectiveType: 'unknown'
  });

  const updateNetworkQuality = useCallback(() => {
    // @ts-ignore - NetworkInformation is experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const { rtt, downlink, effectiveType } = connection;
      
      let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
      
      if (rtt < 100 && downlink > 5) {
        quality = 'excellent';
      } else if (rtt < 300 && downlink > 2) {
        quality = 'good';
      } else if (rtt < 500 && downlink > 0.5) {
        quality = 'fair';
      } else {
        quality = 'poor';
      }

      setNetworkQuality({
        quality,
        rtt: rtt || 0,
        downlink: downlink || 0,
        effectiveType: effectiveType || 'unknown'
      });
    }
  }, []);

  useEffect(() => {
    updateNetworkQuality();
    
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateNetworkQuality);
      return () => connection.removeEventListener('change', updateNetworkQuality);
    }
  }, [updateNetworkQuality]);

  return networkQuality;
}