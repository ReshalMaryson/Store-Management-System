import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const LiveClock = () => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatWith = (formatStr) => {
    return currentTime.tz("Asia/Karachi").format(formatStr);
  };

  return (
    <div className="text-xl font-semibold text-gray-800 space-y-1">
      <div>{formatWith("ddd MMM DD YYYY")}</div>
      <div>{formatWith("h:mm A")}</div>
    </div>
  );
};

export default LiveClock;
