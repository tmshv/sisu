import * as React from 'react';

import './styles.css';

interface IProps {
    file: any,
}

export default class FileInfo extends React.Component<IProps, {}, any> {
    public render() {
        const file = this.props.file;

        console.log(file)

        return (
            <div className="FileInfo">
                <h2>Log</h2>

                <pre>
                    {file.log}
                </pre>
            </div>
        );
    }
}
