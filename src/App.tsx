import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import './App.css';
import NavBar from './components/NavBar';
import Editor from './components/Editor';
import PreferencesModal from './components/PreferencesModal';
import ActiveLearningModal from './components/ActiveLearningModal';
import { checkApiStatus } from './services/apiService';

function App() {
  // モーダル表示状態の管理
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [showActiveLearning, setShowActiveLearning] = useState<boolean>(false);

  // APIの状態管理
  const [apiConnected, setApiConnected] = useState<boolean>(false);

  // 設定値の管理
  const [difficultyThreshold, setDifficultyThreshold] = useState<number>(0.5);
  const [easyWords, setEasyWords] = useState<string[]>([]);
  const [difficultWords, setDifficultWords] = useState<string[]>([]);

  // 苦手な音の設定
  const [difficultSounds, setDifficultSounds] = useState<string[]>(['し', 'は', 'き']);
  const [newSound, setNewSound] = useState<string>('');

  // APIの接続状態を確認する
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkApiStatus();
        setApiConnected(status && status.status === 'ok');
      } catch (error) {
        console.error('API接続エラー:', error);
        setApiConnected(false);
      }
    };

    checkConnection();
    // 30秒ごとに接続状態を確認
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  // 設定を更新する
  const updatePreferences = (threshold: number, easy: string[], difficult: string[]) => {
    setDifficultyThreshold(threshold);
    setEasyWords(easy);
    setDifficultWords(difficult);
    setShowPreferences(false);
  };

  // 簡単な単語をリストに追加
  const handleAddEasyWord = (word: string) => {
    if (!easyWords.includes(word)) {
      setEasyWords([...easyWords, word]);
    }
  };

  // 難しい単語をリストに追加
  const handleAddDifficultWord = (word: string) => {
    if (!difficultWords.includes(word)) {
      setDifficultWords([...difficultWords, word]);
    }
  };

  // 苦手な音を追加
  const handleAddDifficultSound = () => {
    if (newSound && newSound.trim() && !difficultSounds.includes(newSound)) {
      setDifficultSounds([...difficultSounds, newSound]);
      setNewSound('');
    }
  };

  // 苦手な音を削除
  const handleRemoveDifficultSound = (sound: string) => {
    setDifficultSounds(difficultSounds.filter(s => s !== sound));
  };

  return (
    <div className="App">
      <NavBar
        onPreferencesClick={() => setShowPreferences(true)}
        onActiveLearningClick={() => setShowActiveLearning(true)}
        apiConnected={apiConnected}
      />
      <Container fluid>
        <Row className="my-4">
          <Col md={8}>
            <Editor
              hardWords={difficultWords}
              onAddEasyWord={handleAddEasyWord}
              onAddDifficultWord={handleAddDifficultWord}
              threshold={difficultyThreshold}
              userEasyWords={easyWords}
              userDifficultWords={difficultWords}
              difficultSounds={difficultSounds}
            />
          </Col>
          <Col md={4}>
            <div className="settings-panel p-3 border rounded">
              <h4>苦手な音の設定</h4>
              <p className="text-muted">苦手な音を設定すると、その音を含む単語が自動的にハイライトされます</p>

              <div className="mb-3">
                <Form.Group className="d-flex mb-2">
                  <Form.Control
                    type="text"
                    placeholder="苦手な音（例: し）"
                    value={newSound}
                    onChange={(e) => setNewSound(e.target.value)}
                    maxLength={2}
                  />
                  <Button
                    variant="primary"
                    className="ms-2"
                    onClick={handleAddDifficultSound}
                    disabled={!newSound.trim()}
                  >
                    追加
                  </Button>
                </Form.Group>

                <div className="difficult-sounds">
                  {difficultSounds.map((sound, index) => (
                    <Button
                      key={index}
                      variant="outline-warning"
                      size="sm"
                      className="me-2 mb-2"
                      onClick={() => handleRemoveDifficultSound(sound)}
                    >
                      {sound} ×
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* 設定モーダル */}
      <PreferencesModal
        show={showPreferences}
        onHide={() => setShowPreferences(false)}
        onSave={updatePreferences}
        initialThreshold={difficultyThreshold}
        initialEasyWords={easyWords}
        initialDifficultWords={difficultWords}
      />

      {/* アクティブラーニングモーダル */}
      <ActiveLearningModal
        show={showActiveLearning}
        onHide={() => setShowActiveLearning(false)}
      />
    </div>
  );
}

export default App; 