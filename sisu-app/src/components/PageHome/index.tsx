import * as React from 'react';
import { Link } from 'react-router-dom';
import withUser from 'src/decorators/withUser';
import Banner from '../Banner';
import Header from '../Header';
import UserMainInfo from '../UserMainInfo';

import './styles.css';

interface IProps {
    user: any;
}

class PageHome extends React.PureComponent<IProps, {}, any> {
    public render() {
        return (
            <div className="PageHome">
                {!this.props.user ? this.renderBasic() : (
                    <React.Fragment>
                        <Header />
                        <UserMainInfo
                            user={this.props.user}
                        />
                    </React.Fragment>
                )}
            </div>
        );
    }

    private renderBasic = () => (
        <main>
            <Banner />

            <div className={'login-form'}>
                <Link to={'/login'}>
                    login
                </Link>
            </div>
        </main>
    )
}

export default withUser(PageHome);
