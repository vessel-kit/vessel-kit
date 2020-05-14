import React, { useEffect, useState } from "react";
import { Stat } from "./stat";
import { DateTime, Duration, Interval } from "luxon";

export function TimeoutStat(
  props: React.PropsWithChildren<{ title: string; timeout: DateTime }>
) {
  const subtitle = props.timeout.toLocaleString({
    year: "numeric",
    day: "numeric",
    month: "numeric",
    hour: "numeric",
    minute: "numeric"
  });
  const [currentTime, setCurrentTime] = useState(DateTime.local());

  useEffect(() => {
    const timeout = setInterval(() => {
      setCurrentTime(DateTime.local());
    }, 1000);
    return () => {
      clearInterval(timeout);
    };
  });

  const prepareValue = () => {
    if (currentTime.valueOf() < props.timeout.valueOf()) {
      const duration = Interval.fromDateTimes(currentTime, props.timeout).toDuration()
      if (duration.hours) {
        return duration.toFormat('hh:mm:ss')
      } else {
        return duration.toFormat('mm:ss')
      }
    } else {
      return 'Done'
    }
  }

  return <Stat title={props.title} subtitle={subtitle} value={prepareValue()} />;
}
