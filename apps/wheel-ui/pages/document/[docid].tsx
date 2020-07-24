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

function DocumentHistoryTiles(props: {historyData: any}) {

  const renderContent = (content) => {
    if (!content) {
      return <>No content here</>
    } else {
      return (
        <>
          <code>{JSON.stringify(content, null, 2)}</code>
        </>
      )
    }
  }

  if (!props.historyData || !props.historyData.length) {
    return (<><span>No history yet!</span></>)
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
              CID: {cid} <RecordType recordType={type}></RecordType>
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

    return props.historyData.map((r, index) => {
      if (index < props.historyData.length - 1) {
        return renderTile(r.cid, 'ANCHOR', r.content)
      } else {
        return renderTile(r.cid, 'GENESIS', r.content)
      }
    })
  }

}

export default function Document() {
  const router = useRouter()
  const [contentSocket, setContentSocket] = useState('')
  const { docid } = router.query
  const socket = io.connect(process.env.WHEEL_SOCKETIO_URL);
  socket.on('connect', (data) => {
    if (docid && docid !== "undefined") {
      socket.emit('room', docid)
    }
  })

  socket.on("live-update", (msg) => setContentSocket(msg));

  const endpointHistory = `${process.env.WHEEL_URL}/api/v0/ceramic/${docid}/history`;
  const endpointContent = `${process.env.WHEEL_URL}/api/v0/ceramic/${docid}/content`;
  const fetcher = url => fetch(url).then(r => r.json())
  const { data: dataHistory } = useSWR(endpointHistory, fetcher)
  const { data: dataContent } = useSWR(endpointContent, fetcher)

  console.log(dataContent)

  useEffect(() => {
    setContentSocket(dataContent?.content)
  }, [dataContent])


  return (
    <Box sx={{ flexGrow: 1, padding: 4 }}>
      <h1>Document</h1>
      <Header3>Doc ID</Header3>
      <code>ceramic://{docid}</code>
      <Header3>History</Header3>
      <DocumentHistoryTiles historyData={dataHistory}/>
      <Header3>Current content</Header3>
      <code>{JSON.stringify(contentSocket)}</code>
      {/*<Header3>Last Record State</Header3>*/}
      {/*<RecordType recordType={status}></RecordType>*/}
    </Box>
  );
}
