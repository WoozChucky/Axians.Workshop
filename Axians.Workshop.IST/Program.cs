using System.ComponentModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.AI;
using OpenAI;

var builder = WebApplication.CreateBuilder(args);

// Get from appsettings
var apiKey = builder.Configuration["OpenAIKey"] ?? throw new InvalidOperationException("OpenAI API key not set");
var ollamaEndpoint = builder.Configuration["OllamaEndpoint"] ?? throw new InvalidOperationException("Ollama endpoint not set");

var innerChatClient = new ChatClientBuilder(
    new OpenAIClient(apiKey).GetChatClient("gpt-4.1-mini").AsIChatClient()
    //new OllamaChatClient(ollamaEndpoint, "gemma3:27b")
)
.UseFunctionInvocation()
.Build();

var getSpeedAiFunc = AIFunctionFactory.Create(GetSpeed);

builder.Services
    .AddChatClient(innerChatClient)
    .UseLogging();

// add cors to allow all origins (insecure, but for testing purposes)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        opts =>
        {
            opts.AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

var app = builder.Build();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.MapGet("/speed", async (IChatClient chatClient) =>
{
    var chatOptions = new ChatOptions() { Tools = [getSpeedAiFunc] };

    var response = await chatClient.GetResponseAsync([
        new ChatMessage(ChatRole.System, "You an AI assistant at a Lego Store."),
        new ChatMessage(ChatRole.User, "How fast are 10 Lego Velociraptors?"),
    ], chatOptions);

    return response.Text;
});

app.MapPost("/chat", async (IChatClient chatClient, [FromBody] ChessChatMessage request) =>
{
    var chatOptions = new ChatOptions() { ConversationId = request.SessionId };

    var response = await chatClient.GetResponseAsync([
        new ChatMessage(ChatRole.System, "You are a Chess AI agent playing against a human. " +
                                         "The human is playing as white. You are playing as black." +
                                         "You can have a conversation with the human about chess-related questions only. Refuse to talk about anything else." +
                                         "Give small and concise answers."),
        request,
    ], chatOptions);

    return response.Text;
});

app.MapPost("/move", async (IChatClient chatClient, [FromBody] ChessMoveRequest request) =>
{
    var chatOptions = new ChatOptions() { ConversationId = request.SessionId };

    var response = await chatClient.GetResponseAsync([
        new ChatMessage(ChatRole.System, "You are a Chess AI agent playing against a human. " +
                                         "The human is playing as white. You are playing as black. The user provides the FEN of the current board state and the possible moves."),
        request,
    ], chatOptions);

    // Parse the response
    var lines = response.Text.Split(["\n", Environment.NewLine], StringSplitOptions.RemoveEmptyEntries);
    if (lines.Length == 0)
    {
        return new ChessMoveResponse(false, "Invalid response format", null);
    }
    var isValid = lines[0].Trim().Equals("True", StringComparison.OrdinalIgnoreCase);

    if (isValid)
    {
        var move = lines.Length > 1 ? lines[1].Trim() : null;
        if (move is not null && !request.PossibleMoves.Contains(move))
        {

        }
        return new ChessMoveResponse(isValid, null, move);
    }

    var message = lines.Length > 1 ? lines[1].Trim() : null;
    return new ChessMoveResponse(isValid, message, null);
});

app.Run();

[Description("Computes the total speed of the Lego Velociraptors in km/h")]
static float GetSpeed([Description("The number of Lego Velociraptors to calculate speed for")] int count) => count * 1.5f;

internal record ChessChatMessage(string SessionId, string Message, string FEN)
{
    public static implicit operator ChatMessage(ChessChatMessage chessChatMessage) =>
        new ChatMessage(ChatRole.User, $"{chessChatMessage.Message}{Environment.NewLine}Current Board FEN: {chessChatMessage.FEN}");
}

internal record ChessMoveRequest(string SessionId, string FEN, List<string> PossibleMoves)
{
    public static implicit operator ChatMessage(ChessMoveRequest chessMoveRequest) =>
        new ChatMessage(ChatRole.User, $"{chessMoveRequest.FEN}{Environment.NewLine} What move would you make here as black?{Environment.NewLine}" +
                                       $"The only possible moves are: '{string.Join(", ", chessMoveRequest.PossibleMoves)}'{Environment.NewLine}" +
                                       $"If you cannot make a move, please say in the first line 'False' and provide an explanation in the second line.{Environment.NewLine}" +
                                       $"If you can make a move, please say in the first line 'True' and the move only in the second line.");
}

internal record ChessMoveResponse(bool Valid, string? Message, string? Move)
{

}