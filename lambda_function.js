const { S3 } = require('aws-sdk');

module.exports.lambda_handler = (event, context, callback) => {
    const s3 = new S3({ signatureVersion: "v4" });
    console.log(event);
    console.log(context);
    // Retrieve the operation context object from the event. This object indicates where the WriteGetObjectResponse request
    // should be delivered and contains a presigned URL in 'inputS3Url' where we can download the requested object from.
    // The 'userRequest' object has information related to the user who made this 'GetObject' request to S3 Object Lambda.
    const { userRequest, getObjectContext } = event;
    const { outputRoute, outputToken, inputS3Url } = getObjectContext;
    
    // extract the object path out of long long inputS3Url
    let array = userRequest['url'].split("/")
    
    let newArr = [];
    let separator = '/';
    
    for(let i = 3; i < array.length; i++) {
      newArr += array[i];
      if (i < array.length - 1) newArr += separator;
    }
    
    console.log(newArr);
    
    let object_key = newArr;

    const bucket = process.env.BUCKET_NAME_SG10K; //BUCKET_NAME;
    if (!bucket) {
      callback(new Error(`S3 bucket not set`));
    }
    
    const key = object_key //event['object_key'];
    if (!key) {
      callback(new Error('S3 object key missing'));
      return;
    }
  
    const params = {'Bucket': bucket, 'Key': key, Expires: 60}; // expires in seconds
  
    s3.getSignedUrl('getObject', params, (error, url) => {
       s3.writeGetObjectResponse({
            RequestRoute: outputRoute,
            RequestToken: outputToken,
            Body: url,
        }).promise();
      if (error) {
        console.log(error)
        callback(error);
      } else {
        console.log(url)
      
      }
    });

    // Gracefully exit the Lambda function.
    return { statusCode: 200 };
}
