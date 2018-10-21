import * as React from 'react';
import { Link } from 'react-router-dom';
import { IProjectInfo } from 'src/core';

import './styles.css';

interface IProps {
    project: IProjectInfo;
}

export default class ProjectCard extends React.PureComponent<IProps, {}, any> {
    public render() {
        const project = this.props.project
        const projectLink = `/project/${project.uri}`

        return (
            <div
                className={'ProjectCard'}
            >
                <Link
                    to={projectLink}
                >
                    {project.name}
                </Link>
            </div>
        )
    }
}
