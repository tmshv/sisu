import * as React from 'react';
import ImagePreview from './ImagePreview';

// import './styles.css';

interface IPreview {
    type: string
    options: any
}

interface IProps {
    items: IPreview[]
    // file: IFile,
}

// interface IState {
//     onlyFailed: boolean,
// }

const FilePreview = (props: IProps) => {
    return (
        <div
            className={'FilePreview'}
        >
            {props.items.map((x, i) => {
                if (x.type === 'image') {
                    return (
                        <ImagePreview
                            key={i}
                            src={x.options.src}
                        />
                    )
                }

                return (
                    <div
                        key={i}
                    >
                        File Preview
                    </div>
                )
            })}
        </div>
    )
}

export default FilePreview
