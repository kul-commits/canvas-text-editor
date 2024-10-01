const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const textInput = document.getElementById('textInput');
const fontSelect = document.getElementById('fontSelect');
const colorPicker = document.getElementById('colorPicker');
const fontSizeInput = document.getElementById('fontSizeInput');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');

let textObjects = [];
let undoStack = [];
let redoStack = [];
let selectedText = null;
let isDragging = false;
let offsetX, offsetY;

let isBoldActive = false; 
let isItalicActive = false; 

addHistory();

canvas.addEventListener('mousedown', (e) => {
    const { offsetX: x, offsetY: y } = e;
    const clickedText = textObjects.find(text => ctx.isPointInPath(text.path, x, y));

    if (clickedText) {
        selectedText = clickedText;
        isDragging = true;
        offsetX = x - selectedText.x;
        offsetY = y - selectedText.y;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && selectedText) {
        selectedText.x = e.offsetX - offsetX;
        selectedText.y = e.offsetY - offsetY;
        redrawCanvas();
    }
});

canvas.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        addHistory(); 
    }
});


textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        const text = textInput.value.trim(); 
        const font = fontSelect.value;
        const color = colorPicker.value;
        const fontSize = parseInt(fontSizeInput.value, 10);

        if (text) {
            const newTextObject = {
                text,
                font,
                color,
                fontSize,
                bold: isBoldActive ? 'bold' : '',
                italic: isItalicActive ? 'italic' : '',
                x: 50,
                y: 100,
                path: new Path2D() 
            };

            textObjects.push(newTextObject);
            textInput.value = ''; 
            addHistory(); 
            redrawCanvas();
        }
    }
});

fontSelect.addEventListener('change', () => {
    if (selectedText) {
        selectedText.font = fontSelect.value;
        redrawCanvas();
        addHistory();
    }
});

colorPicker.addEventListener('change', () => {
    if (selectedText) {
        selectedText.color = colorPicker.value;
        redrawCanvas();
        addHistory();
    }
});

fontSizeInput.addEventListener('change', () => {
    if (selectedText) {
        selectedText.fontSize = parseInt(fontSizeInput.value, 10);
        redrawCanvas();
        addHistory();
    }
});


undoBtn.addEventListener('click', () => {
    if (undoStack.length > 1) { 
        redoStack.push(undoStack.pop()); 
        textObjects = JSON.parse(JSON.stringify(undoStack[undoStack.length - 1])); 
        redrawCanvas();
    }
});

redoBtn.addEventListener('click', () => {
    if (redoStack.length > 0) {
        undoStack.push(redoStack.pop()); 
        textObjects = JSON.parse(JSON.stringify(undoStack[undoStack.length - 1])); 
        redrawCanvas();
    }
});

boldBtn.addEventListener('click', () => {
    isBoldActive = !isBoldActive;
    boldBtn.classList.toggle('active');
    if (selectedText) {
        selectedText.bold = isBoldActive ? 'bold' : '';
        redrawCanvas();
        addHistory();
    }
});

italicBtn.addEventListener('click', () => {
    isItalicActive = !isItalicActive;
    italicBtn.classList.toggle('active');
    if (selectedText) {
        selectedText.italic = isItalicActive ? 'italic' : '';
        redrawCanvas();
        addHistory();
    }
});

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    textObjects.forEach(textObject => {
        const bold = textObject.bold || '';
        const italic = textObject.italic || '';
        ctx.font = `${bold} ${italic} ${textObject.fontSize}px ${textObject.font}`;
        ctx.fillStyle = textObject.color;
        ctx.fillText(textObject.text, textObject.x, textObject.y);

        textObject.path = new Path2D();
        textObject.path.rect(textObject.x, textObject.y - textObject.fontSize, ctx.measureText(textObject.text).width, textObject.fontSize);
    });
}

function addHistory() {
    undoStack.push(JSON.parse(JSON.stringify(textObjects))); 
    redoStack = []; 
}
