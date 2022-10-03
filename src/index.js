/**
 * @walmart/gea-api-versioning
 * Middleware to work with API Versioning
 * 
 * - registerVersion: Register API version
 * For detect the version requested in Accept headers and set to the request object into the
 * version attribute.
 * The version must be using the format specified in the RFC https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html
 * The version must be specify using the keywords "version" or "v"
 * E.g. 
 *     Accept: application/wm.my-microservice-name+json;version=1.0.0
 *     Accept: application/wm.my-microservice-name+json;v=1.0.0
 * 
 * - routeTo: Executes the handler
 * For executes the correct handler for the version requested
 * The args parameter its an object that maps the version to the handler.
 * E.g.
 *      {
 *          "1.0.0":handlerV1,
 *          "2.0.0":handlerV2
 *      }
 * @author Rafael Chavez Solis <rafael.chavez@walmart.com>
 */

/**
 * Error messages
 */
 const errors = {
    missingHeader: "Accept header is required.",
    customFunctionError: "An error occurs while parsing version using custom function.",
    missingVersion: "You must specify the version number.",
    invalidVersionNumber: "You must provide a valid version number.",
    invalidRoutes: "You must provide a valid route handler object map.",
    handlerError: "You must provide a valid handler for the version requested."
}
const MAX_VERSION_DIGITS = 3;
/**
 * Function to remove white spaces
 * @param {string} str Generic string
 * @returns string with no white spaces
 */
const removeWhitespaces = (str) => {
    if (typeof str === 'string') {
        return str.replace(/\s/g, '');
    }
    return '';
}
/**
 * Function to standarize the version number to a 3 digits length
 * @param {string} version Value to format
 * @returns Version standarized to a 3 digits length
 */
const formatVersion = (version) => {
    if (!version || typeof version === 'function' || typeof version === 'object' || version === true) {
      return undefined;
    }
    let ver = removeWhitespaces(version.toString());
    let split = ver.split('.');
    if (split.length < MAX_VERSION_DIGITS) {
      let size;
      if(split.length < 0){
        size=0;
      }else{
        size=split.length;
      }
      for (let i = size; i < MAX_VERSION_DIGITS; i++) {
        ver += '.0';
      }
      return ver;
    }else if (split.length > MAX_VERSION_DIGITS) {
      return split.slice(0, MAX_VERSION_DIGITS).join('.');
    }else{
        return ver;
    }
}
/**
 * Function to parse the accept header value to find the version requested and assign it to request version attribute
 * @param {function} customFunction Function to parse version
 */
 function registerVersion(customFunction){
    return function(req,res,next){
        //If no exits the accept header
        if (!req || !req.headers || !req.headers["accept"] || req.headers["accept"]===undefined || typeof req.headers["accept"] !== "string") {
            next(new Error(errors.missingHeader));
        }else{
            //If received a custom function to parse the version header
            if (customFunction && typeof customFunction === 'function') {
                try{
                    //Call the custom function
                    req.version = customFunction(req.get("accept"));
                    next();
                }catch(err){
                    next(new Error(`${errors.customFunctionError} ${err.toString()}`));
                }
            }else{
                //Get header value
                let acceptHeader = removeWhitespaces(req.headers["accept"]).replace(/\r\n\S.*$/, '');
                acceptHeader = acceptHeader.length>0 && acceptHeader.split(';');
                //If not receive params
                if(!acceptHeader || acceptHeader === undefined || acceptHeader.length !== 2){
                    next(new Error(errors.missingVersion));
                }else{
                    let versionNumber = undefined;
                    const params = acceptHeader[1].split(",");
                    //For each param, search for version
                    if(params!== undefined && params.length>0){
                        for(let param of params){
                            const [key,value] = param.split("=");
                            if(key==="version" || key==="v"){
                                //Parse version
                                versionNumber = formatVersion(value);
                                break;
                            }
                        }
                    }
                    //If version detected
                    if(versionNumber !== undefined){
                        //Sets the version
                        req.version = versionNumber;
                        // Set common response headers
                        res.setHeader("Content-Type", `${acceptHeader[0]};version=${versionNumber}`);
                        res.setHeader("Vary", "Content-Type");
                        // Move to the next middleware
                        next();   
                    }else{
                        next(new Error(errors.invalidVersionNumber));
                    }
                }
            }
        }
        
    }
}
/**
 * Function to execute the correct handler of the version requested
 * @param {object} args Map with the version number and its handler
 * @param {function} notVersionFound Default callback for executes if no version found
 */
function routeTo(args, notVersionFound){
    return function(req, res, next){
        //If no exits the accept header
        if (!req || !req.version || typeof req.version !== "string") {
            res.statusCode = 403;            
            next(new Error(errors.missingVersion));
            return;
        }
        //If not received a map for routing
        if(!args || typeof args !== "object" ||
        Array.isArray(args)){
            res.statusCode = 403;
            next(new Error(errors.invalidRoutes));
            return;
        }
        //Gets map and execute the handler
        const versions = Object.keys(args);
        const rv = new String(req.version);
        let v = undefined;
        for(let version of versions){
            version = new String(version);
            if(version.toLowerCase().trim() === rv.toLowerCase().trim()){
                v=version;
                break;
            }
        }
        //If not version found
        if(v === undefined ){
            //Executes callback if no version its found
            if(!notVersionFound){
                res.statusCode = 403;
                next(new Error(errors.handlerError));
                return;
            }
            notVersionFound.call(this, req, res, next);
        }else{
            args[v].call(this, req, res, next);
        }
        //Move to next middleware
        next();
    }
}
/**
 * Exports module
 */
module.exports = {
    registerVersion,
    routeTo
};