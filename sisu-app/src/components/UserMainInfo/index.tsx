import * as React from 'react';
import { getRequest } from 'src/api';
import { IProjectInfo } from 'src/core';
import ProjectCard from '../ProjectCard';

import './styles.css';

interface IProps {
    user: any;
}

interface IState {
    projects: IProjectInfo[];
}

export default class UserMainInfo extends React.Component<IProps, IState, any> {
    public state = {
        projects: [],
    }

    public componentDidMount() {
        getRequest('/projects')
            .then(res => res.json())
            .then((data: any) => {
                this.setState({
                    projects: data.resource,
                })
            })
    }

    public render() {
        return (
            <div className="UserMainInfo">
                <div className="projects">
                    {this.state.projects.map(this.renderProject)}
                </div>
            </div>
        );
    }

    private renderProject = (project: IProjectInfo) => (
        <ProjectCard
            key={project.id}
            project={project}
        />
    )
}
