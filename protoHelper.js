import path from 'path';
import protobuf from 'protobufjs';

function getProtoBuffer(protoFilePath, messageFullName, payload) {
    const root = new protobuf.Root();
    root.resolvePath = (origin, target) => {
        let filPath = target;
        if (target.indexOf('shared/') !== -1) {
            filPath = path.resolve('../proto/', target);
        }

        if (target.indexOf('dto/') !== -1) {
            filPath = path.resolve('../proto/', target);
        }

        return filPath;
    };

    const protoRoot = root.loadSync(protoFilePath);
    const GeneCoverageMessage = protoRoot.lookupType(messageFullName);
    const errMsg = GeneCoverageMessage.verify(payload);
    if (errMsg) {
        throw Error(errMsg);
    }

    const message = GeneCoverageMessage.create(payload);
    const buffer = GeneCoverageMessage.encodeDelimited(message).finish();

    return buffer;
}

export { getProtoBuffer };


// const root = protobufjs.loadSync('awesome.proto');

// // Obtain a message type
// var AwesomeMessage = root.lookupType("awesomepackage.AwesomeMessage");

// // Exemplary payload
// var payload = { awesomeField: "AwesomeString" };

// // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
// var errMsg = AwesomeMessage.verify(payload);
// if (errMsg)
//     throw Error(errMsg);

// // Create a new message
// var message = AwesomeMessage.create(payload); // or use .fromObject if conversion is necessary

// // Encode a message to an Uint8Array (browser) or Buffer (node)
// var buffer = AwesomeMessage.encode(message).finish();
// // ... do something with buffer

// // Decode an Uint8Array (browser) or Buffer (node) to a message
// var message = AwesomeMessage.decode(buffer);
// // ... do something with message

// // If the application uses length-delimited buffers, there is also encodeDelimited and decodeDelimited.

// // Maybe convert the message back to a plain object
// var object = AwesomeMessage.toObject(message, {
//     longs: String,
//     enums: String,
//     bytes: String,
//     // see ConversionOptions
// });

// console.log(object, 37);
