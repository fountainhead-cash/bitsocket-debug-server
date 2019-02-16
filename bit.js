// Input: ZMQ
const mingo = require("mingo")
const bcode = require("fountainhead-bcode")
const jq = require("fountainhead-bigjq")

let connections = null;
//
// ADD YOUR CUSTOM TRANSACTIONS HERE
const streamfn = function() {
  setInterval(function() {
    send_mempool({"_id":"5c68729154d6e46216593980","tx":{"h":"9bb678e17ccb14777a2a9be41c4fd856acc51da96c8f0157ff2e47223a704353"},"in":[{"i":0,"b0":"MEQCIHeRa1MQ/eP8DRxGiGt3rHs6B4lnzn18Bg+PYdvIb1t2AiB4sLFBrf9WAk3O+rJKhfMF0Xecrzo9Pyxy3Oi7RLPJzEE=","b1":"Am7S08nlX3hwW9yNo1rD5UIVaegCUfUgRu80X4+wGB7b","str":"3044022077916b5310fde3fc0d1c46886b77ac7b3a078967ce7d7c060f8f61dbc86f5b76022078b0b141adff56024dcefab24a85f305d1779caf3a3d3f2c72dce8bb44b3c9cc41 026ed2d3c9e55f78705bdc8da35ac3e5421569e80251f52046ef345f8fb0181edb","e":{"h":"25beb11d8551a9f333719b0c692f361bf48a170eea4d75dc86af9562af2649a6","i":0,"a":"qqfn9jzukyy4s3z6xs6v3423k4n8fuze7chd0cueuz"},"h0":"3044022077916b5310fde3fc0d1c46886b77ac7b3a078967ce7d7c060f8f61dbc86f5b76022078b0b141adff56024dcefab24a85f305d1779caf3a3d3f2c72dce8bb44b3c9cc41","h1":"026ed2d3c9e55f78705bdc8da35ac3e5421569e80251f52046ef345f8fb0181edb"}],"out":[{"i":0,"b0":{"op":118},"b1":{"op":169},"b2":"gD+OvtEfQtCrtl8uDpNCAgZMncg=","s2":"�?���\u001fBЫ�_.\u000e�B\u0002\u0006L��","b3":{"op":136},"b4":{"op":172},"str":"OP_DUP OP_HASH160 803f8ebed11f42d0abb65f2e0e934202064c9dc8 OP_EQUALVERIFY OP_CHECKSIG","e":{"v":6511000,"i":0,"a":"qzqrlr476y05959tke0jur5nggpqvnyaeqqh86levz"},"h2":"803f8ebed11f42d0abb65f2e0e934202064c9dc8"}]})
  }, 1000)
}

const init = function(config) {
  connections = config.connections
}

const send_mempool = function(tx) {
  Object.keys(connections.pool).forEach(async function(key) {
    let connection = connections.pool[key]
    const encoded = bcode.encode(connection.query)
    const types = encoded.q.db
    if (!types || types.indexOf("u") >= 0) {
      let filter = new mingo.Query(encoded.q.find)
      if (filter.test(tx)) {
        let decoded = bcode.decode(tx)
        let result
        try {
          if (encoded.r && encoded.r.f) {
            result = await jq.run(encoded.r.f, [decoded])
          } else {
            result = [decoded]
          }
        } catch (e) {
          console.log("Error", e)
        }
        connection.res.sseSend({ type: "mempool", data: result })
      }
    }
  })
}

const send_block = function(block) {
  Object.keys(connections.pool).forEach(async function(key) {
    let connection = connections.pool[key]
    const encoded = bcode.encode(connection.query)
    const types = encoded.q.db
    if (!types || types.indexOf("c") >= 0) {
      let filter = new mingo.Query(encoded.q.find)
      let filtered = block.txs.filter(function(tx) {
        return filter.test(tx)
      })
      let transformed = []
      for(let i=0; i<filtered.length; i++) {
        let tx = filtered[i]
        let decoded = bcode.decode(tx)
        let result
        try {
          if (encoded.r && encoded.r.f) {
            result = await jq.run(encoded.r.f, [decoded])
          } else {
            result = decoded
          }
          transformed.push(result)
        } catch (e) {
          console.log("Error", e)
        }
      }
      connection.res.sseSend({
        type: "block", index: block.i, data: transformed 
      })
    }
  })
}

streamfn()

module.exports = { init: init }


