import * as React from 'react';
import { postRequest } from 'src/api';

import './styles.css';

interface IProps {
    match: any,
}

interface IState {
    email: string,
    password: string,
    loading: boolean,
}

export default class PageLogin extends React.Component<IProps, IState, any> {
    public state = {
        email: '',
        loading: false,
        password: '',
    }

    public render() {
        return (
            <div className={'PageLogin'}>
                <form
                    onSubmit={this.onSubmit}
                >
                    <label>
                        <span>email</span>
                        <input
                            type="text"
                            value={this.state.email}
                            onChange={this.onChangeEmail}
                        />
                    </label>

                    <label>
                        <span>password</span>
                        <input
                            type="password"
                            value={this.state.password}
                            onChange={this.onChangePassword}
                        />
                    </label>

                    <label>
                        <span />

                        <button
                            disabled={!this.canLogin}
                        >
                            Login
                        </button>
                    </label>
                </form>
            </div>
        );
    }

    private get canLogin() {
        if (this.state.loading) {
            return false
        }

        return this.state.email && this.state.password
    }

    private onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const data = {
            email: this.state.email,
            password: this.state.password,
        }

        this.setState({
            loading: true
        }, () => {
            postRequest("/login", data)
                .then(res => {
                    if (res.status !== 200) {
                        throw new Error("No authorized")
                    }

                    return res.json();
                })
                .then((result: any) => {
                    console.log(result);

                    const token = result.token;

                    localStorage.setItem("authToken", token);

                    this.setState({
                        loading: false,
                    }, () => {
                        location.href = "/"
                    });
                })
                .catch(error => {
                    console.log(error);

                    this.setState({
                        loading: false,
                    });
                })
        })
    }

    private onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            email: event.target.value,
        })
    }

    private onChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            password: event.target.value,
        })
    }
}
