import React from 'react';
import { Navbar, Button, Badge, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faFlask } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

interface NavBarProps {
  onPreferencesClick: () => void;
  apiConnected: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ onPreferencesClick, apiConnected }) => {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand as={Link} to="/">
        <p className="navbar-title">Fluent Assist</p>
      </Navbar.Brand>
      <Nav className="me-auto">
        <Nav.Link as={Link} to="/api-test">
          <FontAwesomeIcon icon={faFlask} className="me-1" />
          APIテスト
        </Nav.Link>
      </Nav>
      <div className="ms-auto d-flex align-items-center">
        <Badge
          bg={apiConnected ? "success" : "danger"}
          className="me-2"
          title={apiConnected ? "API接続中" : "API未接続"}
        >
          {apiConnected ? "接続中" : "未接続"}
        </Badge>

        <Button
          variant="light"
          className="btn-icon"
          onClick={onPreferencesClick}
          title="設定"
        >
          <FontAwesomeIcon icon={faGear} />
        </Button>
      </div>
    </Navbar>
  );
};

export default NavBar; 