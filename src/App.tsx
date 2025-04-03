import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button } from 'react-bootstrap';
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
  const [difficultWords, setDifficultWords] = useState<string[]>([
    '吃音症', '言語障害', 'スティグマ', 'PWS'
  ]);

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

  return (
    <div className="App">
      <NavBar
        onPreferencesClick={() => setShowPreferences(true)}
        onActiveLearningClick={() => setShowActiveLearning(true)}
        apiConnected={apiConnected}
      />
      <Container fluid>
        <Row className="my-4">
          <Col>
            <Editor
              hardWords={difficultWords}
              onAddEasyWord={handleAddEasyWord}
              onAddDifficultWord={handleAddDifficultWord}
              threshold={difficultyThreshold}
              userEasyWords={easyWords}
              userDifficultWords={difficultWords}
            />
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