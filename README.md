# Axians Workshop IST

This repository contains code used to introduce and explain how to integrate AI into your .NET applications.

## Requirements

- .NET 9 SDK
- Node.js 22.x (Optional)
- Docker Destop (Optional)

## .NET and AI Ecosystem

Starting with .NET 9, Microsoft introduced a new set of libraries specifically targeted at AI workflows. Most of them are still in preview version but feature-wise they are already pretty complete.

This means that you have to make sure you are using the `preview` NuGet channel when looking for them. At the time of writing the libraries used (__Microsoft.Extensions.AI.Ollama__ and __Microsoft.Extensions.AI.OpenAI__) are referencing version `9.4.3-preview.1.25230.7`

## Code

The main branch is mostly empty, and the evolution of the code is split in different branches.

- [01-starting-console](https://github.com/WoozChucky/Axians.Workshop/tree/01-starting-console)
    - Contains the most basic setup to prompt an AI and get responses back via console
- [02-streaming-console](https://github.com/WoozChucky/Axians.Workshop/tree/02-streaming-console)
    - An evolution of the previous example by adding streaming responses
- [03-ai-functions](https://github.com/WoozChucky/Axians.Workshop/tree/03-ai-functions)
    - Example demonstrating how to run custom code/logic by talking to the AI using natural language
- [04-minimal-api](https://github.com/WoozChucky/Axians.Workshop/tree/04-minimal-api)
    - Simple showcase of how to wrap previous examples in a minimal web api
- [05-chess-agent](https://github.com/WoozChucky/Axians.Workshop/tree/05-chess-agent)
    - A working proof-of-concept of a Chess AI agent that we can play against via a React web app as the interface

## Additional Helpers

A `docker-compose.yml` has been provided at the root of this repository that will spin up an OpenWebUI and Ollamma instances for local development with local LLMs.

```bash
$ docker-compose up -d
```

## References
- [.NET AI](https://dotnet.microsoft.com/en-us/apps/ai)
- [Ollama](https://ollama.com/)
- [Open WebUI](https://docs.openwebui.com/)