class ChatGPTSmartIndex {
    constructor() {
        this.sidebar = null;
        this.promptList = null;
        this.isVisible = true;
        this.prompts = [];
        this.observer = null;
        this.debounceTimer = null;
        this.expandBtn = null;
        this.isMobile = window.matchMedia("(max-width: 768px)").matches;
        this.selectedPromptId = null;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.createSidebar();
        this.createFloatingExpandBtn();
        this.setupObserver();
        this.scanForPrompts();
        this.setupKeyboardShortcuts();

        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();

        const reposition = () => {
            this.positionExpandBtnDesktop();
            this.positionExpandBtnMobile();
        };
        window.addEventListener('scroll', reposition, { passive: true });
        setInterval(reposition, 800);
    }

    handleResize() {
        this.isMobile = window.matchMedia("(max-width: 768px)").matches;
        if (this.isMobile) {
            this.isVisible = false;
            this.sidebar.classList.remove('active');
            this.sidebar.classList.add('collapsed');
            this.sidebar.style.display = 'none';
            this.positionExpandBtnMobile();
            this.showExpandBtn();
        } else {
            if (this.isVisible) this.showSidebar(false);
            else this.hideSidebar(false);
            this.positionExpandBtnDesktop();
        }
    }

    createSidebar() {
        this.sidebar = document.createElement('div');
        this.sidebar.id = 'chatgpt-smart-index';
        this.sidebar.className = 'chatgpt-sidebar';

        const header = document.createElement('div');
        header.className = 'sidebar-header';

        const title = document.createElement('h3');
        title.textContent = 'Chat Index';
        title.className = 'sidebar-title';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '−';
        closeBtn.title = 'Minimize sidebar';
        closeBtn.addEventListener('click', () => this.hideSidebar(true));

        header.appendChild(title);
        header.appendChild(closeBtn);

        this.promptList = document.createElement('div');
        this.promptList.className = 'prompt-list';

        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'No prompts found. Start chatting to see your conversation index here.';
        this.promptList.appendChild(emptyState);

        this.sidebar.appendChild(header);
        this.sidebar.appendChild(this.promptList);

        document.body.appendChild(this.sidebar);
    }

    createFloatingExpandBtn() {
        this.expandBtn = document.createElement('button');
        this.expandBtn.id = 'chatgpt-sidebar-expand-btn';
        this.expandBtn.className = 'floating-expand-btn';
        this.expandBtn.setAttribute('aria-label', 'Expand ChatGPT Smart Index');
        this.expandBtn.innerHTML = '+';
        this.expandBtn.addEventListener('click', () => this.showSidebar(true));
        document.body.appendChild(this.expandBtn);
    }

    getShareButtonRect() {
        const shareBtn =
            document.querySelector('button[aria-label*="Share" i]') ||
            document.querySelector('button:has(svg[aria-label*="Share" i])') ||
            Array.from(document.querySelectorAll('button')).find(b => /share/i.test(b.textContent || ''));
        return shareBtn ? shareBtn.getBoundingClientRect() : null;
    }

    getSearchInputRect() {
        const input =
            document.querySelector('input[type="search"]') ||
            document.querySelector('header input[type="text"]') ||
            document.querySelector('form input[type="search"]');
        return input ? input.getBoundingClientRect() : null;
    }

    positionExpandBtnDesktop() {
        if (this.isMobile) return;
        const shareRect = this.getShareButtonRect();
        if (shareRect) {
            const offsetY = 10;
            this.expandBtn.style.position = 'fixed';
            this.expandBtn.style.top = Math.max(10, Math.round(shareRect.bottom + offsetY)) + 'px';
            this.expandBtn.style.right = Math.max(20, Math.round(window.innerWidth - shareRect.right + 8)) + 'px';
            this.expandBtn.style.left = '';
            this.expandBtn.style.bottom = '';
        } else {
            this.expandBtn.style.position = 'fixed';
            this.expandBtn.style.top = '86px';
            this.expandBtn.style.right = '28px';
            this.expandBtn.style.left = '';
            this.expandBtn.style.bottom = '';
        }
        this.expandBtn.style.display = this.isVisible ? 'none' : 'block';
    }

