using System.ComponentModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.AI;
using OpenAI;

var builder = WebApplication.CreateBuilder(args);

// Get from appsettings
var apiKey = builder.Configuration["OpenAIKey"] ?? throw new InvalidOperationException("OpenAI API key not set");
var ollamaEndpoint = builder.Configuration["OllamaEndpoint"] ?? throw new InvalidOperationException("Ollama endpoint not set");

var chatClient = new ChatClientBuilder(
    new OpenAIClient(apiKey).GetChatClient("gpt-4.1-mini").AsIChatClient()
    //new OllamaChatClient(ollamaEndpoint, "gemma3:27b")
).Build();

while (true)
{
    Console.ForegroundColor = ConsoleColor.DarkRed;
    Console.Write("Enter a prompt: ");
    Console.ForegroundColor = ConsoleColor.Yellow;

    var prompt = Console.ReadLine();
    if (string.IsNullOrEmpty(prompt))
        break;

    Console.ForegroundColor = ConsoleColor.Green;
    Console.Write($"AI: ");

    var systemMessage = new ChatMessage(ChatRole.System, "You are a helpful assistant. And will reply using maximum of one paragraph.");
    var userMessage = new ChatMessage(ChatRole.User, prompt);

    await foreach (var update in chatClient.GetStreamingResponseAsync([systemMessage, userMessage]))
    {
        Console.Write(update.Text);
    }
    Console.WriteLine();
}
