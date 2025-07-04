'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { EditorState } from 'lexical';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from 'lexical';

// Tema dasar untuk editor
const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'editor-placeholder',
  paragraph: 'editor-paragraph',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
  },
};

// Toolbar untuk tombol-tombol editor
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="border border-input bg-transparent rounded-t-md p-2 flex items-center gap-1">
      <Button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} variant="ghost" size="icon"><Bold className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} variant="ghost" size="icon"><Italic className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} variant="ghost" size="icon"><Underline className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')} variant="ghost" size="icon"><Strikethrough className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'ul')} variant="ghost" size="icon"><List className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'ol')} variant="ghost" size="icon"><ListOrdered className="h-4 w-4" /></Button>
    </div>
  );
}

// Konfigurasi awal editor
const editorConfig = {
  namespace: 'MyEditor',
  theme,
  onError(error: Error) {
    throw error;
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    AutoLinkNode,
    LinkNode,
  ],
};

interface LexicalEditorProps {
  onChange: (editorStateAsJSON: string, editorStateAsText: string) => void;
  initialState?: string;
}

export default function LexicalEditor({ onChange, initialState }: LexicalEditorProps) {
  const handleOnChange = (editorState: EditorState) => {
    const editorStateJSON = JSON.stringify(editorState.toJSON());
    const editorStateText = editorState.read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        return selection.getTextContent();
      }
      return '';
    });
    onChange(editorStateJSON, editorStateText);
  };

  return (
    <LexicalComposer initialConfig={{...editorConfig, editorState: initialState}}>
      <div className="border border-input rounded-md">
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={<ContentEditable className="min-h-[250px] p-4 outline-none" />}
            placeholder={<div className="text-muted-foreground absolute top-4 left-4 pointer-events-none">Type a content...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>
      <HistoryPlugin />
      <OnChangePlugin onChange={handleOnChange} />
    </LexicalComposer>
  );
}
