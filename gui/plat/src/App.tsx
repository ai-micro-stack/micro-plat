import type { NavLinkRenderProps } from "react-router";
import { Routes, Route, NavLink } from "react-router";
import { Container, Row, Col, Navbar, Nav, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "@/components/AuthService";
import { storeRefreshToken } from "@/utils/refreshToken";
import { PrivateRoute } from "@/components/PrivateRoute";

const HomePage = lazy(() => import("@/pages/HomePage"));
const PlatManager = lazy(() => import("@/pages/PlatManager"));
const PlatPlanner = lazy(() => import("@/pages/PlatPlanner"));
const PlatBuilder = lazy(() => import("@/pages/PlatBuilder"));
const PlatPlatform = lazy(() => import("@/pages/PlatPlatform"));
const PlatPlugin = lazy(() => import("@/pages/PlatPlugin"));
const TeamMember = lazy(() => import("@/pages/TeamMember"));
const AboutUs = lazy(() => import("@/pages/AboutUs"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const UserLogin = lazy(() => import("@/pages/UserLogin"));
const Register = lazy(() => import("@/pages/UserRegister"));

import "bootstrap/dist/css/bootstrap.min.css";
import Loading from "@/pages/Loading";
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
      bg="primary"
      data-bs-theme="dark"
      className="nav"
    >
      <Container>
        <Navbar.Brand>
          <img
            src="/favicon.ico"
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
              backgroundImage: "url('/profile.png')",
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
            <Suspense fallback={<Loading />}>
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
            </Suspense>
          </AuthProvider>
        </Col>
      </Row>
    </div>
  );
};

export default App;
