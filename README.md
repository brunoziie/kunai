# kunai

![logo](https://github.com/brunoziie/kunai/raw/master/kunai.png)

[kunai](https://github.com/brunoziie/kunai) is a _pseudo-structural-language_ designed to test APIs.

[kunai](https://github.com/brunoziie/kunai) provides a high level abstraction that makes it easy to write and run API tests. 

## Installing

[kunai](https://github.com/brunoziie/kunai) was written in JavaScript and distributed through [npm](https://www.npmjs.com/), so make sure you have [Node.js](https://nodejs.org) installed.

If you don't have [Node.js](https://nodejs.org) installed yet, no problem. You can go to [https://nodejs.org/en/download](https://nodejs.org/en/download) and download the installer for your platform.

Once you have [Node.js](https://nodejs.org) installed just run the following command on your terminal.

```bash
npm install -g kunai-lang
```

[kunai](https://github.com/brunoziie/kunai) must be installed globally, so maybe you need to install with administrator privileges. On Linux and MacOS it's made using the following command.

```bash
sudo npm install -g kunai-lang
```

After installed you get access to the `kunai` command on your terminal.

## Getting started

[kunai](https://github.com/brunoziie/kunai) is language, framework or project structure agnostic, that means you can write your test script out of your project. You just need to create a `test.kunai` file and write your test instructions.

### Conventions
Before starting writing is important know some conventions from [kunai](https://github.com/brunoziie/kunai).

- [kunai](https://github.com/brunoziie/kunai) is indentation-sensitive, so **is mandatory** write the test script using **2 spaces indentation**. In a near future this will change and the compiler will autodetect the selected indentation pattern.

- [kunai](https://github.com/brunoziie/kunai) is primary designed to test [JSON](https://www.json.org/) APIs. You can use to non-JSON APIs too, but you will not be able to access the `body` as a object. Instead of you will get the `body` from response as a `string`.

- **argument-block** are blocks defined inside other block.

### Writing a simple test

Create a file named `test.kunai` and put the following code:

```text
CONFIG
  baseurl: 'https://api.github.com/'
  userid: 'brunoziie'
  
GET '/users/:userid:'
  DESCRIBE 'Get user data'

  WITH HEADERS
    User-Agent: 'Kunai API Test'

  RESPONSE MUST
    @assert(response.statusCode == 200, 'Response must have statusCode 200')

  BODY MUST
    @assert(body.gravatar_id, 'User must have a gravatar_id')
```

Now lets run your test script. On your current directory run the `kunai` command:

```bash
kunai
```

The instructions you wrote will be executed and will produce the following output:

```text
▶ Get user data
  ✔ Returns statusCode 200
  ✖ User must have a gravatar_id
```

_Voilà!_ You just ran your first test.

## Getting deep

### Code structure

[kunai](https://github.com/brunoziie/kunai) has two main types of instruction block, one for define settings and other to define request.

#### Settings

May you need to share some settings with your requests. You can do it using `CONFIG` or `ENV` block. Both do the same thing, it's just a syntax sugar.

Suppose you need to share a user id with all your request. In this scenario you will define something like this:

```text
CONFIG
  user_id: 10283
```

##### Predefined variables
[kunai](https://github.com/brunoziie/kunai) has some predefined config variables 

```text
CONFIG
  baseurl: 'http://my-api.domain'
  verbose: false
```

| Variable |  Default |  Description |
|----------|:--------:|------|
| baseurl  | `null`   | Prepend your requests url.|
| verbose  | `false`  | If `true`, in case of error, will output data about the failed test |


##### Acessing config data

Inside your request in _argument-blocks_ `WITH INPUTS`, `WITH HEADERS` and `WITH QUERYSTRING` you has access to the variable `@env`. With `@env` you will be able to access all setting you have defined in `CONFIG|ENV` block.

```text
CONFIG
  user_id: 10283
  
GET '/users'
  [...]
  
  WITH QUERYSTRING
    id: @env.user_id
```

In this example you will produce a request with method `GET` to `/users?id=10283`

You also use this configs in the path of your request with `:variable:` notation.

```text
CONFIG
  user_id: 10283
  
GET '/users?id=:user_id:'
# will produce: /users?id=10283
  
GET '/users/:user_id:/posts'
# will produce: /users/10283/
```

#### Requests

[kunai](https://github.com/brunoziie/kunai) only implements `GET`, `POST`, `PUT` and `DELETE` HTTP request methods.

##### Undestanding request blocks

A full request block can be described as:

```text
[GET|POST|PUT|DELETE] 'my-url-or-segment'
  DESCRIBE 'Description of you request'

  WITH HEADERS 
    # Request headers
    
  WITH QUERYSTRING 
    # Url query string

  WITH INPUTS 
    # Data to send on request

  RESPONSE MUST
    # Rules that response of request have to match
    
  BODY MUST
    # Rules that body of response have to match

  PERSIST
    # Data may you want to persist after request pass on test
     
```

##### Defining request params

To make a simple request you must only select a method and give a url, a description and rule to be tested with response or body. 

```text
GET 'https://api.github.com/users/brunoziie'
  DESCRIBE 'Description of you request'

  RESPONSE MUST
    @assert(response.statusCode == 200, 'status code must be 200')

  BODY MUST
    @assert(body.gravatar_id, 'User must have a gravatar_id')

  # RESPONSE MUST and BODY MUST are not required individually,
  # but unless one have to be defined
```

This is the basic, but maybe you need some more complex like to add headers, querystrings or inputs. 

###### Headers

You can add headers using the `WITH HEADERS` _argument-block_.

```text
GET 'https://api.github.com/users/brunoziie'
  [...]

  WITH HEADERS
    Content-Type: 'application/json'
    Authorization: 'Token f2dd1408c6a2923f168a0f5d3639ab61'

  [...]
```

###### Query Strings

You can add querystring to your URL using the `WITH QUERYSTRING` _argument-block_.

```text
GET 'https://api.yummy-recipes.com/recipes'
  [...]

  WITH QUERYSTRING
    page: 1
    search: 'cupcake'

  [...]
```

This example will produce: 

```text
https://api.yummy-recipes.com/recipes?page=1&search=cupcake
```

###### Inputs

Request with method `POST` and `PUT` may need you pass some data. You can do it using the `WITH INPUTS` _argument-block_.

```text
POST 'https://api.yummy-recipes.com/recipes'
  [...]

  WITH INPUTS
    title: 'Awesome Cupcake Recipe'
    recipe: '....'

  [...]
```
###### Uploading files

Inside the `WITH INPUTS` _argument-block_ you has access to `@file()` method. So you can add file to be uploaded in your request.

```text
POST 'https://api.yummy-recipes.com/recipes'
  [...]

  WITH INPUTS
    title: 'Awesome Cupcake Recipe'
    recipe: '....'
    image: @file('cupcake.jpg')

  [...]
```

When you uploading file keep in mind that the file path is relative to your current directory.

##### Defining test params

You can test the response and the body returned from a request. For that you can make use of `RESPONSE MUST` and `BODY MUST` _argument-block_. Both _argument-blocks_ works the same way. The only diference is the scope.

In `RESPONSE MUST` you will be able to access the `response` variable with the following data:

| Attribute | Type |Description |
|-----------|:--------:|------|
| response.statusCode  | `number`   | Http status code returned.|
| response.headers  | `object`  | List of headers sent by server in response |
| response.request  | `object`  | Object with url, http method and headers sent on request  |

To test the conditions you'll use the `@assert()` method. 

```text
@assert(condition, description)
```

In the first argument you will put the condition you want to test and the second argument will be a text explain what you are testing,

```text
POST 'https://api.yummy-recipes.com/recipes'
  [...]

  RESPONSE MUST
    @assert(response.statusCode == 200, 'StatusCode == 200')

  [...]
```

In `BODY MUST` you will be able to access the `body` variable. If the request returns a valid [JSON](https://www.json.org/), the `body` variable will be a **object** or an **array**, depending from the returned data, else the `body` will be a **string**.

```text
POST 'https://api.yummy-recipes.com/recipes'
  [...]

  BODY MUST
    @assert(body.title == 'Awesome Cupcake Recipe', 'Has the same sent title')

  [...]
```

You also can access config data in these _argument-blocks_ with the `@env` variable.

```text
CONFIG
  baseurl: 'https://api.yummy-recipes.com'
  recipe_title: 'Awesome Cupcake Recipe'
  status: 200

POST '/recipes'
  [...]

  RESPONSE MUST
    @assert(response.statusCode == @env.status, 'StatusCode == 200')

  BODY MUST
    @assert(body.title == @env.recipe_title, 'Has the same sent title')

  [...]
```
##### Checking types

For other way to validate these tests is using the `@it` method, follow the these two patters. 

| Check | Description|
|------|----|
| object, array, string, null, number|Verify the type of property|
| equals, has | Verify if the content of property |

For this way, is possible to check the propeties inside the object.
*All of these features works on `RESPONSE MUST` or in `BODY MUST`

###### Syntax for content  property

```text
[...]
  RESPONSE MUST
    @it(response.list).array('The list must be a array')
    @it(response.price).number('The price must be a number')
    @it(response.name).string('The name must be a string')
    @it(response.faults).null('The faults must be a null')
    @it(response).object('The response must be a object')
[...]
```

###### Syntax for type property

```text
  [...]
  
  RESPONSE MUST
    @it(response).equals('statusCode', 200, 'The status code must be a 200')

  BODY MUST
    @it(body).equals('statusCode', 200, 'The status code must be a 200')
    
  [...]
```
Using the function `has`:

```text
  [...]
  // @it(response).has(path, value, description)
  // @it(response).has(path, description)
  // @it(response).has(path)
  
  RESPONSE MUST
    @it(response).has('statusCode', 200, 'The status code must be a 200')

  BODY MUST
    @it(body).has('statusCode', 200, 'The status code must be a 200')
    
  [...]
```
When the function has are used firstly the handler check if the property in question exists, after that is verified the value. 

You can also use `not` before of these functions to make a easy and clear check:

```text
  [...]
  
  BODY MUST
    @it(body).not.has(statusCode, 200, 'The status code must be different of 200')
    @it(body.victories).not.null('The victories must be different of null') 

  [...]
```


##### Persisting data

Sometimes you need to persist some data from the be used in other requests, like authentication headers or things like that.

For cases like this, you can make use of the `PERSIST` _argument-blocks_. Inside this block you will get access to `@write()`

```text
@write(key, value)
```
| Attribute | Type |Description |
|-----------|:--------:|------|
| key  | `string`   | Key that will be attributed the value.|
| value  | `mixed`  | Value to be saved. Can be a string, number, array or object |  

The `@write()` method has three more specific methods.

- `@write.qs(key, value)`: Save querystrings.
- `@write.headers(key, value)`: Save headers.
- `@write.inputs(key, value)`: Save inputs.
- `@keepCookies()`: Save current response cookies.

```text
CONFIG
  baseurl: 'https://api.yummy-recipes.com'
  recipe_title: 'Awesome Cupcake Recipe'
  status: 200

POST '/login'
  [...]

  PERSIST
    @write.headers('Token', body.user.token)
    @write.qs('category', body.user.category.id) #Assume that's 15
    @write('user_id', body.user.id) #Assume that's 184
  
GET '/users/:user_id:/recipes'
  [...]
  
  # will produce: https://api.yummy-recipes.com/users/184/recipes?category=15
```

#### Utils

##### Spliting test in multiple files.

Maybe writing everything to a file just make the file very long. You can split the test in smaller pieces and include in `test.kunai` file.

```text
INCLUDE 'users/auth.kunai'
INCLUDE 'users/posts.kunai'
INCLUDE 'users/recipes.kunai'
```

You can omit the extension of test file. 

```text
INCLUDE 'users/auth' # Will be read as users/auth.kunai
INCLUDE 'users/posts.kunai'
```
