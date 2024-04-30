
type ColorRGBA = Uint8ClampedArray;
export type onMouseMove_cb = (event: { x: number, y: number, color: ColorRGBA }) => void;

export default class CanvasEngine {
    cnv!: HTMLCanvasElement;

    offsetX!: number;
    offsetY!: number;

    private _ctx!: CanvasRenderingContext2D;
    private _externalOnMouseMove?: onMouseMove_cb;

    private _dropperZoomedPixelsAmount = 7;
    private _dropperPixelMultiplier = 45;
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
            width,
            height,
        } = img;

        cnv.width = width;
        cnv.height = height;

        _ctx.drawImage(img, 0, 0, width, height);
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
            } = this;

            _dropperCnv.style.top = `${y - _realDropperSize / 2}px`;
            _dropperCnv.style.left = `${x - _realDropperSize / 2}px`;

            const getImageDataOffset = Math.ceil(_dropperZoomedPixelsAmount / 2);
            const pixelColors = getPixels(_ctx, -offsetX + x - getImageDataOffset, -offsetY + y - getImageDataOffset, _dropperZoomedPixelsAmount);

            drawPixels(_dropperCtx, pixelColors, _dropperZoomedPixelsAmount, _dropperPixelMultiplier);
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
}