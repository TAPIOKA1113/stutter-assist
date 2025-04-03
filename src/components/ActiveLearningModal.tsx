import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Spinner } from 'react-bootstrap';

interface ActiveLearningModalProps {
  show: boolean;
  onHide: () => void;
}

const ActiveLearningModal: React.FC<ActiveLearningModalProps> = ({
  show,
  onHide
}) => {
  const [nextWord, setNextWord] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // モーダルが表示されたときに単語をロード
  useEffect(() => {
    if (show) {
      loadNextWord();
    }
  }, [show]);

  // 次の単語をロード（実際の実装では、APIから取得）
  const loadNextWord = () => {
    setIsLoading(true);

    // 実際のアプリではAPIから取得する代わりに、モックデータを使用
    const mockWords = ['吃音症', '言語障害', 'スティグマ', '置き換え', '戦略', '職業的', '発表'];

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * mockWords.length);
      setNextWord(mockWords[randomIndex]);
      setIsLoading(false);
    }, 500);
  };

  const handleEasyClick = (): void => {
    // API呼び出しをして、ユーザーフィードバックを送信（実際の実装）
    loadNextWord(); // 次の単語をロード
  };

  const handleDifficultClick = (): void => {
    // API呼び出しをして、ユーザーフィードバックを送信（実際の実装）
    loadNextWord(); // 次の単語をロード
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>モデル調整</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <p>次の単語は発音しやすいですか、難しいですか？</p>
        <Card className="mb-4 mx-auto" style={{ maxWidth: '300px', minHeight: '100px' }}>
          <Card.Body className="d-flex justify-content-center align-items-center">
            {isLoading ? (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">読み込み中...</span>
              </Spinner>
            ) : (
              <h2>{nextWord}</h2>
            )}
          </Card.Body>
        </Card>
        <div className="d-flex justify-content-center">
          <Button
            variant="success"
            className="me-3"
            onClick={handleEasyClick}
            disabled={isLoading}
          >
            簡単
          </Button>
          <Button
            variant="danger"
            onClick={handleDifficultClick}
            disabled={isLoading}
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