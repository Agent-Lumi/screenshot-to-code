/**
 * Screenshot to Code
 * A modern tool to convert screenshots to HTML/CSS code
 * Made by Lumi 💡
 */

// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const optionsSection = document.getElementById('optionsSection');
const resultSection = document.getElementById('resultSection');
const generateBtn = document.getElementById('generateBtn');
const newUploadBtn = document.getElementById('newUploadBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const codeOutput = document.getElementById('codeOutput');
const codeStats = document.getElementById('codeStats');
const codeLang = document.getElementById('codeLang');
const themeToggle = document.getElementById('themeToggle');
const toastContainer = document.getElementById('toastContainer');
const shortcutsModal = document.getElementById('shortcutsModal');
const helpBtn = document.getElementById('helpBtn');
const closeModal = document.getElementById('closeModal');
const previewFrame = document.getElementById('previewFrame');
const colorsTab = document.getElementById('colorsTab');
const colorsGrid = document.getElementById('colorsGrid');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

// State
let currentImage = null;
let generatedCode = '';
let extractedColors = [];

// Initialize
function init() {
    setupEventListeners();
    loadTheme();
    setupTabs();
}

// Event Listeners
function setupEventListeners() {
    // Upload zone interactions
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);

    // File input
    fileInput.addEventListener('change', handleFileSelect);

    // Paste from clipboard
    document.addEventListener('paste', handlePaste);

    // Generate button
    generateBtn.addEventListener('click', generateCode);

    // New upload button
    newUploadBtn.addEventListener('click', resetUpload);

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Help modal
    helpBtn.addEventListener('click', () => showModal(shortcutsModal));
    closeModal.addEventListener('click', () => hideModal(shortcutsModal));
    shortcutsModal.addEventListener('click', (e) => {
        if (e.target === shortcutsModal) hideModal(shortcutsModal);
    });

    // Copy and download
    copyBtn.addEventListener('click', copyCode);
    downloadBtn.addEventListener('click', downloadCode);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadZone.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadZone.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

// File Select Handler
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

// Paste Handler
function handlePaste(e) {
    const items = e.clipboardData.items;
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            const blob = item.getAsFile();
            if (blob) {
                processFile(blob);
                break;
            }
        }
    }
}

// Process File
function processFile(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentImage = e.target.result;
        previewImage.src = currentImage;

        // Show sections
        previewSection.hidden = false;
        optionsSection.hidden = false;

        // Extract colors from image
        if (document.getElementById('extractColors').checked) {
            extractColorsFromImage(currentImage);
        }

        // Scroll to options
        optionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        showToast('Image uploaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
}

// Reset upload
function resetUpload() {
    currentImage = null;
    fileInput.value = '';
    previewSection.hidden = true;
    optionsSection.hidden = true;
    resultSection.hidden = true;
    colorsTab.hidden = true;
    extractedColors = [];
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Extract colors from image
function extractColorsFromImage(imageSrc) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);

        const imageData = ctx.getImageData(0, 0, 50, 50).data;
        const colorMap = new Map();

        // Sample pixels
        for (let i = 0; i < imageData.length; i += 16) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const a = imageData[i + 3];

            if (a < 128) continue; // Skip transparent

            // Round to nearest color bucket
            const bucketSize = 32;
            const roundedR = Math.round(r / bucketSize) * bucketSize;
            const roundedG = Math.round(g / bucketSize) * bucketSize;
            const roundedB = Math.round(b / bucketSize) * bucketSize;

            const hex = rgbToHex(roundedR, roundedG, roundedB);
            colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        }

        // Get top colors
        extractedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([hex, count]) => ({
                hex,
                rgb: hexToRgb(hex),
                count
            }));

        if (extractedColors.length > 0) {
            colorsTab.hidden = false;
            renderColors();
        }
    };
    img.src = imageSrc;
}

// Render colors grid
function renderColors() {
    colorsGrid.innerHTML = extractedColors.map(color => `
        <div class="color-card" data-hex="${color.hex}">
            <div class="color-swatch" style="background-color: ${color.hex}"></div>
            <span class="color-hex">${color.hex}</span>
            <span class="color-label">${getColorName(color.hex)}</span>
        </div>
    `).join('');

    // Add click handlers
    colorsGrid.querySelectorAll('.color-card').forEach(card => {
        card.addEventListener('click', () => {
            const hex = card.dataset.hex;
            navigator.clipboard.writeText(hex);
            showToast(`Copied ${hex} to clipboard`, 'success');
        });
    });
}

// Get color name (simplified)
function getColorName(hex) {
    const rgb = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

    if (l < 0.1) return 'Black';
    if (l > 0.9) return 'White';
    if (s < 0.1) return 'Gray';

    const hueNames = [
        { max: 15, name: 'Red' },
        { max: 45, name: 'Orange' },
        { max: 75, name: 'Yellow' },
        { max: 150, name: 'Green' },
        { max: 200, name: 'Cyan' },
        { max: 260, name: 'Blue' },
        { max: 300, name: 'Purple' },
        { max: 330, name: 'Pink' },
        { max: 360, name: 'Red' }
    ];

    const name = hueNames.find(hn => h * 360 <= hn.max)?.name || 'Color';
    return l > 0.7 ? `Light ${name}` : l < 0.3 ? `Dark ${name}` : name;
}

