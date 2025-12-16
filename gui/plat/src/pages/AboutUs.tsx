import Image from "react-bootstrap/Image";
import { Container, Row, Col } from "react-bootstrap";

function AboutUs() {
  const items = [
    {
      icon: "micro-rack.png",
      title: "Micro Plat",
      text: "A platform management application for creating and managing parallel computing platforms optimized for AI workloads. It allows users to configure clusters with specialized roles for embedding models, vector databases, and large language models. Combined with Micro-Rack and Micro-Tent in the Micro-Stack series, it provides a complete solution for AI research and development environments.",
    },
    {
      icon: "free-use.png",
      title: "Free Use",
      text: "Completely free for use by any commercial, non-profit organizations, and individual researchers. We may charge a time-based fee for technical support. User registration is required for access, but feedback is valuable for improving the software.",
    },
    {
      icon: "open-source.png",
      title: "Open Source",
      text: "Completely open source. Users can build the entire application from source code to create their own private version. Giving it a GitHub star or writing a review on any tech site is a valuable way to help spread the word. If you clone the source code for your own development, it's appreciated to credit the original authors, but it's not required.",
    },
    {
      icon: "user-plugin.png",
      title: "User Plugin",
      text: "The software features an open architecture. All features are implemented as modules and plugins. Users can develop their own plugins by customizing the templates in the source code to support special OS boot requirements. All frontend code is written in TypeScript with React and Bootstrap, and backend code is written in Node.js with Express, combined with Bash scripts.",
    },
    {
      icon: "contributors.png",
      title: "Contributing",
      text: "We welcome contributors to join the project to improve software quality and add new features. Programming skills in TypeScript are helpful. Please do the code integrity and build check before making a pull request. Whether you're fixing bugs, writing documentation, testing features, or suggesting improvements. Join our community on GitHub to get started and collaborate with fellow contributors.",
    },
    {
      icon: "sponsorship.png",
      title: "Sponsorship",
      text: "The software is developed by dedicated volunteers using their own resources. If you'd like to support the project and help with future developments, sponsorships and financial support are welcome. Your contribution would help maintain the quality and growth of this open-source initiative. Thank you for considering supporting us!",
    },
  ];
  const cstyle = {
    paddingLeft: "60px",
    paddingRight: "60px",
    marginRottom: "30px",
    paddingBottom: "30px",
    paddingTop: "30px",
  };
  const istyle = {
    marginTop: "1em",
    backgroundColor: "#eee",
    border: "true",
  };
  const rstyle = { marginTop: "1em" };
  return (
    <div style={cstyle}>
      <h3 className="text-center">
        <b>About</b>
      </h3>
      <Container className="m-t-5" style={rstyle}>
        <Row>
          <Col
            className="col-sm-2 d-flex flex-wrap align-items-center"
            style={istyle}
          >
            <Image src="about.png" fluid />
          </Col>
          <Col>
            <Container fluid>
              {items.map((item) => (
                <Row style={rstyle} key={item.title}>
                  <Col className="col-sm-1">
                    <Image
                      // className="img-thumbnail"
                      src={`${item.icon}`}
                      fluid
                    />
                  </Col>
                  <Col>
                    <h5>
                      <b>{item.title}</b>
                    </h5>
                    <p>{item.text}</p>
                  </Col>
                </Row>
              ))}
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default AboutUs;
