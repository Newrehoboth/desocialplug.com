'use client';
import { useEffect, useState } from 'react';

export function MaintenanceCountdown() {
  // Set end time to 3 hours from now (or use existing end time from localStorage)
  const getEndTime = () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return Date.now() + 3 * 60 * 60 * 1000; // Default for SSR
    }

    // Check if we already have an end time stored
    const storedEndTime = localStorage.getItem('maintenanceEndTime');

    if (storedEndTime) {
      const endTime = parseInt(storedEndTime);
      // If the stored end time is in the future, use it
      if (endTime > Date.now()) {
        return endTime;
      }
    }

    // Otherwise, create a new end time (3 hours from now)
    const newEndTime = Date.now() + 3 * 60 * 60 * 1000;
    localStorage.setItem('maintenanceEndTime', newEndTime.toString());
    return newEndTime;
  };

  const [endTime, setEndTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showResetMessage, setShowResetMessage] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Initialize state on the client only
  useEffect(() => {
    setIsClient(true);
    setEndTime(getEndTime());
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isClient || endTime === 0) return;

    // Update time left immediately
    const updateTimeLeft = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeLeft(Math.floor(remaining / 1000)); // Convert to seconds
    };

    updateTimeLeft(); // Initial update

    const interval = setInterval(() => {
      updateTimeLeft();

      // If countdown reaches 0, silently reset for another 3 hours
      if (timeLeft <= 1 && endTime <= Date.now()) {
        const newEndTime = Date.now() + 3 * 60 * 60 * 1000;
        setEndTime(newEndTime);

        // Only use localStorage on client side
        if (typeof window !== 'undefined') {
          localStorage.setItem('maintenanceEndTime', newEndTime.toString());
        }

        // Briefly show a reset message (optional, can be removed)
        setShowResetMessage(true);
        setTimeout(() => setShowResetMessage(false), 3000); // Hide after 3 seconds
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, timeLeft, isClient]);

  // Calculate hours, minutes, seconds
  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  // Calculate progress percentage for visual indicator
  const totalSeconds = 3 * 60 * 60; // 3 hours in seconds
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Show loading state during SSR
  if (!isClient) {
    return (
      <div className="max-w-xl text-center space-y-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mx-auto">
          <span className="text-3xl">🚧</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Maintenance Mode
        </h1>
        <p className="text-lg text-gray-300">
          Loading maintenance information...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl text-center space-y-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mx-auto">
        <span className="text-3xl">🚧</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-white">
        Maintenance Mode
      </h1>

      <p className="text-lg text-gray-300">
        De'socialPlug is currently undergoing maintenance to improve performance
        and security.
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ⏱ Countdown */}
      <div className="flex justify-center gap-4 text-white">
        {[hours, minutes, seconds].map((value, i) => (
          <div
            key={i}
            className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-4 min-w-[80px]"
          >
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-xs text-gray-400 mt-1">
              {i === 0 ? 'HRS' : i === 1 ? 'MIN' : 'SEC'}
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-400 space-y-2">
        <p>
          Maintenance progress: {Math.min(100, Math.round(progressPercent))}%
        </p>
        <p className="text-xs">
          Estimated completion:{' '}
          {new Date(endTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}
        </p>

        {/* Hidden reset message (users won't see it) */}
        {showResetMessage && (
          <div className="hidden">
            Timer has been automatically reset for another 3 hours
          </div>
        )}
      </div>

      <div className="text-xs text-gray-600 pt-6">
        © {new Date().getFullYear()} De'socialPlug LTD
      </div>
    </div>
  );
}
