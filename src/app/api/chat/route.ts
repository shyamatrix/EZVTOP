import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { messages, model } = await request.json();

    const groqKey = process.env.GROQ_API_KEY;
    const cerebrasKey = process.env.CEREBRAS_API_KEY;

    if (!groqKey && !cerebrasKey) {
      return NextResponse.json({ error: "Missing API key configuration: Neither GROQ_API_KEY nor CEREBRAS_API_KEY is configured in the environment." }, { status: 500 });
    }

    if (model) {
      // Custom model routing (e.g. vision OCR/PDF text extraction)
      let url = "https://api.groq.com/openai/v1/chat/completions";
      let auth = `Bearer ${groqKey}`;

      if (model.includes("cerebras") || model.startsWith("llama3.1-") || model.startsWith("qwen-3-") || model.startsWith("gpt-oss-")) {
        if (!cerebrasKey) {
          return NextResponse.json({ error: "Cerebras API key is not configured in the environment." }, { status: 400 });
        }
        url = "https://api.cerebras.ai/v1/chat/completions";
        auth = `Bearer ${cerebrasKey}`;
      } else {
        if (!groqKey) {
          return NextResponse.json({ error: "Groq API key is not configured in the environment." }, { status: 400 });
        }
      }

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": auth,
          },
          body: JSON.stringify({
            model,
            messages,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}. Details: ${errText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
      } catch (err: any) {
        console.error(`Next.js custom model call failed: ${model} failed: ${err.message || err}`);
        return NextResponse.json({ error: `Custom model call failed: ${err.message || err}` }, { status: 500 });
      }
    }

    const userMessage = messages[messages.length - 1]?.content || "";
    const q = userMessage.toLowerCase();
    
    // Check if it is a reasoning query (GPA, CGPA calculations, target mark calculations, grades, etc.)
    const isReasoningQuery = /gpa|cgpa|grade|target|fat|cat|marks|calculate|compute|predict/i.test(q);

    const modelConfigs: Record<string, { url: string; auth: string; modelName: string }> = {
      "groq-llama-70b": {
        url: "https://api.groq.com/openai/v1/chat/completions",
        auth: `Bearer ${groqKey}`,
        modelName: "llama-3.3-70b-versatile",
      },
      "cerebras-qwen-235b": {
        url: "https://api.cerebras.ai/v1/chat/completions",
        auth: `Bearer ${cerebrasKey}`,
        modelName: "qwen-3-235b-a22b-instruct-2507",
      },
      "cerebras-gpt-120b": {
        url: "https://api.cerebras.ai/v1/chat/completions",
        auth: `Bearer ${cerebrasKey}`,
        modelName: "gpt-oss-120b",
      },
      "groq-qwen-32b": {
        url: "https://api.groq.com/openai/v1/chat/completions",
        auth: `Bearer ${groqKey}`,
        modelName: "qwen/qwen3-32b",
      },
      "cerebras-llama-8b": {
        url: "https://api.cerebras.ai/v1/chat/completions",
        auth: `Bearer ${cerebrasKey}`,
        modelName: "llama3.1-8b",
      },
    };

    const tryRequest = async (configKey: string) => {
      const config = modelConfigs[configKey];
      if (!config) throw new Error("Invalid config key");

      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": config.auth,
        },
        body: JSON.stringify({
          model: config.modelName,
          messages,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`API model call to ${config.modelName} failed with status ${response.status}:`, errText);
        throw new Error(`HTTP error! status: ${response.status}. Details: ${errText}`);
      }

      const data = await response.json();
      if (data.error || !data.choices || data.choices.length === 0) {
        throw new Error(data.error?.message || "Invalid API response structure");
      }

      return data;
    };

    const priorityList = isReasoningQuery
      ? ["cerebras-qwen-235b", "groq-llama-70b", "cerebras-gpt-120b", "groq-qwen-32b"]
      : ["groq-llama-70b", "cerebras-gpt-120b", "cerebras-llama-8b", "groq-qwen-32b"];

    // Filter priority list to only run models for which we have keys configured
    const activePriorityList = priorityList.filter(modelKey => {
      if (modelKey.startsWith("groq-") && !groqKey) return false;
      if (modelKey.startsWith("cerebras-") && !cerebrasKey) return false;
      return true;
    });

    if (activePriorityList.length === 0) {
      return NextResponse.json({ error: "Missing API key configuration: The requested models require API keys that are not configured in the environment." }, { status: 500 });
    }

    let lastError: any = null;
    for (const modelKey of activePriorityList) {
      try {
        const data = await tryRequest(modelKey);
        // Successfully got a response, return it!
        return NextResponse.json(data);
      } catch (err: any) {
        console.warn(`Model ${modelKey} failed: ${err.message || err}. Trying fallback...`);
        lastError = err;
      }
    }

    // If we reach here, all models in the priority list failed!
    return NextResponse.json({ error: `All models failed. Last error: ${lastError?.message || lastError}` }, { status: 500 });
  } catch (error: any) {
    console.error("Error in Next.js chat route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
