import { waitFor} from "./testing-library-dom.mjs";

export const by = (asserting, expectation) => () => asserting(expectation);
export const expecting = (...actuals) => (assert) => actuals.forEach(actual => assert(expect(actual())));
export const waitingFor = (...actuals) => (assert) => waitFor(() => actuals.forEach(actual => assert(expect(actual()))));
export const not = (assert) => (expectElement) => assert(expectElement.not);

export const toBeDisabled = (expectElement) => expectElement.toBeDisabled();
export const toBeEmptyDOMElement = (expectElement) => expectElement.toBeEmptyDOMElement();
export const toBeInTheDocument = (expectElement) => expectElement.toBeInTheDocument();

export const toHaveBeenCalled = (expectMockFun) => expectMockFun.toHaveBeenCalled();
export const toHaveBeenCalledWith = (args) => (expectElement) => expectElement.toHaveBeenCalledWith(args());
