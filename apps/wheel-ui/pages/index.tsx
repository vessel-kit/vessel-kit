import React, { useEffect, useState } from "react";
import { Grid, Box } from "@theme-ui/components";
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
      const endpoint = `${process.env.WHEEL_URL}/api/v0/stats`;
      console.log('endp', endpoint)
      fetch(endpoint)
        .then(async response => {
          const data = await response.json();
          setStats(data);
        })
        .catch(error => {
          console.error(error);
        });
    }
  });

  return (
    <Box sx={{ flexGrow: 1, padding: 6 }}>
      <Grid columns={[2, null, 4]} sx={{ gridAutoRows: "1fr" }}>
        <Stat
          title={"Documents"}
          subtitle={"Total"}
          value={zeroOrNa(load, stats.totalDocuments)}
        />
        {/*<Stat*/}
        {/*  title={"Anchors"}*/}
        {/*  subtitle={"Total"}*/}
        {/*  value={zeroOrNa(load, stats.anchorsTotalCount)}*/}
        {/*/>*/}
        {/*<Stat*/}
        {/*  title={"Requests"}*/}
        {/*  subtitle={"Pending"}*/}
        {/*  value={zeroOrNa(load, stats.pendingRequests)}*/}
        {/*/>*/}
        {/*{timeoutStat()}*/}
      </Grid>
    </Box>
  );
}
