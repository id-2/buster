# buster-cli

A CLI tool for creating and managing your semantic model in Buster.

This tool is two-way compatible with your dbt projects as well.  We like dbt and think its a great tool, 

## Installation

TODO

## How does it work?

You can imagine Buster as a layer on top of your dbt project that allows you to create and manage semantic models.  We collect extra metadata about your models, however dbt semantic models don't allow you to have extra fields than what they've defined.  When you run `buster deploy`, we will createa a dbt-compatible copy that is used to run the dbt commands.

## Quick Start

1. Obtain your Buster API key. You can create one [here](https://platform.buster.so/app/settings/api-keys).

Initialize your project by running:

```bash
buster init
```

This command will go through the following steps:

1. Authenticate with your Buster API key.
2. Checks to see if you have an existing dbt project. If you do, you will be prompted to use the existing project or create a new one.

- If you choose to use the existing project, Buster will use the existing project to create semantic model files.
