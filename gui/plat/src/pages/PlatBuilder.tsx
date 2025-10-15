import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Row, Col, Table, Button, Alert, Modal } from "react-bootstrap";
import { useAuth } from "@/components/AuthService";
import Loading from "@/pages/Loading";
import type { moduleType } from "@/types/Addon";
// import type { platModuleAreas } from "@/types/Plat";
// import { platEmptyAreas } from "@/types/Plat";
import type { tentModuleAreas } from "@/types/Tent";
import { tentEmptyAreas } from "@/types/Tent";
import type { ClusterTuple, PlatType } from "@/types/Plat";
import { defaultPlat, emptyPlat } from "@/types/Plat";
import { getAvailableClusters } from "@/utils/activeResource";
import { storeGuiContext, fetchGuiContext } from "@/utils/currentContext";
import { TerminalModal } from "@/components/WebTerminal";

function PlatBuilder() {
  const bntInitState = {
    save: true,
    buld: true,
    updt: true,
    prev: false,
    next: false,
  };
  const navigate = useNavigate();
  const { axiosInstance } = useAuth();
  const [curContext, setCurContext] = useState({
    ...fetchGuiContext("plat.context"),
  });
  const [platId, setPlatId] = useState<number | null>(0);

  const [refresh, setRefresh] = useState(0);

  const [appPlats, setAppPlats] = useState<PlatType[]>([]);
  const [curPlat, setCurPlat] = useState<PlatType>(emptyPlat);

  const [clusterTuples, setClusterTuples] = useState<ClusterTuple[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [modalAlert, setModalAlert] = useState(false);
  const [validated, setValidated] = useState(false);

  // const [platformAreas, setPlatformAreas] =
  //   useState<platModuleAreas>(platEmptyAreas);
  const [clusterAreas, setClusterAreas] =
    useState<tentModuleAreas>(tentEmptyAreas);

  const [embeddingModules, setEmbeddingModules] = useState<moduleType[]>([]);
  const [vectordbModules, setVectordbModules] = useState<moduleType[]>([]);
  const [llmModules, setLlmModules] = useState<moduleType[]>([]);
  const [balancerTypes, setBalancerTypes] = useState<moduleType[]>([]);
  const [computeTypes, setComputeTypes] = useState<moduleType[]>([]);
  const [storageTypes, setStorageTypes] = useState<moduleType[]>([]);

  const supportedServers = [
    { name: "(None)", notfor: [] },
    { name: "Ollama", notfor: ["vectordb"] },
  ];
  const [serverOpts, setServerOpts] = useState(supportedServers);

  const [spinning, setSpinning] = useState(false);
  const [errMsg, setErrMsg] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [bntStatus, setBntStatus] = useState(bntInitState);

  const [showTerminal, setShowTerminal] = useState(false);

  const defaultOption = "-- select a platform --";

  useEffect(
    () => {
      axiosInstance
        .get("/platbuild/modules")
        .then(({ data }) => {
          // setPlatformAreas({ ...data });
          setEmbeddingModules([...data.embeddingModules]);
          setVectordbModules([...data.vectordbModules]);
          setLlmModules([...data.llmModules]);
        })
        .catch((error) =>
          console.error("Get platform config data failed ", error)
        );

      axiosInstance
        .get("/tentbuild/modules")
        .then(({ data }) => {
          setClusterAreas({ ...data });
          setBalancerTypes([...data.balancerModules]);
          setComputeTypes([...data.computeModules]);
          setStorageTypes([...data.storageModules]);
        })
        .catch((error) =>
          console.error("Get cluster config data failed ", error)
        );
    },
    // eslint-disable-next-line
    [refresh]
  );

  useEffect(
    () => {
      let platData = [];
      axiosInstance
        .get("/platplan/data")
        .then(({ data }) => {
          platData = data
            // .filter(
            //   (plat: PlatType) => plat.plat_name !== defaultPlat.plat_name
            // )
            .map((plat: PlatType) => {
              return {
                ...plat,
                Clusters: plat.Clusters.map((cluster: ClusterTuple) => {
                  return {
                    ...cluster,
                    balancer_cluster:
                      balancerTypes[cluster.balancer_cluster_type ?? 0]
                        ?.moduleName,
                    compute_cluster:
                      computeTypes[cluster.compute_cluster_type ?? 0]
                        ?.moduleName,
                    storage_cluster:
                      storageTypes[cluster.storage_cluster_type ?? 0]
                        ?.moduleName,
                  };
                }),
              };
            });
          setAppPlats(platData);

          if (curContext.platId === null || curContext.platId >= data.length) {
            changePlat(0);
          } else setPlatId(curContext.platId ?? 0);
          if (platData.length) {
            setBntStatus({
              ...bntStatus,
              prev: false,
              next: false,
            });
          }
        })
        .catch((error) => console.error("Get Plat Data failed ", error));
    },
    // eslint-disable-next-line
    [clusterAreas]
  );

  useEffect(() => {
    if (platId === null || appPlats.length > platId) {
      const availableClusters = getAvailableClusters(
        "builder",
        appPlats,
        platId
      );
      setClusterTuples(availableClusters.Clusters);
      setCurPlat(appPlats[platId ?? 0]);
      setServerOpts(supportedServers);
    }
  }, [appPlats, platId]);

  const handleModalShow = (id: number | null) => {
    const curplatId = id ?? platId;
    const plat: PlatType = curplatId ? appPlats[curplatId] : emptyPlat;
    setCurPlat(plat);
    setModalAlert(false);
    setValidated(false);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setCurPlat(emptyPlat);
    setModalAlert(false);
    setValidated(false);
    setShowModal(false);
  };

  const handleModalSave = () => {
    const postRoute = curPlat.id ? "update" : "create";
    axiosInstance
      .post(
        `/platplan/${postRoute}`,
        {
          ...curPlat,
          // subnet_id: subnets[subnetId].id,
          // compute_cluster_type: curPlat.compute_cluster_type ?? 0,
          // storage_cluster_type: curPlat.storage_cluster_type ?? 0,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            // "x-member-uuid": curPlat.id,
          },
        }
      )
      .then((/*{ data }*/) => {
        setShowModal(false);
        // setComputeRoles(
        //   clusterAreas.computeModules[data.compute_cluster_type ?? 0]
        //     .moduleRoles
        // );

        // setStorageRoles(
        //   clusterAreas.storageModules[data.storage_cluster_type ?? 0]
        //     .moduleRoles
        // );

        // setBalancerRoles(
        //   clusterAreas.balancerModules[data.balancer_cluster_type ?? 0]
        //     .moduleRoles
        // );

        setRefresh(refresh + 1);
      })
      .catch((error) => {
        setErrMsg([
          error.message,
          error.status === 403
            ? "--- You don't have permission to make this operation."
            : "",
        ]);
        setModalAlert(true);
        console.error("Failed.", error);
      });
  };

  const changeEmbeddingModel = (clusterId: number, roleId: number) => {
    clusterTuples[clusterId].embedding_model = roleId;
  };
  const changeVectordbVendor = (clusterId: number, roleId: number) => {
    clusterTuples[clusterId].vectordb_vendor = roleId;
  };
  const changeLlmModel = (clusterId: number, roleId: number) => {
    clusterTuples[clusterId].llm_model = roleId;
  };

  const changePlat = (targetPlat: number) => {
    setCurContext({ ...curContext, platId: targetPlat });
    storeGuiContext("plat.context", { ...curContext, platId: targetPlat });
    setPlatId(targetPlat);
    chgBntStatus("dirty");
  };

  const saveAssignment = () => {
    axiosInstance
      .post("/platplan/save", {
        // app_id: apps[appId].id,
        plat_0: appPlats[0].id,
        plat_id: appPlats[platId ?? 0].id,
        Clusters: clusterTuples.map((c) => {
          return { ...c };
        }),
      })
      .then(() => {
        chgBntStatus("save");
        axiosInstance
          .post("/platbuild/conf", {
            // subnet_id: appPlats[platId].id,
            // plat_id: appPlats[platId ?? 1].id,
            // Subnet: ..
            Plat: curPlat,
            Clusters: clusterTuples.map((c) => {
              return {
                ...c,
                embedding_module:
                  embeddingModules[c.compute_cluster_type ?? 0].moduleName,
                vectordb_module:
                  vectordbModules[c.compute_cluster_type ?? 0].moduleName,
                llm_module: llmModules[c.compute_cluster_type ?? 0].moduleName,
                embedding_model_name:
                  embeddingModules.filter((m) => {
                    return (
                      m.moduleName ===
                      computeTypes[c.compute_cluster_type ?? 0]?.moduleName
                    );
                  })[0]?.moduleRoles[c.embedding_model ?? 0].role ?? "(None)",
                vectordb_vendor_name:
                  vectordbModules.filter((m) => {
                    return (
                      m.moduleName ===
                      computeTypes[c.compute_cluster_type ?? 0]?.moduleName
                    );
                  })[0]?.moduleRoles[c.vectordb_vendor ?? 0].role ?? "(None)",
                llm_model_name:
                  llmModules.filter((m) => {
                    return (
                      m.moduleName ===
                      computeTypes[c.compute_cluster_type ?? 0]?.moduleName
                    );
                  })[0]?.moduleRoles[c.llm_model ?? 0].role ?? "(None)",
              };
            }),
          })
          .then(() => {
            chgBntStatus("save");
            // setRefresh(refresh + 1);
          })
          .catch((error) => {
            chgBntStatus("save");
            setErrMsg([
              error.message,
              error.status === 403
                ? "--- You don't have permission to make this operation."
                : "",
            ]);
            setShowAlert(true);
            console.error("Failed to build the cluster. ", error);
          });
        setRefresh(refresh + 1);
      })
      .catch((error) => {
        chgBntStatus("save");
        setErrMsg([
          error.message,
          error.status === 403
            ? "--- You don't have permission to make this operation."
            : "",
        ]);
        setShowAlert(true);
        console.error("Failed to save the resources.", error);
      });
  };

  const buildPlatform = () => {
    const confirmBuild = window.confirm(
      `You are about to build a AI platform with the current settings. Click OK to continue.`
    );
    if (!confirmBuild) return;
    chgBntStatus("none");
    axiosInstance
      .post("/platplan/save", {
        // app_id: apps[appId].id,
        plat_0: appPlats[0].id,
        plat_id: appPlats[platId ?? 0].id,
        Clusters: clusterTuples.map((c) => {
          return { ...c };
        }),
      })
      .then(() => {
        chgBntStatus("save");
        axiosInstance
          .post("/platbuild/build", {
            Plat: curPlat,
            Clusters: clusterTuples.map((c) => {
              return {
                ...c,
                embedding_module:
                  embeddingModules[c.compute_cluster_type ?? 0].moduleName,
                vectordb_module:
                  vectordbModules[c.compute_cluster_type ?? 0].moduleName,
                llm_module: llmModules[c.compute_cluster_type ?? 0].moduleName,
                embedding_model_name:
                  embeddingModules.filter((m) => {
                    return (
                      m.moduleName ===
                      computeTypes[c.compute_cluster_type ?? 0]?.moduleName
                    );
                  })[0]?.moduleRoles[c.embedding_model ?? 0].role ?? "(None)",
                vectordb_vendor_name:
                  vectordbModules.filter((m) => {
                    return (
                      m.moduleName ===
                      computeTypes[c.compute_cluster_type ?? 0]?.moduleName
                    );
                  })[0]?.moduleRoles[c.vectordb_vendor ?? 0].role ?? "(None)",
                llm_model_name:
                  llmModules.filter((m) => {
                    return (
                      m.moduleName ===
                      computeTypes[c.compute_cluster_type ?? 0]?.moduleName
                    );
                  })[0]?.moduleRoles[c.llm_model ?? 0].role ?? "(None)",
              };
            }),
          })
          .then(() => {
            chgBntStatus("buld");
            setRefresh(refresh + 1);
          })
          .then(() => {
            handleTerminalShow();
          })
          .then(() => {
            if (!curPlat.build_auto_lock) return;
            axiosInstance.post("/platplan/update", {
              ...curPlat,
              is_locked: true,
            });
          })
          .catch((error) => {
            chgBntStatus("buld");
            setErrMsg([
              error.message,
              error.status === 403
                ? "--- You don't have permission to make this operation."
                : "",
            ]);
            setShowAlert(true);
            console.error("Failed to build the cluster. ", error);
          });
      })
      .catch((error) => {
        chgBntStatus("save");
        setErrMsg([
          error.message,
          error.status === 403
            ? "--- You don't have permission to make this operation."
            : "",
        ]);
        setShowAlert(true);
        console.error("Failed to save the cluster assignment.", error);
      });
  };

  const chgBntStatus = (status: string) => {
    switch (status) {
      case "none":
        setSpinning(true);
        setBntStatus({
          save: true,
          buld: true,
          updt: true,
          prev: false,
          next: true,
        });
        break;
      case "save":
        setSpinning(false);
        setBntStatus({
          save: true,
          buld: false,
          updt: false,
          prev: false,
          next: true,
        });
        break;
      case "buld":
        setSpinning(false);
        setBntStatus({
          save: true,
          buld: true,
          updt: false,
          prev: false,
          next: false,
        });
        break;
      case "updt":
        setSpinning(false);
        setBntStatus({
          save: true,
          buld: true,
          updt: true,
          prev: false,
          next: false,
        });
        break;
      case "dirty":
      default:
        setSpinning(false);
        setBntStatus({
          save: false,
          buld: false,
          updt: true,
          prev: false,
          next: true,
        });
        break;
    }
  };

  const handleTerminalShow = () => {
    setShowTerminal(true);
  };
  const handleTerminalClose = () => {
    setShowTerminal(false);
  };

  const lstyle = { margin: 10 };
  const bstyle = { padding: 20 };

  const optionTransformer = (option: string) => {
    const transfer = option === defaultPlat.plat_name;
    return {
      disabled: transfer,
      option: transfer ? defaultOption : option,
    };
  };

  return (
    <div>
      <h3 className="text-center" style={lstyle}>
        <b>Computing Plat Builder</b>
      </h3>
      <div className="jumbotron">
        <Form>
          {showAlert && (
            <Alert
              className="mb-2"
              variant="danger"
              onClose={() => setShowAlert(false)}
              dismissible
            >
              {errMsg?.join(" ") ?? "An unknown error."}
            </Alert>
          )}
          <Row>
            <Form.Group as={Col}>
              <Form.Label>Plat:</Form.Label>
              <Form.Select
                value={platId ?? 0}
                onChange={(e) => {
                  e.preventDefault();
                  changePlat(Number(e.target.value));
                  chgBntStatus("dirty");
                }}
              >
                {appPlats.map((plat, id) => {
                  const optDisplay = optionTransformer(plat.plat_name);
                  return (
                    <option
                      key={plat.plat_name}
                      value={id}
                      disabled={optDisplay.disabled}
                    >
                      {optDisplay.option}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col}>
              <Form.Label>Action:</Form.Label>
              <div>
                <Button
                  variant="outline-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    handleModalShow(platId);
                  }}
                >
                  {platId ? "Edit" : "Create"} Plat Settings
                </Button>
              </div>
            </Form.Group>
          </Row>
        </Form>
      </div>
      <Modal
        size="xl"
        backdrop="static"
        keyboard={false}
        show={showModal}
        onHide={handleModalClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Plat Cluster Settings</Modal.Title>
        </Modal.Header>
        {modalAlert && (
          <Alert
            className="mb-2"
            variant="danger"
            onClose={() => setShowAlert(false)}
            dismissible
          >
            {errMsg?.join(" ") ?? "An unknown error."}
          </Alert>
        )}
        <Modal.Body>
          <Form noValidate validated={validated}>
            <div>
              <h5>Embedding Cluster:</h5>
              <br />
              <Row>
                <Col>
                  <Form.Group className="mb-2 d-flex">
                    <Form.Label className=" col-sm-3 text-center">
                      Model Server:
                    </Form.Label>
                    <Form.Select
                      value={curPlat?.embedding_model_server}
                      onChange={(e) => {
                        setCurPlat({
                          ...curPlat,
                          embedding_model_server: e.target.value,
                        });
                      }}
                    >
                      {serverOpts.map((modelServer) => {
                        return (
                          <option
                            key={modelServer.name}
                            value={modelServer.name}
                            disabled={modelServer.notfor.includes("embedding")}
                          >
                            {modelServer.name}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-2 d-flex">
                    <Form.Label className=" col-sm-3 text-center">
                      Model Store:
                    </Form.Label>
                    <Form.Control
                      required
                      type="input"
                      defaultValue={curPlat?.embedding_model_store}
                      onChange={(e) => {
                        setCurPlat({
                          ...curPlat,
                          embedding_model_store: e.target.value,
                        });
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
            <hr />
            <div>
              <h5>LLM Cluster:</h5>
              <br />
              <Row>
                <Col>
                  <Form.Group className="mb-2 d-flex">
                    <Form.Label className=" col-sm-3 text-center">
                      Model Server:
                    </Form.Label>
                    <Form.Select
                      value={curPlat?.llm_model_server}
                      onChange={(e) => {
                        setCurPlat({
                          ...curPlat,
                          llm_model_server: e.target.value,
                        });
                      }}
                    >
                      {serverOpts.map((modelServer) => {
                        return (
                          <option
                            key={modelServer.name}
                            value={modelServer.name}
                            disabled={modelServer.notfor.includes("iim")}
                          >
                            {modelServer.name}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-2 d-flex">
                    <Form.Label className=" col-sm-3 text-center">
                      Model Store:
                    </Form.Label>
                    <Form.Control
                      required
                      type="input"
                      defaultValue={curPlat?.llm_model_store}
                      onChange={(e) => {
                        setCurPlat({
                          ...curPlat,
                          llm_model_store: e.target.value,
                        });
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
            <hr />
            <div>
              <h5>VectorDb Cluster:</h5>
              <br />
              <Row>
                <Col>
                  <Form.Group className="mb-2 d-flex">
                    <Form.Label className=" col-sm-3 text-center">
                      Model Server:
                    </Form.Label>
                    <Form.Select
                      value={curPlat?.vectordb_data_server}
                      onChange={(e) => {
                        setCurPlat({
                          ...curPlat,
                          vectordb_data_server: e.target.value,
                        });
                      }}
                    >
                      {serverOpts.map((modelServer) => {
                        return (
                          <option
                            key={modelServer.name}
                            value={modelServer.name}
                            disabled={modelServer.notfor.includes("vectordb")}
                          >
                            {modelServer.name}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-2 d-flex">
                    <Form.Label className=" col-sm-3 text-center">
                      Data Store:
                    </Form.Label>
                    <Form.Control
                      required
                      type="input"
                      defaultValue={curPlat?.vectordb_data_store}
                      onChange={(e) => {
                        setCurPlat({
                          ...curPlat,
                          vectordb_data_store: e.target.value,
                        });
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
            <hr />
            <div>
              <h5>Change Control:</h5>
              <br />
              <Row>
                <Col>
                  <Form.Group className="mb-2 d-flex">
                    <Form.Label className="col-sm-3 text-center">
                      Lock Plat:
                    </Form.Label>
                    <Form.Check
                      type="switch"
                      id="cluster-lock-switch"
                      // label="Lock this cluster"
                      checked={curPlat?.is_locked}
                      onChange={(e) => {
                        setCurPlat({
                          ...curPlat,
                          is_locked: e.target.checked,
                        });
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-2 d-flex">
                    <Form.Label className="col-sm-3 text-center">
                      Build Auto-lock:
                    </Form.Label>
                    <Form.Check
                      type="switch"
                      id="cluster-lock-switch"
                      checked={curPlat?.build_auto_lock}
                      onChange={(e) => {
                        setCurPlat({
                          ...curPlat,
                          build_auto_lock: e.target.checked,
                        });
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleModalSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="table" style={bstyle}>
        <Table striped bordered hover>
          <thead className="text-center align-middle">
            <tr>
              {/* <th>
                <b>Cluster Id</b>
              </th> */}
              <th>
                <b>Cluster Name</b>
              </th>
              <th>
                <b>Virtual IPv4</b>
              </th>
              <th>
                <b>Total Nodes</b>
              </th>
              <th>
                <b>Compute Cluster</b>
              </th>
              <th>
                <b>Compute Nodes</b>
              </th>
              <th>
                <b>Storage Cluster</b>
              </th>
              <th>
                <b>Storage Nodes</b>
              </th>
              {/* <th>
                <b>Cluster Status</b>
              </th> */}
              <th></th>
              <th>
                <b>Embedding Model</b>
              </th>
              <th>
                <b>VectorDb Vendor</b>
              </th>
              <th>
                <b>LLM Model</b>
              </th>
            </tr>
          </thead>
          <tbody>
            {clusterTuples.map((cluster: ClusterTuple, idx: number) => {
              return (
                <tr key={cluster.cluster_name} className="text-center">
                  {/* <td>{idx + 1}</td> */}
                  <td>{cluster.cluster_name}</td>
                  <td>{cluster.balancer_cluster_vip}</td>
                  <td>{cluster.cluster_nodes}</td>
                  <td>{cluster.compute_cluster}</td>
                  <td>{cluster.compute_nodes}</td>
                  <td>{cluster.storage_cluster}</td>
                  <td>{cluster.storage_nodes}</td>
                  {/* <td>{cluster.cluster_status}</td> */}
                  {/* <td>{cluster.is_active ? "✓" : " "}</td> */}
                  <td></td>
                  <td>
                    {cluster.plat_member && cluster.embedding_member && (
                      <Form.Select
                        key={cluster.id + "@storageRole"}
                        id={idx.toString() + "@storageRole"}
                        value={cluster.embedding_model ?? 0}
                        onChange={(e) => {
                          e.preventDefault();
                          changeEmbeddingModel(
                            parseInt(e.target.id),
                            Number(e.target.value)
                          );
                          chgBntStatus("dirty");
                        }}
                      >
                        {embeddingModules
                          .filter((m) => {
                            return (
                              m.moduleName ===
                              computeTypes[cluster.compute_cluster_type ?? 0]
                                ?.moduleName
                            );
                          })[0]
                          .moduleRoles.map((opt, id) => {
                            return (
                              <option
                                key={opt.role}
                                value={id}
                                disabled={opt.disabled ?? false}
                                // disabled={opt.moduleStatus >= 0 ? false : true}
                              >
                                {opt.role}
                              </option>
                            );
                          })}
                      </Form.Select>
                    )}
                  </td>
                  <td>
                    {cluster.plat_member && cluster.vectordb_member && (
                      <Form.Select
                        key={cluster.id + "@storageRole"}
                        id={idx.toString() + "@storageRole"}
                        value={cluster.vectordb_vendor ?? 0}
                        onChange={(e) => {
                          e.preventDefault();
                          changeVectordbVendor(
                            parseInt(e.target.id),
                            Number(e.target.value)
                          );
                          chgBntStatus("dirty");
                        }}
                      >
                        {vectordbModules
                          .filter((m) => {
                            return (
                              m.moduleName ===
                              computeTypes[cluster.compute_cluster_type ?? 0]
                                ?.moduleName
                            );
                          })[0]
                          .moduleRoles.map((opt, id) => {
                            return (
                              <option
                                key={opt.role}
                                value={id}
                                disabled={opt.disabled ?? false}
                                // disabled={opt.moduleStatus >= 0 ? false : true}
                              >
                                {opt.role}
                              </option>
                            );
                          })}
                      </Form.Select>
                    )}
                  </td>
                  <td>
                    {cluster.plat_member && cluster.llm_member && (
                      <Form.Select
                        key={cluster.id + "@storageRole"}
                        id={idx.toString() + "@storageRole"}
                        value={cluster.llm_model ?? 0}
                        onChange={(e) => {
                          e.preventDefault();
                          changeLlmModel(
                            parseInt(e.target.id),
                            Number(e.target.value)
                          );
                          chgBntStatus("dirty");
                        }}
                      >
                        {llmModules
                          .filter((m) => {
                            return (
                              m.moduleName ===
                              computeTypes[cluster.compute_cluster_type ?? 0]
                                ?.moduleName
                            );
                          })[0]
                          .moduleRoles.map((opt, id) => {
                            return (
                              <option
                                key={opt.role}
                                value={id}
                                disabled={opt.disabled ?? false}
                                // disabled={opt.moduleStatus >= 0 ? false : true}
                              >
                                {opt.role}
                              </option>
                            );
                          })}
                      </Form.Select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      <div className="jumbotron">
        <Form>
          <Button
            variant={bntStatus.save ? "secondary" : "primary"}
            style={lstyle}
            disabled={bntStatus.save}
            onClick={(e) => {
              e.preventDefault();
              if (!bntStatus.save) {
                saveAssignment();
              }
            }}
          >
            Save Assignment
          </Button>
          <Button
            variant={
              bntStatus.buld || curPlat.is_locked ? "secondary" : "primary"
            }
            style={lstyle}
            disabled={bntStatus.buld || curPlat.is_locked}
            onClick={(e) => {
              e.preventDefault();
              if (!bntStatus.buld) {
                buildPlatform();
              }
            }}
          >
            Setup the Plat
          </Button>
          <Button
            variant={bntStatus.buld ? "secondary" : "primary"}
            style={lstyle}
            disabled={bntStatus.buld}
            onClick={(e) => {
              e.preventDefault();
              if (!bntStatus.buld) {
                // buildPlatform();
              }
            }}
          >
            Load up Models
          </Button>
          <Button
            className="float-end"
            variant={bntStatus.next ? "outline-secondary" : "outline-primary"}
            style={lstyle}
            disabled={bntStatus.next}
            onClick={(e) => {
              e.preventDefault();
              navigate("/plat-platform");
            }}
          >
            Active Platform &#9655;&#x25B7;
          </Button>
          <Button
            className="float-end"
            variant={bntStatus.prev ? "outline-secondary" : "outline-primary"}
            style={lstyle}
            disabled={bntStatus.prev}
            onClick={(e) => {
              e.preventDefault();
              navigate("/plat-planner");
            }}
          >
            &#9665;&#x25C1; Platform Planner
          </Button>
        </Form>
      </div>
      {spinning && <Loading />}
      <TerminalModal
        showTerminal={showTerminal}
        handleTerminalClose={handleTerminalClose}
      />
    </div>
  );
}

export default PlatBuilder;
