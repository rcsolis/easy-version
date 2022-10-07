/* eslint-disable no-undef */
const { registerVersion, routeTo } = require('./index');

// Suite for testing regiterVersion function
describe('Testing API Versioning Middleware - Register Version', () => {
    let mockRequest = {};
    let mockResponse = {};
    const mockNext = jest.fn((res) => res);
    beforeEach(() => {
        mockRequest = {
            headers: [],
        };
        mockResponse = {
            headers: [],
            setHeader: jest.fn((header, value) => {
                mockResponse.headers[header] = value;
            }),
        };
    });
    // Tests
    test('Register version Fails, No header sent', () => {
        mockRequest.headers.accept = '';
        const rv = registerVersion(undefined);
        rv(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalledWith(Error('Accept header is required.'));
    });
    test('Register version Fails, Empty header', () => {
        mockRequest.headers.accept = ' ';
        const rv = registerVersion(undefined);
        rv(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalledWith(Error('You must specify the version number.'));
    });
    test('Register version Fails, Not valid version number', () => {
        mockRequest.headers.accept = 'application/x.my-microservice-name+json;param=';
        const rv = registerVersion(undefined);
        rv(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalledWith(Error('You must provide a valid version number.'));
    });
    test('Register Version Success', () => {
        mockRequest.headers.accept = 'application/x.my-microservice-name+json;version=1.0.0';
        const rv = registerVersion(undefined);
        rv(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockRequest.version).toBe('1.0.0');
    });
    test('Register Version Success, optional field name', () => {
        mockRequest.headers.accept = 'application/x.my-microservice-name+json;v=1.0.0';
        const rv = registerVersion(undefined);
        rv(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockRequest.version).toBe('1.0.0');
    });
});
// Suite for testing routeTo function
describe('Testing API Versioning Middleware - RouteTo', () => {
    let mockRequest = {};
    let mockResponse = {};
    const mockNext = jest.fn((res) => res);
    beforeEach(() => {
        mockRequest = {
            headers: [],
        };
        mockResponse = {
            headers: [],
            setHeader: jest.fn((header, value) => {
                mockResponse.headers[header] = value;
            }),
        };
    });
    // Tests
    test('Should routeTo fails with and error for missing version', () => {
        mockRequest.version = '';
        const route = routeTo({}, undefined);
        route(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalledWith(Error('You must specify the version number.'));
        expect(mockResponse).toEqual(expect.objectContaining({ statusCode: 403 }));
    });
    test('Should routeTo fails with and error for missing handler map', () => {
        mockRequest.version = '1.0.0';
        const route = routeTo('', undefined);
        route(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalledWith(Error('You must provide a valid route handler object map.'));
        expect(mockResponse).toEqual(expect.objectContaining({ statusCode: 403 }));
    });
    test('Should routeTo completes and call the handler2', () => {
        mockRequest.version = '2.0.0';
        const handler1 = jest.fn(() => console.log('handler1'));
        const handler2 = jest.fn(() => console.log('handler2'));
        const defaultHandler = undefined;
        const mockHandlers = {
            '1.0.0': handler1,
            '2.0.0': handler2,
        };
        const route = routeTo(mockHandlers, defaultHandler);
        route(mockRequest, mockResponse, mockNext);
        expect(handler2).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalled();
    });
    test('Should routeTo completes and call the handler1', () => {
        mockRequest.version = '1.0.0';
        const handler1 = jest.fn(() => console.log('handler1'));
        const handler2 = jest.fn(() => console.log('handler2'));
        const defaultHandler = undefined;
        const mockHandlers = {
            '1.0.0': handler1,
            '2.0.0': handler2,
        };
        const route = routeTo(mockHandlers, defaultHandler);
        route(mockRequest, mockResponse, mockNext);
        expect(handler1).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalled();
    });
    test('Should routeTo fails with an error for missing default handler', () => {
        mockRequest.version = '3.0.0';
        const handler1 = jest.fn(() => console.log('handler1'));
        const handler2 = jest.fn(() => console.log('handler2'));
        const defaultHandler = undefined;
        const mockHandlers = {
            '1.0.0': handler1,
            '2.0.0': handler2,
        };
        const route = routeTo(mockHandlers, defaultHandler);
        route(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalledWith(Error('You must provide a valid handler for the version requested.'));
    });
    test('Should routeTo completes and call the default handler', () => {
        mockRequest.version = '3.0.0';
        const handler1 = jest.fn(() => console.log('handler1'));
        const handler2 = jest.fn(() => console.log('handler2'));
        const defaultHandler = jest.fn(() => console.log('default handler'));
        const mockHandlers = {
            '1.0.0': handler1,
            '2.0.0': handler2,
        };
        const route = routeTo(mockHandlers, defaultHandler);
        route(mockRequest, mockResponse, mockNext);
        expect(defaultHandler).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalled();
    });
});
