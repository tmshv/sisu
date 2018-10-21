import * as React from "react";
import { UserContext } from '../context';

export default (ComposedComponent: any) => class WithUserComponent extends React.Component {
    public render() {
        return React.createElement(UserContext.Consumer, {
            children: this.renderContext,
        });
    }

    private renderContext = (value: any) => {
        return React.createElement(ComposedComponent, {
            ...this.props,
            user: value.user,
        });
    }
}