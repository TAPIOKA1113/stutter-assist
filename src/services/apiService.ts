import axios from 'axios';

// APIのベースURL
const API_BASE_URL = 'http://localhost:8000';

// APIクライアントの設定
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 難しい単語を取得するAPI
export const analyzeDifficultWords = async (text: string, difficultyThreshold: number = 0.5, userDifficultWords: string[] = []) => {
  try {
    const response = await apiClient.post('/analyze', {
      text,
      difficulty_threshold: difficultyThreshold,
      user_difficult_words: userDifficultWords
    });
    return response.data;
  } catch (error) {
    console.error('難しい単語の取得に失敗しました', error);
    throw error;
  }
};

// リアルタイム分析API（難しい単語と代替案を一度に取得）
export const analyzeRealtime = async (text: string, difficultyThreshold: number = 0.5, userDifficultWords: string[] = []) => {
  try {
    const response = await apiClient.post('/analyze-realtime', {
      text,
      difficulty_threshold: difficultyThreshold,
      user_difficult_words: userDifficultWords
    });
    return response.data;
  } catch (error) {
    console.error('リアルタイム分析に失敗しました', error);
    throw error;
  }
};

// 特定の単語の代替案を取得するAPI
export const getAlternatives = async (word: string) => {
  try {
    const response = await apiClient.get(`/alternatives/${word}`);
    return response.data.alternatives;
  } catch (error) {
    console.error(`単語「${word}」の代替案取得に失敗しました`, error);
    throw error;
  }
};

// BERTを使用した高度な代替案を取得するAPI
export const getSmartAlternatives = async (text: string, targetWord: string) => {
  try {
    const response = await apiClient.post('/smart-alternatives', {
      text,
      target_word: targetWord,
      method: 'mlm'
    });

    // 応答形式の変更を処理
    if (response.data.alternatives) {
      // 代替単語の配列を返す
      const alternatives = response.data.alternatives
        .filter((alt: any) => alt.word !== targetWord) // 元の単語と同じものは除外
        .map((alt: any) => alt.word);

      return { alternatives };
    } else {
      return { alternatives: [] };
    }
  } catch (error) {
    console.error(`単語「${targetWord}」の高度な代替案取得に失敗しました`, error);
    return { alternatives: [] }; // エラー時は空の配列を返す
  }
};

// APIのバージョンやステータスを確認するAPI
export const checkApiStatus = async () => {
  try {
    const response = await apiClient.get('/');
    return response.data;
  } catch (error) {
    console.error('API接続エラー', error);
    throw error;
  }
};

export default {
  analyzeDifficultWords,
  analyzeRealtime,
  getAlternatives,
  getSmartAlternatives,
  checkApiStatus,
}; 