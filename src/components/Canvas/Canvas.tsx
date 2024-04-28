
import * as React from 'react';
import "./styles.scss";
import CanvasEngine from "./CanvasEngine";

interface IProps {
    img?: HTMLImageElement;
}

export default function Canvas(props: IProps) {
    const {
        img,
    } = props;
    const cnv = React.useRef<HTMLCanvasElement>(null);
    const [ color, setColor ] = React.useState<string | void>(void 0);

    React.useEffect(() => {
        const canvasDOM = cnv.current;

        if (!canvasDOM || !img) {
            return;
        }

        const engine = new CanvasEngine(canvasDOM);

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

        <span
            className={'dropperColor'}
            style={{
                backgroundColor: color || 'none',
            }}
        ></span>
    </div>
}