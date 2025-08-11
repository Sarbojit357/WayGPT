# WayGPT — ChatGPT Smart Index (Chrome Extension)

Smart, in‑chat navigation for long ChatGPT threads. WayGPT adds a right‑side “index” that lists each turn in the current conversation so it’s easy to jump to any prompt or answer instantly. Designed for desktop and mobile with polished collapse/expand behavior.

## Features

### Live conversation index
- Automatically detects user and assistant turns in the current chat.
- Compact previews for quick scanning.
- Click to auto‑scroll to the exact turn with a brief highlight pulse.

### Desktop experience
- Docked right sidebar with dark theme and wider layout for readability.
- “−” button in the header to collapse the sidebar.
- Green “+” launcher appears below ChatGPT’s Share button when collapsed.
- Clicking an index item does not auto‑collapse; the sidebar stays open.
- Selected item in the index shows a green outline to preserve context.

### Mobile/tablet experience
- Only the green “+” launcher is visible by default so chat content isn’t covered.
- Tapping “+” opens a full‑screen overlay index.
- Tapping a prompt jumps to that turn and auto‑closes the overlay.

### Robust DOM handling
- MutationObserver + debounced scanning to adapt to ChatGPT UI updates.
- Multiple selector fallbacks for reliability.
- Long text wrapping and no horizontal overflow in the sidebar.

### Accessibility and UX
- Keyboard shortcut: Cmd/Ctrl+Shift+I to toggle.
- Keyboard/Screen‑reader friendly: tab focus, Enter/Space to activate.
- Clear hover/active states and focus rings.

## Demo
- Right sidebar shows numbered items for each turn.
- Click any item to jump; target briefly highlights in the chat.
- “−” collapses the sidebar; green “+” re‑opens it.
- Mobile: tap the floating “+” above the search bar to open the full‑screen index.

_Add GIFs or screenshots here: `assets/waygpt-1.png`, `assets/waygpt-2.gif`_

## Installation (Developer Mode)

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable Developer mode (top‑right).
4. Click “Load unpacked” and select this folder (the one with `manifest.json`).
5. Open `https://chat.openai.com` and start a conversation. The sidebar will appear on the right.

## Usage

### Desktop
- Collapse with the “−” button in the header; expand with the green “+” under Share.
- Click any index item to jump to that turn; the sidebar stays open.
- The selected item keeps a green outline until another item is selected.

### Mobile/Tablet
- Tap the green “+” above the ChatGPT search bar to open the overlay.
- Tap an item to jump; the overlay auto‑closes so the answer is visible.

## Keyboard Shortcuts
- Cmd/Ctrl+Shift+I — Toggle sidebar  
- Esc — Collapse/close when the sidebar is open

## Project Structure
- `manifest.json` — Chrome extension manifest (MV3)
- `content.js` — Injected logic (builds UI, observes DOM, navigation, shortcuts)
- `styles.css` — Sidebar layout, item states, mobile overlay, launcher button
- `assets/` — Optional screenshots/GIFs for the README

## How It Works (High Level)
- A content script injects a sidebar and listens for DOM changes with `MutationObserver`.
- It scans the visible conversation for message nodes, extracts text, and builds an index.
- Clicking an index item scrolls to the corresponding chat turn and briefly highlights it.
- On desktop, selection persists and the sidebar remains open by design.
- On mobile, the overlay closes after navigating to keep the chat visible.

## Configuration Tips
- Sidebar width: edit width and page margin in `styles.css` (`.chatgpt-sidebar` width and `body.chatgpt-index-active` margin-right).
- Index preview length: change `maxLength` in `createPreview()` inside `content.js`.
- Launcher color: update `.floating-expand-btn` colors in `styles.css`.
- Selection outline color: update `.prompt-item.selected` in `styles.css`.

## Troubleshooting

### Sidebar/launcher overlaps ChatGPT UI
- The launcher auto‑positions near Share/Search with fallbacks; reload the page.
- If ChatGPT changes its DOM, update the selectors in `getShareRect()` / `getSearchRect()`.

### No items in the index
- Scroll the conversation to load more messages; the observer will rescan.
- Ensure the page is on `chat.openai.com` and the extension is enabled.

### Jumps are off by a bit
- Adjust the `offset` value in `scrollToMessage()` in `content.js`.

## Privacy
- Runs entirely in the browser on `chat.openai.com`.
- No data leaves the device.
- No analytics or external requests.

## Roadmap
- Search within the current conversation’s index.
- Pin/favorite turns.
- Export current index as Markdown.
- Optional compact/dense mode.
- Persist last selected item across reloads.

## Contributing
- Issues and PRs are welcome.
- For UI tweaks, include screenshots or short GIFs.
- Keep changes small and focused.

## License
MIT License. See `LICENSE` for details.

## Credits
Built by Sarbojit. Inspired by the need to navigate long ChatGPT threads efficiently.
