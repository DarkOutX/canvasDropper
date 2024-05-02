
type ColorRGBA = Uint8ClampedArray;
type ColorHEX = string;
export type onMouseEvent_cb = (event: { x: number, y: number, color: ColorHEX }) => void;

export default class CanvasEngine {
    cnv!: HTMLCanvasElement;

    offsetX!: number;
    offsetY!: number;

    private _ctx!: CanvasRenderingContext2D;
    private _externalOnMouseMove?: onMouseEvent_cb;
    private _externalOnColorSelected?: onMouseEvent_cb;

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

    private _isDropperOn = false;

    private get _realDropperSize() {
        return this._dropperZoomedPixelsAmount * this._dropperPixelMultiplier;
    }

    private _dropperWrapper?: HTMLDivElement;
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

    initDropper(wrapper: HTMLDivElement) {
        const {
            _realDropperSize,
        } = this;

        wrapper.style.width = `${_realDropperSize}px`;
        wrapper.style.height = `${_realDropperSize}px`;

        const canvas = document.createElement('canvas');

        wrapper.appendChild(canvas);
        canvas.width = _realDropperSize;
        canvas.height = _realDropperSize;

        this._dropperWrapper = wrapper;
        this._dropperCnv = canvas;
        this._dropperCtx = this._getContext(canvas);
    }

    private _reloadDropper() {
        const {
            _dropperWrapper,
        } = this;

        if (_dropperWrapper) {
            this._dropperCnv?.remove();
            this.initDropper(_dropperWrapper);
        }
    }

    toggleDropper() {
        this._isDropperOn = !this._isDropperOn;

        const {
            _dropperWrapper,
        } = this;

        if (_dropperWrapper) {
            _dropperWrapper.style.opacity = this._isDropperOn ? '1' : '0';
        }
    }

    /**
     * Method to add the possibility of getting color in some external methods.
     * Was using it to output color in external DOM-container during debug,
     *  but decided to save such functionality just as a preview
     */
    setOnMouseMove(cb: onMouseEvent_cb) {
        this._externalOnMouseMove = cb;
    }

    setOnColorSelected(cb: onMouseEvent_cb) {
        this._externalOnColorSelected = cb;
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
        cnv.addEventListener('click', this._onClick);
    }

    private _removeListeners() {
        const {
            cnv,
        } = this;

        cnv.removeEventListener('mousemove', this._onMouseMove);
        cnv.removeEventListener('click', this._onClick);
    }

    destructor() {
        this._removeListeners();
    }

    private _onMouseMove = (ev: MouseEvent) => {
        const {
            cnv,
            _ctx,
            offsetX,
            offsetY,
            _externalOnMouseMove,
            _isDropperOn,
        } = this;
        const {
            x,
            y,
        } = ev;
        const color = _ctx.getImageData(-offsetX + x, -offsetY + y, 1, 1).data;

        if (typeof _externalOnMouseMove === 'function') {
            try {
                _externalOnMouseMove({ x, y, color: rgba2hex(color) });
            }
            catch (err) {
                console.error('[CanvasEngine#_externalOnMouseMove] ERROR:', err);
            }
        }

        if (_isDropperOn) {
            const {
                _dropperWrapper,
                _dropperCnv,
                _dropperCtx,
            } = this;

            if (_dropperCtx && _dropperCnv && _dropperWrapper) {
                const {
                    _dropperZoomedPixelsAmount,
                    _dropperPixelMultiplier,
                    _realDropperSize,

                    _textYOffset,
                    _textPadding,
                    _textSize,
                } = this;

                const dropperSizeCenter = _realDropperSize / 2;

                _dropperWrapper.style.top = `${y - dropperSizeCenter}px`;
                _dropperWrapper.style.left = `${x - dropperSizeCenter}px`;

                const getImageDataOffset = Math.ceil(_dropperZoomedPixelsAmount / 2);
                const maxX = cnv.width - offsetX;
                const maxY = cnv.height - offsetY;
                const takeXStart = Math.min(Math.max(-offsetX + x - getImageDataOffset, 0), maxX);
                const takeYStart = Math.min(Math.max(-offsetY + y - getImageDataOffset, 0), maxY);

                /**
                 * I was looking for a way to transfer part of image with single use of getImageData() + putImageData(),
                 *  but there are problems with image scaling, I decided it would be unstable tactic.
                 * Moreover, getPixels + drawPixels is a functions with fixed amount of iterations independent of image size,
                 *  so I found it as enough good solution
                 */
                const pixelColors = getPixels(_ctx, takeXStart, takeYStart, _dropperZoomedPixelsAmount);

                drawPixels(this._getContext(_dropperCnv), pixelColors, _dropperZoomedPixelsAmount, _dropperPixelMultiplier);

                { // Writing HEX-color
                    const textString = `${rgba2hex(color)}`;
                    const textWidthHalf = _dropperCtx.measureText(textString).width / 2;

                    _dropperCtx.fillStyle = `white`;

                    const bgX = dropperSizeCenter - textWidthHalf - _textPadding;
                    const bgY = dropperSizeCenter - _textYOffset - _textSize;
                    const bgWidth = (textWidthHalf + _textPadding) * 2;
                    const bgHeight = _textSize + _textPadding * 2;

                    _dropperCtx.fillRect(bgX, bgY, bgWidth, bgHeight);
                    _dropperCtx.fillStyle = `black`;
                    _dropperCtx.font = `${_textSize}px serif`;
                    _dropperCtx.fillText(textString, (_dropperCnv.width / 2) - textWidthHalf, dropperSizeCenter - _textYOffset);
                }
            }
        }
    }

    private _onClick = (ev: MouseEvent) => {
        const {
            _ctx,
            offsetX,
            offsetY,
            _externalOnColorSelected,

            _isDropperOn,
        } = this;
        const {
            x,
            y,
        } = ev;
        const color = _ctx.getImageData(-offsetX + x, -offsetY + y, 1, 1).data;

        if (_isDropperOn && typeof _externalOnColorSelected === 'function') {
            try {
                _externalOnColorSelected({ x, y, color: rgba2hex(color) });
            }
            catch (err) {
                console.error('[CanvasEngine#_externalOnColorSelected] ERROR:', err);
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