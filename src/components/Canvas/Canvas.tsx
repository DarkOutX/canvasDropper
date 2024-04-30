
import * as React from 'react';
import "./styles.scss";
import CanvasEngine from "./CanvasEngine";
import Dropper from "./Dropper";

interface IProps {
    img?: HTMLImageElement;
}

export default function Canvas(props: IProps) {
    const {
        img,
    } = props;
    const cnv = React.useRef<HTMLCanvasElement>(null);
    const dropperCnv = React.useRef<HTMLCanvasElement>(null);
    const [ color, setColor ] = React.useState<string | void>(void 0);
    const engine = new CanvasEngine();

    React.useEffect(() => {
        const canvasDOM = cnv.current;

        if (!canvasDOM || !img) {
            return;
        }

        engine.init(canvasDOM);
        // engine.initDropper(canvasDropperDOM);
        engine.drawImage(img);

        engine.setOnMouseMove((event) => {
            const {
                color,
            } = event;

            setColor(`rgba(${color.join(',')})`);
        });
    }, []);

    return <div>
        <canvas
            className={'canvas'}
            ref={cnv}
        />

        <Dropper setDropper={engine!.initDropper.bind(engine!)} />
        <span
            className={'dropperColor'}
            style={{
                backgroundColor: color || 'none',
            }}
        ></span>
    </div>
}