// Color utilities
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h, s, l };
}

// Generate Code
async function generateCode() {
    if (!currentImage) {
        showToast('Please upload an image first', 'error');
        return;
    }

    const outputType = document.querySelector('input[name="outputType"]:checked').value;
    const includeResponsive = document.getElementById('includeResponsive').checked;
    const includeComments = document.getElementById('includeComments').checked;

    // Show loading
    loadingOverlay.hidden = false;

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate code based on type
    generatedCode = generateMockCode(outputType, includeResponsive, includeComments);

    // Update UI
    codeOutput.textContent = generatedCode;
    codeLang.textContent = getLangName(outputType);

    // Calculate stats
    const lines = generatedCode.split('\n').length;
    const chars = generatedCode.length;
    codeStats.textContent = `${lines} lines · ${chars} chars`;

    // Update preview
    updatePreview(outputType, generatedCode);

    // Show result section
    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Hide loading
    loadingOverlay.hidden = false;

    showToast('Code generated successfully!', 'success');
}

// Generate mock code (this would be replaced by actual AI in production)
function generateMockCode(type, responsive, comments) {
    const commentPrefix = comments ? '\n<!-- Component generated from screenshot -->\n' : '';

    switch (type) {
        case 'html':
            return generateHTMLCode(responsive, commentPrefix);
        case 'react':
            return generateReactCode(responsive, commentPrefix);
        case 'vue':
            return generateVueCode(responsive, commentPrefix);
        case 'tailwind':
            return generateTailwindCode(responsive, commentPrefix);
        default:
            return generateHTMLCode(responsive, commentPrefix);
    }
}

function generateHTMLCode(responsive, commentPrefix) {
    const mediaQuery = responsive ? `
@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }
    
    .grid {
        grid-template-columns: 1fr;
    }
}` : '';

    return `${commentPrefix}<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated from Screenshot</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .card h2 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
            color: #1a1a2e;
        }
        
        .card p {
            color: #666;
        }
        
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: #6366f1;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 1rem;
            transition: background 0.2s;
        }
        
        .btn:hover {
            background: #4f46e5;
        }
        ${mediaQuery}
    </style>
</head>
<body>
    <div class="container">
        <div class="grid">
            <div class="card">
                <h2>Component 1</h2>
                <p>This component was generated based on your screenshot. Customize the styles to match your design.</p>
                <a href="#" class="btn">Learn More</a>
            </div>
            
            <div class="card">
                <h2>Component 2</h2>
                <p>Adjust the colors, typography, and layout to fit your brand guidelines.</p>
                <a href="#" class="btn">Get Started</a>
            </div>
            
            <div class="card">
                <h2>Component 3</h2>
                <p>The grid layout automatically adjusts for different screen sizes.</p>
                <a href="#" class="btn">View Docs</a>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function generateReactCode(responsive, commentPrefix) {
    return `import React from 'react';
import styled from 'styled-components';
${commentPrefix}
const Container = styled.div\`
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
\`;

const Grid = styled.div\`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    ${responsive ? `
    
    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 1rem;
    }` : ''}
\`;

const Card = styled.div\`
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
\`;

const CardTitle = styled.h2\`
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: #1a1a2e;
\`;

const CardText = styled.p\`
    color: #666;
    line-height: 1.6;
\`;

const Button = styled.button\`
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
    transition: background 0.2s;
    
    &:hover {
        background: #4f46e5;
    }
\`;

const components = [
    {
        title: 'Component 1',
        description: 'This component was generated based on your screenshot.',
        action: 'Learn More'
    },
    {
        title: 'Component 2',
        description: 'Customize styles to match your brand guidelines.',
        action: 'Get Started'
    },
    {
        title: 'Component 3',
        description: 'The layout automatically adjusts for different screens.',
        action: 'View Docs'
    }
];

export default function GeneratedComponent() {
    return (
        <Container>
            <Grid>
                {components.map((item, index) => (
                    <Card key={index}>
                        <CardTitle>{item.title}</CardTitle>
                        <CardText>{item.description}</CardText>
                        <Button>{item.action}</Button>
                    </Card>
                ))}
            </Grid>
        </Container>
    );
}`;
}

