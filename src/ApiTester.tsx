import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Badge } from 'react-bootstrap';
import { analyzeRealtime, getSmartAlternatives } from './services/apiService';

const ApiTester: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [targetWord, setTargetWord] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGettingAlternatives, setIsGettingAlternatives] = useState<boolean>(false);
  const [difficultWords, setDifficultWords] = useState<any[]>([]);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // テキスト分析
  const handleAnalyzeText = async () => {
    if (!inputText.trim()) {
      setApiError('テキストを入力してください');
      return;
    }

    setIsAnalyzing(true);
    setApiError(null);

    try {
      const response = await analyzeRealtime(inputText, 0.5, []);

      if (response && response.words && Array.isArray(response.words)) {
        setDifficultWords(response.words);
      } else {
        setDifficultWords([]);
        setApiError('結果が正しい形式ではありません');
      }
    } catch (error) {
      console.error('分析エラー:', error);
      setApiError('API通信中にエラーが発生しました');
      setDifficultWords([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 代替案取得
  const handleGetAlternatives = async () => {
    if (!targetWord.trim() || !inputText.trim()) {
      setApiError('テキストと対象単語を入力してください');
      return;
    }

    setIsGettingAlternatives(true);
    setApiError(null);

    try {
      const response = await getSmartAlternatives(inputText, targetWord);

      if (response && response.alternatives && Array.isArray(response.alternatives)) {
        setAlternatives(response.alternatives);
      } else {
        setAlternatives([]);
        setApiError('代替案が取得できませんでした');
      }
    } catch (error) {
      console.error('代替案取得エラー:', error);
      setApiError('API通信中にエラーが発生しました');
      setAlternatives([]);
    } finally {
      setIsGettingAlternatives(false);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">API通信テスト</h1>

      {apiError && (
        <div className="alert alert-danger">{apiError}</div>
      )}

      <Row className="mb-4">
        <Col>
          <Form.Group>
            <Form.Label>テキスト分析対象</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="分析したいテキストを入力してください"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Button
            variant="primary"
            onClick={handleAnalyzeText}
            disabled={isAnalyzing || !inputText.trim()}
          >
            {isAnalyzing ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                /> 分析中...
              </>
            ) : '難しい単語を分析'}
          </Button>
        </Col>

        <Col md={6}>
          <Form.Group className="d-flex">
            <Form.Control
              type="text"
              value={targetWord}
              onChange={(e) => setTargetWord(e.target.value)}
              placeholder="代替案を取得する単語"
            />
            <Button
              variant="success"
              onClick={handleGetAlternatives}
              disabled={isGettingAlternatives || !targetWord.trim() || !inputText.trim()}
              className="ms-2"
            >
              {isGettingAlternatives ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  /> 取得中...
                </>
              ) : '代替案を取得'}
            </Button>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>難しい単語</Card.Header>
            <Card.Body>
              {difficultWords.length > 0 ? (
                <ul className="list-unstyled">
                  {difficultWords.map((item, index) => (
                    <li key={index} className="mb-2">
                      <Badge bg="warning" text="dark" className="me-2">{item.word}</Badge>
                      <small>難易度: {item.difficulty?.toFixed(2)}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">難しい単語はありません</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>「{targetWord}」の代替案</Card.Header>
            <Card.Body>
              {alternatives.length > 0 ? (
                <ul className="list-unstyled">
                  {alternatives.map((word, index) => (
                    <li key={index} className="mb-2">
                      <Badge bg="info" className="me-2">{word}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">代替案はありません</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ApiTester; 