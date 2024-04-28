
type ColorRGBA = Uint8ClampedArray;
export type onMouseMove_cb = (event: { x: number, y: number, color: ColorRGBA }) => void;

export default class CanvasEngine {
    readonly cnv: HTMLCanvasElement;

    readonly offsetX: number;
    readonly offsetY: number;

    private _ctx: CanvasRenderingContext2D;
    private _externalOnMouseMove?: onMouseMove_cb;

    constructor(canvas: HTMLCanvasElement) {
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

    setOnMouseMove(cb: onMouseMove_cb) {
        this._externalOnMouseMove = cb;
    }

    private _getContext(): CanvasRenderingContext2D {
        const ctx = this.cnv.getContext('2d');

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
    }


}