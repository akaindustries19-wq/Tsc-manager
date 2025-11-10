/**
 * TSC Manager Web Component
 * Allows embedding TSC Manager as a custom HTML element
 */

class TSCManagerWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const apiKey = this.getAttribute('api-key') || 'default-api-key';
        const apiUrl = this.getAttribute('api-url') || window.location.origin;
        const height = this.getAttribute('height') || '600px';

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                iframe {
                    width: 100%;
                    height: ${height};
                    border: none;
                    border-radius: 0.5rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
            </style>
            <iframe 
                src="${apiUrl}/?apiKey=${encodeURIComponent(apiKey)}" 
                title="TSC Manager Widget"
                allow="web-share"
            ></iframe>
        `;
    }
}

// Register the custom element
customElements.define('tsc-manager-widget', TSCManagerWidget);
