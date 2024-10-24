'use client';

import React, { useEffect, useRef } from 'react';

interface ShadowWrapperProps {
    content: string;
}

const ShadowWrapper: React.FC<ShadowWrapperProps> = ({ content }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const shadowRootRef = useRef<ShadowRoot | null>(null); // To track if shadow DOM is already attached

    useEffect(() => {
        if (containerRef.current && !shadowRootRef.current) {
            // Attach Shadow DOM only if it hasn't been attached yet
            const shadowRoot = containerRef.current.attachShadow({ mode: 'open' });
            shadowRootRef.current = shadowRoot;

            // Create a container to hold the HTML content
            const innerDiv = document.createElement('div');
            innerDiv.innerHTML = content;

            // Optional: Add any default styles within the Shadow DOM
            const style = document.createElement('style');
            style.textContent = `
                * {
                }
                body {
                margin: 0;
                padding: 0;
                }
            `;

            // Append styles and content to the shadow root
            shadowRoot.appendChild(style);
            shadowRoot.appendChild(innerDiv);
        } else if (shadowRootRef.current) {
            // If Shadow DOM already exists, just update the content
            const innerDiv = shadowRootRef.current.querySelector('div');
            if (innerDiv) {
                innerDiv.innerHTML = content;
            }
        }
    }, [content]);

    return <div ref={containerRef}></div>;
};

export default ShadowWrapper;