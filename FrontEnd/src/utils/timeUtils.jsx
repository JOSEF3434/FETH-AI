// Convert UTC to Ethiopian Time (UTC+3)
export const utcToEthiopian = (utcDate) => {
  const ethTime = new Date(utcDate);
  ethTime.setHours(ethTime.getHours() + 3);
  return ethTime;
};

// Format time for display
export const formatTime = (date) => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};