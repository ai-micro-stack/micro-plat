import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Table, Button } from "react-bootstrap";
import { Alert } from "react-bootstrap";
import { useAuth } from "@/components/AuthService";
import PlatModal from "@/components/PlatModal";
// import Loading from "@/pages/Loading";
import type { ClusterTuple, PlatType } from "@/types/Plat";
import type { moduleType } from "@/types/Addon";
import { defaultPlat, emptyPlat, platTypes } from "@/types/Plat";
import { formatDate } from "@/utils/formatDate";
import { getAvailableClusters } from "@/utils/activeResource";

function PlatManager() {
  const bntInitState = {
    add: false,
    prev: false,
    next: false,
  };
  const navigate = useNavigate();
  const { axiosInstance } = useAuth();

  const [refresh, setRefresh] = useState(0);

  const [appPlats, setAppPlats] = useState<PlatType[]>([]);
  // const [spinning, setSpinning] = useState(false);
  const [errMsg, setErrMsg] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [bntStatus, setBntStatus] = useState(bntInitState);
  const [showModal, setShowModal] = useState(false);
  const [modalPlat, setModalPlat] = useState(emptyPlat);
  const [modalAlert, setModalAlert] = useState(false);
  const [validated, setValidated] = useState(false);
  const [computeTypes, setComputeTypes] = useState<moduleType[]>([]);
  const [coreCluster, setCoreCluster] = useState<ClusterTuple | null>(null);

  const [platId, setPlatId] = useState<number | null>(0);
  const [clusterTuples, setClusterTuples] = useState<ClusterTuple[]>([]);

  useEffect(
    () => {
      axiosInstance
        .get("/tentbuild/modules")
        .then(({ data }) => {
          setComputeTypes([...data.computeModules]);
        })
        .catch((error) =>
          console.error("Get cluster config data failed ", error)
        );
    },
    // eslint-disable-next-line
    []
  );

  const getPlatData = () => {
    let platData = [];
    axiosInstance
      .get("/platplan/data")
      .then(({ data }) => {
        platData = data.map((plat: PlatType) => {
          return plat;
        });
        setAppPlats(platData);
        if (platData.length) {
          setBntStatus({
            ...bntStatus,
            prev: false,
            next: false,
          });
        }
      })
      .catch((error) => console.error("Get Cluster Plat failed ", error));
  };

  useEffect(
    () => {
      getPlatData();
    },
    // eslint-disable-next-line
    [refresh, computeTypes]
  );

  useEffect(() => {
    const availableClusters = getAvailableClusters("planner", appPlats, platId);
    setClusterTuples(availableClusters.Clusters);
    if (platId === null && showModal) {
      setCoreCluster(availableClusters.Clusters[0] || null);
    }
  }, [appPlats, platId, showModal]);

  const handleModalShow = (id: number | null) => {
    if (id === null) {
      setModalPlat(emptyPlat);
      setCoreCluster(null);
      setPlatId(null);
    } else {
      const plat = appPlats.find((p: PlatType) => p.id === id) ?? emptyPlat;
      setModalPlat(plat);
      const coreCluster = plat.Clusters?.find((c: ClusterTuple) => c.plat_core_cluster);
      setCoreCluster(coreCluster || null);
      const index = appPlats.findIndex((p: PlatType) => p.id === id);
      setPlatId(index !== -1 ? index : null);
    }
    setModalAlert(false);
    setValidated(false);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setModalPlat(emptyPlat);
    setModalAlert(false);
    setValidated(false);
    setShowModal(false);
  };

  const handleModalSave = () => {
    // const form = e.currentTarget;
    // if (form.checkValidity() === false) {
    //   e.preventDefault();
    //   e.stopPropagation();
    // }
    // setValidated(true);

    const postRoute = modalPlat.id ? "update" : "create";
    axiosInstance
      .post(
        `/platplan/${postRoute}`,
        { ...modalPlat, selectedCoreCluster: coreCluster?.cluster_name || null },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "x-plat-id": modalPlat.id,
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
        console.error("Failed to send the plat data to server.", error);
      });
  };

  const platDelete = (id: number) => {
    const plat: PlatType | undefined = appPlats.find((plat: PlatType) => {
      return plat.id === id;
    });
    const confirmDelete = window.confirm(`Delete "${plat?.plat_name}" ?`);
    if (confirmDelete) {
      axiosInstance
        .delete(
          "/platplan/delete", // { params: id },
          {
            headers: {
              "x-plat-id": id.toString(),
            },
          }
        )
        .then(() => {
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
          console.error("Delete team plat failed ", error);
        });
    }
  };

  const lstyle = { margin: 10 };
  const bstyle = { padding: 20 };

  return (
    <div>
      <h3 className="text-center" style={lstyle}>
        <b>Parallel Computing Plats</b>
      </h3>
      {/* <div className="jumbotron">
        <Form>
          <Form.Group>
            <Form.Control
              id="fileSelector"
              onChange={(e) => {
                getFileContext(e.target);
              }}
              // label="Example file input"
              type="file"
            />
          </Form.Group>
        </Form>
      </div> */}
      {/* ALert */}
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
      <div className="table" style={bstyle}>
        <Table striped bordered hover>
          <thead className="text-center">
            <tr>
              <th>
                <Button variant="link">
                  <b>Plat Name (&#9650;&#9660;)</b>
                </Button>
              </th>
              <th>
                <Button variant="link">
                  <b>Plat Note (&#9650;&#9660;)</b>
                </Button>
              </th>
              <th>
                <Button variant="link">
                  <b>Plat_URI (&#9650;&#9660;)</b>
                </Button>
              </th>
              <th>
                <Button variant="link">
                  <b>Plat_Type (&#9650;&#9660;)</b>
                </Button>
              </th>
              <th>
                <Button variant="link">
                  <b>Created At (&#9650;&#9660;)</b>
                </Button>
              </th>
              <th>
                <Button variant="link">
                  <b>Active (&#9650;&#9660;)</b>
                </Button>
              </th>
              <th>
                <Button variant="link">
                  <b>Modifiers</b>
                </Button>
              </th>
            </tr>
          </thead>
          <tbody className="text-center">
            {appPlats
              .filter((plat: PlatType) => {
                return plat.plat_name !== defaultPlat.plat_name;
              })
              .map((plat: PlatType) => {
              return (
                <tr key={plat.id}>
                  <td>{plat.plat_name}</td>
                  <td>{plat.plat_note}</td>
                  <td>{plat.plat_vip}</td>
                  <td>
                    {!plat.plat_type || plat.plat_type === 0
                      ? ""
                      : platTypes.find(({ key }) => {
                          return key == plat.plat_type;
                        })?.plat_type_name}
                  </td>
                  <td>{formatDate(plat.createdAt)}</td>
                  <td>{plat.is_active ? "Yes" : "No"}</td>
                  <td className="d-flex gap-2">
                    <Button
                      className="edit-btn"
                      variant="danger"
                      style={{
                        padding: "0.125rem 0.25rem",
                        fontSize: "0.75rem",
                      }}
                      onClick={() => handleModalShow(plat.id)}
                    >
                      <b>&#9998; Edit</b>
                    </Button>
                    <Button
                      className="remove-btn"
                      variant="danger"
                      style={{
                        padding: "0.125rem 0.25rem",
                        fontSize: "0.75rem",
                      }}
                      onClick={() => platDelete(plat.id)}
                    >
                      <b>&#10005; Delete</b>
                    </Button>
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
            variant={bntStatus.add ? "secondary" : "primary"}
            style={lstyle}
            disabled={bntStatus.add}
            onClick={(e) => {
              e.preventDefault();
              if (!bntStatus.add) {
                handleModalShow(null);
              }
            }}
          >
            Add A New Plat
          </Button>
          <Button
            className="float-end"
            variant={bntStatus.next ? "outline-secondary" : "outline-primary"}
            style={lstyle}
            disabled={bntStatus.next}
            onClick={(e) => {
              e.preventDefault();
              navigate("/plat-planner");
            }}
          >
            Platform Planner &#9655;&#x25B7;
          </Button>
          {/* <Button
            className="float-end"
            variant={bntStatus.prev ? "outline-secondary" : "outline-primary"}
            style={lstyle}
            disabled={bntStatus.prev}
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            &#9665;&#x25C1; Home Page
          </Button> */}
        </Form>
      </div>
      {/* {spinning && <Loading />} */}
      <PlatModal
        show={showModal}
        onHide={handleModalClose}
        onSave={handleModalSave}
        plat={modalPlat}
        setPlat={setModalPlat}
        coreCluster={coreCluster}
        setCoreCluster={setCoreCluster}
        clusterTuples={clusterTuples}
        modalAlert={modalAlert}
        errMsg={errMsg}
        validated={validated}
      />
    </div>
  );
}

export default PlatManager;
