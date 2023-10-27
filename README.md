# Luxelocker
Luxelocker application is to target clients who would like to purchase, lease, or sell luxury storage units. The application will allow users to access their storage units through their mobile phones and view the security cameras remotely. The owner and renter will also be able to add additional users and invite vendors to access their units through the mobile application. Initially, the customer will be given the option to rent or buy a specified unit. The purchasing and leasing are completed outside of the application. After the customer purchases or leases the unit they will be emailed the relevant credentials to access their account.
## Prerequisites

- [Node.js > 12](https://nodejs.org) and npm (Recommended: Use [nvm](https://github.com/nvm-sh/nvm))
- [Watchman](https://facebook.github.io/watchman)
- [Xcode 12](https://developer.apple.com/xcode)
- [Cocoapods 1.10.1](https://cocoapods.org)
- [JDK > 11](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
- [Android Studio and Android SDK](https://developer.android.com/studio)

## Base dependencies

- [axios](https://github.com/axios/axios) for networking.
- [prop-types](https://github.com/facebook/prop-types) to type-check our components exposed properties.
- [react-native-config](https://github.com/luggit/react-native-config) to manage envionments.
- [react-navigation](https://https://reactnavigation.org/docs/getting-started) navigation library.
- [react-native-localization](https://github.com/stefalda/ReactNativeLocalization) for string localization.
- [@react-native-community/async-storage](https://www.npmjs.com/package/@react-native-community/async-storage) as storage solution.
- [jest](https://facebook.github.io/jest/) and [react-native-testing-library](https://callstack.github.io/react-native-testing-library/) for testing.

## Usage

#### Use Template button

Click the "Use this template" button above the file list, then use the Owner drop-down menu, and select the account you want to own the repository. Creating a repository from a template has the following advantages:

- A repository created from a template starts with a single commit.
- Commits to a repository created from a template do appear in your contribution graph.
- Creating a repository from a template starts a new project quickly.

### Option 1: Using React-Native-Rename

You can start by cloning this repository and using [react-native-rename](https://github.com/junedomingo/react-native-rename). In the current state of this project, it should give you no issues at all, just run the script, delete your node modules and reinstall them and you should be good to go.

Keep in mind that this library can cause trouble if you are renaming a project that uses `Pods` on the iOS side.

After that you should proceed as with any javascript project:

- Go to your project's root folder and run `npm install`.
- If you are using Xcode 12.5 or higher got to /ios and execute `pod install --`repo-update`
- Run `npm run ios` or `npm run android` to start your application!

(Using yarn: `yarn ios` or `yarn android`)

Note: Please read the Setup environments section that is below in this file for more information about the execution scripts.

### Option 2: Copy the structure to your project

If you want to roll on your own and don't want to use this as a template, you can create your project and then copy the `/src` folder (which has all the code of your application) and update your `index.js`.

Keep in mind that if you do this, you'll have to **install and link** all dependencies (as well as adding all the necessary native code for each library that requires it).

## Folder structure

This template follows a very simple project structure:

- `src`: This folder is the main container of all the code inside your application.
  - `actions`: This folder contains all actions that can be dispatched to redux.
  - `assets`: Asset folder to store all images, vectors and fonts, etc.
  - `components`: Folder to store any common component that you use through your app (such as a generic button)
  - `constants`: Folder to store any kind of constant that you have.
  - `selectors`: Folder to store your selectors for each reducer.
  - `utils`: Folder to store utilities and components like stlying and colors.
  - `theme`: Folder to store all the styling concerns related to the application theme.
  - `App.js`: Main component that starts your whole app.
  - `index.js`: Entry point of your application as per React-Native standards.

## 
screen customization

To customize the splash screen (logo and background color) use the CLI provided in the [official docs](https://www.npmjs.com/package/react-native-splash-screen).

## Setup environments

### Using scripts from console

The template already has scripts to execute the project calling a specific environment defined into the package.json file. Keep in mind that if you are going to create new `envs` you have to define the script to build the project properly.

To define which env you want to use, just keep the structure `yarn [platform]: [environment]`


DEV: `yarn ios` or `yarn android`

STG: `yarn ios:staging` or `yarn android:staging`

PROD: `yarn ios:prod` o `yarn android:prod`

Also, you can use npm following the same rule as before: `npm run ios:staging`

Modify the environment variables files in root folder (`.env.development`, `.env.production` and `.env.staging`)


#### Android

A map associating builds with env files is already defined in `app/build.gradle` you can modify or add environments if needed.

For multiple enviroments to work you would need to change `-keep class [YOUR_PACKAGE_NAME].BuildConfig { *; }` on `proguard-rules.pro` file.

#### iOS

The basic idea in iOS is to have one scheme per environment file, so you can easily alternate between them.

To create a new scheme:

- In the Xcode menu, go to Product > Scheme > Edit Scheme
- Click Duplicate Scheme on the bottom
- Give it a proper name on the top left. For instance: "qa"
- Then edit the newly created scheme to make it use a different env file. From the same "manage scheme" window:

  Expand the "Build" tab on the left menu
  - Click "Pre-actions", and under the plus sign select "New Run Script Action"
  - Where it says "Type a script or drag a script file", type: `echo ".env.qa" > /tmp/envfile` replacing `.env.qa` with your file.
- Also, you will need to select the executable for the new schema:

  Expand the "Run" tab on the left menu
  - Under the "Executable" dropdown select the ".app" you would like to use for that schema

## Generate production version

These are the steps to generate `.apk`, `.aab` and `.ipa` files

### Android

1. Generate an upload key
2. Setting up gradle variables
3. Go to the android folder
4. Execute `./gradlew assemble[Env][BuildType]`

Note: You have three options to execute the project
`assemble:` Generates an apk that you can share with others.
`install:` When you want to test a release build on a connected device.
`bundle:` When you are uploading the app to the Play Store.

For more info please go to https://reactnative.dev/docs/signed-apk-android

### iOS

1. Go to the Xcode
2. Select the schema
3. Select 'Any iOS device' as target
4. Product -> Archive

For more info please go to https://reactnative.dev/docs/publishing-to-app-store

## Styleguide

For coding styling, we decided to go with ESLint and [React Native community's styleguide](https://github.com/facebook/react-native/tree/master/packages/eslint-config-react-native-community#readme).

# How to use it

The idea of this section is to explain how the template composition is the best and easiest to use when you try to use well-formed, architectures, especially using redux flow.

The template follows a simple and convenient exporting pattern. The folder index exposes the resources, allowing to import all from the same path.

With that in mind, we are going to look at each folder to explain how to use it.

## Components

Components are the basic blocks of a react native application, but since we​​ aim to minimize development complexity, all the components are at the same nesting level.

Another important thing is the use of propTypes to check the kind of data that your components need to work properly. If the component receives some data from others, the type of these props must be defined, and in case you need it the default value of the property too.

### Static resources:

To keep an application scalable and organized, the global static resources that are used in the application have to be created in a specific file.

### We manage three main folders for that:

- Assets: Here you can store all the images and icons that you need through the app. You have as an example the icon ic_home.png, to respond with the different device screen densities just create inside the same folder the image and all the scaled versions that you need. RN only handles x1, x2 and x3 in this case, you have.

  - assets
    - ic_home
      - ic_home.png
      - ic_home@2x.png
      - ic_home@3x.png

- Localization: This folder contains all the locale objects that you need to create a multilingual application. Create a file for each locale, inside define an object then maintain the nesting sorted by the screen that contains the text that you need and the text you want to show. As the last step, remember to create a reference inside the Localization.js file and add it to LocalizedStrings.
- Theme: Here you can define all the styles that you use on different screens. To make easier the interaction of the application with device options for example you can create here assets as light and dark color palette



## Screens

In this folder, you have the main objects to apply the composition architecture. Just create a folder for each screen you have in your application, call all the components and static resources you need to render the scene and finally use the corresponding hooks to interact with redux and create behaviors depending on the store.

To keep the structure, extract the styles from the main file and place it in a {namefile.styles.js} do the same for the set of tests needed for each screen with the file {namefile.test.js}

This directory contains configuration variables in 3 files:

- `index.dev.js` : contains development variables
- `index.production.js` : contains production variables
- `index.staging.js` : contains beta tests variables

You need to create `index.js` by copying the right file.

#### Warning

Each time you need to build, you need to verify if your `index.js` is the right one.
For example, during development, before building your app do:

```
cp src/Config/APIConfig/index.dev.js src/Config/APIConfig/index.js
cp src/Config/APIConfig/index.staging.js src/Config/APIConfig/index.js
cp src/Config/APIConfig/index.production.js src/Config/APIConfig/index.js

```

In other environment, you must pay attention to change your `index.js` with the good one.
Also, make sure you add each configuration variable in each configuration file.
This directory contains configuration variables in 3 files:

- `index.dev.js` : contains development variables
- `index.production.js` : contains production variables
- `index.staging.js` : contains beta tests variables

You need to create `index.js` by copying the right file.

#### Warning

Each time you need to build, you need to verify if your `index.js` is the right one.
For example, during development, before building your app do:

```
cp src/Config/APIConfig/index.dev.js src/Config/APIConfig/index.js
cp src/Config/APIConfig/index.staging.js src/Config/APIConfig/index.js
cp src/Config/APIConfig/index.production.js src/Config/APIConfig/index.js

```

In other environment, you must pay attention to change your `index.js` with the good one.
Also, make sure you add each configuration variable in each configuration file.