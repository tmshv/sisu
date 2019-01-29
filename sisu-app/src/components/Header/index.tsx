import * as React from 'react';
import { Link } from 'react-router-dom';
import UserInfo from '../UserInfo';

import sisuLogo from './sisu-dark.svg';
import './styles.css';

export interface IHeaderProps {
    title?: string;
}

export default class Header extends React.PureComponent<IHeaderProps, {}, any> {
    public render() {
        return (
            <header className="Header">
                <div className="main">
                    <Link
                        className="title"
                        to={'/'}
                    >
                        <img
                            src={sisuLogo}
                            alt={'SISU'}
                        />
                    </Link>
                </div>

                <div>
                    <UserInfo />
                </div>
            </header>
        );
    }
}
