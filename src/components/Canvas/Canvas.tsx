
import * as React from 'react';
import "./styles.scss";
import CanvasEngine from "./CanvasEngine";
import Dropper from "./Dropper";

interface IProps {
    img?: HTMLImageElement;
}

const engine = new CanvasEngine();

export default function Canvas(props: IProps) {
    const {
        img,
    } = props;
    const [ dropperColor, setDropperColor] = React.useState<void | string>(void 0);
    const [ isDropperOn, setIsDropperOn] = React.useState<boolean>(false);
    const cnv = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        const canvasDOM = cnv.current;

        if (!canvasDOM || !img) {
            return;
        }

        engine.init(canvasDOM);
        engine.drawImage(img);
        engine.setOnColorSelected((ev) => {
            setDropperColor(() => ev.color);
        });

        return () => {
            engine.destructor();
        }
    }, []);

    return <div className={`canvasWrapper ${ isDropperOn ? 'dropperOn' : '' }`}>
        <div className={'dropperTools'}>
            <span
                className={'dropperTools__btn'}
                onClick={() => {
                    engine.toggleDropper();

                    setIsDropperOn(!isDropperOn);
                }}
            ></span>
            <span className={'dropperTools__hexColor'}>{dropperColor}</span>
        </div>

        <canvas
            className={'canvas'}
            ref={cnv}
        />

        <Dropper setDropper={engine.initDropper.bind(engine)} />
    </div>
}