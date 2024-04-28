
import * as React from 'react';
import "./styles.scss";

interface IProps {
    onChange(image: HTMLImageElement): void;
}

export default function ImgInput(props: IProps) {
    const {
        onChange: externalOnChange,
    } = props;
    const _onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const {
            target: {
                files,
            }
        } = e;

        if (!files || files.length === 0) {
            return;
        }

        const file = files[0];

        await new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = function(){
                if (typeof externalOnChange === 'function') {
                    try {
                        externalOnChange(img);
                    }
                    catch (err) {
                        console.error('[ImgInput] Error while trying to call external onChange');
                    }
                }
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    return <input
        type={ 'file' }
        accept={ 'image/*' }
        onChange={ _onChange }
    />
}