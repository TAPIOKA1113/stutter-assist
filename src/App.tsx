import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import NavBar from './components/NavBar';
import Editor from './components/Editor';
import PreferencesModal from './components/PreferencesModal';
import ActiveLearningModal from './components/ActiveLearningModal';

const App: React.FC = () => {
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [showActiveLearning, setShowActiveLearning] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(0.5);
  const [easyWords, setEasyWords] = useState<string>('');
  const [difficultWords, setDifficultWords] = useState<string>('');
  const [nextWord, setNextWord] = useState<string>('example');

  // モックデータ: 発音が難しい単語 (英語と日本語の両方を含める)
  const [hardWords, setHardWords] = useState<string[]>([
    'stuttering', 'presentation', 'professional', 'country', 'organization',
    '吃音症', '職業的', '言語障害', '戦略', '置き換え'
  ]);

  const handleUpdate = (): void => {
    // モック: APIコールの代わりに、ハードコードされた単語リストを更新
    console.log('更新ボタンがクリックされました');
    // 実際のアプリでは、APIを呼び出してhardWordsリストを更新
  };

  const handlePreferencesOpen = (): void => setShowPreferences(true);
  const handlePreferencesClose = (): void => setShowPreferences(false);

  const handleActiveLearningOpen = (): void => setShowActiveLearning(true);
  const handleActiveLearningClose = (): void => setShowActiveLearning(false);

  const handlePreferencesSave = (newThreshold: number, newEasyWords: string, newDifficultWords: string): void => {
    setThreshold(newThreshold);
    setEasyWords(newEasyWords);
    setDifficultWords(newDifficultWords);
    handlePreferencesClose();
  };

  const handleAddEasyWord = (word: string): void => {
    console.log(`単語を簡単なリストに追加: ${word}`);
    // 実際のアプリではAPIを呼び出してユーザー設定を更新
  };

  const handleAddDifficultWord = (word: string): void => {
    console.log(`単語を難しいリストに追加: ${word}`);
    // 実際のアプリではAPIを呼び出してユーザー設定を更新
  };

  return (
    <div className="App">
      <NavBar
        onUpdate={handleUpdate}
        onPreferencesOpen={handlePreferencesOpen}
        onActiveLearningOpen={handleActiveLearningOpen}
      />

      <Container fluid>
        <Editor
          hardWords={hardWords}
          onAddEasyWord={handleAddEasyWord}
          onAddDifficultWord={handleAddDifficultWord}
        />
      </Container>

      <PreferencesModal
        show={showPreferences}
        onHide={handlePreferencesClose}
        onSave={handlePreferencesSave}
        threshold={threshold}
        easyWords={easyWords}
        difficultWords={difficultWords}
      />

      <ActiveLearningModal
        show={showActiveLearning}
        onHide={handleActiveLearningClose}
        nextWord={nextWord}
        onAddEasyWord={handleAddEasyWord}
        onAddDifficultWord={handleAddDifficultWord}
      />
    </div>
  );
};

export default App; 