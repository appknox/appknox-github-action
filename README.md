# Appknox Github Action

The Appknox Github action allows you to perform Appknox security scan on your mobile application binary. The APK/IPA built from your CI pipeline will be uploaded to Appknox platform which performs static scan and the build will be errored according to the chosen risk threshold.

## How to use it?

### Step 1: Get your Appknox access token

Sign up on [Appknox](https://appknox.com).

Generate a personal access token from <a href="https://secure.appknox.com/settings/developersettings" target="_blank">Developer Settings</a>

### Step 2: Configure Appknox access token in your app's GitHub repository

Go to your app's repository settings in Github, click on Secrets in sidebar and create a new secret with name `APPKNOX_ACCESS_TOKEN` and value with the access token obtained in step 1

![Add Github secret](images/github_settings_secrets_new.jpg)

### Step 3: Configure the GitHub action

In your Github action workflow file (eg: `.github/workflows/build.yml`), insert the following content after the app build step:
```yml
- name: Appknox Scan
  uses: appknox/appknox-github-action@1.1.2
  with:
    appknox_access_token: ${{ secrets.APPKNOX_ACCESS_TOKEN }}
    file_path: app/build/outputs/apk/debug/app-debug.apk
    risk_threshold: HIGH
```

## Inputs

| Key                     | Value                        |
|-------------------------|------------------------------|
| `appknox_access_token`  | Personal access token secret |
| `file_path`             | File path to the mobile application binary to be uploaded |
| `risk_threshold`        | Risk threshold value for which the CI should fail. <br><br>Accepted values: `CRITICAL, HIGH, MEDIUM & LOW` <br><br>Default: `LOW` |
| `sarif`                 | Enables SARIF report generation. <br><br>Accepted values: `Enable & Disable` <br><br>Default: `Disable`|
| `sast_timeout`          | SAST Timeout in Minutes. <br><br>Accepted values: `1 to 240` <br><br>Default: `30` Minutes |

---

## Examples:

### Running Appknox Scan for Vulnerability Detection
```yml
name: Build
on:
  push:
    branches:
      - master
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up JDK 1.8
      uses: actions/setup-java@v1
      with:
        java-version: 1.8
    - name: Grant execute permission for gradlew
      run: chmod +x gradlew
    - name: Build the app
      run: ./gradlew build
    - name: Appknox GitHub action
      uses: appknox/appknox-github-action@1.1.2
      with:
        appknox_access_token: ${{ secrets.APPKNOX_ACCESS_TOKEN }}
        file_path: app/build/outputs/apk/debug/app-debug.apk
        risk_threshold: MEDIUM
```
### Appknox Scan with Downloadable SARIF File
_This example demonstrates how to run Appknox Scan to generate a SARIF report and download it as an artifact._
```yml
    name: Build
    on:
      push:
        branches:
          - master
    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v2
        - name: Set up JDK 1.8
          uses: actions/setup-java@v1
          with:
            java-version: 1.8
        - name: Grant execute permission for gradlew
          run: chmod +x gradlew
        - name: Build the app
          run: ./gradlew build
        - name: Appknox GitHub action
          uses: appknox/appknox-github-action@1.1.2
          with:
            appknox_access_token: ${{ secrets.APPKNOX_ACCESS_TOKEN }}
            file_path: app/build/outputs/apk/debug/app-debug.apk
            risk_threshold: MEDIUM
            sarif: Enable
        - name: Download SARIF Report
          if: always()
          uses: actions/upload-artifact@v2
          with:
            name: sarif-report
            path: report.sarif
```
### Upload Appknox Scan Report to GitHub Code Scanning
**Note:** _For integrating with GitHub Advanced Security (GHAS), ensure you have an active GitHub account with the Advanced Security feature enabled._

```yml
    name: Build
    on:
      push:
        branches:
          - master
    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v2
        - name: Set up JDK 1.8
          uses: actions/setup-java@v1
          with:
            java-version: 1.8
        - name: Grant execute permission for gradlew
          run: chmod +x gradlew
        - name: Build the app
          run: ./gradlew build
        - name: Appknox GitHub action
          uses: appknox/appknox-github-action@1.1.2
          with:
            appknox_access_token: ${{ secrets.APPKNOX_ACCESS_TOKEN }}
            file_path: app/build/outputs/apk/debug/app-debug.apk
            risk_threshold: MEDIUM
            sarif: Enable
        - name: Upload SARIF to GHAS
          if: always()
          uses: github/codeql-action/upload-sarif@v3
          with:
            sarif_file: report.sarif
```
**View reported vulnerabilities in GitHub Code Scanning after running above workflow**

![Code Scanner Sample](images/codescanner.png)
