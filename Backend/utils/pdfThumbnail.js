const pdfjsLib = require("pdfjs-dist/legacy/build/pdf");
const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

async function generatePdfThumbnail(pdfPath) {

    const data = new Uint8Array(fs.readFileSync(pdfPath));

    const pdf = await pdfjsLib.getDocument({
        data,
        disableWorker: true
    }).promise;

    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    await page.render({
        canvasContext: context,
        viewport
    }).promise;

    const fileName = `preview_${Date.now()}.png`;
    const outPath = path.join("uploads", fileName);

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outPath, buffer);

    return fileName;
}

module.exports = generatePdfThumbnail;  