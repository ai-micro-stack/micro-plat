import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Table, Button } from "react-bootstrap";
import { Modal, Alert } from "react-bootstrap";
import { useAuth } from "@/components/AuthService";
// import Loading from "@/pages/Loading";
import type { PlatType } from "@/types/Plat";
import { defaultPlat, emptyPlat, platTypes } from "@/types/Plat";
import { formatDate } from "@/utils/formatDate";

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

  useEffect(
    () => {
      let platData = [];
      axiosInstance
        .get("/platplan/data")
        .then(({ data }) => {
          // const { /*dhcpDomain,*/ plats } = data;
          platData = data
            .filter((plat: PlatType) => {
              return plat.plat_name !== defaultPlat.plat_name;
            })
            .map((plat: PlatType) => {
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
    },
    // eslint-disable-next-line
    [refresh]
  );

  const handleModalShow = (id: number | null) => {
    const plat: PlatType | null =
      appPlats.find((plat: PlatType) => {
        return plat.id === id;
      }) ?? emptyPlat;
    setModalPlat(plat);
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
        { ...modalPlat },
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
                  <b>Plat_vIP (&#9650;&#9660;)</b>
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
            {appPlats.map((plat: PlatType) => {
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
                      size="sm"
                      onClick={() => handleModalShow(plat.id)}
                    >
                      <b>&#9998; Edit</b>
                    </Button>
                    <Button
                      className="remove-btn"
                      variant="danger"
                      size="sm"
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
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Cluster Member Details</Modal.Title>
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
            <Form.Group className="mb-2 d-flex">
              <Form.Label className=" col-sm-3 text-center">
                Plat Name:
              </Form.Label>
              <Form.Control
                required
                type="input"
                defaultValue={modalPlat?.plat_name}
                onChange={(e) => {
                  setModalPlat({
                    ...modalPlat,
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
                type="input"
                defaultValue={modalPlat?.plat_note}
                onChange={(e) => {
                  setModalPlat({
                    ...modalPlat,
                    plat_note: e.target.value,
                  });
                }}
              />
            </Form.Group>
            <Form.Group className="mb-2 d-flex">
              <Form.Label className=" col-sm-3 text-center">
                Plat Type:
              </Form.Label>
              <Form.Select
                value={modalPlat?.plat_type ?? 0}
                onChange={(e) => {
                  setModalPlat({
                    ...modalPlat,
                    plat_type: Number(e.target.value),
                  });
                }}
              >
                {platTypes.map(({ key, plat_type_name }) => {
                  return (
                    <option key={key} value={key} disabled={key ? false : true}>
                      {plat_type_name}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2 d-flex">
              <Form.Label className=" col-sm-3 text-center">
                Plat URI:
              </Form.Label>
              <Form.Control
                type="input"
                value={modalPlat?.plat_vip ?? ""}
                onChange={(e) => {
                  setModalPlat({
                    ...modalPlat,
                    plat_vip: e.target.value,
                  });
                }}
              />
            </Form.Group>

            <Form.Group className="mb-2 d-flex">
              <Form.Label className="col-sm-3 text-center">Active:</Form.Label>
              <Form.Check
                inline
                type="checkbox"
                defaultChecked={modalPlat?.is_active ?? false}
                onChange={(e) => {
                  setModalPlat({
                    ...modalPlat,
                    is_active: e.target.checked,
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
    </div>
  );
}

export default PlatManager;
