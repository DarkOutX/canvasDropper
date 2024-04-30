
import * as React from 'react';
import CanvasEngine from "./CanvasEngine";

interface IProps {
    setDropper: (dropperCanbas: HTMLCanvasElement) => void;
}

export default function Dropper(props: IProps) {
    const {
        setDropper,
    } = props;
    const dropperCnv = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        const canvasDropperDOM = dropperCnv.current;

        if (!canvasDropperDOM) {
            return;
        }

        setDropper(canvasDropperDOM);
    }, []);

    return <div className={'dropperWrapper'}>
        <canvas
            ref={dropperCnv}
        />
    </div>

}