import React from 'react';
import { Modal, Button, Card } from 'react-bootstrap';

interface ActiveLearningModalProps {
  show: boolean;
  onHide: () => void;
  nextWord: string;
  onAddEasyWord: (word: string) => void;
  onAddDifficultWord: (word: string) => void;
}

const ActiveLearningModal: React.FC<ActiveLearningModalProps> = ({
  show,
  onHide,
  nextWord,
  onAddEasyWord,
  onAddDifficultWord
}) => {
  const handleEasyClick = (): void => {
    onAddEasyWord(nextWord);
    onHide();
  };

  const handleDifficultClick = (): void => {
    onAddDifficultWord(nextWord);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>モデル調整</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p>次の単語は発音しやすいですか、難しいですか？</p>
        <Card className="mb-4 mx-auto" style={{ maxWidth: '300px' }}>
          <Card.Body>
            <h2>{nextWord}</h2>
          </Card.Body>
        </Card>
        <div className="d-flex justify-content-center">
          <Button
            variant="success"
            className="mr-3"
            onClick={handleEasyClick}
            style={{ marginRight: '10px' }}
          >
            簡単
          </Button>
          <Button
            variant="danger"
            onClick={handleDifficultClick}
          >
            難しい
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <small className="text-muted mx-auto">
          これらのフィードバックはあなた専用のモデルを改善するために使用されます。
        </small>
      </Modal.Footer>
    </Modal>
  );
};

export default ActiveLearningModal; 