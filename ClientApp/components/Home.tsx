import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import * as TubeStatusState from '../store/TubeStatus';


// At runtime, Redux will merge together...
type TubeStatusProps =
    TubeStatusState.TubeStatusState                    // ... state we've requested from the Redux store
    & typeof TubeStatusState.actionCreators            // ... plus action creators we've requested
    & RouteComponentProps<{}>;                         // ... plus incoming routing parameters

class Home extends React.Component<TubeStatusProps, {}> {
    componentWillMount() {
        // This method runs when the component is first added to the page
        this.props.requestTubeStatus();
    }
    componentDidMount() {
        window.setInterval(this.props.requestTubeStatus, 60000);
    }
    public render() {
        return <div className="tubeStatus">
            <StatusTable statusData={this.props.statusData} />
            <p>{this.props.statusTimestamp}</p>
            <p><a href="https://unop.uk">Made by unop.uk</a></p>
            <p><a href="https://tfl.gov.uk/tube-dlr-overground/status/">Data from TfL</a></p>
            <p><button onClick={this.props.requestTubeStatus}>Reload</button></p>
        </div>;
    }
}

class StatusTable extends React.Component<TubeStatusState.TubeStatus, {}> {
    render() {
        return (
            <div className="statusTable">
                <table>
                    <thead>
                        <tr>
                            <th>Line</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <StatusTableRowList statusData={this.props.statusData} />
                </table>
            </div>
        );
    }
}

class StatusTableRowList extends React.Component<TubeStatusState.TubeStatus, {}> {
    render() {
        let lineStatusList = this.props.statusData.map(function (line) {
            let order = 9;
            if (line.modeName === 'tube') order = 1;
            if (line.modeName === 'overground') order = 2;
            if (line.modeName === 'tflrail') order = 3;
            if (line.modeName === 'dlr') order = 4;
            if (line.modeName === 'tram') order = 5;
            return (
                <StatusTableRow lineStatusData={line} key={line.id} order={order} />
            );
        }).sort(function (a, b) {
            // Sort by list above
            if (a.props.order < b.props.order) return -1;
            if (a.props.order > b.props.order) return 1;
            // Then by mode name
            if (a.props.lineStatusData.modeName < b.props.lineStatusData.modeName) return -1;
            if (a.props.lineStatusData.modeName > b.props.lineStatusData.modeName) return 1;
            // Then by id (~ lower case name)
            if (a.props.lineStatusData.id < b.props.lineStatusData.id) return -1;
            if (a.props.lineStatusData.id > b.props.lineStatusData.id) return 1;
            return 0;
        });
        return (
            <tbody>
                {lineStatusList}
            </tbody>
        );
    }
}

class StatusTableRow extends React.Component<TubeStatusState.LineStatusViewModel, {}> {
    render() {
        let status = <td>Getting Status Data....</td>;
        if (this.props.lineStatusData.lineStatuses && this.props.lineStatusData.lineStatuses.length > 0) {
            status = this.props.lineStatusData.lineStatuses[0].statusSeverity === 10 ?
                <td className="standard">Bog Standard Service</td> :
                <td className="bad">
                    <details>
                        <summary>
                            {this.props.lineStatusData.lineStatuses[0].statusSeverityDescription}
                        </summary>
                        {this.props.lineStatusData.lineStatuses[0].reason}
                    </details>
                </td>;
        }
        return (
            <tr>
                <td className={this.props.lineStatusData.id}>{this.props.lineStatusData.name}</td>
                {status}
            </tr>
        );
    }
}

export default connect(
    (state: ApplicationState) => state.tubeStatus, // Selects which state properties are merged into the component's props
    TubeStatusState.actionCreators                 // Selects which action creators are merged into the component's props
)(Home) as typeof Home;
