import glob from "glob-promise"
import {readFile} from "fs-extra"
import thenP from "@unction/thenp"
import optimisticP from "@unction/optimisticp"
import mapValues from "@unction/mapvalues"
import nestedObjOf from "@unction/nestedObjOf"
import mergeLeft from "@unction/mergeleft"
import mergeDeepRight from "@unction/mergedeepright"

import {logs} from "@internal/logger"
import {log} from "@internal/logger"

export default function pushFileSearch (event, pattern) {
  log.info("pushFileSearch")

  return glob(pattern)
    | thenP(mapValues(nestedObjOf(["id"])))
    | thenP(mapValues(mergeLeft({type: "files"})))
    | thenP(mapValues((record) => readFile(record.id, "utf8")
      | thenP(nestedObjOf(["attributes", "content"]))
      | thenP(mergeDeepRight(record))))
    | thenP(optimisticP)
    | thenP(logs.info("Pushing files to client"))
    | thenP((files) => event.sender.send("pushFileMatches", files))
}
