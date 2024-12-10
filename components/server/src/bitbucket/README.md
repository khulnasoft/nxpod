# Bitbucket Integration tests

To run the Bitbucket integration tests via `npm test` the `NXPOD_TEST_TOKEN_BITBUCKET` environment variable needs to be defined:

```bash
export NXPOD_TEST_TOKEN_BITBUCKET='{ "username": "$username", "value": "$applicationPassword", "scopes": [] }'
```

Replace `$username` / `$applicationPassword` with the integration test username and application password.

## Running a single test

Use `test.only` thus:

```js
test('Your cool test', function (done) {
    //...
}
```

becomes

```js
test.only('Your cool test', function (done) {
    //...
}
```
