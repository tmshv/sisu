import * as React from 'react';
import { Link } from 'react-router-dom';
import UserInfo from '../UserInfo';

import './styles.css';

export interface IHeaderProps {
    title?: string;
}

export default class Header extends React.PureComponent<IHeaderProps, {}, any> {
    public render() {
        return (
            <header className="Header">
                <div className="main">
                    <h1 className="title">
                        <Link to={'/'}>SISU</Link>
                    </h1>

                    {!this.props.title ? null : (
                        <h2 className="title">
                            <Link to={'/project/a101'}>
                                {this.props.title}
                            </Link>
                        </h2>
                    )}

                    <Link to={'/project/a101/config'}>Config</Link>
                </div>

                <div>
                    <UserInfo/>
                </div>
            </header>
        );
    }
}
