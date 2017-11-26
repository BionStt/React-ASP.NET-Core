import { fetch, addTask } from 'domain-task';
import { Action, Reducer, ActionCreator } from 'redux';
import { AppThunkAction } from './';
import * as moment from 'moment';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface TubeStatusState {
    isLoading: boolean;
    statusData: LineStatus[];
    statusTimestamp: string;
}

export interface TubeStatus {
    statusData: LineStatus[];
}

export interface LineStatus {
    modeName: string;
    name: string;
    id: string;
    lineStatuses: Status[];
}

export interface Status {
    statusSeverity: number;
    statusSeverityDescription: string;
    reason: string;
}

export interface LineStatusViewModel {
    lineStatusData: LineStatus;
    key: string;
    order: number;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface RequestTubeStatusAction {
    type: 'REQUEST_TUBE_STATUS';
}

interface ReceiveTubeStatusAction {
    type: 'RECEIVE_TUBE_STATUS';
    status: LineStatus[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestTubeStatusAction | ReceiveTubeStatusAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestTubeStatus: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        let fetchTask = 
            //fetch('https://api.tfl.gov.uk/line/mode/tube,overground,dlr,tflrail,tram/status')
            fetch('/api/tubestatus')
            .then(response => response.json() as Promise<LineStatus[]>)
            .then(data => {
                dispatch({ type: 'RECEIVE_TUBE_STATUS', status: data });
            });
        addTask(fetchTask); // Ensure server-side prerendering waits for this to complete
        dispatch({ type: 'REQUEST_TUBE_STATUS' });
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: TubeStatusState = { statusData: [], isLoading: false, statusTimestamp: "" };

export const reducer: Reducer<TubeStatusState> = (state: TubeStatusState, incomingAction: Action) => {
    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_TUBE_STATUS':
            return {
                statusData: state.statusData,
                statusTimestamp: state.statusTimestamp,
                isLoading: true
            };
        case 'RECEIVE_TUBE_STATUS':
            return {
                statusData: action.status,
                statusTimestamp: moment().format("dddd Do MMMM YYYY hh:mm:ss A"),
                isLoading: false
            };
        default:
            // The following line guarantees that every action in the KnownAction union has been covered by a case above
            const exhaustiveCheck: never = action;
    }

    return state || unloadedState;
};
