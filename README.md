# Spaces Inside Braces

[![](https://vsmarketplacebadge.apphb.com/version/AiryShift.spaces-inside-braces.svg)](https://marketplace.visualstudio.com/items?itemName=AiryShift.spaces-inside-braces)
[![](https://vsmarketplacebadge.apphb.com/installs-short/AiryShift.spaces-inside-braces.svg)](https://marketplace.visualstudio.com/items?itemName=AiryShift.spaces-inside-braces)
[![](https://vsmarketplacebadge.apphb.com/rating-short/AiryShift.spaces-inside-braces.svg)](https://marketplace.visualstudio.com/items?itemName=AiryShift.spaces-inside-braces)

Reformats braces (and others) as you type.

## Features

Spaces braces `{}`, parentheses `()`, brackets `[]`, and angle brackets `<>` as you type.

When `{` is typed to create a pair of curly braces, the following appears with the cursor in between the two braces.

    {|}
     ^cursor

Pressing space once by default gives the following:

    { |}
      ^cursor

By installing this extension, it autoformats to:

    { | }
      ^cursor

Removing the space returns the braces to the original state:

    {|}
     ^cursor

The extension works with multiple cursors, however all cursors must either be in a position to space or unspace. Otherwise, normal behaviour will be preserved.

## Configuration

All options are by default enabled.

- `spaces-inside-braces.enable`: enable/disable the extension.
- `spaces-inside-braces.enableForBraces`: enable/disable spacing for braces.
- `spaces-inside-braces.enableForParens`: enable/disable spacing for parentheses.
- `spaces-inside-braces.enableForBrackets`: enable/disable spacing for brackets.
- `spaces-inside-braces.enableForAngle`: enable/disable spacing for angle brackets.

## Known Behaviour

Pressing delete in the following configuration results in the cursor getting reset.

    {|  }
     ^cursor

to

    { | }
      ^cursor

## Icon

The icon is from the set "Curly Brackets" by Marek Polakovic from the Noun Project, available at [The Noun Project](https://thenounproject.com/term/curly-brackets/108564/) under Creative Commons Attribution 3.0 (CC BY 3.0 US).
Full terms at [Creative Commons](https://creativecommons.org/licenses/by/3.0/us/).

The icon was cropped and resized from its original resolution to 128 by 128 pixels.
