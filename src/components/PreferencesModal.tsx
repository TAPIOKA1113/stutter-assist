import React, { useState, useEffect, ChangeEvent } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface PreferencesModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (threshold: number, easyWords: string[], difficultWords: string[]) => void;
  initialThreshold: number;
  initialEasyWords: string[];
  initialDifficultWords: string[];
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({
  show,
  onHide,
  onSave,
  initialThreshold,
  initialEasyWords,
  initialDifficultWords
}) => {
  const [thresholdValue, setThresholdValue] = useState<number>(initialThreshold);
  const [easyWordsList, setEasyWordsList] = useState<string>(initialEasyWords.join(', '));
  const [difficultWordsList, setDifficultWordsList] = useState<string>(initialDifficultWords.join(', '));

  // props が変更されたときに state を更新
  useEffect(() => {
    setThresholdValue(initialThreshold);
    setEasyWordsList(initialEasyWords.join(', '));
    setDifficultWordsList(initialDifficultWords.join(', '));
  }, [initialThreshold, initialEasyWords, initialDifficultWords]);

  const handleSave = (): void => {
    // カンマ区切りの文字列を配列に変換して保存
    const easyWordsArray = easyWordsList
      .split(',')
      .map(word => word.trim())
      .filter(word => word.length > 0);

    const difficultWordsArray = difficultWordsList
      .split(',')
      .map(word => word.trim())
      .filter(word => word.length > 0);

    onSave(thresholdValue, easyWordsArray, difficultWordsArray);
  };

  const handleThresholdChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setThresholdValue(parseFloat(e.target.value));
  };

  const handleEasyWordsChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setEasyWordsList(e.target.value);
  };

  const handleDifficultWordsChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setDifficultWordsList(e.target.value);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>設定</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>難易度閾値: {thresholdValue}</Form.Label>
            <Form.Range
              min={0}
              max={1}
              step={0.01}
              value={thresholdValue}
              onChange={handleThresholdChange}
            />
            <Form.Text className="text-muted">
              値を高くすると、より多くの単語がハイライトされます。
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>簡単な単語リスト（カンマ区切り）</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={easyWordsList}
              onChange={handleEasyWordsChange}
              placeholder="例: hello, world, computer"
            />
            <Form.Text className="text-muted">
              これらの単語はハイライトされません。
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>難しい単語リスト（カンマ区切り）</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={difficultWordsList}
              onChange={handleDifficultWordsChange}
              placeholder="例: organization, presentation, professional"
            />
            <Form.Text className="text-muted">
              これらの単語は常にハイライトされます。
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          キャンセル
        </Button>
        <Button variant="primary" onClick={handleSave}>
          保存
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PreferencesModal; 