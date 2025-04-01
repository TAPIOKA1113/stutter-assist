import React, { useState, useEffect, ChangeEvent } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface PreferencesModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (threshold: number, easyWords: string, difficultWords: string) => void;
  threshold: number;
  easyWords: string;
  difficultWords: string;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({
  show,
  onHide,
  onSave,
  threshold,
  easyWords,
  difficultWords
}) => {
  const [thresholdValue, setThresholdValue] = useState<number>(threshold);
  const [easyWordsList, setEasyWordsList] = useState<string>(easyWords);
  const [difficultWordsList, setDifficultWordsList] = useState<string>(difficultWords);

  // props が変更されたときに state を更新
  useEffect(() => {
    setThresholdValue(threshold);
    setEasyWordsList(easyWords);
    setDifficultWordsList(difficultWords);
  }, [threshold, easyWords, difficultWords]);

  const handleSave = (): void => {
    onSave(thresholdValue, easyWordsList, difficultWordsList);
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