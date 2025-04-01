import React from 'react';
import { Navbar, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh, faGear, faBars } from '@fortawesome/free-solid-svg-icons';

interface NavBarProps {
  onUpdate: () => void;
  onPreferencesOpen: () => void;
  onActiveLearningOpen: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onUpdate, onPreferencesOpen, onActiveLearningOpen }) => {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="#home">
        <p className="navbar-title">fluent</p>
      </Navbar.Brand>
      <div className="ml-auto d-flex">
        <Button
          variant="light"
          className="btn-icon"
          onClick={onUpdate}
          title="更新"
        >
          <FontAwesomeIcon icon={faRefresh} />
        </Button>
        <Button
          variant="light"
          className="btn-icon"
          onClick={onActiveLearningOpen}
          title="モデル調整"
        >
          <FontAwesomeIcon icon={faGear} />
        </Button>
        <Button
          variant="light"
          className="btn-icon"
          onClick={onPreferencesOpen}
          title="設定"
        >
          <FontAwesomeIcon icon={faBars} />
        </Button>
      </div>
    </Navbar>
  );
};

export default NavBar; 