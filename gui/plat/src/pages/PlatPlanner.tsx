import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Row,
  Col,
  Table,
  Button,
  ToggleButton,
  Alert,
  Modal,
} from "react-bootstrap";
import { useAuth } from "@/components/AuthService";
import Loading from "@/pages/Loading";
import type { moduleType } from "@/types/Addon";
import type { ClusterTuple, PlatType } from "@/types/Plat";
import { emptyPlat } from "@/types/Plat";
import { getAvailableClusters } from "@/utils/activeResource";
import { storeGuiContext, fetchGuiContext } from "@/utils/currentContext";

function PlatPlanner() {
  const bntInitState = {
    save: true,
    dnsr: true,
    etcf: true,
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

  const [spinning, setSpinning] = useState(false);
  const [errMsg, setErrMsg] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [bntStatus, setBntStatus] = useState(bntInitState);
  const [computeTypes, setComputeTypes] = useState<moduleType[]>([]);
  const [storageTypes, setStorageTypes] = useState<moduleType[]>([]);

  useEffect(
    () => {
      axiosInstance
        .get("/tentbuild/modules")
        .then(({ data }) => {
          setComputeTypes([...data.computeModules]);
          setStorageTypes([...data.storageModules]);
          getPlatData();
        })
        .catch((error) =>
          console.error("Get cluster config data failed ", error)
        );
    },
    // eslint-disable-next-line
    [refresh]
  );

  const getPlatData = () => {
    let platData = [];
    axiosInstance
      .get("/platplan/data")
      .then(({ data }) => {
        platData = data.map((plat: PlatType) => {
          return {
            ...plat,
            Clusters: plat.Clusters.map((cluster: ClusterTuple) => {
              return {
                ...cluster,
                compute_cluster:
                  computeTypes[cluster.compute_cluster_type ?? 0]?.moduleName,
                storage_cluster:
                  storageTypes[cluster.storage_cluster_type ?? 0]?.moduleName,
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
  };

  useEffect(
    () => {
      (() => {
        getPlatData();
      })();
    },
    // eslint-disable-next-line
    [computeTypes, storageTypes]
  );

  useEffect(() => {
    if (platId === null || appPlats.length > platId) {
      const availableClusters = getAvailableClusters(
        "planner",
        appPlats,
        platId
      );
      setClusterTuples(availableClusters.Clusters);
      setCurPlat(appPlats[platId ?? 0]);
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
        { ...curPlat },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
      .then(() => {
        setShowModal(false);
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
        console.error("Failed to send the member data to server.", error);
      });
  };

  const togglePlatMember = (picked: number) => {
    if (!platId) return;
    if ((picked ?? -1) !== -1) {
      clusterTuples[picked].plat_member = !clusterTuples[picked].plat_member;
    } else {
      const toggledAllAs = clusterTuples[0].plat_member ? false : true;
      setClusterTuples(
        clusterTuples.map((c) => {
          return { ...c, plat_member: toggledAllAs };
        })
      );
    }
    setBntStatus({
      ...bntStatus,
      save: false,
    });
  };

  const toggleEmbeddingMember = (picked: number) => {
    const member_name: keyof ClusterTuple = "embedding_member";
    if ((picked ?? -1) !== -1) {
      clusterTuples[picked][member_name] = !clusterTuples[picked][member_name];
    } else {
      const toggledAllAs = clusterTuples.filter((c) => {
        return c.plat_member === true; // && c.is_active;
      })[0][member_name]
        ? false
        : true;
      setClusterTuples(
        clusterTuples.map((c) => {
          return {
            ...c,
            [member_name]:
              c.plat_member === true // && c.is_active
                ? toggledAllAs
                : c[member_name],
          };
        })
      );
    }
    setBntStatus({
      ...bntStatus,
      save: false,
    });
  };

  const toggleVectordbMember = (picked: number) => {
    const member_name: keyof ClusterTuple = "vectordb_member";
    if ((picked ?? -1) !== -1) {
      clusterTuples[picked][member_name] = !clusterTuples[picked][member_name];
    } else {
      const toggledAllAs = clusterTuples.filter((c) => {
        return c.plat_member === true; // && c.is_active;
      })[0][member_name]
        ? false
        : true;
      setClusterTuples(
        clusterTuples.map((c) => {
          return {
            ...c,
            [member_name]:
              c.plat_member === true // && c.is_active
                ? toggledAllAs
                : c[member_name],
          };
        })
      );
    }
    setBntStatus({
      ...bntStatus,
      save: false,
    });
  };

  const toggleLlmodelMember = (picked: number) => {
    const member_name: keyof ClusterTuple = "llm_member";
    if ((picked ?? -1) !== -1) {
      clusterTuples[picked][member_name] = !clusterTuples[picked][member_name];
    } else {
      const toggledAllAs = clusterTuples.filter((c) => {
        return c.plat_member === true; // && c.is_active;
      })[0][member_name]
        ? false
        : true;
      setClusterTuples(
        clusterTuples.map((c) => {
          return {
            ...c,
            [member_name]:
              c.plat_member === true // && c.is_active
                ? toggledAllAs
                : c[member_name],
          };
        })
      );
    }
    setBntStatus({
      ...bntStatus,
      save: false,
    });
  };

  const changePlat = (targetPlat: number) => {
    setCurContext({ ...curContext, platId: targetPlat });
    storeGuiContext("plat.context", { ...curContext, platId: targetPlat });
    setPlatId(targetPlat);
    chgBntStatus("dirty");
  };

  const saveAllocations = () => {
    axiosInstance
      .post("/platplan/save", {
        plat_0: appPlats[0].id,
        plat_id: appPlats[platId ?? 0].id,
        Clusters: clusterTuples.map((c) => {
          return { ...c };
        }),
      })
      .then(() => {
        chgBntStatus("save");
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

  const chgBntStatus = (status: string) => {
    switch (status) {
      case "none":
        setSpinning(true);
        setBntStatus({
          save: true,
          dnsr: true,
          etcf: true,
          prev: true,
          next: true,
        });
        break;
      case "save":
        setSpinning(false);
        setBntStatus({
          save: true,
          dnsr: true,
          etcf: true,
          prev: false,
          next: false,
        });
        break;
      case "dnsr":
        setSpinning(false);
        setBntStatus({
          save: true,
          dnsr: true,
          etcf: true,
          prev: false,
          next: false,
        });
        break;
      case "etcf":
        setSpinning(false);
        setBntStatus({
          save: true,
          dnsr: true,
          etcf: true,
          prev: false,
          next: false,
        });
        break;
      case "dirty":
      default:
        setSpinning(false);
        setBntStatus({
          save: false,
          dnsr: true,
          etcf: true,
          prev: true,
          next: true,
        });
        break;
    }
  };

  const lstyle = { margin: 10 };
  const bstyle = { padding: 20 };

  return (
    <div>
      <h3 className="text-center" style={lstyle}>
        <b>Computing Plat Planner</b>
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
                  return (
                    <option
                      key={plat.plat_name}
                      value={id}
                      //disabled={id ? false : true}
                    >
                      {id
                        ? plat.plat_name + ": (list with addable clusters)"
                        : "Default list: (All free clusters)"}
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
                  {platId ? "Edit" : "Create"} Plat Stub
                </Button>
              </div>
            </Form.Group>
          </Row>
        </Form>
      </div>
      <Modal
        size="lg"
        backdrop="static"
        keyboard={false}
        show={showModal}
        onHide={handleModalClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>HCI Plat Stub</Modal.Title>
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
            <br />
            <h5>Plat General Information:</h5>
            <br />
            <Form.Group className="mb-2 d-flex">
              <Form.Label className=" col-sm-3 text-center">
                Plat Name:
              </Form.Label>
              <Form.Control
                required
                type="input"
                defaultValue={curPlat?.plat_name}
                onChange={(e) => {
                  setCurPlat({
                    ...curPlat,
                    plat_name: e.target.value,
                  });
                }}
              />
            </Form.Group>
            <Form.Group className="mb-2 d-flex">
              <Form.Label className=" col-sm-3 text-center">
                Plat Note:
              </Form.Label>
              <Form.Control
                required
                type="input"
                defaultValue={curPlat?.plat_note}
                onChange={(e) => {
                  setCurPlat({
                    ...curPlat,
                    plat_note: e.target.value,
                  });
                }}
              />
            </Form.Group>
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
              {/* <th>
                <b>Virtual IPv4</b>
              </th> */}
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
              <th>
                <b>Plat Member</b>
                <Button variant="link" onClick={() => togglePlatMember(-1)}>
                  <b>( All in/out )</b>
                </Button>
              </th>
              <th></th>
              <th>
                <b>Embedding Member</b>
                <Button
                  variant="link"
                  onClick={() => toggleEmbeddingMember(-1)}
                >
                  <b>( All in/out )</b>
                </Button>
              </th>
              <th>
                <b>VectorDb Member</b>
                <Button variant="link" onClick={() => toggleVectordbMember(-1)}>
                  <b>( All in/out )</b>
                </Button>
              </th>
              <th>
                <b>LLModel Member</b>
                <Button variant="link" onClick={() => toggleLlmodelMember(-1)}>
                  <b>( All in/out )</b>
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {clusterTuples.map((cluster: ClusterTuple, idx: number) => {
              return (
                <tr key={cluster.cluster_name} className="text-center">
                  {/* <td>{idx + 1}</td> */}
                  <td>{cluster.cluster_name}</td>
                  {/* <td>{cluster.balancer_cluster_vip}</td> */}
                  <td>{cluster.cluster_nodes}</td>
                  <td>{cluster.compute_cluster}</td>
                  <td>{cluster.compute_nodes}</td>
                  <td>{cluster.storage_cluster}</td>
                  <td>{cluster.storage_nodes}</td>
                  {/* <td>{cluster.cluster_status}</td> */}
                  {/* <td>{cluster.is_active ? "✓" : " "}</td> */}
                  <td className="text-center">
                    <ToggleButton
                      key={cluster.id + "@plat"}
                      id={idx.toString() + "@plat"}
                      type="checkbox"
                      variant={
                        cluster.plat_member
                          ? "outline-success"
                          : "outline-primary"
                      }
                      name="checkbox"
                      value={cluster.id || ""}
                      checked={cluster.plat_member}
                      onChange={(e) =>
                        togglePlatMember(parseInt(e.currentTarget.id))
                      }
                    ></ToggleButton>
                  </td>
                  <td></td>
                  <td>
                    {cluster.plat_member && (
                      <ToggleButton
                        key={cluster.id + "@embedding"}
                        id={idx.toString() + "@embedding"}
                        type="checkbox"
                        variant={
                          cluster.embedding_member
                            ? "outline-success"
                            : "outline-primary"
                        }
                        name="checkbox"
                        value={cluster.id || ""}
                        checked={cluster.embedding_member}
                        onChange={(e) =>
                          toggleEmbeddingMember(parseInt(e.currentTarget.id))
                        }
                      ></ToggleButton>
                    )}
                  </td>
                  <td>
                    {cluster.plat_member && (
                      <ToggleButton
                        key={cluster.id + "@vectordb"}
                        id={idx.toString() + "@vectordb"}
                        type="checkbox"
                        variant={
                          cluster.vectordb_member
                            ? "outline-success"
                            : "outline-primary"
                        }
                        name="checkbox"
                        value={cluster.id || ""}
                        checked={cluster.vectordb_member}
                        onChange={(e) =>
                          toggleVectordbMember(parseInt(e.currentTarget.id))
                        }
                      ></ToggleButton>
                    )}
                  </td>
                  <td>
                    {cluster.plat_member && (
                      <ToggleButton
                        key={cluster.id + "@llm"}
                        id={idx.toString() + "@llm"}
                        type="checkbox"
                        variant={
                          cluster.llm_member
                            ? "outline-success"
                            : "outline-primary"
                        }
                        name="checkbox"
                        value={cluster.id || ""}
                        checked={cluster.llm_member}
                        onChange={(e) =>
                          toggleLlmodelMember(parseInt(e.currentTarget.id))
                        }
                      ></ToggleButton>
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
                saveAllocations();
              }
            }}
          >
            Save Allocation
          </Button>
          <Button
            className="float-end"
            variant={bntStatus.next ? "outline-secondary" : "outline-primary"}
            style={lstyle}
            disabled={bntStatus.next}
            onClick={(e) => {
              e.preventDefault();
              navigate("/plat-builder");
            }}
          >
            Platform Builder &#9655;&#x25B7;
          </Button>
          <Button
            className="float-end"
            variant={bntStatus.prev ? "outline-secondary" : "outline-primary"}
            style={lstyle}
            disabled={bntStatus.prev}
            onClick={(e) => {
              e.preventDefault();
              navigate("/plat-manager");
            }}
          >
            &#9665;&#x25C1; Platform Manager
          </Button>
        </Form>
      </div>
      {spinning && <Loading />}
    </div>
  );
}

export default PlatPlanner;
