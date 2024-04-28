
import * as React from 'react';
import Canvas from "./components/Canvas/Canvas";
import ImgInput from "./components/ImgInput/ImgInput";

export default function App() {
    const [ img, setImg ] = React.useState<HTMLImageElement | void>(void 0);

    return <div>
        <ImgInput
            onChange={(img) => setImg(img)}
        />
        { img ? <Canvas img={img} /> : void 0 }
    </div>
}