import React, { Component } from 'react';

export type IProps = {
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    children?: React.ReactNode;
};
type IState = {
    hasError: boolean;
};
export default class ErrorBoundary extends Component<IProps, IState> {
    state = {
        hasError: false,
    };
    constructor(props) {
        super(props);
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {}

    render() {
        if (this.state.hasError) {
            return this.props.fallback || null;
        }

        return this.props.children;
    }
}

export const withErrorBoundary = (Component, fallback = null) => {
    return class newComponent extends React.Component {
        render() {
            return (
                <ErrorBoundary fallback={fallback}>
                    <Component {...(this.props || {})} />
                </ErrorBoundary>
            );
        }
    };
};
