import * as React from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from 'src/context';
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
            <span>{value.user.email}</span>
        );
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