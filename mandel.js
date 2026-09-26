"use strict";
let canvas = document.querySelector("#canvas");
let ctx = canvas.getContext("2d");
const CANVAS_X = canvas.width;
const CANVAS_Y = canvas.height;
// Calculate Pixel:Style size ratio
let canvasStyleXStrPx = canvas.style.width;
let canvasStyleYStrPx = canvas.style.height;
let canvasStyleX = parseInt(canvasStyleXStrPx.substring(0,canvasStyleXStrPx.length-2));
let canvasStyleY = parseInt(canvasStyleYStrPx.substring(0,canvasStyleYStrPx.length-2));
const CANVAS_STYLE_PIXEL_X_RATIO = CANVAS_X / canvasStyleX; 
const CANVAS_STYLE_PIXEL_Y_RATIO = CANVAS_Y / canvasStyleY;
// Starter Values
let mandelbrotState = {
    cartesianLengthPerPixel: 0.003,
    cartesianLeftX: -2,
    cartesianTopY: -1,
    iterations: 500
}

function drawPixelOnData(data,x,y,r,g,b){
    let toDraw = (x + y * data.width) * 4;
    data.data[toDraw] = r;
    data.data[toDraw + 1] = g;
    data.data[toDraw + 2] = b;
    data.data[toDraw + 3] = 255;
    return data;
}

function hueToRGB(hue){
    let hueMod60 = hue%60;
    switch(Math.floor(hue/60)){
        case 0:
            return [255,hue/60*255,0]
        case 1:
            return [255-255*(hueMod60/60),255,0]
        case 2:
            return [0,255,hueMod60/60*255]
        case 3:
            return [0,255-255*(hueMod60/60),255]
        case 4:
            return [255*hueMod60/60,0,255]
        case 5:
            return [255,0,255-255*(hueMod60/60)]
        default:
            return [0,0,0]
    }
}

function mandelbrot(cR, cI, iterations){
    let zR = cR;
    let zI = cI;
    for (let iterationsPassed = 0; iterationsPassed < iterations; iterationsPassed++){
        let zR_squared = zR*zR;
        let zI_squared = zI*zI;
        // if magnitude is greater than 2, it escapes and doesn't belong
        if (zR_squared + zI_squared > 4 /*2^2*/) {
            return iterationsPassed;
        }
        // Using new_zR because old zR must be used in zI calc
        let new_zR = (zR_squared - zI_squared) + cR; // Real of Z^2 + C
        zI = (2 * zR * zI) + cI;                     // Imag of Z^2 + C
        zR = new_zR;

    }
    return -1;
}

function createImageDataWithMandelbrot(
    canvasX, canvasY, cartesianLengthPerPixel, cartesianLeftX, cartesianTopY, iterations) {
    let fractalSetData = new ImageData(canvasX, canvasY);
    for (let x = 0; x < canvasX; x++) {
        for (let y = 0; y < canvasY; y++) {
            let cartesianX = x * cartesianLengthPerPixel + cartesianLeftX;
            let cartesianY = y * cartesianLengthPerPixel + cartesianTopY;
            let coordinateIterations = mandelbrot(cartesianX, cartesianY, iterations);
            let coordinateColor = hueToRGB(coordinateIterations);
            fractalSetData = drawPixelOnData(fractalSetData, x, y, 
                coordinateColor[0], coordinateColor[1], coordinateColor[2]
            );
        }
    }
    return fractalSetData;
}

function redraw(mandelbrotState){ ctx.putImageData(createImageDataWithMandelbrot(
    CANVAS_X, CANVAS_Y, mandelbrotState.cartesianLengthPerPixel, mandelbrotState.cartesianLeftX, 
    mandelbrotState.cartesianTopY, mandelbrotState.iterations), 0, 0); }
redraw(mandelbrotState);

canvas.addEventListener("click", e => {
    let mouseX = e.offsetX * CANVAS_STYLE_PIXEL_X_RATIO;
    let mouseY = e.offsetY * CANVAS_STYLE_PIXEL_Y_RATIO;
    mandelbrotState.cartesianLengthPerPixel /= 2;
    mandelbrotState.cartesianLeftX += mouseX * mandelbrotState.cartesianLengthPerPixel;
    mandelbrotState.cartesianTopY  += mouseY * mandelbrotState.cartesianLengthPerPixel;
    redraw(mandelbrotState);
});

document.querySelector("#setIterations").addEventListener("click", e => {
    let intInput = parseInt(document.querySelector("#iterations").value);
    if (isNaN(intInput)) return;
    mandelbrotState.iterations = intInput;
    redraw(mandelbrotState);
});

document.querySelector("#left").addEventListener("click", e => {
    mandelbrotState.cartesianLeftX -= CANVAS_X / 3 * mandelbrotState.cartesianLengthPerPixel;
    redraw(mandelbrotState);
});
document.querySelector("#right").addEventListener("click", e => {
    mandelbrotState.cartesianLeftX += CANVAS_X / 3 * mandelbrotState.cartesianLengthPerPixel;
    redraw(mandelbrotState);
});
document.querySelector("#up").addEventListener("click", e => {
    mandelbrotState.cartesianTopY -= CANVAS_Y / 3 * mandelbrotState.cartesianLengthPerPixel;
    redraw(mandelbrotState);
});
document.querySelector("#down").addEventListener("click", e => {
    mandelbrotState.cartesianTopY += CANVAS_Y / 3 * mandelbrotState.cartesianLengthPerPixel;
    redraw(mandelbrotState);
});
