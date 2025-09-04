// src/utils/videoUtils.ts
export function getVideoConstraints(quality: 'low' | 'medium' | 'high' | 'hd') {
  const constraints = {
    low: { width: 640, height: 480, frameRate: 15 },
    medium: { width: 854, height: 480, frameRate: 24 },
    high: { width: 1280, height: 720, frameRate: 30 },
    hd: { width: 1920, height: 1080, frameRate: 30 }
  };

  return {
    width: { ideal: constraints[quality].width },
    height: { ideal: constraints[quality].height },
    frameRate: { ideal: constraints[quality].frameRate }
  };
}

export function getAudioConstraints() {
  return {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000
  };
}

export async function checkMediaPermissions(): Promise<{
  video: boolean;
  audio: boolean;
}> {
  try {
    const permissions = await Promise.all([
      navigator.permissions.query({ name: 'camera' as PermissionName }),
      navigator.permissions.query({ name: 'microphone' as PermissionName })
    ]);

    return {
      video: permissions[0].state === 'granted',
      audio: permissions[1].state === 'granted'
    };
  } catch (error) {
    // Fallback for browsers that don't support permissions API
    return { video: false, audio: false };
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}