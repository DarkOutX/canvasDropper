
type ColorRGBA = Uint8ClampedArray;
export type onMouseMove_cb = (event: { x: number, y: number, color: ColorRGBA }) => void;

export default class CanvasEngine {
    cnv!: HTMLCanvasElement;

    offsetX!: number;
    offsetY!: number;

    private _ctx!: CanvasRenderingContext2D;
    private _externalOnMouseMove?: onMouseMove_cb;

    /**
     * Amount of zoomed pixels in dropper
     */
    private _dropperZoomedPixelsAmount = 7;
    /**
     * Scale factor of zoomed pixels in dropper
     */
    private _dropperPixelMultiplier = 45;
    /**
     * Value to move HEX-color text above center
     */
    private _textYOffset = 35;
    /**
     * Size of HEX-color text
     */
    private _textSize = 25;
    /**
     * Padding for background of HEX-color text
     */
    private _textPadding = 3;

    private get _realDropperSize() {
        return this._dropperZoomedPixelsAmount * this._dropperPixelMultiplier;
    }

    private _dropperCnv?: HTMLCanvasElement;
    private _dropperCtx?: CanvasRenderingContext2D;

    init(canvas: HTMLCanvasElement) {
        this.cnv = canvas;

        const {
            x,
            y,
        } = canvas.getBoundingClientRect();

        this.offsetX = x;
        this.offsetY = y;
        this._ctx = this._getContext();

        this._addListeners();
    }

    drawImage(img: HTMLImageElement) {
        const {
            cnv,
            _ctx,
        } = this;
        const {
            width: imgWidth,
            height: imgHeight,
        } = img;

        const viewWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        const viewHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

        cnv.width = Math.min(viewWidth, imgWidth);
        cnv.height = Math.min(viewHeight, imgHeight);

        _ctx.drawImage(img, 0, 0, cnv.width, cnv.height);
    }

    initDropper(canvas: HTMLCanvasElement) {
        const {
            _realDropperSize,
        } = this;

        canvas.width = _realDropperSize;
        canvas.height = _realDropperSize;

        this._dropperCnv = canvas;
        this._dropperCtx = this._getContext(canvas);
    }

    /**
     * Method to add the possibility of getting color in some external methods.
     * Was using it to output color in external DOM-container during debug,
     *  but decided to save such functionality just as a preview
     */
    setOnMouseMove(cb: onMouseMove_cb) {
        this._externalOnMouseMove = cb;
    }

    private _getContext(cnv = this.cnv): CanvasRenderingContext2D {
        const ctx = cnv.getContext('2d');

        if (!ctx) {
            throw new Error(`[CanvasEngine] Received canvas without 2D context`);
        }

        return ctx;
    }

    private _addListeners() {
        const {
            cnv,
        } = this;

        cnv.addEventListener('mousemove', this._onMouseMove);
    }

    private _removeListeners() {
        const {
            cnv,
        } = this;

        cnv.removeEventListener('mousemove', this._onMouseMove);
    }

    destructor() {
        this._removeListeners();
    }

    private _onMouseMove = (ev: MouseEvent) => {
        const {
            _ctx,
            offsetX,
            offsetY,
            _externalOnMouseMove,
            _dropperCnv,
            _dropperCtx,
        } = this;
        const {
            x,
            y,
        } = ev;

        const color = _ctx.getImageData(-offsetX + x, -offsetY + y, 1, 1).data;

        if (typeof _externalOnMouseMove === 'function') {
            try {
                _externalOnMouseMove({ x, y, color });
            }
            catch (err) {
                console.error('[CanvasEngine#_externalOnMouseMove] ERROR:', err);
            }
        }

        if (_dropperCtx && _dropperCnv) {
            const {
                _dropperZoomedPixelsAmount,
                _dropperPixelMultiplier,
                _realDropperSize,

                _textYOffset,
                _textPadding,
                _textSize,
            } = this;

            const dropperSizeCenter = _realDropperSize / 2;

            _dropperCnv.style.top = `${y - dropperSizeCenter}px`;
            _dropperCnv.style.left = `${x - dropperSizeCenter}px`;

            const getImageDataOffset = Math.ceil(_dropperZoomedPixelsAmount / 2);
            const takeXStart = -offsetX + x - getImageDataOffset;
            const takeYStart = -offsetY + y - getImageDataOffset;

            /**
             * I was looking for a way to transfer part of image with single use of getImageData() + putImageData(),
             *  but there are problems with image scaling, I decided it would be unstable tactic.
             * Moreover, getPixels + drawPixels is a functions with fixed amount of iterations independent of image size,
             *  so I found it as enough good solution
             */
            const pixelColors = getPixels(_ctx, takeXStart, takeYStart, _dropperZoomedPixelsAmount);

            drawPixels(_dropperCtx, pixelColors, _dropperZoomedPixelsAmount, _dropperPixelMultiplier);

            { // Writing HEX-color
                const textString = `${rgba2hex(color)}`;
                const textWidthHalf = _dropperCtx.measureText(textString).width / 2;

                _dropperCtx.fillStyle = `white`;
                _dropperCtx.fillRect(dropperSizeCenter - textWidthHalf - _textPadding, dropperSizeCenter - _textYOffset - _textSize, (textWidthHalf + _textPadding) * 2, _textSize + _textPadding * 2);
                _dropperCtx.fillStyle = `black`;
                _dropperCtx.font = `${_textSize}px serif`;
                _dropperCtx.fillText(textString, (_dropperCnv.width / 2) - textWidthHalf, dropperSizeCenter - _textYOffset);
            }
        }
    }


}

function getPixels(ctx: CanvasRenderingContext2D, xOrigin: number, yOrigin: number, size: number): ColorRGBA[] {
    const colors: ColorRGBA[] = [];

    for (let y = yOrigin; y < (yOrigin + size); y++) {
        for (let x = xOrigin; x < (xOrigin + size); x++) {
            const color = ctx.getImageData(x, y, 1, 1).data as ColorRGBA;

            colors.push(color);
        }
    }

    return colors;
}

function drawPixels(ctx: CanvasRenderingContext2D, colors: ColorRGBA[], size: number, pixelSize: number) {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const [ r, g, b, a ] = colors[y * size + x];

            ctx.globalAlpha = a;
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            ctx.globalAlpha = 255;
        }
    }

    { // Outlining selected pixel
        const centerPixelNum = Math.floor(size / 2);

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(centerPixelNum * pixelSize, centerPixelNum * pixelSize, pixelSize, pixelSize);
    }
}

function _colorPartToHex(colorValue: number) {
    const hex = colorValue.toString(16);

    return hex.length == 1 ? "0" + hex : hex;
}

function rgba2hex(rgba: ColorRGBA) {
    const [ r, g, b ] = rgba;

    return "#" + _colorPartToHex(r) + _colorPartToHex(g) + _colorPartToHex(b);
}