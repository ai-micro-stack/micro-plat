import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Table, Button, Alert } from "react-bootstrap";
import Collapse from "react-bootstrap/Collapse";
import { useAuth } from "@/components/AuthService";
import Loading from "@/pages/Loading";
import type { moduleType } from "@/types/Addon";
import type { ClusterTuple, PlatType } from "@/types/Plat";
import { defaultPlat, platTypes } from "@/types/Plat";
import { formatDate } from "@/utils/formatDate";

type ClusterInfo = ClusterTuple & {
  embedding_model_name: string;
  vectordb_vendor_name: string;
  llm_model_name: string;
};

export type PlatInfo = {
  readonly id: number;
  plat_name: string;
  plat_note: string;
  plat_type: number;
  plat_vip: string;
  embedding_model_store: string;
  llm_model_store: string;
  vectordb_data_store: string;
  is_active: boolean;
  readonly createdAt: Date;
  Clusters: ClusterInfo[];
};

function PlatPlatform() {
  const bntInitState = {
    apply: true,
    prev: false,
    next: false,
  };

  const navigate = useNavigate();
  const { axiosInstance } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [errMsg, setErrMsg] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [bntStatus, setBntStatus] = useState(bntInitState);
  const [refresh, setRefresh] = useState(0);

  // const [allOpen, setAllOpen] = useState(false);
  const [openStates, setOpenStates] = useState<string[]>([]);
  const [appPlats, setAppPlats] = useState<PlatInfo[]>([]);
  const [embeddingModules, setEmbeddingModules] = useState<moduleType[]>([]);
  const [vectordbModules, setVectordbModules] = useState<moduleType[]>([]);
  const [llmModules, setLlmModules] = useState<moduleType[]>([]);
  const [computeTypes, setComputeTypes] = useState<moduleType[]>([]);

  const toggleOpen = (id: string) => {
    if (openStates.includes(id)) {
      setOpenStates(openStates.filter((rowId) => rowId !== id));
    } else {
      setOpenStates([...openStates, id]);
    }
  };

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
          setComputeTypes([...data.computeModules]);
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
            .filter((plat: PlatType) => {
              return plat.plat_name !== defaultPlat.plat_name;
            })
            .map((plat: PlatType): PlatInfo => {
              return {
                ...plat,
                Clusters: plat.Clusters.map(
                  (cluster: ClusterTuple): ClusterInfo => {
                    return {
                      ...cluster,
                      compute_cluster: cluster.compute_cluster_type ?? "(None)",
                      storage_cluster: cluster.storage_cluster_type ?? "(None)",
                      embedding_model_name: (() => {
                        const module = embeddingModules.find(m => m.moduleName === cluster.compute_cluster_type);
                        return module ? module.moduleRoles[cluster.embedding_model ?? 0].role : "";
                      })(),
                      vectordb_vendor_name: (() => {
                        const module = vectordbModules.find(m => m.moduleName === cluster.compute_cluster_type);
                        return module ? module.moduleRoles[cluster.vectordb_vendor ?? 0].role : "";
                      })(),
                      llm_model_name: (() => {
                        const module = llmModules.find(m => m.moduleName === cluster.compute_cluster_type);
                        return module ? module.moduleRoles[cluster.llm_model ?? 0].role : "";
                      })(),
                    };
                  }
                ).sort((a: ClusterInfo, b: ClusterInfo) => {
                  const weightA = a.cluster_name;
                  const weightB = b.cluster_name;
                  if (weightA < weightB) {
                    return -1;
                  }
                  if (weightA > weightB) {
                    return 1;
                  }
                  return 0;
                }),
              };
            })
            .sort((a: PlatInfo, b: PlatInfo) => {
              const weightA = a.plat_name;
              const weightB = b.plat_name;
              if (weightA < weightB) {
                return -1;
              }
              if (weightA > weightB) {
                return 1;
              }
              return 0;
            });
          setAppPlats(platData);
        })
        .catch((error) => console.error("Get Plat Data failed ", error));
    },
    // eslint-disable-next-line
    [computeTypes]
  );

  const chgBntStatus = (status: string) => {
    switch (status) {
      case "none":
        setSpinning(true);
        setBntStatus({
          apply: true,
          prev: false,
          next: false,
        });
        break;
      case "apply":
        setSpinning(false);
        setBntStatus({
          apply: true,
          prev: false,
          next: false,
        });
        break;
      case "dirty":
      default:
        setSpinning(false);
        setBntStatus({
          apply: false,
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
        <b>Active Computing Platforms</b>
      </h3>
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
          <thead>
            <tr>
              <th>
                {/* <Button
              onClick={() => toggleOpen(-1)}
              aria-controls={`collapse-content-all`}
              // aria-expanded={openStates[plat.id]}
              size="sm"
            >
              {allOpen ? "-" : "+"}
            </Button> */}
              </th>
              {/* For the expand/collapse button */}
              <th>Plat Name</th>
              <th>Plat Note</th>
              <th>End Point</th>
              <th>Plat_Type</th>
              <th>Created At</th>
              <th>Is Active</th>
            </tr>
          </thead>
          <tbody>
            {appPlats.map((plat) => (
              <React.Fragment key={plat.id}>
                <tr>
                  <td>
                    {plat.Clusters && (
                      <Button
                        size="sm"
                        style={{ width: "40px" }}
                        onClick={() => toggleOpen(plat.id.toString())}
                        aria-controls={`collapse-${plat.id}`}
                        aria-expanded={openStates.includes(plat.id.toString())}
                      >
                        {openStates.includes(plat.id.toString()) ? "-" : "+"}
                      </Button>
                    )}
                  </td>
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
                </tr>
                <tr>
                  <td colSpan={7}>
                    <Collapse in={openStates.includes(plat.id.toString())}>
                      <div id={`collapse-content-${plat.id}`}>
                        <Table size="sm" className="mt-2">
                          <tbody>
                            <tr>
                              <th></th>
                              <th>hci_cluster_name</th>
                              <th>hci_cluster_nodes</th>
                              <th>compute_cluster</th>
                              <th>compute_nodes</th>
                              <th>storage_cluster</th>
                              <th>storage_nodes</th>
                              <th>embedding_model</th>
                              <th>vectordb_vendor</th>
                              <th>llm_model</th>
                            </tr>
                            {plat.Clusters.map((item, index) => (
                              <tr key={index}>
                                <td></td>
                                <td>{item.cluster_name}</td>
                                <td>{item.cluster_nodes}</td>
                                <td>{item.compute_cluster}</td>
                                <td>{item.compute_nodes}</td>
                                <td>{item.storage_cluster}</td>
                                <td>{item.storage_nodes}</td>
                                <td>
                                  {item.embedding_member
                                    ? item.embedding_model_name
                                    : ""}
                                </td>
                                <td>
                                  {item.vectordb_member
                                    ? item.vectordb_vendor_name
                                    : ""}
                                </td>
                                <td>
                                  {item.llm_member ? item.llm_model_name : ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Collapse>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="jumbotron">
        {/* fixed-bottom */}
        <Form>
          <Button
            // variant={bntStatus.apply ? "secondary" : "primary"}
            style={lstyle}
            // disabled={bntStatus.apply}
            onClick={(e) => {
              e.preventDefault();
              chgBntStatus("apply");
              setErrMsg([]);
              setRefresh(refresh + 1);
              // window.location.reload();
            }}
          >
            Page Refresh
          </Button>
          {/* <Button
            className="float-end"
            variant={bntStatus.next ? "outline-secondary" : "outline-primary"}
            style={lstyle}
            disabled={bntStatus.next}
            onClick={(e) => {
              e.preventDefault();
              navigate("/about-up");
            }}
          >
            About Us &#9655;&#x25B7;
          </Button> */}
          <Button
            className="float-end"
            variant={bntStatus.prev ? "outline-secondary" : "outline-primary"}
            style={lstyle}
            disabled={bntStatus.prev}
            onClick={(e) => {
              e.preventDefault();
              navigate("/plat-builder");
            }}
          >
            &#9665;&#x25C1; Platform Builder
          </Button>
        </Form>
      </div>
      {spinning && <Loading />}
    </div>
  );
}

export default PlatPlatform;