function generateVueCode(responsive, commentPrefix) {
    return `\u003cscript setup\u003e${commentPrefix}
defineProps({
    title: {
        type: String,
        default: 'Generated Component'
    }
});

const components = [
    {
        title: 'Component 1',
        description: 'This component was generated based on your screenshot.',
        action: 'Learn More'
    },
    {
        title: 'Component 2',
        description: 'Customize styles to match your brand guidelines.',
        action: 'Get Started'
    },
    {
        title: 'Component 3',
        description: 'The layout automatically adjusts for different screens.',
        action: 'View Docs'
    }
];
\u003c/script\u003e

\u003ctemplate\u003e
    \u003cdiv class="container"\u003e
        \u003cdiv class="grid"\u003e
            \u003cdiv v-for="(item, index) in components" :key="index" class="card"\u003e
                \u003ch2\u003e{{ item.title }}\u003c/h2\u003e
                \u003cp\u003e{{ item.description }}\u003c/p\u003e
                \u003cbutton class="btn"\u003e{{ item.action }}\u003c/button\u003e
            \u003c/div\u003e
        \u003c/div\u003e
    \u003c/div\u003e
\u003c/template\u003e

\u003cstyle scoped\u003e
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card h2 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: #1a1a2e;
}

.card p {
    color: #666;
}

.btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
}
${responsive ? `

@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }
    
    .grid {
        grid-template-columns: 1fr;
    }
}` : ''}
\u003c/style\u003e`;
}

function generateTailwindCode(responsive, commentPrefix) {
    return `${commentPrefix}<!-- Component structure using Tailwind CSS -->
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 ${responsive ? 'md:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-6">
        
        <!-- Card 1 -->
        <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Component 1</h2>
            <p class="text-gray-600 leading-relaxed">
                This component was generated based on your screenshot. 
                Customize the styles to match your design.
            </p>
            <button class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                Learn More
            </button>
        </div>

        <!-- Card 2 -->
        <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Component 2</h2>
            <p class="text-gray-600 leading-relaxed">
                Adjust the colors, typography, and layout to fit 
                your brand guidelines.
            </p>
            <button class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                Get Started
            </button>
        </div>

        <!-- Card 3 -->
        <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Component 3</h2>
            <p class="text-gray-600 leading-relaxed">
                The grid layout automatically adjusts for different 
                screen sizes with responsive breakpoints.
            </p>
            <button class="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                View Docs
            </button>
        </div>

    </div>
</div>

<!-- Required: Tailwind CSS CDN or build -->
<!-- <script src="https://cdn.tailwindcss.com"></script> -->`;
}

function getLangName(type) {
    const names = {
        html: 'HTML',
        react: 'JSX',
        vue: 'Vue',
        tailwind: 'HTML + Tailwind'
    };
    return names[type] || 'Code';
}

// Update preview iframe
function updatePreview(type, code) {
    let html = code;

    // For React/Vue, create a simple preview
    if (type === 'react' || type === 'vue') {
        html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; padding: 2rem; background: #f5f5f5; }
                    .preview-card {
                        background: white;
                        border-radius: 12px;
                        padding: 1.5rem;
                        margin-bottom: 1rem;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    h2 { color: #1a1a2e; margin-bottom: 0.5rem; }
                    p { color: #666; }
                    button {
                        background: #6366f1;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        margin-top: 1rem;
                        cursor: pointer;
                    }
                </style>
            </head>
            <body>
                <div class="preview-card">
                    <h2>Component Preview</h2>
                    <p>This is a preview of the generated ${type === 'react' ? 'React' : 'Vue'} component. The actual component code is shown in the Code tab.</p>
                    <button>Sample Button</button>
                </div>
                <div class="preview-card">
                    <h2>Component Preview</h2>
                    <p>Multiple components would be rendered here based on the generated code.</p>
                    <button>Sample Button</button>
                </div>
            </body>
            </html>
        `;
    }

    const blob = new Blob([html], { type: 'text/html' });
    previewFrame.src = URL.createObjectURL(blob);
}

// Tab handling
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update panels
            tabPanels.forEach(p => p.classList.remove('active'));
            document.getElementById(tab + 'Panel').classList.add('active');
        });
    });
}

// Copy code
async function copyCode() {
    if (!generatedCode) return;

    try {
        await navigator.clipboard.writeText(generatedCode);
        showToast('Code copied to clipboard!', 'success');
    } catch (err) {
        showToast('Failed to copy code', 'error');
    }
}

// Download code
function downloadCode() {
    if (!generatedCode) return;

    const outputType = document.querySelector('input[name="outputType"]:checked').value;
    const extensions = {
        html: 'html',
        react: 'jsx',
        vue: 'vue',
        tailwind: 'html'
    };

    const extension = extensions[outputType] || 'txt';
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-component.${extension}`;
    a.click();

    URL.revokeObjectURL(url);
    showToast('File downloaded!', 'success');
}

// Theme management
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

// Modal management
function showModal(modal) {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.hidden = true;
    document.body.style.overflow = '';
}

// Toast notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Keyboard shortcuts
function handleKeyboard(e) {
    // Ctrl/Cmd + ?
    if ((e.ctrlKey || e.metaKey) && e.key === '?') {
        e.preventDefault();
        showModal(shortcutsModal);
    }

    // Ctrl/Cmd + V (paste is handled by paste event)

    // Ctrl/Cmd + O
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        fileInput.click();
    }

    // Ctrl/Cmd + C (copy code when in result section)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && e.shiftKey) {
        e.preventDefault();
        if (!resultSection.hidden) {
            copyCode();
        }
    }

    // Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!resultSection.hidden) {
            downloadCode();
        }
    }

    // Escape to close modal
    if (e.key === 'Escape') {
        hideModal(shortcutsModal);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', init);
