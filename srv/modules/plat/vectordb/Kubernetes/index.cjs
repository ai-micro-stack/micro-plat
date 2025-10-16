require("module-alias/register");
const fs = require("fs");
// const { pull_Milvus } = require("./pull_milvus");
// const { pull_Qdrant } = require("./pull_qdrant");
// const { pull_Weaviatet } = require("./pull_weaviate");

async function ModuleHandler(confObj, taskDetails) {
  // console.log(confObj, null, 4);
  const serviceAccount = confObj.serviceAccount;
  const members = confObj.vectordb.members;
  // const clusters = confObj.resource.clusters;
  const modelServer = confObj.vectordb.model_server;

  let cluster = members.find((m) => m.hci_id === taskDetails.hci_id);
  if (!cluster) {
    console.log("Can't find the target cluster.");
    return;
  }

  if (taskDetails.target === "server" && modelServer !== "(None)") {
    console.log(
      `With ${cluster.hci_name}, it calls installing server: ${modelServer}`
    );
  }

  console.log(
    `With ${cluster.hci_name}, it calls pulling vectordb: ${cluster.vectordb_vendor_name}`
  );
  // switch (cluster.vectordb_vendor_name) {
  //   case "Milvus":
  //     await pull_Milvus(cluster, serviceAccount);
  //     break;
  //   case "Qdrant":
  //     await pull_Qdrant(cluster, serviceAccount);
  //     break;
  //   case "Weaviatet":
  //     await pull_Weaviatet(cluster, serviceAccount);
  //     break;
  //   default:
  //     console.log("Not supported vectordb: " + cluster.vectordb_vendor_name);
  //     break;
  // }
}

if (process.argv.length < 4) {
  console.log("Missing conf file argument. Quit task process ...");
} else {
  const confObjPath = process.argv[2];
  const taskDetails = JSON.parse(process.argv[3]);
  const confObject = fs.readFileSync(confObjPath, "utf8");
  const confObj = JSON.parse(confObject);
  ModuleHandler(confObj, taskDetails);
}
