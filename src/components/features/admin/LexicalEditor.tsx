'use client';

import { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

// Import Node yang diperlukan
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';

// Import fungsi dari Lexical Core
import { EditorState, $getRoot, $insertNodes } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';

import { Bold, Italic, Underline, Strikethrough, List, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
} from 'lexical';

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
  link: 'editor-link',
};

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  return (
    <div className="border border-input bg-transparent rounded-t-md p-2 flex items-center gap-1">
      <Button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} variant="ghost" size="icon"><Bold className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} variant="ghost" size="icon"><Italic className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} variant="ghost" size="icon"><Underline className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')} variant="ghost" size="icon"><Strikethrough className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} variant="ghost" size="icon"><List className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} variant="ghost" size="icon"><ListOrdered className="h-4 w-4" /></Button>
    </div>
  );
}

function HTMLInitializerPlugin({ initialHtml }: { initialHtml: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHtml, 'text/html');
      
      const nodes = $generateNodesFromDOM(editor, dom);
      
      const root = $getRoot();
      root.clear();
      root.select();
      
      $insertNodes(nodes);
    });
  }, [editor, initialHtml]);

  return null;
}

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
  onChange: (editorStateAsJSON: string) => void;
  initialState?: string | null;
}

export default function LexicalEditor({ onChange, initialState }: LexicalEditorProps) {
  let initialEditorState: string | null = null;
  let initialHtml: string | null = null;

  if (initialState) {
    try {
      const parsedState = JSON.parse(initialState);
      if (typeof parsedState === 'object' && parsedState !== null && 'root' in parsedState) {
        initialEditorState = initialState;
      } else {
        initialHtml = initialState;
      }
    } catch (e) {
      initialHtml = initialState;
    }
  }

  const handleOnChange = (editorState: EditorState) => {
    const editorStateJSON = JSON.stringify(editorState.toJSON());
    onChange(editorStateJSON);
  };

  const finalEditorConfig = {
    ...editorConfig,
    editorState: initialEditorState,
  };

  return (
    <LexicalComposer initialConfig={finalEditorConfig}>
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
      <ListPlugin />
      <LinkPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <OnChangePlugin onChange={handleOnChange} />
      {initialHtml && <HTMLInitializerPlugin initialHtml={initialHtml} />}
    </LexicalComposer>
  );
}