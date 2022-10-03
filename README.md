# Easy-Version

## Comprehensive middleware for API versioning

Middlweare for Express framework to enable API versioning.
Implements versioning through content media fields (content-negotiation) to specify the version as media type for ensure backwards compatibility using request headers.

The goal of this middleware is to avoid the URI versioning, replacing by the use of common request headers.

E.g.
```
Accept: application/wm.my-service-name+json;version=2.0.0

Content-Type: application/wm.my-service-name+json;version=2.0.0
```

The recommended format for the media type is:
```
application/<prefix>.<service-name>+json;version=<version>
``` 
- Its strongly suggest *version* is a semantic versioning (https://semver.org/).

## References

- [RFC 9110 paper](https://www.rfc-editor.org/rfc/rfc9110.html#name-content-negotiation-fields)

## Build with

- NodeJs v16.15.1
- NPM v8.11.0

## Get Started

For use this package, first install as dependency 

```
npm i easy-version
```

Import into the express application

```
const {
    registerVersion,
    routeTo
} = require('easy-version');
```

Register middlerware for detects the requested API version
```
    app.use(registerVersion());
```

For each route, regiter the handlers per accepted version of the API
```
const pathVersions = {
    "1.0.0": Controller.myCustomHandler,
    "2.0.0": myCustomHandlerV2,
};
app.get('/path', routeTo(pathVersions));
```

### Response Headers

Its recommended that the APIs must send a Vary header to enable cache and proxies to differentiate between versions (as below):
```
res.setHeader("Content-Type", "application/x.service-name+json;version="+req.version);
res.setHeader("Vary", "Content-Type");
```
This headers will be **injected automatically**

## Documentation

### registerVersion (*customParser*)
Function to parse the Accept header value for get the version requested and registers it to the request version attribute.
 
> **@param {*function*} customParser** (Optional) Function to execute a custom parse logic for detects the version

### routeTo (*args*, *notVersionFound*)
 Function to execute the correct handler for the version requested.

 > **@param {*object*} args** (Required) Map with the version number and its handler

 > **@param {*function*} notVersionFound** (Optional) Default callback for executes if no version found

### Request.version
Injects the version detected into the *version* attribute of the standard request object. So its available to read in all the requests.

> **req.version** Attribute to get the received version

## Author

Rafael Chavez Solis <rafaelchavezsolis@gmail.com>

## License

MIT License (MIT) - [LICENSE](LICENSE) file for details