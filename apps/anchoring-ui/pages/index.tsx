import Head from "next/head";
import { useEffect, useState } from "react";

function zeroOrNa(s: number | undefined) {
  if (typeof s === "undefined") {
    return "N/A";
  } else {
    return s;
  }
}

export default function Home() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    if (Object.keys(stats).length === 0) {
      const endpoint = `${process.env.ANCHORING_URL}/api/v0/stats`;
      fetch(endpoint)
        .then(async response => {
          const data = await response.json();
          console.log(data);
          setStats(data);
        })
        .catch(error => {
          console.error(error);
        });
    }
  });

  return (
    <div>
      <p>Total Requests: {zeroOrNa(stats.requestsTotalCount)}</p>
      <p>Total Anchors: {zeroOrNa(stats.anchorsTotalCount)}</p>
      <p>Pending Requests: {zeroOrNa(stats.pendingRequests)}</p>
      <p>Next anchoring: {zeroOrNa(stats.nextAnchoring)}</p>
    </div>
  );
}
