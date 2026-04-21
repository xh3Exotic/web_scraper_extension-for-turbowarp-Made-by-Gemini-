/**
 * TurboWarp Web Scraper Custom Extension - FINALIZED VERSION
 *
 * This extension is optimized for high stability against anti-bot checks
 * and reliably fetches a single piece of data (Text or a static Image URL).
 * When fetching an Image URL that points to a GIF, Scratch will automatically
 * load and display the *first frame* as a static image.
 * make sure to enable 'Run whitout sandbox'
 * Made by Gemini
 */

(function(Scratch) {
    'use strict';

    if (!Scratch) {
        return;
    }

    class WebScraper {
        getInfo() {
            return {
                id: 'webscraper',
                name: 'Web Scraper',
                menus: {
                    extract_types: {
                        acceptReporters: true,
                        items: ['text', 'image URL']
                    }
                },
                blocks: [
                    {
                        opcode: 'fetchAndParseValue', 
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'fetch [TYPE] from selector [SELECTOR] at [URL]',
                        arguments: {
                            TYPE: { type: Scratch.ArgumentType.STRING, menu: 'extract_types', defaultValue: 'text' },
                            SELECTOR: { type: Scratch.ArgumentType.STRING, defaultValue: 'img' }, 
                            URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://rovalue.com/da-hood/skin/364' }
                        }
                    }
                ]
            };
        }

        async fetchAndParseValue(args) {
            const { URL, SELECTOR, TYPE } = args;
            if (!URL || URL.trim() === '') { return 'ERROR: URL cannot be empty.'; }

            try {
                // MAXIMUM SPOOFING HEADERS: Mimics a user directly typing the URL into the address bar.
                const headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': undefined, // CRITICAL: Tells the server there is no referring page (fresh navigation)
                    'Sec-Fetch-Site': 'none', 
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-User': '?1',
                    'Sec-Fetch-Dest': 'document',
                    'Connection': 'keep-alive'
                };

                const response = await fetch(URL, { headers: headers });
                
                if (!response.ok) {
                    return `ERROR: HTTP Status ${response.status} (${response.statusText}). Server blocked the request.`;
                }
                
                const htmlText = await response.text();
                const doc = (new DOMParser()).parseFromString(htmlText, 'text/html');
                const element = doc.querySelector(SELECTOR);

                if (element) {
                    if (TYPE.toLowerCase() === 'image url') {
                        const imageUrl = element.getAttribute('src');
                        return imageUrl ? imageUrl.trim() : `ERROR: Element found, but no 'src' attribute.`;
                    } else {
                        const textContent = element.textContent.trim();
                        return textContent === '' ? `ERROR: Selector found, but content is blank. Switching to 'image URL' may fix this` : textContent;
                    }
                } else {
                    return `ERROR: Selector "${SELECTOR}" not found.`;
                }

            } catch (error) {
                console.error('Fetch/Parse Error:', error);
                return `ERROR: Network failure. Details: ${error.message}`;
            }
        }
    }

    Scratch.extensions.register(new WebScraper());
})(Scratch);