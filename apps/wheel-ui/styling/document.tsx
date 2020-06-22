import { Tag } from 'carbon-components-react'
import React from 'react'

export function RecordType(
  props: React.PropsWithChildren<{recordType: string}>
) {
  let color
  switch (props.recordType) {
    case "ANCHOR": {
      color = "green"
    } break;
    case "UPDATE": {
      color = "cyan"
    } break;
    default: {
      color = "warm-gray"
    }
  }
  return (
    <Tag type={color} title={props.recordType}> {props.recordType} </Tag>
  );
}
