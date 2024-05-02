
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
    const engine = new CanvasEngine();

    React.useEffect(() => {
        const canvasDOM = cnv.current;

        if (!canvasDOM || !img) {
            return;
        }

        engine.init(canvasDOM);
        engine.drawImage(img);

        return () => {
            engine.destructor();
        }
    }, []);

    return <div>
        <canvas
            className={'canvas'}
            ref={cnv}
        />

        <Dropper setDropper={engine.initDropper.bind(engine!)} />
    </div>
}