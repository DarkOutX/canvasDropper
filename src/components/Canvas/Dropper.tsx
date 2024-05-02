
import * as React from 'react';
import CanvasEngine from "./CanvasEngine";

interface IProps {
    setDropper: (dropperWrapper: HTMLDivElement) => void;
}

export default function Dropper(props: IProps) {
    const {
        setDropper,
    } = props;
    const wrapperCnv = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const dropperWrapperDOM = wrapperCnv.current;

        if (!dropperWrapperDOM) {
            return;
        }

        setDropper(dropperWrapperDOM);
    }, []);

    return <div className={'dropperWrapper'} ref={wrapperCnv}>
    </div>

}