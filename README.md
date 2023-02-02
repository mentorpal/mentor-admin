mentor-admin
==================

Usage
-----

A docker image that serves a web client for users to record and build mentors that will be viewed in [mentor-client](https://github.com/mentorpal/mentor-client), and for admin users to author and edit subjects.

Development
-----------

Any changes made to this repo should be covered by tests.

All pushed commits must pass format, lint, type, audit, and license checks. To check all required tests before a commit:

```
make test-all
```

To fix formatting issues:

```
make format
```

To add license headers:

```
make license
```

#### Cypress Testing

To run cypress tests locally with UI you need two shells, first make sure the client is running locally:

```
cd client && make develop
```

...then you can run the full cypress test suite with

```
cd cypress && npm run cy:open
```

...then in the cypress browser window, click a spec to run it.

To run cypress tests headlessly in docker, you do **not** need the client running locally. Just run:

```
make test-e2e
```

## Windows 10 Development

- Install git on the native windows side.
- Clone https://github.com/mentorpal/mentor-admin to your machine.
- Install nvm for windows: https://dev.to/skaytech/how-to-install-node-version-manager-nvm-for-windows-10-4nbi
- Install node v18.x (latest LTS version) for the mentorpal admin project.
- Go to the client directory of the admin project and run npm install then npm develop.
- Go to the cypress directory of the admin project and run npm install then npm run cy:open

Releases
--------

Currently, this image is semantically versioned. When making changes that you want to test in another project, create a branch and PR and then you can release a test tag one of two ways:

To build/push a pre-release semver tag of `mentor-admin` for the current commit in your branch

- ensure all github actions tests are passing
- create a [github release](https://github.com/ICTLearningSciences/mentor-admin/releases/new) with tag format `[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9.]*)?$` (e.g. `1.0.0-alpha.1`)
- ensure all github actions tests pass again and the docker `test and publish` action completes
- this will create a tag like `mentorpal/mentor-admin:1.0.0-alpha.1`

Once your changes are approved and merged to `main`, you should create a release tag in semver format as follows:

- create a [github release](https://github.com/ICTLearningSciences/mentor-admin/releases/new) **from main** with tag format `[0-9]+\.[0-9]+\.[0-9]$` (e.g. `1.0.0`)
- ensure all github actions tests pass and the docker `test and publish` action completes
- this will create a tag like `mentorpal/mentor-admin:1.0.0`
