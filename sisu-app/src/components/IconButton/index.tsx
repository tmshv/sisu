import className from 'classnames'
import * as React from 'react'

import './styles.css'

interface IProps {
    disabled?: boolean,
    theme: 'light' | 'dark'
    size: number,
    children: React.ReactElement<any>,
    onClick(event: React.MouseEvent<HTMLButtonElement>): void,
}

export default class IconButton extends React.Component<IProps, any, any> {
    public static defaultProps = {
        disabled: false,
    }

    public render() {
        return (
            <button
                className={className('IconButton', `theme-${this.props.theme}`)}
                onClick={this.props.onClick}
                disabled={this.props.disabled}
            >
                {React.cloneElement(this.props.children, {
                    color: this.color,
                    size: this.props.size,
                })}
            </button>
        )
    }

    private get color() {
        if (this.props.disabled) {
            return '#ccc'
        }

        if (this.props.theme === 'dark') {
            return 'white'
        }

        if (this.props.theme === 'light') {
            return 'black'
        }

        return 'black'
    }
}
