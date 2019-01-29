import * as React from 'react'

import './styles.css'

interface IProps {
    disabled?: boolean,
    size: number,
    children: React.ReactElement<any>,
    onClick(event: React.MouseEvent<HTMLButtonElement>): void,
}

export default class IconButton extends React.Component<IProps, any, any> {
    public static defaultProps = {
        disabled: false,
    }

    public render() {
        const color = this.props.disabled
            ? '#ccc'
            : 'black'

        return (
            <button
                className={'IconButton'}
                onClick={this.props.onClick}
                disabled={this.props.disabled}
            >
                {React.cloneElement(this.props.children, {
                    color,
                    size: this.props.size,
                })}
            </button>
        )
    }
}
