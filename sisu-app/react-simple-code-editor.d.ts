declare module "react-simple-code-editor" {
    export interface IReactSimpleCodeEditorProps {
        value: string;
        highlight(value: string): any;
        onValueChange(value: string): void;
        padding: number;
        style: any;
        tabSize?: number;
        insertSpaces?: boolean;
        ignoreTabKey?: boolean;
    }

    export default class SimpleEditor extends React.Component<IReactSimpleCodeEditorProps, {}, any> {
    }
}
