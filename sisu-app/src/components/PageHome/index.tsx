import * as React from 'react';
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
                <Header />

                {!this.props.user ? this.renderBasic() : (
                    <UserMainInfo
                        user={this.props.user}
                    />
                )}
            </div>
        );
    }

    private renderBasic = () => (
        <div>
            <Banner />
        </div>
    )
}

export default withUser(PageHome);
