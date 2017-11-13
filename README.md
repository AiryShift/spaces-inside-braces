# Spaces Inside Braces

Reformats braces (and others) as you type.

## Features

Spaces braces `{}`, parentheses `()`, and brackets `[]` as you type.

When `{` is typed to create a pair of curly braces, the following appears with the cursor in between the two braces.

    {|}
     ^
    cursor

Pressing space once by default gives the following:

    { |}
      ^
    cursor

By installing this extension, it autoformats to:

    { | }
      ^
    cursor

Removing the space returns the braces to the original state:

    {|}
     ^
    cursor

## Configuration

- `spaces-inside-braces.enable`: enable/disable the extension.
- `spaces-inside-braces.enableForBraces`: enable/disable spacing for braces.
- `spaces-inside-braces.enableForParens`: enable/disable spacing for parentheses.
- `spaces-inside-braces.enableForBrackets`: enable/disable spacing for brackets.
