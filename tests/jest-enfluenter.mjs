import { waitFor} from "./testing-library-dom.mjs";

export const by = (assertOrPromise, toMatch) => () => assertOrPromise(toMatch);
export const expecting = (...actuals) => (toMatch) => actuals.forEach(actual => toMatch(expect(actual())));
export const waitingFor = (...actuals) => (toMatch) => waitFor(() => actuals.forEach(actual => toMatch(expect(actual()))));
export const timeoutWhile = (awaiting) => (toMatch) => expect(awaiting(toMatch)).rejects.toThrow();
export const not = (assert) => (expectElementOrFun) => assert(expectElementOrFun.not);

export const toBeDisabled = (expectElement) => expectElement.toBeDisabled();
export const toBeEmptyDOMElement = (expectElement) => expectElement.toBeEmptyDOMElement();
export const toBeInTheDocument = (expectElement) => expectElement.toBeInTheDocument();

export const toHaveBeenCalled = (expectMockFun) => expectMockFun.toHaveBeenCalled();
export const toHaveBeenCalledWith = (args) => (expectMockFun) => expectMockFun.toHaveBeenCalledWith(args());
