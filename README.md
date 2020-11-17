# Appknox Github Action

This action provides github action integration with Appknox.

## Inputs

### `appknox_access_token`

**Required** Appknox personal access token. Can you generated from Appknox Dashboard.

### `file_path`

**Required** File path to the mobile application binary to be uploaded.

### `risk_threshold`

**Required** Risk threshold value for which the CI should fail. Default `"LOW"`

## Example usage
```yaml
uses: actions/appknox-github-action@v1.0
with:
  appknox_access_token: 'XXXXXXXXXXXXXXXXXXXXX'
  file_path: 'app/build/outputs/apk/debug/app-debug.apk'
```
