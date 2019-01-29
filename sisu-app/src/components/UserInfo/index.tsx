import { LogoutVariantIcon } from 'mdi-react';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from 'src/context';
import IconButton from '../IconButton';
import { getUser } from './lib';

import './styles.css';

class UserInfo extends React.Component {
    public render() {
        return (
            <UserContext.Consumer>
                {this.renderContext}
            </UserContext.Consumer>
        )
    }

    private renderContext = (value: any) => {
        return !value.user ? this.renderLogin() : (
            <div
                className={'UserInfo'}
            >
                <span>{value.user.email}</span>

                <div
                    className={'actions'}
                >
                    <IconButton
                        theme={'dark'}
                        onClick={this.onClickLogout}
                        size={20}
                    >
                        <LogoutVariantIcon />
                    </IconButton>
                </div>
            </div>
        );
    }

    private onClickLogout = (event: React.MouseEvent<HTMLButtonElement>) => {
        localStorage.removeItem("authToken")
        location.href = "/"
    }

    private renderLogin() {
        return (
            <Link to={'/login'}>
                login
            </Link>
        )
    }
}

export default getUser()(UserInfo)