# Postman Collection Generator for Cloudformation Lambda Functions
This package allows you to generate a JSON from a cloudformation function definition. This JSON can be imported into postman as a collection.

# Installing the SDK:
Postman Collection SDK can be installed using NPM or directly from the git repository within your NodeJS projects. If installing from NPM, the following command installs the SDK and saves in your ```package.json```

```> npm install clf-lambda-definition-2-postman-collection```



# Getting Started:
To use the package you can run the following command.

```
npx clf-lambda-definition-2-postman-collection functions.yml https://httpbin.org/api test-api headers.json
```

# Variables (In order):
### definition:
##### Path to the cloudformation function definition as a YML file.
### endpoint:
#####  The endpoint that you want to test using. Note that you can specify a variable using double curly braces. For example. 
#####  "{{ENDPOINT}}/api"
### name:
#####  The name of your postman collection.
### headers:
#####  Path to a JSON file specifying an array of headers you want for the requests. For example.

```
[
    {
        "key": "Authorization",
        "value": "Bearer {{TOKEN}}",
        "type": "text"
    },
    {
        "key": "type",
        "value": "{{TYPE}}",
        "type": "text"
    }
]
```