    positionExpandBtnMobile() {
        if (!this.isMobile) return;
        const searchRect = this.getSearchInputRect();
        if (searchRect) {
            const topPos = Math.max(10, Math.round(searchRect.top - 72));
            this.expandBtn.style.position = 'fixed';
            this.expandBtn.style.top = topPos + 'px';
            this.expandBtn.style.right = '16px';
            this.expandBtn.style.left = '';
            this.expandBtn.style.bottom = '';
        } else {
            this.expandBtn.style.position = 'fixed';
            this.expandBtn.style.right = '16px';
            this.expandBtn.style.bottom = '36px';
            this.expandBtn.style.top = '';
            this.expandBtn.style.left = '';
        }
        this.expandBtn.style.display = this.isVisible ? 'none' : 'block';
    }

    showExpandBtn() {
        if (this.isMobile) this.positionExpandBtnMobile();
        else this.positionExpandBtnDesktop();
        this.expandBtn.style.display = this.isVisible ? 'none' : 'block';
    }

    hideExpandBtn() {
        this.expandBtn.style.display = 'none';
    }

    showSidebar() {
        this.isVisible = true;
        this.sidebar.classList.add('active');
        this.sidebar.classList.remove('collapsed');
        this.sidebar.style.display = 'flex';
        this.hideExpandBtn();
        if (this.isMobile) document.body.classList.add('chatgpt-mobile-sidebar');
        this.applySelectedStyling();
    }

    hideSidebar() {
        this.isVisible = false;
        this.sidebar.classList.remove('active');
        this.sidebar.classList.add('collapsed');
        this.sidebar.style.display = (this.isMobile ? 'none' : 'flex');
        if (this.isMobile) {
            document.body.classList.remove('chatgpt-mobile-sidebar');
            this.positionExpandBtnMobile();
        } else {
            this.positionExpandBtnDesktop();
        }
        this.showExpandBtn();
    }

