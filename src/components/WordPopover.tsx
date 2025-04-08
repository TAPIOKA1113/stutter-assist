import React, { forwardRef, Ref, MouseEvent, useState, useEffect } from 'react';
import { getSmartAlternatives } from '../services/apiService';

interface WordPopoverProps {
  word: string;
  position: {
    top: number;
    left: number;
  };
  currentText: string; // 現在のエディタのテキスト全体
  textPosition: {  // 追加：テキスト内での単語の位置
    start: number;
    end: number;
  };
  onSelect: (alternative: string) => void;
  onIgnore: () => void;
  onMouseEnter?: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLDivElement>) => void;
}

const WordPopover = forwardRef((
  { word, position, currentText, textPosition, onSelect, onIgnore, onMouseEnter, onMouseLeave }: WordPopoverProps,
  ref: Ref<HTMLDivElement>
) => {
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // コンテキストウィンドウを取得する関数
  const getContextWindow = (text: string, start: number, end: number, windowSize: number) => {
    const beforeStart = Math.max(0, start - windowSize);
    const afterEnd = Math.min(text.length, start + windowSize);

    const beforeContext = text.slice(beforeStart, start).trim();
    const afterContext = text.slice(end, afterEnd).trim();

    return { beforeContext, afterContext };
  };

  // 代替案をAPIから取得
  useEffect(() => {
    const fetchAlternatives = async () => {
      try {
        setLoading(true);

        // コンテキストウィンドウを取得
        const { beforeContext, afterContext } = getContextWindow(
          currentText,
          textPosition.start,
          textPosition.end,
          250 // 前後200文字ずつ取得
        );

        const contextText = beforeContext + word + afterContext;
        console.log('contextText', contextText);

        // 代替案APIを呼び出し（コンテキスト情報を含める）
        const result = await getSmartAlternatives(
          contextText,  // 一部テキストを送信することでトークン制限を回避
          word,
        );

        if (result && result.alternatives && Array.isArray(result.alternatives)) {
          setAlternatives(result.alternatives);
        } else {
          setAlternatives([]);
        }
      } catch (err) {
        console.error('代替案の取得に失敗しました', err);
        setError('代替案を取得できませんでした');
      } finally {
        setLoading(false);
      }
    };

    fetchAlternatives();
  }, [word, currentText, textPosition]);

  const handleSelect = (alternative: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    onSelect(alternative);
  };

  const handleIgnore = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onSelect('ignore');
    onIgnore();
  };

  return (
    <div
      ref={ref}
      className="absolute z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => e.stopPropagation()}
    >
      {loading ? (
        <div className="p-3 text-center text-gray-600">
          読み込み中...
        </div>
      ) : error ? (
        <div className="p-3 text-center text-red-600">
          {error}
        </div>
      ) : alternatives.length === 0 ? (
        <div className="p-3 text-center text-gray-600">
          代替案がありません
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {alternatives.map((alt, index) => (
            <li
              key={index}
              onClick={(e) => handleSelect(alt, e)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`px-4 py-2 cursor-pointer text-sm transition-colors duration-150
                ${hoveredIndex === index ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
            >
              {alt}
            </li>
          ))}
          <li
            onClick={handleIgnore}
            onMouseEnter={() => setHoveredIndex(-1)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`px-4 py-2 cursor-pointer text-sm text-gray-500 transition-colors duration-150
              ${hoveredIndex === -1 ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
          >
            無視
          </li>
        </ul>
      )}
    </div>
  );
});

export default WordPopover; 