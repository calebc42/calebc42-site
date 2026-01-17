+++
title = "CSS Stress Test"
author = ["desktop"]
date = 2025-11-20
lastmod = 2026-01-16T16:57:39-07:00
tags = ["css", "tag", "test"]
draft = false
+++

This post serves as a "unit test" for my design language, inspired by the Nier: Automata YoHRa UI. It contains examples of common Org Mode elements to ensure the Hugo CSS handles them correctly.


## Typography and Inline Styles {#typography-and-inline-styles}

We need to verify that _italics_, **bold text**, ~~strikethrough text~~, and <span class="underline">underlined text</span> render cleanly. We also need to check distinct elements like `code (tilde)` and `verbatim (equals)`.

This is the keybinding for `find-file`:  <kbd>C-x</kbd> <kbd>C-f</kbd>

Here is a [standard hyperlink](https://orgmode.org) to an external site.


## Lists and Definitions {#lists-and-definitions}


### Unordered List {#unordered-list}

-   Level 1 item
-   Level 1 item
    -   Level 2 item (nested)
    -   Level 2 item
        -   Level 3 item


### Ordered List {#ordered-list}

1.  Step One
2.  Step Two
    1.  Sub-step A
    2.  Sub-step B


### Definition List (The Critical Test) {#definition-list--the-critical-test}

This uses the standard `- Term :: Definition` syntax.

YoRHa
: An elite military force of androids charged with retaking Earth.

Bunker
: The orbital base of operations for YoRHa forces.

2B
: A battle android deployed to Earth.


## Block Elements {#block-elements}


### Block Quotes {#block-quotes}

> "Everything that lives is designed to end. We are perpetually trapped in a never-ending spiral of life and death."
> -- 2B, Nier: Automata


### Tables {#tables}

| Unit | Class    | Status | Load |
|------|----------|--------|------|
| 2B   | Battler  | Active | 98%  |
| 9S   | Scanner  | Active | 100% |
| A2   | Attacker | AWOL   | ???  |


## Horizontal Rules {#horizontal-rules}

The line below separates sections.

---


## Admonition System Check {#admonition-system-check}

<div class="warning">

****Critical Failure****
If you see this box with a red border and a "WARNING" label, the Elisp filter is working.

</div>

<div class="note">

****Observation****
This should render as a neutral/accent colored note.

</div>

<div class="tip">

You can use **bold** and _italics_ inside these blocks because the shortcode uses \`markdownify\`.

</div>


## Technical Blocks {#technical-blocks}


### Source Code (Terminal) {#source-code--terminal}

```python
def mission_status(unit_id):
    """
    Checks the status of a YoRHa unit.
    """
    if unit_id == "9S":
        return "Hacking in progress..."
    return "Combat Mode Engaged"
```


### Example Block {#example-block}

This checks the styling for generic examples (often used for output or logs).

```text
[LOG] Pod 042 reports connection established.
[LOG] Data upload to Bunker complete.
[WARN] Black box signal unstable.
```


### Fixed Width (Colon Syntax) {#fixed-width--colon-syntax}

Lines starting with a colon should render as literal text, similar to code but without the wrapper box.

```text
This is a fixed-width line.
It should look like a typewriter output.
No syntax highlighting here.
```


## Interactive &amp; Meta Elements {#interactive-and-meta-elements}


### Collapsible Details (HTML Export) {#collapsible-details--html-export}

<details>
  <summary>ACCESS CLASSIFIED DATA [CLICK TO EXPAND]</summary>
  <div style="padding-top: 1rem;">
    <p>This data is concealed behind a standard HTML5 details element.</p>
    <ul>
      <li>Hidden Intel A</li>
      <li>Hidden Intel B</li>
    </ul>
  </div>
</details>


### Footnotes &amp; Citations {#footnotes-and-citations}

This is a statement that requires verification[^fn:1].
Here is another point that references the same source[^fn:1].

[^fn:1]: This is the footnote content. It will jump to the bottom of the page.
