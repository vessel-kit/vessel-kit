import { DateTime } from 'luxon'
import { Box } from "@theme-ui/components";
import React, { useEffect, useState } from "react";
import {
  ExpandableTile, TileAboveTheFoldContent, TileBelowTheFoldContent
} from 'carbon-components-react';
import { RecordType } from '../../styling/document'
import { Header3 } from "../../styling/header";
import { useRouter } from 'next/router'
import useSWR from 'swr'
const io = require('socket.io-client')

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

  const renderContent = (content) => {
    if (!content) {
      return <>No content here</>
    } else {
      return (
        <>
          Content: <code>{JSON.stringify(content)}</code>
        </>
      )
    }
  }

  if (!props.historyData) {
    return <></>
  } else {
    const renderTile = (cid, type, content) => {
      return (
        <ExpandableTile
          tabIndex={0}
          tileMaxHeight={0}
          tilePadding={0}
          key={cid}
        >
          <TileAboveTheFoldContent>
            <div style={{ height: '34px'}}>
              CID: {cid}, Record type:  <RecordType recordType={type}></RecordType>
            </div>
          </TileAboveTheFoldContent>
          <TileBelowTheFoldContent>
            <div style={{ height: '64px'}}>
              {renderContent(content)}
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
  const [contentSocket, setContentSocket] = useState('')
  const { docId } = router.query
  const socket = io.connect(process.env.WHEEL_SOCKETIO_URL);
  socket.on('connect', (data) => {
    if (docId && docId !== "undefined") {
      socket.emit('room', docId)
    }
  })

  socket.on("live-update", (msg) => setContentSocket(msg));

  const endpointHistory = `${process.env.WHEEL_URL}/api/v0/ceramic/list/${docId}`;
  const endpointContent = `${process.env.WHEEL_URL}/api/v0/ceramic/content/${docId}`;
  const fetcher = url => fetch(url).then(r => r.json())
  const { data: dataHistory } = useSWR(endpointHistory, fetcher)
  const { data: dataContent } = useSWR(endpointContent, fetcher)
  const status = convertRecordStatusNaming(dataHistory?.sort( (firstEl, secondEl) =>
    DateTime.fromJSDate(firstEl).toMillis() < DateTime.fromJSDate(secondEl).toMillis() ? 1 : -1 )[0].status)


  useEffect(() => {
    setContentSocket(dataContent?.content)
  }, [dataContent])


  return (
    <Box sx={{ flexGrow: 1, padding: 6 }}>
      <h1>Document</h1>
      <Header3>Doc ID</Header3>
      <code>ceramic://{docId}</code>
      <Header3>History</Header3>
      <DocumentHistoryTiles historyData={dataHistory}/>
      <Header3>Current content</Header3>
      <code>{contentSocket}</code>
      <Header3>Last Record State</Header3>
      <RecordType recordType={status}></RecordType>
    </Box>
  );
}
