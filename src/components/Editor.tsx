import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Editor as DraftEditor, EditorState, ContentState, CompositeDecorator, Modifier, SelectionState, ContentBlock } from 'draft-js';
import 'draft-js/dist/Draft.css';
import WordPopover from './WordPopover';

interface DifficultWordSpanProps {
  decoratedText: string;
  blockKey: string;
  start: number;
  end: number;
  children: React.ReactNode;
  onSelectAlternative: (alternative: string) => void;
}

interface EditorProps {
  hardWords: string[];
  onAddEasyWord: (word: string) => void;
  onAddDifficultWord: (word: string) => void;
}

// 難しい単語をハイライトするスパンコンポーネント
const DifficultWordSpan: React.FC<DifficultWordSpanProps> = (props) => {
  const [showPopover, setShowPopover] = useState<boolean>(false);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const spanRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOverPopover, setIsOverPopover] = useState<boolean>(false);

  const handleClick = (): void => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      setPopoverPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
      setShowPopover(!showPopover); // クリックするたびに表示・非表示を切り替え
    }
  };

  const handlePopoverMouseEnter = (): void => {
    setIsOverPopover(true);
  };

  const handlePopoverMouseLeave = (): void => {
    setIsOverPopover(false);
  };

  // ポップオーバー外のクリックを検知してポップオーバーを閉じるためのハンドラ
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showPopover &&
        spanRef.current &&
        popoverRef.current &&
        !spanRef.current.contains(event.target as Node) &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopover]);

  const handleSelectAlternative = (alternative: string): void => {
    // 代替案を選択した後にポップアップを閉じる
    setShowPopover(false);
    // ポップオーバーの状態を更新するために非同期にする
    setTimeout(() => {
      // 親コンポーネントに選択した代替案を通知
      props.onSelectAlternative(alternative);
    }, 0);
  };

  return (
    <span
      ref={spanRef}
      className="highlight"
      onClick={handleClick}
    >
      {props.children}
      {showPopover && (
        <WordPopover
          ref={popoverRef}
          word={props.decoratedText}
          position={popoverPosition}
          onSelect={handleSelectAlternative}
          onIgnore={() => setShowPopover(false)}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
        />
      )}
    </span>
  );
};

// 難しい単語を検出するストラテジー
type DecoratorStrategy = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) => void;

const createDifficultWordStrategy = (hardWords: string[]): DecoratorStrategy => {
  return (contentBlock, callback, contentState) => {
    const text = contentBlock.getText();

    hardWords.forEach(word => {
      // 大文字小文字を区別せずに検索するための正規表現を作成
      const regex = new RegExp(word, 'gi');
      let match;

      // 正規表現で一致する全ての箇所を見つける
      while ((match = regex.exec(text)) !== null) {
        callback(match.index, match.index + word.length);
      }
    });
  };
};

const Editor: React.FC<EditorProps> = ({ hardWords, onAddEasyWord, onAddDifficultWord }) => {
  // 単語を置き換える関数
  const replaceWord = useCallback((oldWord: string, newWord: string, blockKey: string, start: number, end: number): void => {
    // 指定された単語の位置を基にSelectionStateを作成
    const selection = SelectionState.createEmpty(blockKey).merge({
      anchorOffset: start,
      focusOffset: end,
    });

    // 単語を置き換える新しいコンテンツステートを作成
    setEditorState(currentEditorState => {
      const contentState = currentEditorState.getCurrentContent();
      const newContentState = Modifier.replaceText(
        contentState,
        selection,
        newWord
      );

      // 新しいEditorStateを作成して設定
      const newEditorState = EditorState.push(
        currentEditorState,
        newContentState,
        'insert-characters'
      );

      // 現在のデコレーターを取得して新しいEditorStateに適用
      const currentDecorator = currentEditorState.getDecorator();
      const stateWithDecorator = EditorState.set(newEditorState, { decorator: currentDecorator });

      // カーソル位置を置換後の単語の後ろに設定
      const newSelection = SelectionState.createEmpty(blockKey).merge({
        anchorOffset: start + newWord.length,
        focusOffset: start + newWord.length,
      });
      const stateWithSelection = EditorState.forceSelection(stateWithDecorator, newSelection);

      console.log(`${oldWord} を ${newWord} に置き換えました`);
      return stateWithSelection;
    });
  }, []);

  // デコレーターを作成する関数
  const createDecorator = useCallback((): CompositeDecorator => {
    return new CompositeDecorator([
      {
        strategy: createDifficultWordStrategy(hardWords),
        component: (props: any) => (
          <DifficultWordSpan
            {...props}
            onSelectAlternative={(alternative: string) => {
              if (alternative === 'ignore') {
                onAddEasyWord(props.decoratedText);
              } else {
                // 単語を代替案で置き換える処理
                replaceWord(props.decoratedText, alternative, props.blockKey, props.start, props.end);
              }
            }}
          />
        ),
      },
    ]);
  }, [hardWords, onAddEasyWord, replaceWord]);

  const [editorState, setEditorState] = useState<EditorState>(() => {
    // 初期状態
    return EditorState.createWithContent(
      ContentState.createFromText('吃音症は何百万人もの人々の個人的および職業的生活に影響を与える言語障害です。スティグマや恥ずかしさから身を守るために、吃音のある人々(PWS)はさまざまな戦略を採用して吃音を隠すことがあります。一般的な戦略の一つは単語の置き換えです。'),
      createDecorator()
    );
  });

  // hardWordsが変更されたときにデコレーターを更新
  useEffect(() => {
    setEditorState(currentState =>
      EditorState.set(currentState, { decorator: createDecorator() })
    );
  }, [hardWords, createDecorator]);

  return (
    <div className="editor-container">
      <div className="editor">
        <DraftEditor
          editorState={editorState}
          onChange={setEditorState}
          placeholder="入力を始めましょう..."
        />
      </div>
    </div>
  );
};

export default Editor; 