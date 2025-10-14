import type { NavLinkRenderProps } from "react-router";
import { Routes, Route, NavLink } from "react-router";
import { Container, Row, Col, Navbar, Nav, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/AuthService";
import { storeRefreshToken } from "@/utils/refreshToken";
import { PrivateRoute } from "@/components/PrivateRoute";
import HomePage from "@/pages/HomePage";
import PlatManager from "@/pages/PlatManager";
import PlatPlanner from "@/pages/PlatPlanner";
import PlatBuilder from "@/pages/PlatBuilder";
import PlatPlatform from "@/pages/PlatPlatform";
import PlatPlugin from "@/pages/PlatPlugin";
import TeamMember from "@/pages/TeamMember";
import AboutUs from "@/pages/AboutUs";
import UserProfile from "@/pages/UserProfile";
import UserLogin from "@/pages/UserLogin";
import Register from "@/pages/UserRegister";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const style = ({ isActive }: NavLinkRenderProps) => ({
  fontWeight: isActive ? "bold" : "normal",
  whiteSpace: "pre",
});

const Navigation = () => {
  const { accessToken, onLogout } = useAuth();
  const navigate = useNavigate();
  return (
    <Navbar
      // bg="dark"
      bg="primary"
      data-bs-theme="dark"
      // sticky="top"
      className="nav"
    >
      <Container>
        <Navbar.Brand>
          <img
            src="favicon.ico"
            width="28"
            height="28"
            className="d-inline-block align-bottom me-2"
            alt=""
          />
          Micro Plat
        </Navbar.Brand>
        <Nav className="me-auto">
          <Container>
            <NavLink to="/" style={style}>
              Home Page
            </NavLink>
          </Container>
          <Container>
            <NavLink to="/plat-manager" style={style}>
              Plat Manager
            </NavLink>
          </Container>
          <Container>
            <NavLink to="/plat-planner" style={style}>
              Plat Planner
            </NavLink>
          </Container>
          <Container>
            <NavLink to="/plat-builder" style={style}>
              Plat Builder
            </NavLink>
          </Container>
          <Container>
            <NavLink to="/plat-platform" style={style}>
              Active Platforms
            </NavLink>
          </Container>
          <Container>
            <NavLink to="/plat-plugin" style={style}>
              Plat Plugins
            </NavLink>
          </Container>
          <Container>
            <NavLink to="/team-user" style={style}>
              Team User
            </NavLink>
          </Container>
          <Container>
            <NavLink to="/about-up" style={style}>
              About
            </NavLink>
          </Container>
        </Nav>
      </Container>
      <Container className="d-flex justify-content-end gap-2">
        {accessToken && (
          <Button
            style={{
              backgroundColor: "transparent",
              backgroundImage: "url('./profile.png')",
              backgroundSize: "cover",
              width: "40px",
              height: "40px",
            }}
            onClick={(e) => {
              e.preventDefault();
              navigate("/user-profile");
            }}
          ></Button>
        )}
        {accessToken ? (
          <Button
            className="float-end"
            onClick={(e) => {
              e.preventDefault();
              storeRefreshToken("", false);
              onLogout();
              navigate("/");
            }}
          >
            Sign Out
          </Button>
        ) : (
          <Button
            className="float-end"
            onClick={(e) => {
              e.preventDefault();
              navigate("/user-login");
            }}
          >
            Sign In
          </Button>
        )}
      </Container>
    </Navbar>
  );
};

const App = () => {
  return (
    <div>
      <Row>
        <Col>
          <AuthProvider>
            <Navigation />
            <Routes>
              <Route index element={<HomePage />} />
              <Route
                path="plat-manager"
                element={
                  <PrivateRoute allowedRoles={[1, 9]}>
                    <PlatManager />
                  </PrivateRoute>
                }
              />
              <Route
                path="plat-planner"
                element={
                  <PrivateRoute allowedRoles={[1, 9]}>
                    <PlatPlanner />
                  </PrivateRoute>
                }
              />
              <Route
                path="plat-builder"
                element={
                  <PrivateRoute allowedRoles={[1, 9]}>
                    <PlatBuilder />
                  </PrivateRoute>
                }
              />
              <Route
                path="plat-platform"
                element={
                  <PrivateRoute allowedRoles={[1, 2, 3, 9]}>
                    <PlatPlatform />
                  </PrivateRoute>
                }
              />
              <Route
                path="plat-plugin"
                element={
                  <PrivateRoute allowedRoles={[1, 2, 3, 9]}>
                    <PlatPlugin />
                  </PrivateRoute>
                }
              />
              <Route
                path="team-user"
                element={
                  <PrivateRoute allowedRoles={[1, 9]}>
                    <TeamMember />
                  </PrivateRoute>
                }
              />
              <Route
                path="user-profile"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              <Route path="about-up" element={<AboutUs />} />
              <Route path="user-login" element={<UserLogin />} />
              <Route path="register" element={<Register />} />
              <Route path="*" element={<p>There's nothing here: 404!</p>} />
            </Routes>
          </AuthProvider>
        </Col>
      </Row>
    </div>
  );
};

export default App;
