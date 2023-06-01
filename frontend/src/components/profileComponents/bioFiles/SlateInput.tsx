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
import { EventContext } from "./UserBiography";

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
    children: [{ text: "This is my Bio" }],
  },
];

function SlateInput(props: any) {
  const editor = useMemo(() => {
    return withHistory(withReact(createEditor()));
  }, []);

  // const [isEmpty, setIsEmpty] = useState(true);

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
      if (!selection) {
        return;
      } // guard against null selection

      const [start] = Editor.edges(editor, selection);
      Transforms.insertText(editor, " ", { at: start });
      Transforms.insertText(editor, " ", { at: start });
      Transforms.delete(editor, { distance: 1, at: start });
    }
  };

  const userData = useContext(EventContext);
  const { showEmojiOverLay, selectedEmoji, setSelectedEmoji } = userData;

  const insertEmoji = (emoji: string) => {
    const selection = editor.selection;
    if (!selection) {
      return;
    } // guard against null selection

    const [start] = Editor.edges(editor, selection);
    Transforms.insertText(editor, emoji, { at: start });
    setSelectedEmoji("");
  };

  useEffect(() => {
    document.getElementById("txtInput")?.focus();
    console.log("focus");
  }, [selectedEmoji]);

  useEffect(() => {
    console.log(selectedEmoji);
    if (selectedEmoji && selectedEmoji?.length > 0) insertEmoji(selectedEmoji);
  }, [selectedEmoji]);

  useEffect(() => {
    // Move the cursor to the end of the text node
    const path = Editor.end(editor, []);
    const range = Editor.range(editor, path);
    ReactEditor.focus(editor);
    Transforms.select(editor, range);
  }, [editor]);

  return (
    <div id="outerTxtInput">
      <Slate editor={editor} value={initialValue}>
        <Editable
          spellCheck
          placeholder="Dont be shy : )"
          onKeyDown={(event) => handleKeyPress(event)}
          id="txtInput"
        />
      </Slate>
    </div>
  );
}

export default SlateInput;
