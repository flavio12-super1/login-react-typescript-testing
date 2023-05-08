import React, { useMemo, useRef, useContext, useState, useEffect } from "react";
import {
  Editor,
  BaseEditor,
  createEditor,
  Descendant,
  Transforms,
  Text,
  Range,
} from "slate";
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  useFocused,
  useSlate,
} from "slate-react";

import { withHistory, HistoryEditor } from "slate-history";
import { EventContext } from "./Messages";

type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = { text: string; bold?: true };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

function SlateInput(props: any) {
  const editor = useMemo(() => {
    return withHistory(withReact(createEditor()));
  }, []);

  function sendMessage() {
    let x = JSON.parse(JSON.stringify(editor));

    Transforms.delete(editor, {
      at: {
        anchor: Editor.start(editor, []),
        focus: Editor.end(editor, []),
      },
    });
    props.onMessageSubmit(x.children);
  }

  const handleKeyPress = (event: any) => {
    if (!event.shiftKey && event.which === 13) {
      event.preventDefault();
      sendMessage();
    } else if (event.which === 32) {
      // Spacebar
      event.preventDefault();
      const selection = editor.selection;
      if (!selection) return; // guard against null selection

      const [start, end] = Editor.edges(editor, selection);
      const [node] = Editor.node(editor, start.path);
      if (Text.isText(node)) {
        const length = node.text.length;
        Transforms.select(editor, { path: start.path, offset: length });
        Transforms.insertText(editor, " ");
        Transforms.select(editor, { path: start.path, offset: length });
        Transforms.insertText(editor, " ");
        Transforms.delete(editor, { distance: 1 });
      }
    }
  };

  const userData = useContext(EventContext);
  const { postMessageId } = userData;

  useEffect(() => {
    console.log("focus");
    Transforms.select(editor, { offset: 0, path: [0, 0] });
  }, [editor]);

  useEffect(() => {
    document.getElementById("txtInput")?.focus();
  }, [postMessageId]);

  return (
    <div id="outerTxtInput">
      <Slate editor={editor} value={initialValue}>
        <Editable
          autoFocus
          onKeyPress={(event) => handleKeyPress(event)}
          id="txtInput"
        />
      </Slate>
    </div>
  );
}

export default SlateInput;
