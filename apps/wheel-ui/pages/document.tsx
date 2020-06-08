import { DateTime } from 'luxon'
import { Box } from "@theme-ui/components";
import React from "react";
import { ExpandableTile, TileAboveTheFoldContent, TileBelowTheFoldContent
} from 'carbon-components-react';

import { useRouter } from 'next/router'
import useSWR from 'swr'

function convertRecordStatusNaming(status: string): string {
  let result
  switch (status) {
    case "COMPLETED": {
      result = "ANCHOR"
    } break;
    case "PENDING":
    case "PROCESSING":
    case "FAILED":{
      result = "UPDATE"
    } break;
    default: {}
  }

  return result
}

function DocumentHistoryTiles(props: {historyData: any}) {

  if (!props.historyData) {
    return <></>
  } else {
    const renderTile = (cid, type, content) => {
      return (
        <ExpandableTile
          tabIndex={0}
          tileMaxHeight={0}
          tilePadding={0}
        >
          <TileAboveTheFoldContent>
            <div style={{ height: '34px'}}>
              CID: {cid}, Record type: {type}
            </div>
          </TileAboveTheFoldContent>
          <TileBelowTheFoldContent>
            <div style={{ height: '64px'}}>
              Content: <code>{JSON.stringify(content)}</code>
            </div>
          </TileBelowTheFoldContent>
        </ExpandableTile>
      );
    }

    return props.historyData.sort(
      (firstEl, secondEl) =>
        DateTime.fromJSDate(firstEl).toMillis() < DateTime.fromJSDate(secondEl).toMillis() ? 1 : -1 ).map(r => {
      const type = convertRecordStatusNaming(r.status)
      return renderTile(r.cid, type, r.content)
    })
  }

}

export default function Document() {
  const router = useRouter()
  const { docId } = router.query
  const endpoint = `${process.env.WHEEL_URL}/api/v0/ceramic/list/${docId}`;
  const fetcher = url => fetch(url).then(r => r.json())
  const { data } = useSWR(endpoint, fetcher)
  const status = convertRecordStatusNaming(data?.sort( (firstEl, secondEl) =>
    DateTime.fromJSDate(firstEl).toMillis() < DateTime.fromJSDate(secondEl).toMillis() ? 1 : -1 )[0].status)

  return (
    <Box sx={{ flexGrow: 1, padding: 6 }}>
      <h1>Document</h1>
      <h3>Doc ID</h3>
      <code>ceramic://{docId}</code>
      <h3>History</h3>
      <DocumentHistoryTiles historyData={data}/>
      <h3>Current content</h3>

      <h3>Last Record State</h3>
      {status}
    </Box>
  );
}
