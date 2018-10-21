import * as React from 'react';

export function getUser() {
    return (ComposedComponent: typeof React.Component) => class GetUserComponent extends React.Component {
        public render() {
            const props: any = this.props;

            return React.createElement(ComposedComponent, {
                ...props,
                user: null,
            });
        }
    }
}
