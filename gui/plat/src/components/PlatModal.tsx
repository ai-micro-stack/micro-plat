import { Form, Row, Col, Modal, Alert, Button } from "react-bootstrap";
import type { ClusterTuple, PlatType } from "@/types/Plat";
import { coreGateways, coreIMAs, platTypes } from "@/types/Plat";

interface PlatModalProps {
  show: boolean;
  onHide: () => void;
  onSave: () => void;
  plat: PlatType;
  setPlat: (plat: PlatType) => void;
  coreCluster: ClusterTuple | null;
  setCoreCluster: (cluster: ClusterTuple | null) => void;
  clusterTuples: ClusterTuple[];
  modalAlert: boolean;
  errMsg: string[];
  validated: boolean;
}

function PlatModal({
  show,
  onHide,
  onSave,
  plat,
  setPlat,
  coreCluster,
  setCoreCluster,
  clusterTuples,
  modalAlert,
  errMsg,
  validated,
}: PlatModalProps) {
  return (
    <Modal
      size="xl"
      backdrop="static"
      keyboard={false}
      show={show}
      onHide={onHide}
    >
      <Modal.Header closeButton>
        <Modal.Title>HCI Plat Stub</Modal.Title>
      </Modal.Header>
      {modalAlert && (
        <Alert
          className="mb-2"
          variant="danger"
          onClose={() => {}}
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
          <Row>
            <Col>
              <Form.Group className="mb-2 d-flex">
                <Form.Label className=" col-sm-3 text-center">
                  Plat Name:
                </Form.Label>
                <Form.Control
                  required
                  type="input"
                  defaultValue={plat?.plat_name}
                  onChange={(e) => {
                    setPlat({
                      ...plat,
                      plat_name: e.target.value,
                    });
                  }}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-2 d-flex">
                <Form.Label className=" col-sm-3 text-center">
                  Plat Note:
                </Form.Label>
                <Form.Control
                  type="input"
                  defaultValue={plat?.plat_note}
                  onChange={(e) => {
                    setPlat({
                      ...plat,
                      plat_note: e.target.value,
                    });
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group className="mb-2 d-flex">
                <Form.Label className=" col-sm-3 text-center">
                  Plat Type:
                </Form.Label>
                <Form.Select
                  value={plat?.plat_type ?? 0}
                  onChange={(e) => {
                    setPlat({
                      ...plat,
                      plat_type: Number(e.target.value),
                    });
                  }}
                >
                  {platTypes.map(({ key, plat_type_name }) => {
                    return (
                      <option
                        key={key}
                        value={key}
                        disabled={key ? false : true}
                      >
                        {plat_type_name}
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-2 d-flex">
                <Form.Label className=" col-sm-3 text-center">
                  Plat URI:
                </Form.Label>
                <Form.Control
                  type="input"
                  value={plat?.plat_vip ?? ""}
                  onChange={(e) => {
                    setPlat({
                      ...plat,
                      plat_vip: e.target.value,
                    });
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group className="mb-2 d-flex">
                <Form.Label className="col-sm-3 text-center">
                  Active:
                </Form.Label>
                <Form.Check
                  inline
                  type="checkbox"
                  defaultChecked={plat?.is_active ?? false}
                  onChange={(e) => {
                    setPlat({
                      ...plat,
                      is_active: e.target.checked,
                    });
                  }}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-2 d-flex">
                <Form.Label className="col-sm-3 text-center">
                  Lock Plat:
                </Form.Label>
                <Form.Check
                  type="switch"
                  id="cluster-lock-switch"
                  checked={plat?.is_locked}
                  onChange={(e) => {
                    setPlat({
                      ...plat,
                      is_locked: e.target.checked,
                    });
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
          <br />
          <hr />
          <div>
            <h5>Core Service Configuration:</h5>
            <br />
            <Row>
              <Col>
                <Form.Group className="mb-2 d-flex">
                  <Form.Label className=" col-sm-3 text-center">
                    Core Cluster:
                  </Form.Label>
                  <Form.Select
                    value={coreCluster?.cluster_name || ""}
                    onChange={(e) => {
                      const selected = clusterTuples.find(c => c.cluster_name === e.target.value) || null;
                      setCoreCluster(selected);
                    }}
                  >
                    {clusterTuples.map(
                      (cluster: ClusterTuple , idx: number) => {
                        return (
                          <option
                            key={idx}
                            value={cluster.cluster_name}
                            disabled={cluster.cluster_name ? false : true}
                          >
                            {cluster.cluster_name}
                          </option>
                        );
                      }
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-2 d-flex">
                  <Form.Label className=" col-sm-3 text-center">
                    Cluster Type:
                  </Form.Label>
                  <Form.Control
                    plaintext
                    readOnly
                    className="square border border-2"
                    style={{ paddingLeft: '12px' }}
                    value={coreCluster ? coreCluster.compute_cluster_type ?? "" : ""}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-2 d-flex">
                  <Form.Label className=" col-sm-3 text-center">
                    App Gateway:
                  </Form.Label>
                  <Form.Select
                    value={plat?.core_gateway_service ?? "0"}
                    onChange={(e) => {
                      setPlat({
                        ...plat,
                        core_gateway_service: e.target.value.toString(),
                      });
                    }}
                  >
                    {coreGateways.map(({ key, gateway_name }) => {
                      return (
                        <option
                          key={key}
                          value={key.toString()}
                          disabled={key ? false : true}
                        >
                          {gateway_name}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-2 d-flex">
                  <Form.Label className=" col-sm-3 text-center">
                    IMA Service:
                  </Form.Label>
                  <Form.Select
                    value={plat?.core_auth_ima_service ?? "0"}
                    onChange={(e) => {
                      setPlat({
                        ...plat,
                        core_auth_ima_service: e.target.value.toString(),
                      });
                    }}
                  >
                    {coreIMAs.map(({ key, ima_name }) => {
                      return (
                        <option
                          key={key}
                          value={key.toString()}
                          disabled={key ? false : true}
                        >
                          {ima_name}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={onSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PlatModal;