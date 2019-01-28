import * as React from 'react';

import logo from './sisu.svg';
import './styles.css';

export default class Banner extends React.Component {
    public render() {
        return (
            <div className="Banner">
                <img src={logo} alt="SISU"/>
            </div>
        );
    }
}