    setupObserver() {
        const targetNode = document.body;
        const config = { childList: true, subtree: true };
        this.observer = new MutationObserver((mutations) => {
            let shouldScan = false;
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (
                                node.matches &&
                                (node.matches('[data-message-author-role]') ||
                                 node.querySelector('[data-message-author-role]') ||
                                 node.matches('.group.w.full') ||
                                 node.querySelector('.group.w-full') ||
                                 node.matches('.group.w-full'))
                            ) {
                                shouldScan = true;
                            }
                        }
                    });
                }
            });
            if (shouldScan) this.debouncedScan();
        });
        this.observer.observe(targetNode, config);
    }

    debouncedScan() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.scanForPrompts();
        }, 500);
    }

    scanForPrompts() {
        const messageSelectors = [
            '[data-message-author-role="user"]',
            '[data-message-author-role="assistant"]',
            '.group.w-full.text-gray-800',
            '.group.w-full.bg-gray-50',
            '.flex.flex-col.items-start',
            '.conversation-turn'
        ];
        let messages = [];
        for (const selector of messageSelectors) {
            const foundMessages = document.querySelectorAll(selector);
            if (foundMessages.length > 0) {
                messages = Array.from(foundMessages);
                break;
            }
        }
        if (messages.length === 0) {
            const potential = document.querySelectorAll('.group, [class*="message"], [class*="conversation"]');
            messages = Array.from(potential).filter(el => {
                const text = el.textContent.trim();
                return text.length > 10 && text.length < 2000;
            });
        }
        this.updatePromptList(messages);
    }

    updatePromptList(messages) {
        const newPrompts = [];
        messages.forEach((message, index) => {
            const text = this.extractMessageText(message);
            if (!text || text.length < 10) return;
            const isUser = this.isUserMessage(message);
            const messageId = `msg-${index}`;
            if (!message.id && !message.hasAttribute('data-smart-index-id')) {
                message.setAttribute('data-smart-index-id', messageId);
            }
            newPrompts.push({
                id: messageId,
                text,
                isUser,
                element: message,
                preview: this.createPreview(text)
            });
        });

        if (JSON.stringify(newPrompts.map(p => p.preview)) !== JSON.stringify(this.prompts.map(p => p.preview))) {
            this.prompts = newPrompts;
            this.renderPromptList();
            this.applySelectedStyling();
        }
    }

    extractMessageText(element) {
        const clone = element.cloneNode(true);
        const sidebar = clone.querySelector('#chatgpt-smart-index');
        if (sidebar) sidebar.remove();
        const textElements = clone.querySelectorAll('p, div, span');
        let text = '';
        textElements.forEach(el => {
            const parent = el.parentElement;
            if (parent &&
                (parent.matches('button') ||
                 parent.closest('button') ||
                 el.matches('.sr-only') ||
                 el.matches('[aria-hidden="true"]'))) return;
            const elementText = el.textContent.trim();
            if (elementText && !text.includes(elementText)) text += elementText + ' ';
        });
        return text.trim() || clone.textContent.trim();
    }

    isUserMessage(element) {
        const indicators = [
            () => element.hasAttribute('data-message-author-role') && element.getAttribute('data-message-author-role') === 'user',
            () => element.querySelector('[data-message-author-role="user"]'),
            () => element.classList.contains('bg-white') || !element.classList.contains('bg-gray-50')
        ];
        return indicators.some(check => check());
    }

    createPreview(text) {
        const maxLength = 60;
        return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
    }

    renderPromptList() {
        this.promptList.innerHTML = '';
        if (this.prompts.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No prompts found. Start chatting to see your conversation index here.';
            this.promptList.appendChild(emptyState);
            return;
        }
        this.prompts.forEach((prompt, index) => {
            const item = this.createPromptItem(prompt, index);
            this.promptList.appendChild(item);
        });
    }

    createPromptItem(prompt, index) {
        const promptItem = document.createElement('div');
        promptItem.className = `prompt-item ${prompt.isUser ? 'user' : 'assistant'}`;
        promptItem.dataset.pid = prompt.id;

        const promptNumber = document.createElement('span');
        promptNumber.className = 'prompt-number';
        promptNumber.textContent = `${index + 1}`;

        const promptText = document.createElement('div');
        promptText.className = 'prompt-text';
        promptText.textContent = prompt.preview;
        promptText.title = prompt.text;

        const promptType = document.createElement('span');
        promptType.className = 'prompt-type';
        promptType.textContent = prompt.isUser ? 'You' : 'AI';

        promptItem.appendChild(promptNumber);
        promptItem.appendChild(promptText);
        promptItem.appendChild(promptType);

        promptItem.addEventListener('click', (e) => {
            e.preventDefault();
            this.handlePromptClick(prompt, promptItem);
        });

        promptItem.setAttribute('tabindex', '0');
        promptItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handlePromptClick(prompt, promptItem);
            }
        });

        return promptItem;
    }

    handlePromptClick(prompt, promptItem) {
        promptItem.style.transform = 'scale(0.98)';
        setTimeout(() => { promptItem.style.transform = ''; }, 120);

        this.selectedPromptId = prompt.id;
        this.applySelectedStyling();

        this.scrollToPrompt(prompt.element);

        if (this.isMobile) this.hideSidebar(true);

        this.highlightPrompt(prompt.element);
    }

    applySelectedStyling() {
        this.promptList.querySelectorAll('.prompt-item.selected').forEach(el => el.classList.remove('selected'));
        if (!this.selectedPromptId) return;
        const selected = this.promptList.querySelector(`.prompt-item[data-pid="${this.selectedPromptId}"]`);
        if (selected) selected.classList.add('selected');
    }

    scrollToPrompt(element) {
        const target = element.hasAttribute('data-smart-index-id')
            ? element
            : document.querySelector(`[data-smart-index-id="${element.id}"]`) || element;
        const elementTop = target.offsetTop;
        const offset = 100;
        target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        setTimeout(() => {
            window.scrollTo({ top: elementTop - offset, behavior: 'smooth' });
        }, 100);
    }

    highlightPrompt(element) {
        document.querySelectorAll('.chatgpt-highlight').forEach(el => el.classList.remove('chatgpt-highlight'));
        element.classList.add('chatgpt-highlight');
        setTimeout(() => element.classList.remove('chatgpt-highlight'), 3000);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toUpperCase() === 'I') {
                e.preventDefault();
                if (this.isVisible) this.hideSidebar(true);
                else this.showSidebar(true);
            }
            if (e.key === 'Escape' && this.isVisible) {
                this.hideSidebar(true);
            }
        });
    }
}

new ChatGPTSmartIndex();
