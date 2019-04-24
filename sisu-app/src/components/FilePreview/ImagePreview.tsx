import * as React from 'react';

// import './styles.css';

interface IProps {
    src: string
}

const ImagePreview = (props: IProps) => (
    <div>
        <img
            src={props.src}
            style={{
                width: '100%',
            }}
        />
    </div>
)

export default ImagePreview
