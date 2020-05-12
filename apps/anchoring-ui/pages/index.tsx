import Head from "next/head";
import React, { useEffect, useState } from "react";
import { Grid, Box } from "@theme-ui/components";
import { Tile } from "../styling/tile";
import { Stat } from "../styling/stat";
import { TimeoutStat } from "../styling/timeout-stat";
import { DateTime } from "luxon";

function zeroOrNa(load: boolean, s: number | undefined) {
  if (typeof s === "undefined") {
    return "N/A";
  } else {
    return s.toString();
  }
}

export default function Home() {
  const [stats, setStats] = useState<any>({});
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (Object.keys(stats).length === 0) {
      const endpoint = `${process.env.ANCHORING_URL}/api/v0/stats`;
      fetch(endpoint)
        .then(async response => {
          const data = await response.json();
          data.nextAnchoring = DateTime.fromISO(data.nextAnchoring);
          setStats(data);
        })
        .catch(error => {
          console.error(error);
        });
    }
  });

  const timeoutStat = () => {
    if (stats.nextAnchoring) {
      return (
        <TimeoutStat title={"Next Anchoring"} timeout={stats.nextAnchoring} />
      );
    } else {
      return (
        <Stat title={"Next Anchoring"} subtitle={<>&nbsp;</>} value={"N/A"} />
      );
    }
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 6 }}>
      <Grid columns={[2, null, 4]} sx={{ gridAutoRows: "1fr" }}>
        <Stat
          title={"Requests"}
          subtitle={"Total"}
          value={zeroOrNa(load, stats.requestsTotalCount)}
        />
        <Stat
          title={"Anchors"}
          subtitle={"Total"}
          value={zeroOrNa(load, stats.anchorsTotalCount)}
        />
        <Stat
          title={"Requests"}
          subtitle={"Pending"}
          value={zeroOrNa(load, stats.pendingRequests)}
        />
        {timeoutStat()}
      </Grid>
    </Box>
  );
}
